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
import {
  uiCheckServiceRequiredFields,
  uiFillServiceRequiredFields,
} from '@e2e/utils/ui/services';
import { expect } from '@playwright/test';

import { deleteAllServices } from '@/apis/services';

test.describe.configure({ mode: 'serial' });

const serviceName = randomId('test-service');

test.beforeAll(async () => {
  await deleteAllServices(e2eReq);
});

test('should CRUD service with required fields', async ({ page }) => {
  await servicesPom.toIndex(page);
  await servicesPom.isIndexPage(page);

  await servicesPom.getAddServiceBtn(page).click();
  await servicesPom.isAddPage(page);

  await test.step('submit with required fields', async () => {
    await uiFillServiceRequiredFields(page, {
      name: serviceName,
    });

    // Ensure upstream is valid. In some configurations (e.g. http&stream), 
    // the backend might require a valid upstream configuration.
    const upstreamSection = page.getByRole('group', { name: 'Upstream' }).first();
    const addNodeBtn = page.getByRole('button', { name: 'Add a Node' });
    await addNodeBtn.click();

    const rows = upstreamSection.locator('tr.ant-table-row');

    const hostInput = rows.first().locator('input').first();
    await hostInput.click();
    await hostInput.fill('127.0.0.1');
    await expect(hostInput).toHaveValue('127.0.0.1');

    const portInput = rows.first().locator('input').nth(1);
    await portInput.click();
    await portInput.fill('80');
    await expect(portInput).toHaveValue('80');

    const weightInput = rows.first().locator('input').nth(2);
    await weightInput.click();
    await weightInput.fill('1');
    await expect(weightInput).toHaveValue('1');

    // Ensure the name field is properly filled before submitting
    const nameField = page.getByRole('textbox', { name: 'Name' }).first();
    await expect(nameField).toHaveValue(serviceName);

    await servicesPom.getAddBtn(page).click();

    // Wait for either success or error toast (longer timeout for CI)
    const alertMsg = page.getByRole('alert');
    await expect(alertMsg).toBeVisible({ timeout: 30000 });

    // Check if it's a success message
    await expect(alertMsg).toContainText('Add Service Successfully', { timeout: 5000 });

    // Close the toast
    await alertMsg.getByRole('button').click();
    await expect(alertMsg).toBeHidden();
  });

  await test.step('auto navigate to service detail page', async () => {
    await servicesPom.isDetailPage(page);
    // Verify ID exists
    const ID = page.getByRole('textbox', { name: 'ID', exact: true });
    await expect(ID).toBeVisible();
    await expect(ID).toBeDisabled();
    await uiCheckServiceRequiredFields(page, {
      name: serviceName,
    });
  });

  await test.step('can see service in list page', async () => {
    await servicesPom.getServiceNavBtn(page).click();
    await expect(page.getByRole('cell', { name: serviceName })).toBeVisible();
  });

  await test.step('navigate to service detail page', async () => {
    // Click on the service name to go to the detail page
    await page
      .getByRole('row', { name: serviceName })
      .getByRole('button', { name: 'View' })
      .click();
    await servicesPom.isDetailPage(page);
    const name = page.getByRole('textbox', { name: 'Name' }).first();
    await expect(name).toHaveValue(serviceName);
  });

  await test.step('edit and update service in detail page', async () => {
    // Click the Edit button in the detail page
    await page.getByRole('button', { name: 'Edit' }).click();

    // Verify we're in edit mode - fields should be editable now
    const nameField = page.getByRole('textbox', { name: 'Name' }).first();
    await expect(nameField).toBeEnabled();

    // Update the description field (use first() to get service description, not upstream description)
    const descriptionField = page.getByLabel('Description').first();
    await descriptionField.fill('Updated description for testing');

    // Add a simple label (key:value format)
    // Use first() to get service labels field, not upstream labels
    const labelsField = page.getByPlaceholder('Input text like `key:value`,').first();
    await expect(labelsField).toBeEnabled();

    // Add a single label in key:value format
    await labelsField.click();
    await labelsField.fill('version:v1');
    await labelsField.press('Enter');

    // Verify the label was added by checking if the input is cleared
    // This indicates the tag was successfully created
    await expect(labelsField).toHaveValue('');

    // Click the Save button to save changes
    const saveBtn = page.getByRole('button', { name: 'Save' });
    await saveBtn.click();

    // Verify the update was successful
    await uiHasToastMsg(page, {
      hasText: 'success',
    });

    // Verify we're back in detail view mode
    await servicesPom.isDetailPage(page);

    // Verify the updated fields
    await expect(page.getByLabel('Description').first()).toHaveValue(
      'Updated description for testing'
    );

    // check labels
    await expect(page.getByText('version:v1')).toBeVisible();

    // Return to list page and verify the service exists
    await servicesPom.getServiceNavBtn(page).click();
    await servicesPom.isIndexPage(page);

    // Find the row with our service
    const row = page.getByRole('row', { name: serviceName });
    await expect(row).toBeVisible();
  });

  await test.step('delete service in detail page', async () => {
    // Navigate back to detail page
    await page
      .getByRole('row', { name: serviceName })
      .getByRole('button', { name: 'View' })
      .click();
    await servicesPom.isDetailPage(page);

    await page.getByRole('button', { name: 'Delete' }).click();

    await page
      .getByRole('dialog', { name: 'Delete Service' })
      .getByRole('button', { name: 'Delete' })
      .click();

    // will redirect to services page
    await servicesPom.isIndexPage(page);
    await uiHasToastMsg(page, {
      hasText: 'Delete Service Successfully',
    });
    await expect(page.getByRole('cell', { name: serviceName })).toBeHidden();
  });
});
