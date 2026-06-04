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

// Regression: consumer usernames containing hyphens must not be blocked.
// Related issues:
//   - apache/apisix-dashboard#3146 hyphen in consumer username blocked by
//     frontend even though APISIX 3.13+ allows it
//   - apache/apisix-dashboard#3141 same
// User expectation: a username like "test-consumer-1" submits successfully
// and is created via the Admin API.

import { consumersPom } from '@e2e/pom/consumers';
import { e2eReq } from '@e2e/utils/req';
import { test } from '@e2e/utils/test';
import { uiHasToastMsg } from '@e2e/utils/ui';
import { expect } from '@playwright/test';
import { customAlphabet } from 'nanoid';

import { deleteAllConsumers, getConsumerReq } from '@/apis/consumers';

const nanoid = customAlphabet(
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  6
);
// Deliberately include hyphens to reproduce #3146 / #3141.
const consumerUsername = `test-consumer-${nanoid()}`;

test.beforeAll(async () => {
  await deleteAllConsumers(e2eReq);
});

test.afterAll(async () => {
  await deleteAllConsumers(e2eReq);
});

test('should allow consumer username containing hyphens (APISIX 3.13+)', async ({
  page,
}) => {
  await consumersPom.toAdd(page);
  await consumersPom.isAddPage(page);

  await test.step('fill username with hyphens and submit', async () => {
    const usernameInput = page.getByRole('textbox', { name: 'Username' });
    await usernameInput.fill(consumerUsername);
    await expect(usernameInput).toHaveValue(consumerUsername);

    await consumersPom.getAddBtn(page).click();
    await uiHasToastMsg(page, { hasText: 'Add Consumer Successfully' });
  });

  await test.step('detail page shows the hyphenated username', async () => {
    await consumersPom.isDetailPage(page);
    const username = page.getByRole('textbox', { name: 'Username' });
    await expect(username).toHaveValue(consumerUsername);
  });

  await test.step('Admin API reflects the created consumer', async () => {
    const resp = await getConsumerReq(e2eReq, consumerUsername);
    expect(resp.value.username).toBe(consumerUsername);
  });
});
