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

import { upstreamsPom } from '@e2e/pom/upstreams';
import { setupPaginationTests } from '@e2e/utils/pagination-test-helper';
import { e2eReq } from '@e2e/utils/req';
import { test } from '@e2e/utils/test';
import { expect, type Page } from '@playwright/test';

import { deleteAllUpstreams, putUpstreamReq } from '@/apis/upstreams';
import { API_UPSTREAMS } from '@/config/constant';
import type { APISIXType } from '@/types/schema/apisix';

test('should navigate to upstreams page', async ({ page }) => {
  await test.step('navigate to upstreams page', async () => {
    await upstreamsPom.getUpstreamNavBtn(page).click();
    await upstreamsPom.isIndexPage(page);
  });

  await test.step('verify upstreams page components', async () => {
    await expect(upstreamsPom.getAddUpstreamBtn(page)).toBeVisible();

    // list table exists
    const table = page.getByRole('table');
    await expect(table).toBeVisible();
    await expect(table.getByText('ID', { exact: true })).toBeVisible();
    await expect(table.getByText('Name', { exact: true })).toBeVisible();
    await expect(table.getByText('Actions', { exact: true })).toBeVisible();
  });
});

const upstreams: APISIXType['Upstream'][] = Array.from(
  { length: 11 },
  (_, i) => ({
    id: `upstream_id_${i + 1}`,
    name: `upstream_name_${i + 1}`,
    nodes: [
      {
        host: `node_${i + 1}`,
        port: 80,
        weight: 100,
      },
    ],
  })
);

test.describe('page and page_size should work correctly', () => {
  test.describe.configure({ mode: 'serial' });
  test.beforeAll(async () => {
    await deleteAllUpstreams(e2eReq);
    await Promise.all(upstreams.map((d) => putUpstreamReq(e2eReq, d)));
  });

  test.afterAll(async () => {
    await Promise.all(
      upstreams.map((d) => e2eReq.delete(`${API_UPSTREAMS}/${d.id}`))
    );
  });

  // Setup pagination tests with upstream-specific configurations
  const filterItemsNotInPage = async (page: Page) => {
    // filter the item which not in the current page
    // it should be random, so we need get all items in the table
    const itemsInPage = await page
      .getByRole('cell', { name: /upstream_name_/ })
      .all();
    const names = await Promise.all(itemsInPage.map((v) => v.textContent()));
    return upstreams.filter((d) => !names.includes(d.name));
  };

  setupPaginationTests(test, {
    pom: upstreamsPom,
    items: upstreams,
    filterItemsNotInPage,
    getCell: (page, item) =>
      page.getByRole('cell', { name: item.name }).first(),
  });
});
