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
import { e2eReq } from '@e2e/utils/req';
import { test } from '@e2e/utils/test';
import { expect } from '@playwright/test';

import { deleteAllRoutes, putRouteReq } from '@/apis/routes';
import type { APISIXType } from '@/types/schema/apisix';

/**
 * Test for version filtering.
 * Routes are created via API to guarantee labels are saved correctly,
 * then we test the UI filter behavior.
 */
test.describe('Routes version filter', () => {
  test.describe.configure({ mode: 'serial' });

  const v1Routes: APISIXType['Route'][] = Array.from({ length: 3 }, (_, i) => ({
    id: `route_v1_id_${i + 1}`,
    name: `route_v1_name_${i + 1}`,
    uri: `/v1/test${i + 1}`,
    methods: ['GET'],
    labels: { version: 'v1' },
    upstream: {
      nodes: [{ host: 'test.com', port: 80, weight: 100 }],
    },
  }));

  const v2Routes: APISIXType['Route'][] = Array.from({ length: 3 }, (_, i) => ({
    id: `route_v2_id_${i + 1}`,
    name: `route_v2_name_${i + 1}`,
    uri: `/v2/test${i + 1}`,
    methods: ['GET'],
    labels: { version: 'v2' },
    upstream: {
      nodes: [{ host: 'test.com', port: 80, weight: 100 }],
    },
  }));

  const allRoutes = [...v1Routes, ...v2Routes];

  test.beforeAll(async () => {
    await deleteAllRoutes(e2eReq);
    await Promise.all(allRoutes.map((r) => putRouteReq(e2eReq, r)));
  });

  test.afterAll(async () => {
    await deleteAllRoutes(e2eReq);
  });

  test('should filter routes by version', async ({ page }) => {
    await test.step('verify all routes are visible and version filter exists', async () => {
      await routesPom.toIndex(page);
      await routesPom.isIndexPage(page);

      // Verify some routes are visible
      await expect(page.getByRole('cell', { name: 'route_v1_name_1' }).first()).toBeVisible();
      await expect(page.getByRole('cell', { name: 'route_v2_name_1' }).first()).toBeVisible();
    });

    await test.step('filter by version v1 and verify only v1 routes are shown', async () => {
      // Open the Version dropdown, then use keyboard to select v1 (first option)
      await page.getByRole('combobox', { name: 'Version' }).click();
      // v1 is the first option (sorted alphabetically), press Enter to select it
      await page.keyboard.press('Enter');

      // Click the Search button to apply the filter
      await page.getByRole('button', { name: 'Search' }).click();

      // v1 routes should be present
      for (const r of v1Routes) {
        await expect(page.getByRole('cell', { name: r.name }).first()).toBeVisible();
      }

      // v2 routes should not be present in the filtered results
      for (const r of v2Routes) {
        await expect(page.getByRole('cell', { name: r.name })).toBeHidden();
      }
    });

    await test.step('filter by version v2 and verify only v2 routes are shown', async () => {
      // Reload page to get a clean filter state
      await routesPom.toIndex(page);
      await routesPom.isIndexPage(page);

      // Wait for routes to be visible again
      await expect(page.getByRole('cell', { name: 'route_v1_name_1' }).first()).toBeVisible();

      // Open the Version dropdown, then arrow down to v2 (second option) and select
      await page.getByRole('combobox', { name: 'Version' }).click();
      await page.keyboard.press('ArrowDown'); // move to v2
      await page.keyboard.press('Enter');

      // Click the Search button to apply the filter
      await page.getByRole('button', { name: 'Search' }).click();

      // v2 routes should be present
      for (const r of v2Routes) {
        await expect(page.getByRole('cell', { name: r.name }).first()).toBeVisible();
      }

      // v1 routes should not be present in the filtered results
      for (const r of v1Routes) {
        await expect(page.getByRole('cell', { name: r.name })).toBeHidden();
      }
    });
  });
});
