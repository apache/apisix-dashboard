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
import { API_ROUTES } from '@/config/constant';
import type { APISIXType } from '@/types/schema/apisix';

// Sample routes for testing search functionality
const testRoutes: APISIXType['Route'][] = [
  {
    id: 'search_route_1',
    name: 'alpha_route',
    uri: '/alpha',
    desc: 'First test route',
    methods: ['GET'],
    upstream: {
      nodes: [{ host: '127.0.0.1', port: 80, weight: 100 }],
    },
  },
  {
    id: 'search_route_2',
    name: 'beta_route',
    uri: '/beta',
    desc: 'Second test route',
    methods: ['POST'],
    upstream: {
      nodes: [{ host: '127.0.0.1', port: 80, weight: 100 }],
    },
  },
  {
    id: 'search_route_3',
    name: 'gamma_route',
    uri: '/gamma',
    desc: 'Third test route',
    methods: ['GET'],
    upstream: {
      nodes: [{ host: '127.0.0.1', port: 80, weight: 100 }],
    },
  },
];

test.describe('Routes search functionality', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeAll(async () => {
    await deleteAllRoutes(e2eReq);
    await Promise.all(testRoutes.map((route) => putRouteReq(e2eReq, route)));
  });

  test.afterAll(async () => {
    await Promise.all(
      testRoutes.map((route) => e2eReq.delete(`${API_ROUTES}/${route.id}`))
    );
  });

  test('should filter routes by name', async ({ page }) => {
    await test.step('navigate to routes page', async () => {
      await routesPom.getRouteNavBtn(page).click();
      await routesPom.isIndexPage(page);
    });

    await test.step('search for routes with "alpha" in name', async () => {
      const nameInput = page.getByLabel('Name'); // Matches the label from SearchForm
      await nameInput.fill('alpha');
      const searchButton = page.getByRole('button', { name: 'Search' });
      await searchButton.click();

      // Wait for table to update
      await expect(page.getByText('alpha_route')).toBeVisible();

      // Verify only matching route is shown
      const tableRows = page.getByRole('row');
      await expect(tableRows).toHaveCount(2); // Header + 1 data row
      await expect(page.getByText('beta_route')).toBeHidden();
      await expect(page.getByText('gamma_route')).toBeHidden();
    });

    await test.step('reset search and verify all routes are shown', async () => {
      const resetButton = page.getByRole('button', { name: 'Reset' });
      await resetButton.click();

      // Wait for table to update
      await expect(page.getByText('beta_route')).toBeVisible();

      // Verify all routes are back
      const tableRows = page.getByRole('row');
      await expect(tableRows).toHaveCount(4); // Header + 3 data rows
      await expect(page.getByText('alpha_route')).toBeVisible();
      await expect(page.getByText('gamma_route')).toBeVisible();
    });
  });

  test('should show no results for non-matching search', async ({ page }) => {
    await test.step('navigate to routes page', async () => {
      await routesPom.getRouteNavBtn(page).click();
      await routesPom.isIndexPage(page);
    });

    await test.step('search for non-existent name', async () => {
      const nameInput = page.getByLabel('Name');
      await nameInput.fill('nonexistent');
      const searchButton = page.getByRole('button', { name: 'Search' });
      await searchButton.click();

      // Wait for table to update
      await expect(page.getByText('No Data')).toBeVisible(); // Assuming Antd's empty state
    });
  });
});