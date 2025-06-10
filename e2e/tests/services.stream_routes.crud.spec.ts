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
import { uiHasToastMsg } from '@e2e/utils/ui';
import { expect } from '@playwright/test';

import { deleteAllServices, postServiceReq } from '@/apis/services';
import { deleteAllStreamRoutes } from '@/apis/stream_routes';

const serviceName = randomId('test-service');
const streamRouteServerAddr = '127.0.0.1';
const streamRouteServerPort = 8080;
const updatedStreamRouteServerAddr = '127.0.0.2';
const updatedStreamRouteServerPort = 8081;

let testServiceId: string;

test.beforeAll(async () => {
  await deleteAllStreamRoutes(e2eReq);
  await deleteAllServices(e2eReq);

  // Create a test service for testing service stream routes
  const serviceResponse = await postServiceReq(e2eReq, {
    name: serviceName,
    desc: 'Test service for stream route CRUD testing',
  });

  testServiceId = serviceResponse.data.value.id;
});

test.afterAll(async () => {
  await deleteAllStreamRoutes(e2eReq);
  await deleteAllServices(e2eReq);
});

test('should CRUD stream route under service', async ({ page }) => {
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

  await servicesPom.getAddStreamRouteBtn(page).click();
  await servicesPom.isServiceStreamRouteAddPage(page);

  await test.step('can submit without any fields (no required fields)', async () => {
    // Verify service_id is pre-filled and disabled (since it's read-only in service context)
    const serviceIdField = page.getByLabel('Service ID', { exact: true });
    await expect(serviceIdField).toHaveValue(testServiceId);
    await expect(serviceIdField).toBeDisabled();

    // Submit the form without filling any other fields
    await servicesPom.getAddBtn(page).click();
    await uiHasToastMsg(page, {
      hasText: 'Add Stream Route Successfully',
    });
  });

  await test.step('auto navigate to stream route detail page', async () => {
    await servicesPom.isServiceStreamRouteDetailPage(page);

    // Verify the stream route details
    // Verify ID exists
    const ID = page.getByRole('textbox', { name: 'ID', exact: true });
    await expect(ID).toBeVisible();
    await expect(ID).toBeDisabled();

    // Verify service_id is still pre-filled and disabled
    const serviceIdField = page.getByLabel('Service ID', { exact: true });
    await expect(serviceIdField).toHaveValue(testServiceId);
    await expect(serviceIdField).toBeDisabled();

    // Verify default values for server address and port (should be empty initially)
    const serverAddrField = page.getByLabel('Server Address', { exact: true });
    const serverPortField = page.getByLabel('Server Port', { exact: true });

    // These fields might be empty or have default values
    await expect(serverAddrField).toBeVisible();
    await expect(serverPortField).toBeVisible();
  });

  await test.step('edit and update stream route with some fields', async () => {
    // Click the Edit button in the detail page
    await page.getByRole('button', { name: 'Edit' }).click();

    // Verify we're in edit mode - fields should be editable now
    const serverAddrField = page.getByLabel('Server Address', { exact: true });
    await expect(serverAddrField).toBeEnabled();

    // Service ID should still be disabled even in edit mode
    const serviceIdField = page.getByLabel('Service ID', { exact: true });
    await expect(serviceIdField).toBeDisabled();

    // Fill in some fields
    await serverAddrField.fill(streamRouteServerAddr);

    const serverPortField = page.getByLabel('Server Port', { exact: true });
    await serverPortField.fill(streamRouteServerPort.toString());

    // Click the Save button to save changes
    const saveBtn = page.getByRole('button', { name: 'Save' });
    await saveBtn.click();

    // Verify the update was successful
    await uiHasToastMsg(page, {
      hasText: 'success',
    });

    // Verify we're back in detail view mode
    await servicesPom.isServiceStreamRouteDetailPage(page);

    // Verify the updated fields
    await expect(
      page.getByLabel('Server Address', { exact: true })
    ).toHaveValue(streamRouteServerAddr);
    await expect(page.getByLabel('Server Port', { exact: true })).toHaveValue(
      streamRouteServerPort.toString()
    );
  });

  await test.step('edit again and update with different values', async () => {
    // Click the Edit button again
    await page.getByRole('button', { name: 'Edit' }).click();

    // Update with different values
    const serverAddrField = page.getByLabel('Server Address', { exact: true });
    await serverAddrField.fill(updatedStreamRouteServerAddr);

    const serverPortField = page.getByLabel('Server Port', { exact: true });
    await serverPortField.fill(updatedStreamRouteServerPort.toString());

    // Click the Save button
    const saveBtn = page.getByRole('button', { name: 'Save' });
    await saveBtn.click();

    // Verify the update was successful
    await uiHasToastMsg(page, {
      hasText: 'success',
    });

    // Verify the updated values
    await expect(
      page.getByLabel('Server Address', { exact: true })
    ).toHaveValue(updatedStreamRouteServerAddr);
    await expect(page.getByLabel('Server Port', { exact: true })).toHaveValue(
      updatedStreamRouteServerPort.toString()
    );
  });

  await test.step('stream route should exist in service stream routes list', async () => {
    // Navigate back to service stream routes list
    await servicesPom.toServiceStreamRoutes(page, testServiceId);
    await servicesPom.isServiceStreamRoutesPage(page);

    // Verify the stream route appears in the list with updated values
    await expect(
      page.getByRole('cell', { name: updatedStreamRouteServerAddr })
    ).toBeVisible();
    await expect(
      page.getByRole('cell', { name: updatedStreamRouteServerPort.toString() })
    ).toBeVisible();

    // Click on the stream route to go to the detail page
    await page
      .getByRole('row', { name: updatedStreamRouteServerAddr })
      .getByRole('button', { name: 'View' })
      .click();
    await servicesPom.isServiceStreamRouteDetailPage(page);
  });

  await test.step('delete stream route in detail page', async () => {
    // We're already on the detail page from the previous step

    // Delete the stream route
    await page.getByRole('button', { name: 'Delete' }).click();

    await page
      .getByRole('dialog', { name: 'Delete Stream Route' })
      .getByRole('button', { name: 'Delete' })
      .click();

    // Will redirect to service stream routes page
    await servicesPom.isServiceStreamRoutesPage(page);
    await uiHasToastMsg(page, {
      hasText: 'Delete Stream Route Successfully',
    });

    // Verify the stream route is no longer in the list
    await expect(
      page.getByRole('cell', { name: updatedStreamRouteServerAddr })
    ).toBeHidden();
  });

  await test.step('create another stream route with minimal fields', async () => {
    // Add another stream route to test creation with minimal data
    await servicesPom.getAddStreamRouteBtn(page).click();
    await servicesPom.isServiceStreamRouteAddPage(page);

    // Just fill server address this time
    const serverAddrField = page.getByLabel('Server Address', { exact: true });
    await serverAddrField.fill('192.168.1.1');

    // Submit the form
    await servicesPom.getAddBtn(page).click();
    await uiHasToastMsg(page, {
      hasText: 'Add Stream Route Successfully',
    });

    // Verify we're on the detail page
    await servicesPom.isServiceStreamRouteDetailPage(page);
    await expect(
      page.getByLabel('Server Address', { exact: true })
    ).toHaveValue('192.168.1.1');

    // Clean up - delete this stream route too
    await page.getByRole('button', { name: 'Delete' }).click();
    await page
      .getByRole('dialog', { name: 'Delete Stream Route' })
      .getByRole('button', { name: 'Delete' })
      .click();
    await servicesPom.isServiceStreamRoutesPage(page);
  });
});
