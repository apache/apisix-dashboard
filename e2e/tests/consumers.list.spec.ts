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

import { consumersPom } from '@e2e/pom/consumers';
import { setupPaginationTests } from '@e2e/utils/pagination-test-helper';
import { e2eReq } from '@e2e/utils/req';
import { test } from '@e2e/utils/test';
import { expect, type Page } from '@playwright/test';

import { deleteAllConsumers, putConsumerReq } from '@/apis/consumers';
import { API_CONSUMERS } from '@/config/constant';
import type { APISIXType } from '@/types/schema/apisix';

test('should navigate to consumers page', async ({ page }) => {
  await test.step('navigate to consumers page', async () => {
    await consumersPom.getConsumerNavBtn(page).click();
    await consumersPom.isIndexPage(page);
  });

  await test.step('verify consumers page components', async () => {
    await expect(consumersPom.getAddConsumerBtn(page)).toBeVisible();

    // list table exists
    const table = page.getByRole('table');
    await expect(table).toBeVisible();
    await expect(table.getByText('Username', { exact: true })).toBeVisible();
    await expect(table.getByText('Actions', { exact: true })).toBeVisible();
  });
});

const consumers: APISIXType['ConsumerPut'][] = Array.from({ length: 11 }, (_, i) => ({
  username: `test_consumer_${i + 1}`,
  desc: `Description for consumer ${i + 1}`,
}));

test.describe('page and page_size should work correctly', () => {
  test.describe.configure({ mode: 'serial' });
  test.beforeAll(async () => {
    await deleteAllConsumers(e2eReq);
    await Promise.all(consumers.map((d) => putConsumerReq(e2eReq, d)));
  });

  test.afterAll(async () => {
    await Promise.all(
      consumers.map((d) => e2eReq.delete(`${API_CONSUMERS}/${d.username}`))
    );
  });

  // Setup pagination tests with consumer-specific configurations
  const filterItemsNotInPage = async (page: Page) => {
    // filter the item which not in the current page
    // it should be random, so we need get all items in the table
    const itemsInPage = await page
      .getByRole('cell', { name: /test_consumer_/ })
      .all();
    const names = await Promise.all(itemsInPage.map((v) => v.textContent()));
    return consumers.filter((d) => !names.includes(d.username));
  };

  setupPaginationTests(test, {
    pom: consumersPom,
    items: consumers,
    filterItemsNotInPage,
    getCell: (page, item) =>
      page.getByRole('cell', { name: item.username }).first(),
  });
});
