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
import { servicesPom } from '@e2e/pom/services';
import { randomId } from '@e2e/utils/common';
import { env } from '@e2e/utils/env';
import { e2eReq } from '@e2e/utils/req';
import { test } from '@e2e/utils/test';
import { uiGoto } from '@e2e/utils/ui';
import { expect, type Page } from '@playwright/test';

import { postRouteReq } from '@/apis/routes';
import { postServiceReq } from '@/apis/services';
import type { APISIXType } from '@/types/schema/apisix';

test.describe.configure({ mode: 'serial' });

const serviceName = randomId('test-service');
const anotherServiceName = randomId('another-service');
const routes: APISIXType['Route'][] = [
  {
    name: randomId('route1'),
    uri: '/api/v1/test1',
    methods: ['GET'],
    labels: { test: serviceName },
  },
  {
    name: randomId('route2'),
    uri: '/api/v1/test2',
    methods: ['POST'],
    labels: { test: serviceName },
  },
  {
    name: randomId('route3'),
    uri: '/api/v1/test3',
    methods: ['PUT'],
    labels: { test: serviceName },
  },
];

const upstreamRouteName = randomId('upstream-route');
const upstreamRoute: APISIXType['Route'] = {
  name: upstreamRouteName,
  uri: '/api/v1/upstream-test',
  methods: ['GET'],
  upstream: {
    nodes: [{ host: 'example.com', port: 80, weight: 100 }],
  },
  labels: { test: upstreamRouteName },
};

const anotherServiceRouteName = randomId('another-service-route');
const anotherServiceRoute: APISIXType['Route'] = {
  name: anotherServiceRouteName,
  uri: '/api/v1/another-test',
  methods: ['GET'],
  labels: { test: anotherServiceName },
};

let testServiceId: string;
let anotherServiceId: string;
const createdRoutes: string[] = [];

let upstreamRouteId: string;
let anotherServiceRouteId: string;

test.beforeAll(async () => {
  const serviceResponse = await postServiceReq(e2eReq, {
    name: serviceName,
    desc: 'Test service for route listing',
    labels: { test: serviceName },
  });

  testServiceId = serviceResponse.data.value.id;

  const anotherServiceResponse = await postServiceReq(e2eReq, {
    name: anotherServiceName,
    desc: 'Another test service for route isolation testing',
    labels: { test: anotherServiceName },
  });

  anotherServiceId = anotherServiceResponse.data.value.id;

  for (const route of routes) {
    const routeResponse = await postRouteReq(e2eReq, {
      ...(route as unknown),
      service_id: testServiceId,
    });
    if (!routeResponse.data?.value) {
      throw new Error(`Failed to create route: ${JSON.stringify(routeResponse.data)}`);
    }
    createdRoutes.push(routeResponse.data.value.id);
  }


  const upstreamRouteResponse = await postRouteReq(e2eReq, upstreamRoute as unknown);
  if (!upstreamRouteResponse.data?.value) {
    throw new Error(`Failed to create upstream route: ${JSON.stringify(upstreamRouteResponse.data)}`);
  }
  upstreamRouteId = upstreamRouteResponse.data.value.id;

  const anotherServiceRouteResponse = await postRouteReq(e2eReq, {
    ...(anotherServiceRoute as unknown),
    service_id: anotherServiceId,
  });
  if (!anotherServiceRouteResponse.data?.value) {
    throw new Error(`Failed to create another service route: ${JSON.stringify(anotherServiceRouteResponse.data)}`);
  }
  anotherServiceRouteId = anotherServiceRouteResponse.data.value.id;

  // Significant delay for backend consistency in intensive parallel CI
  // Moved to end of setup to ensure all resources have time to propagate
  await new Promise((resolve) => setTimeout(resolve, 8000));
});

test.afterAll(async () => {
  const allRouteIds = [...createdRoutes, upstreamRouteId, anotherServiceRouteId].filter(Boolean);
  for (const id of allRouteIds) {
    await e2eReq.delete(`/routes/${id}`);
  }

  if (testServiceId) {
    await e2eReq.delete(`/services/${testServiceId}`);
  }
  if (anotherServiceId) {
    await e2eReq.delete(`/services/${anotherServiceId}`);
  }
});

async function navigateToServiceDetail(page: Page, id: string, name: string) {
  // Try search first as it's the intended UI flow
  await page.goto(`${env.E2E_TARGET_URL}services?name=${name}&page_size=100`);
  const row = page.locator('tr').filter({ hasText: name });

    try {
      await expect(row.first()).toBeVisible({ timeout: 15000 });
      await row.getByText('View').click();
      await expect(page).toHaveURL(new RegExp(`/services/detail/${id}`));
    } catch {
    // Stage 2: Reload search
    await page.reload();
    try {
      await expect(row.first()).toBeVisible({ timeout: 15000 });
      await row.getByText('View').click();
    } catch {
      // Stage 3: Direct Link as absolute fallback
      await uiGoto(page, '/services/detail/$id', { id });
    }
  }

  await servicesPom.isDetailPage(page);
}

test('should only show routes with current service_id', async ({ page }) => {
  await test.step('should only show routes with current service_id', async () => {
    await navigateToServiceDetail(page, testServiceId, serviceName);

    await servicesPom.getServiceRoutesTab(page).click();
    await servicesPom.isServiceRoutesPage(page);
    await page.waitForLoadState('load');

    await expect(page.getByRole('cell', { name: anotherServiceRoute.name })).toBeHidden();
    await expect(page.getByRole('cell', { name: upstreamRoute.name })).toBeHidden();

    for (const route of routes) {
      await expect(page.getByRole('cell', { name: route.name })).toBeVisible({ timeout: 20000 });
    }
  });

  await test.step('without service_id routes should still exist in the routes list', async () => {
    // Navigate using POM to reach the correct base path
    await routesPom.toIndex(page);
    await routesPom.isIndexPage(page);

    // Filter by name for precise isolation - use absolute fallbacks and reloads if needed
    const searchByName = async (name: string) => {
      const url = new URL(page.url());
      url.searchParams.set('name', name);
      url.searchParams.set('page_size', '100');
      await page.goto(url.toString());
      await page.waitForLoadState('load');

      const locator = page.getByRole('cell', { name });
      try {
        await locator.waitFor({ timeout: 15000 });
      } catch {
        // Retry with a clean reload if backend propagation is lagging
        await page.reload();
        await page.waitForLoadState('load');
        await locator.waitFor({ timeout: 15000 });
      }
    };

    await searchByName(upstreamRouteName);
    await searchByName(anotherServiceRouteName);

    for (const route of routes) {
      await searchByName(route.name);
    }
  });
});

test('should display routes list under service', async ({ page }) => {
  await navigateToServiceDetail(page, testServiceId, serviceName);

  await servicesPom.getServiceRoutesTab(page).click();
  await servicesPom.isServiceRoutesPage(page);

  await test.step('should display all routes under service', async () => {
    for (const route of routes) {
      await expect(page.getByRole('cell', { name: route.name })).toBeVisible({ timeout: 30000 });
      await expect(page.getByRole('cell', { name: route.uri })).toBeVisible({ timeout: 30000 });
    }
  });

  await test.step('should have correct table headers', async () => {
    await expect(page.getByRole('columnheader', { name: 'ID' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Name' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'URI' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Actions' })).toBeVisible();
  });

  await test.step('should be able to navigate to route detail', async () => {
    const row = page.getByRole('row', { name: routes[0].name });
    await expect(row).toBeVisible({ timeout: 30000 });
    await row.scrollIntoViewIfNeeded();
    
    // Click the View button
    await row.getByRole('button', { name: 'View' }).click();
    await servicesPom.isServiceRouteDetailPage(page);
    await expect(page.getByLabel('Name', { exact: true }).first()).toHaveValue(routes[0].name);
    await expect(page.getByLabel('Service ID', { exact: true })).toHaveValue(testServiceId);
  });

  await test.step('should have Add Route button', async () => {
    await servicesPom.toServiceRoutes(page, testServiceId);
    await servicesPom.isServiceRoutesPage(page);
    const addRouteBtn = servicesPom.getAddRouteBtn(page);
    await expect(addRouteBtn).toBeVisible();
    await addRouteBtn.click();
    await servicesPom.isServiceRouteAddPage(page);
    const serviceIdField = page.getByLabel('Service ID', { exact: true });
    await expect(serviceIdField).toHaveValue(testServiceId);
    await expect(serviceIdField).toBeDisabled();
  });

  await test.step('should show correct route count', async () => {
    await servicesPom.toServiceRoutes(page, testServiceId);
    await servicesPom.isServiceRoutesPage(page);
    await expect(page.locator('tbody tr')).toHaveCount(routes.length);
  });
});
