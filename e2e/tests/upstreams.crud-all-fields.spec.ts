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
import { upstreamsPom } from '@e2e/pom/upstreams';
import { randomId } from '@e2e/utils/common';
import { e2eReq } from '@e2e/utils/req';
import { test } from '@e2e/utils/test';
import { uiHasToastMsg } from '@e2e/utils/ui';
import {
  uiCheckUpstreamAllFields,
  uiFillUpstreamAllFields,
} from '@e2e/utils/ui/upstreams';
import { expect } from '@playwright/test';

import { deleteAllUpstreams } from '@/apis/upstreams';

test.beforeAll(async () => {
  await deleteAllUpstreams(e2eReq);
});

test('should CRUD upstream with all fields', async ({ page }) => {
  test.setTimeout(30000);

  const upstreamNameWithAllFields = randomId('test-upstream-full');
  const description =
    'This is a test description for the upstream with all fields';

  // Navigate to the upstream list page
  await upstreamsPom.toIndex(page);
  await upstreamsPom.isIndexPage(page);

  // Click the add upstream button
  await upstreamsPom.getAddUpstreamBtn(page).click();
  await upstreamsPom.isAddPage(page);

  await uiFillUpstreamAllFields(test, page, {
    name: upstreamNameWithAllFields,
    desc: description,
  });

  // Submit the form
  const addBtn = page.getByRole('button', { name: 'Add', exact: true });
  await addBtn.click();

  // Wait for success message
  await uiHasToastMsg(page, {
    hasText: 'Add Upstream Successfully',
  });

  // Verify automatic redirection to detail page
  await upstreamsPom.isDetailPage(page);

  await test.step('verify all fields in detail page', async () => {
    await uiCheckUpstreamAllFields(page, {
      name: upstreamNameWithAllFields,
      desc: description,
    });
  });

  await test.step('return to list page and verify', async () => {
    // Return to the upstream list page
    await upstreamsPom.getUpstreamNavBtn(page).click();
    await upstreamsPom.isIndexPage(page);

    // Verify the created upstream is visible in the list - using a more reliable method
    // Using expect's toBeVisible method which has a retry mechanism
    await expect(page.locator('.ant-table-tbody')).toBeVisible();

    // Use expect to wait for the upstream name to appear
    await expect(page.getByText(upstreamNameWithAllFields)).toBeVisible();
  });

  await test.step('delete the created upstream', async () => {
    // Find the row containing the upstream name
    const row = page
      .locator('tr')
      .filter({ hasText: upstreamNameWithAllFields });
    await expect(row).toBeVisible();

    // Click to view details
    await row.getByRole('button', { name: 'View' }).click();

    // Verify entered detail page
    await upstreamsPom.isDetailPage(page);

    // Delete the upstream
    await page.getByRole('button', { name: 'Delete' }).click();

    // Confirm deletion
    const deleteDialog = page.getByRole('dialog', { name: 'Delete Upstream' });
    await expect(deleteDialog).toBeVisible();
    await deleteDialog.getByRole('button', { name: 'Delete' }).click();

    // Verify successful deletion
    await upstreamsPom.isIndexPage(page);
    await uiHasToastMsg(page, {
      hasText: 'Delete Upstream Successfully',
    });

    // Verify removed from the list
    await expect(page.getByText(upstreamNameWithAllFields)).toBeHidden();

    // Final verification: Reload the page and check again to ensure it's really gone
    await page.reload();
    await upstreamsPom.isIndexPage(page);

    // After reload, the upstream should still be gone
    await expect(page.getByText(upstreamNameWithAllFields)).toBeHidden();
  });
});
