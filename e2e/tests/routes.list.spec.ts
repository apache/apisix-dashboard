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

import { routesPom } from '@e2e/pom/routes';
import { setupPaginationTests } from '@e2e/utils/pagination-test-helper';
import { e2eReq } from '@e2e/utils/req';
import { test } from '@e2e/utils/test';
import { expect, type Page } from '@playwright/test';

import { deleteAllRoutes, putRouteReq } from '@/apis/routes';
import { API_ROUTES } from '@/config/constant';
import type { APISIXType } from '@/types/schema/apisix';

test('should navigate to routes page', async ({ page }) => {
  await test.step('navigate to routes page', async () => {
    await routesPom.getRouteNavBtn(page).click();
    await routesPom.isIndexPage(page);
  });

  await test.step('verify routes page components', async () => {
    await expect(routesPom.getAddRouteBtn(page)).toBeVisible();

    // list table exists
    const table = page.getByRole('table');
    await expect(table).toBeVisible();
    await expect(table.getByText('ID', { exact: true })).toBeVisible();
    await expect(table.getByText('Name', { exact: true })).toBeVisible();
    await expect(table.getByText('URI', { exact: true })).toBeVisible();
    await expect(table.getByText('Actions', { exact: true })).toBeVisible();
  });
});

const routes: APISIXType['Route'][] = Array.from({ length: 11 }, (_, i) => ({
  id: `route_id_${i + 1}`,
  name: `route_name_${i + 1}`,
  uri: `/test_route_${i + 1}`,
  desc: `Description for route ${i + 1}`,
  methods: ['GET'],
  upstream: {
    nodes: [
      {
        host: `node_${i + 1}`,
        port: 80,
        weight: 100,
      },
    ],
  },
}));

test.describe('page and page_size should work correctly', () => {
  test.describe.configure({ mode: 'serial' });
  test.beforeAll(async () => {
    await deleteAllRoutes(e2eReq);
    await Promise.all(routes.map((d) => putRouteReq(e2eReq, d)));
  });

  test.afterAll(async () => {
    await Promise.all(
      routes.map((d) => e2eReq.delete(`${API_ROUTES}/${d.id}`))
    );
  });

  // Setup pagination tests with route-specific configurations
  const filterItemsNotInPage = async (page: Page) => {
    // filter the item which not in the current page
    // it should be random, so we need get all items in the table
    const itemsInPage = await page
      .getByRole('cell', { name: /route_name_/ })
      .all();
    const names = await Promise.all(itemsInPage.map((v) => v.textContent()));
    return routes.filter((d) => !names.includes(d.name));
  };

  setupPaginationTests(test, {
    pom: routesPom,
    items: routes,
    filterItemsNotInPage,
    getCell: (page, item) =>
      page.getByRole('cell', { name: item.name }).first(),
  });
});
