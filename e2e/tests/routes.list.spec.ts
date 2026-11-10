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
    await Promise.all(routes.slice(0, -1).map((d) => putRouteReq(e2eReq, d)));
    await putRouteReq(e2eReq, {
      ...routes[10],
      labels: { team: 'payments-ops' },
      status: 0,
    });
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

  test('searches across pages and reuses the downloaded routes', async ({ page }) => {
    const listRequests: URL[] = [];
    page.on('request', (request) => {
      const url = new URL(request.url());
      if (request.method() === 'GET' && url.pathname === '/apisix/admin/routes') {
        listRequests.push(url);
      }
    });
    await routesPom.getRouteNavBtn(page).click();
    const search = page.getByRole('searchbox', { name: 'Search routes' });
    const first = page.getByRole('cell', { name: 'route_name_1', exact: true });
    const target = page.getByRole('cell', { name: 'route_name_11', exact: true });
    await expect(first).toBeVisible();
    await expect(target).toBeHidden();
    expect(listRequests).toHaveLength(1);
    expect(listRequests[0].searchParams.get('page_size')).toBe('10');

    await search.fill('PAYMENTS-OPS');
    await expect(target).toBeVisible();
    await expect(first).toBeHidden();
    expect(listRequests).toHaveLength(2);
    expect(listRequests[1].search).toBe('');

    await search.fill('route_name_');
    await expect(first).toBeVisible();
    await expect(target).toBeHidden();
    await page.getByRole('listitem', { name: '2', exact: true }).click();
    await expect(target).toBeVisible();
    await search.fill('disabled');
    await expect(target).toBeVisible();
    await expect(page.getByRole('listitem', { name: '1', exact: true })).toBeVisible();

    await search.fill('no-such-route');
    await expect(page.getByText('No routes match this search')).toBeVisible();
    await search.clear();
    await expect(first).toBeVisible();
    await expect(target).toBeHidden();
    expect(listRequests).toHaveLength(2);
  });

  test('matches complete status labels using the selected language', async ({ page }) => {
    await routesPom.getRouteNavBtn(page).click();
    const enabledRoute = page.getByRole('cell', { name: 'route_name_1', exact: true });
    const disabledRoute = page.getByRole('cell', { name: 'route_name_11', exact: true });

    for (const [language, label, enabled, disabled] of [
      ['Deutsch', 'Routen suchen', 'Aktiviert', 'Deaktiviert'],
      ['Español', 'Buscar rutas', 'Habilitado', 'Deshabilitado'],
      ['Türkçe', 'Rota ara', 'AKTİF', 'PASİF'],
    ]) {
      await page.getByRole('button', { name: 'Select language' }).click();
      await page.getByRole('menuitem', { name: language }).click();
      const search = page.getByRole('searchbox', { name: label });

      await search.fill(enabled);
      await expect(enabledRoute).toBeVisible();
      await expect(disabledRoute).toBeHidden();
      await expect(page.getByRole('listitem', { name: '2', exact: true })).toBeHidden();

      await search.fill(disabled);
      await expect(disabledRoute).toBeVisible();
      await expect(enabledRoute).toBeHidden();
    }
  });
});
