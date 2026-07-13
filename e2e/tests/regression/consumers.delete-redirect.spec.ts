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

// Regression: deleting a consumer from its detail page used to navigate to
// /consumer_groups (copy-paste from a sibling page). The user must land on
// the consumers list they came from.

import { consumersPom } from '@e2e/pom/consumers';
import { randomId } from '@e2e/utils/common';
import { e2eReq } from '@e2e/utils/req';
import { test } from '@e2e/utils/test';
import { expect } from '@playwright/test';

import { deleteAllConsumers, putConsumerReq } from '@/apis/consumers';

const username = randomId('reg_del_redirect').replaceAll('-', '_');

test.beforeAll(async () => {
  await deleteAllConsumers(e2eReq);
  await putConsumerReq(e2eReq, { username });
});

test.afterAll(async () => {
  await deleteAllConsumers(e2eReq);
});

test('deleting a consumer redirects to the consumers list', async ({
  page,
}) => {
  await consumersPom.toIndex(page);
  await consumersPom.isIndexPage(page);

  await page
    .getByRole('row', { name: username })
    .getByRole('button', { name: 'View' })
    .click();
  await consumersPom.isDetailPage(page);

  await page.getByRole('button', { name: 'Delete' }).click();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Delete' })
    .click();

  // must land on the consumers list, not /consumer_groups
  await consumersPom.isIndexPage(page);
  await expect(page).toHaveURL(/\/consumers(\?|$)/);
  await expect(page.getByRole('row', { name: username })).toBeHidden();
});
