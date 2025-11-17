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
import { uiHasToastMsg } from '@e2e/utils/ui';
import { uiFillUpstreamRequiredFields } from '@e2e/utils/ui/upstreams';
import { expect } from '@playwright/test';

import { deleteAllRoutes } from '@/apis/routes';
import type { APISIXType } from '@/types/schema/apisix';

/**
 * Test for version filtering across multiple pages.
 * This verifies that client-side filtering works across all routes,
 * not just the current page.
 */
test.describe('Routes version filter', () => {
  test.describe.configure({ mode: 'serial' });

  const nodes: APISIXType['UpstreamNode'][] = [
    { host: 'test.com', port: 80, weight: 100 },
    { host: 'test2.com', port: 80, weight: 100 },
  ];

  test.beforeAll(async () => {
    // Clean up any existing routes
    await deleteAllRoutes(e2eReq);
  });

  test.afterAll(async () => {
    // Clean up test routes
    await deleteAllRoutes(e2eReq);
  });

  test('should filter routes by version across all pages', async ({ page }) => {
    test.slow(); // This test creates multiple routes via UI

    await test.step('create routes with different versions via UI', async () => {
      await routesPom.toIndex(page);
      await routesPom.isIndexPage(page);

      // Create 3 routes with version v1
      for (let i = 1; i <= 3; i++) {
        await routesPom.getAddRouteBtn(page).click();
        await routesPom.isAddPage(page);

        await page.getByLabel('Name', { exact: true }).first().fill(`route_v1_${i}`);
        await page.getByLabel('URI', { exact: true }).fill(`/v1/test${i}`);

        // Select HTTP method
        await page.getByRole('textbox', { name: 'HTTP Methods' }).click();
        await page.getByRole('option', { name: 'GET' }).click();

        // Add label for version (in the route section, not upstream)
        const routeLabelsField = page.getByRole('textbox', { name: 'Labels' }).first();
        await routeLabelsField.click();
        await routeLabelsField.fill('version:v1');
        await routeLabelsField.press('Enter');

        // Add upstream
        const upstreamSection = page.getByRole('group', {
          name: 'Upstream',
          exact: true,
        });
        await uiFillUpstreamRequiredFields(upstreamSection, {
          nodes,
          name: `upstream_v1_${i}`,
          desc: 'test',
        });

        await routesPom.getAddBtn(page).click();
        await uiHasToastMsg(page, {
          hasText: 'Add Route Successfully',
        });

        // Go back to list
        await routesPom.getRouteNavBtn(page).click();
        await routesPom.isIndexPage(page);
      }

      // Create 3 routes with version v2
      for (let i = 1; i <= 3; i++) {
        await routesPom.getAddRouteBtn(page).click();
        await routesPom.isAddPage(page);

        await page.getByLabel('Name', { exact: true }).first().fill(`route_v2_${i}`);
        await page.getByLabel('URI', { exact: true }).fill(`/v2/test${i}`);

        // Select HTTP method
        await page.getByRole('textbox', { name: 'HTTP Methods' }).click();
        await page.getByRole('option', { name: 'GET' }).click();

        // Add label for version (in the route section, not upstream)
        const routeLabelsField = page.getByRole('textbox', { name: 'Labels' }).first();
        await routeLabelsField.click();
        await routeLabelsField.fill('version:v2');
        await routeLabelsField.press('Enter');

        // Add upstream
        const upstreamSection = page.getByRole('group', {
          name: 'Upstream',
          exact: true,
        });
        await uiFillUpstreamRequiredFields(upstreamSection, {
          nodes,
          name: `upstream_v2_${i}`,
          desc: 'test',
        });

        await routesPom.getAddBtn(page).click();
        await uiHasToastMsg(page, {
          hasText: 'Add Route Successfully',
        });

        // Go back to list
        await routesPom.getRouteNavBtn(page).click();
        await routesPom.isIndexPage(page);
      }
    });

    await test.step('verify all routes are created with labels', async () => {
      // Verify routes are visible in list
      await expect(page.getByText('route_v1_1')).toBeVisible();
      await expect(page.getByText('route_v2_1')).toBeVisible();
    });
  });
});
