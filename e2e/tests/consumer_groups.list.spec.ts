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
import { consumerGroupsPom } from '@e2e/pom/consumer_groups';
import { setupPaginationTests } from '@e2e/utils/pagination-test-helper';
import { e2eReq } from '@e2e/utils/req';
import { test } from '@e2e/utils/test';
import { expect, type Page } from '@playwright/test';

import {
  deleteAllConsumerGroups,
  putConsumerGroupReq,
} from '@/apis/consumer_groups';
import { API_CONSUMER_GROUPS } from '@/config/constant';
import type { APISIXType } from '@/types/schema/apisix';

test('should navigate to Consumer Groups page', async ({ page }) => {
  await consumerGroupsPom.toIndex(page);
  await consumerGroupsPom.isIndexPage(page);

  // Check if the add button is visible
  const addButton = consumerGroupsPom.getAddConsumerGroupBtn(page);
  await expect(addButton).toBeVisible();
});

const consumerGroups: APISIXType['ConsumerGroupPut'][] = Array.from(
  { length: 11 },
  (_, i) => ({
    id: `test-consumer-group-${(i + 1).toString().padStart(2, '0')}`,
    desc: `Test Consumer Group ${i + 1}`,
    plugins: {},
  })
);

test.describe('page and page_size should work correctly', () => {
  test.describe.configure({ mode: 'serial' });
  test.beforeAll(async () => {
    await deleteAllConsumerGroups(e2eReq);
    await Promise.all(
      consumerGroups.map((d) => putConsumerGroupReq(e2eReq, d))
    );
  });

  test.afterAll(async () => {
    await Promise.all(
      consumerGroups.map((d) =>
        e2eReq.delete(`${API_CONSUMER_GROUPS}/${d.id}`)
      )
    );
  });

  const filterItemsNotInPage = async (page: Page) => {
    // filter the item which not in the current page
    // it should be random, so we need get all items in the table
    const itemsInPage = await page
      .getByRole('cell', { name: /test-consumer-group-/ })
      .all();
    const ids = await Promise.all(itemsInPage.map((v) => v.textContent()));
    return consumerGroups.filter((d) => !ids.includes(d.id));
  };

  setupPaginationTests(test, {
    pom: consumerGroupsPom,
    items: consumerGroups,
    filterItemsNotInPage,
    getCell: (page, item) =>
      page.getByRole('cell', { name: item.id }).first(),
  });
});
