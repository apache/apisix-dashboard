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
import { e2eReq } from '@e2e/utils/req';
import { test } from '@e2e/utils/test';
import { expect } from '@playwright/test';

import { deleteAllServices, postServiceReq } from '@/apis/services';
import {
  deleteAllStreamRoutes,
  postStreamRouteReq,
} from '@/apis/stream_routes';

const serviceName = randomId('test-service');
const streamRoutes = [
  {
    server_addr: '127.0.0.1',
    server_port: 8080,
  },
  {
    server_addr: '127.0.0.2',
    server_port: 8081,
  },
  {
    server_addr: '127.0.0.3',
    server_port: 8082,
  },
];

let testServiceId: string;
const createdStreamRoutes: string[] = [];

test.beforeAll(async () => {
  await deleteAllStreamRoutes(e2eReq);
  await deleteAllServices(e2eReq);

  // Create a test service for testing service stream routes
  const serviceResponse = await postServiceReq(e2eReq, {
    name: serviceName,
    desc: 'Test service for stream route listing',
  });

  testServiceId = serviceResponse.data.value.id;

  // Create test stream routes under the service
  for (const streamRoute of streamRoutes) {
    const streamRouteResponse = await postStreamRouteReq(e2eReq, {
      server_addr: streamRoute.server_addr,
      server_port: streamRoute.server_port,
      service_id: testServiceId,
    });
    createdStreamRoutes.push(streamRouteResponse.data.value.id);
  }
});

test.afterAll(async () => {
  await deleteAllStreamRoutes(e2eReq);
  await deleteAllServices(e2eReq);
});

test('should display stream routes list under service', async ({ page }) => {
  // Navigate to service detail page
  await servicesPom.toIndex(page);
  await servicesPom.isIndexPage(page);

  // Click on the service to go to detail page
  await page
    .getByRole('row', { name: serviceName })
    .getByRole('button', { name: 'View' })
    .click();
  await servicesPom.isDetailPage(page);

  // Navigate to Stream Routes tab
  await servicesPom.getServiceStreamRoutesTab(page).click();
  await servicesPom.isServiceStreamRoutesPage(page);

  await test.step('should display all stream routes under service', async () => {
    // Verify all created stream routes are displayed
    for (const streamRoute of streamRoutes) {
      await expect(
        page.getByRole('cell', { name: streamRoute.server_addr })
      ).toBeVisible();
      await expect(
        page.getByRole('cell', { name: streamRoute.server_port.toString() })
      ).toBeVisible();
    }
  });

  await test.step('should have correct table headers', async () => {
    await expect(page.getByRole('columnheader', { name: 'ID' })).toBeVisible();
    await expect(
      page.getByRole('columnheader', { name: 'Server Address' })
    ).toBeVisible();
    await expect(
      page.getByRole('columnheader', { name: 'Server Port' })
    ).toBeVisible();
    await expect(
      page.getByRole('columnheader', { name: 'Actions' })
    ).toBeVisible();
  });

  await test.step('should be able to navigate to stream route detail', async () => {
    // Click on the first stream route's View button
    await page
      .getByRole('row', { name: streamRoutes[0].server_addr })
      .getByRole('button', { name: 'View' })
      .click();

    await servicesPom.isServiceStreamRouteDetailPage(page);

    // Verify we're on the correct stream route detail page
    const serverAddrField = page.getByLabel('Server Address', { exact: true });
    await expect(serverAddrField).toHaveValue(streamRoutes[0].server_addr);

    // Verify service_id is correct
    const serviceIdField = page.getByLabel('Service ID', { exact: true });
    await expect(serviceIdField).toHaveValue(testServiceId);
  });

  await test.step('should have Add Stream Route button', async () => {
    // Navigate back to service stream routes list
    await servicesPom.toServiceStreamRoutes(page, testServiceId);
    await servicesPom.isServiceStreamRoutesPage(page);

    // Verify Add Stream Route button exists and is clickable
    const addStreamRouteBtn = servicesPom.getAddStreamRouteBtn(page);
    await expect(addStreamRouteBtn).toBeVisible();

    await addStreamRouteBtn.click();
    await servicesPom.isServiceStreamRouteAddPage(page);

    // Verify service_id is pre-filled
    const serviceIdField = page.getByLabel('Service ID', { exact: true });
    await expect(serviceIdField).toHaveValue(testServiceId);
    await expect(serviceIdField).toBeDisabled();
  });

  await test.step('should show correct stream route count', async () => {
    // Navigate back to service stream routes list
    await servicesPom.toServiceStreamRoutes(page, testServiceId);
    await servicesPom.isServiceStreamRoutesPage(page);

    // Check that all 3 stream routes are displayed in the table
    const tableRows = page.locator('tbody tr');
    await expect(tableRows).toHaveCount(streamRoutes.length);
  });
});
