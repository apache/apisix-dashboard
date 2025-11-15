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
  uiCheckServiceAllFields,
  uiFillServiceAllFields,
} from '@e2e/utils/ui/services';
import { expect } from '@playwright/test';

import { deleteAllServices } from '@/apis/services';

test.beforeAll(async () => {
  await deleteAllServices(e2eReq);
});

test('should CRUD service with all fields', async ({ page }) => {
  test.setTimeout(30000);

  const serviceNameWithAllFields = randomId('test-service-full');
  const description =
    'This is a test description for the service with all fields';

  // Navigate to the service list page
  await servicesPom.toIndex(page);
  await servicesPom.isIndexPage(page);

  // Click the add service button
  await servicesPom.getAddServiceBtn(page).click();
  await servicesPom.isAddPage(page);

  await uiFillServiceAllFields(test, page, {
    name: serviceNameWithAllFields,
    desc: description,
  });

  // Submit the form
  const addBtn = page.getByRole('button', { name: 'Add', exact: true });
  await addBtn.click();

  // Wait for success message
  await uiHasToastMsg(page, {
    hasText: 'Add Service Successfully',
  });

  // Verify automatic redirection to detail page
  await servicesPom.isDetailPage(page);

  await test.step('verify all fields in detail page', async () => {
    await uiCheckServiceAllFields(page, {
      name: serviceNameWithAllFields,
      desc: description,
    });
  });

  await test.step('return to list page and verify', async () => {
    // Return to the service list page
    await servicesPom.getServiceNavBtn(page).click();
    await servicesPom.isIndexPage(page);

    // Verify the created service is visible in the list
    await expect(page.locator('.ant-table-tbody')).toBeVisible();

    // Use expect to wait for the service name to appear
    await expect(page.getByText(serviceNameWithAllFields)).toBeVisible();
  });

  await test.step('delete the created service', async () => {
    // Find the row containing the service name
    const row = page.locator('tr').filter({ hasText: serviceNameWithAllFields });
    await expect(row).toBeVisible();

    // Click to view details
    await row.getByRole('button', { name: 'View' }).click();

    // Verify entered detail page
    await servicesPom.isDetailPage(page);

    // Delete the service
    await page.getByRole('button', { name: 'Delete' }).click();

    // Confirm deletion
    const deleteDialog = page.getByRole('dialog', { name: 'Delete Service' });
    await expect(deleteDialog).toBeVisible();
    await deleteDialog.getByRole('button', { name: 'Delete' }).click();

    // Verify successful deletion
    await servicesPom.isIndexPage(page);
    await uiHasToastMsg(page, {
      hasText: 'Delete Service Successfully',
    });

    // Verify removed from the list
    await expect(page.getByText(serviceNameWithAllFields)).toBeHidden();

    // Final verification: Reload the page and check again to ensure it's really gone
    await page.reload();
    await servicesPom.isIndexPage(page);

    // After reload, the service should still be gone
    await expect(page.getByText(serviceNameWithAllFields)).toBeHidden();
  });
});
