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
import { servicesPom } from '@e2e/pom/services';
import { randomId } from '@e2e/utils/common';
import { env } from '@e2e/utils/env';
import { e2eReq } from '@e2e/utils/req';
import { test } from '@e2e/utils/test';
import { uiGoto } from '@e2e/utils/ui';
import { expect, type Page } from '@playwright/test';

import { postServiceReq } from '@/apis/services';
import { getStreamRouteListReq, postStreamRouteReq } from '@/apis/stream_routes';

test.describe.configure({ mode: 'serial' });

const serviceName = randomId('test-service');
const anotherServiceName = randomId('another-service');
// Use indexed octets with random offset to ensure uniqueness (0-4 starting at random value to avoid reserved ranges)
const randomOffset = Math.floor(Math.random() * 100) + 100;
let octetIndex = randomOffset;
const getUniqueOctet = () => (octetIndex++ % 256);
const streamRoutes = [
  {
    server_addr: `127.0.0.${getUniqueOctet()}`,
    server_port: 8080,
  },
  {
    server_addr: `127.0.0.${getUniqueOctet()}`,
    server_port: 8081,
  },
  {
    server_addr: `127.0.0.${getUniqueOctet()}`,
    server_port: 8082,
  },
];

const upstreamStreamRoute = {
  server_addr: `127.0.0.${getUniqueOctet()}`,
  server_port: 9090,
  upstream: {
    nodes: [{ host: 'example.com', port: 80, weight: 100 }],
  },
};

const anotherServiceStreamRoute = {
  server_addr: `127.0.0.${getUniqueOctet()}`,
  server_port: 9091,
};

let testServiceId: string;
let anotherServiceId: string;
const createdStreamRoutes: string[] = [];

let upstreamStreamRouteId: string;
let anotherServiceStreamRouteId: string;

test.beforeAll(async () => {
  const serviceResponse = await postServiceReq(e2eReq, {
    name: serviceName,
    desc: 'Test service for stream route listing',
    labels: { test: serviceName },
  });

  testServiceId = serviceResponse.data.value.id;

  const anotherServiceResponse = await postServiceReq(e2eReq, {
    name: anotherServiceName,
    desc: 'Another test service for stream route isolation testing',
    labels: { test: anotherServiceName },
  });

  anotherServiceId = anotherServiceResponse.data.value.id;

  for (const streamRoute of streamRoutes) {
    const streamRouteResponse = await postStreamRouteReq(e2eReq, {
      server_addr: streamRoute.server_addr,
      server_port: streamRoute.server_port,
      service_id: testServiceId,
      labels: { test: serviceName },
    });
    if (!streamRouteResponse.data?.value) {
      throw new Error(`Failed to create stream route: ${JSON.stringify(streamRouteResponse.data)}`);
    }
    createdStreamRoutes.push(streamRouteResponse.data.value.id);
  }

  const upstreamStreamRouteResponse = await postStreamRouteReq(e2eReq, {
    ...upstreamStreamRoute,
    labels: { test: 'upstream-' + serviceName },
  });
  if (!upstreamStreamRouteResponse.data?.value) {
    throw new Error(`Failed to create upstream stream route: ${JSON.stringify(upstreamStreamRouteResponse.data)}`);
  }
  upstreamStreamRouteId = upstreamStreamRouteResponse.data.value.id;

  const anotherServiceStreamRouteResponse = await postStreamRouteReq(e2eReq, {
    ...anotherServiceStreamRoute,
    service_id: anotherServiceId,
    labels: { test: anotherServiceName },
  });
  if (!anotherServiceStreamRouteResponse.data?.value) {
    throw new Error(`Failed to create another service stream route: ${JSON.stringify(anotherServiceStreamRouteResponse.data)}`);
  }
  anotherServiceStreamRouteId = anotherServiceStreamRouteResponse.data.value.id;

  // Wait for data propagation to complete by polling the backend
  await expect(async () => {
    const res = await getStreamRouteListReq(e2eReq, { page_size: 100 } as Parameters<typeof getStreamRouteListReq>[1]);
    const existingIds = res.list.map((r) => r.value.id);
    const expectedIds = [...createdStreamRoutes, upstreamStreamRouteId, anotherServiceStreamRouteId].filter(Boolean);
    expect(expectedIds.every((id) => existingIds.includes(id))).toBeTruthy();
  }).toPass({ timeout: 15000, intervals: [1000] });
});

test.afterAll(async () => {
  const allStreamRouteIds = [...createdStreamRoutes, upstreamStreamRouteId, anotherServiceStreamRouteId].filter(Boolean);
  for (const id of allStreamRouteIds) {
    await e2eReq.delete(`/stream_routes/${id}`);
  }

  if (testServiceId) {
    await e2eReq.delete(`/services/${testServiceId}`);
  }
  if (anotherServiceId) {
    await e2eReq.delete(`/services/${anotherServiceId}`);
  }
});

async function navigateToServiceDetail(page: Page, id: string) {
  await uiGoto(page, '/services/detail/$id', { id });
  await page.waitForLoadState('load');
  await servicesPom.isDetailPage(page);
}

test('should only show stream routes with current service_id', async ({ page }) => {
  await test.step('should only show stream routes with current service_id', async () => {
    await navigateToServiceDetail(page, testServiceId);

    await servicesPom.getServiceStreamRoutesTab(page).click();
    await servicesPom.isServiceStreamRoutesPage(page);
    await page.waitForLoadState('load');

    await expect(page.getByRole('cell', { name: anotherServiceStreamRoute.server_addr })).toBeHidden();
    await expect(page.getByRole('cell', { name: upstreamStreamRoute.server_addr })).toBeHidden();

    for (const streamRoute of streamRoutes) {
      await expect(page.getByRole('cell', { name: streamRoute.server_addr })).toBeVisible({ timeout: 30000 });
    }
  });

  await test.step('without service_id stream routes should still exist in the stream routes list', async () => {
    // Navigate using POM to reach the correct base path
    await page.goto(`${env.E2E_TARGET_URL}stream_routes`);
    await page.waitForLoadState('load');

    const searchByIP = async (ip: string) => {
      const url = new URL(page.url());
      // Removed search parameter to fix unused param warning. Filtering by locating text on page.
      url.searchParams.set('page_size', '100');
      await page.goto(url.toString());
      await page.waitForLoadState('load');

      const locator = page.getByRole('cell', { name: ip }).first();
      try {
        await locator.waitFor({ timeout: 15000 });
      } catch {
        // Retry with a clean reload if backend propagation is lagging
        await page.reload();
        await page.waitForLoadState('load');
        await locator.waitFor({ timeout: 15000 });
      }
    };

    await searchByIP(upstreamStreamRoute.server_addr);
    await searchByIP(anotherServiceStreamRoute.server_addr);

    for (const streamRoute of streamRoutes) {
      await searchByIP(streamRoute.server_addr);
    }
  });
});

test('should display stream routes list under service', async ({ page }) => {
  await navigateToServiceDetail(page, testServiceId);

  await servicesPom.getServiceStreamRoutesTab(page).click();
  await servicesPom.isServiceStreamRoutesPage(page);

  await test.step('should display all stream routes under service', async () => {
    for (const streamRoute of streamRoutes) {
      await expect(page.getByRole('cell', { name: streamRoute.server_addr })).toBeVisible({ timeout: 30000 });
      await expect(page.getByRole('cell', { name: streamRoute.server_port.toString() })).toBeVisible({ timeout: 30000 });
    }
  });

  await test.step('should have correct table headers', async () => {
    await expect(page.getByRole('columnheader', { name: 'ID' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Server Address' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Server Port' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Actions' })).toBeVisible();
  });

  await test.step('should be able to navigate to stream route detail', async () => {
    const row = page.getByRole('row', { name: streamRoutes[0].server_addr });
    await expect(row).toBeVisible({ timeout: 30000 });
    await row.scrollIntoViewIfNeeded();

    // Click the View button
    await row.getByRole('button', { name: 'View' }).click();
    await servicesPom.isServiceStreamRouteDetailPage(page);
    await expect(page.getByLabel('Server Address', { exact: true })).toHaveValue(streamRoutes[0].server_addr);
    await expect(page.getByLabel('Service ID', { exact: true })).toHaveValue(testServiceId);
  });

  await test.step('should have Add Stream Route button', async () => {
    await servicesPom.toServiceStreamRoutes(page, testServiceId);
    await servicesPom.isServiceStreamRoutesPage(page);
    const addStreamRouteBtn = servicesPom.getAddStreamRouteBtn(page);
    await expect(addStreamRouteBtn).toBeVisible();
    await addStreamRouteBtn.click();
    await servicesPom.isServiceStreamRouteAddPage(page);
    const serviceIdField = page.getByLabel('Service ID', { exact: true });
    await expect(serviceIdField).toHaveValue(testServiceId);
    await expect(serviceIdField).toBeDisabled();
  });

  await test.step('should show correct stream route count', async () => {
    await servicesPom.toServiceStreamRoutes(page, testServiceId);
    await servicesPom.isServiceStreamRoutesPage(page);
    await expect(page.locator('tbody tr')).toHaveCount(streamRoutes.length);
  });
});
