/**
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Regression: consumer labels must remain visible after save.
// Related issue:
//   - apache/apisix-dashboard#3201 consumer labels not shown
// User expectation: labels entered when creating a consumer remain
// visible in both the detail page and the Admin API after save.

import { consumersPom } from '@e2e/pom/consumers';
import { e2eReq } from '@e2e/utils/req';
import { test } from '@e2e/utils/test';
import { uiHasToastMsg } from '@e2e/utils/ui';
import { uiCheckLabels, uiFillLabels } from '@e2e/utils/ui/labels';
import { expect } from '@playwright/test';
import { customAlphabet } from 'nanoid';

import { deleteAllConsumers, getConsumerReq } from '@/apis/consumers';

const nanoid = customAlphabet(
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  8
);
const username = `reglblconsumer${nanoid()}`;
const labels = {
  env: 'staging',
  team: 'platform',
  region: 'apac',
};

test.beforeAll(async () => {
  await deleteAllConsumers(e2eReq);
});

test.afterAll(async () => {
  await deleteAllConsumers(e2eReq);
});

test('consumer labels are preserved and displayed after save', async ({
  page,
}) => {
  await consumersPom.toAdd(page);
  await consumersPom.isAddPage(page);

  await test.step('fill username + labels and submit', async () => {
    await page.getByRole('textbox', { name: 'Username' }).fill(username);
    await uiFillLabels(page, labels);

    // Confirm labels are visible in form before submit.
    await uiCheckLabels(page, labels);

    await consumersPom.getAddBtn(page).click();
    await uiHasToastMsg(page, { hasText: 'Add Consumer Successfully' });
    await consumersPom.isDetailPage(page);
  });

  await test.step('detail page displays labels', async () => {
    await uiCheckLabels(page, labels);
  });

  await test.step('Admin API has the labels', async () => {
    const resp = await getConsumerReq(e2eReq, username);
    expect(resp.value.labels).toBeDefined();
    for (const [k, v] of Object.entries(labels)) {
      expect((resp.value.labels as Record<string, string>)[k]).toBe(v);
    }
  });
});
