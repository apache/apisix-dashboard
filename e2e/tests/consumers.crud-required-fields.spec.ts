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
import { consumersPom } from '@e2e/pom/consumers';
import { e2eReq } from '@e2e/utils/req';
import { test } from '@e2e/utils/test';
import { uiHasToastMsg } from '@e2e/utils/ui';
import { expect } from '@playwright/test';
import { customAlphabet } from 'nanoid';

import { deleteAllConsumers } from '@/apis/consumers';

// Consumer usernames can only contain: a-zA-Z0-9_-
const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 10);
const consumerUsername = `testconsumer${nanoid()}`;

test.beforeAll(async () => {
  await deleteAllConsumers(e2eReq);
});

test('should CRUD consumer with required fields', async ({ page }) => {
  await consumersPom.toIndex(page);
  await consumersPom.isIndexPage(page);

  await consumersPom.getAddConsumerBtn(page).click();
  await consumersPom.isAddPage(page);

  await test.step('cannot submit without required fields', async () => {
    await consumersPom.getAddBtn(page).click();
    // Should stay on add page - form validation prevents submission
    await consumersPom.isAddPage(page);
  });

  await test.step('submit with required fields', async () => {
    // Fill in the Username field (only required field for consumers)
    await page.getByRole('textbox', { name: 'Username' }).fill(consumerUsername);

    // Submit the form
    await consumersPom.getAddBtn(page).click();
    await uiHasToastMsg(page, {
      hasText: 'Add Consumer Successfully',
    });
  });

  await test.step('auto navigate to consumer detail page', async () => {
    await consumersPom.isDetailPage(page);

    // Verify the consumer username
    const username = page.getByRole('textbox', { name: 'Username' });
    await expect(username).toHaveValue(consumerUsername);
    await expect(username).toBeDisabled();
  });

  await test.step('edit and update consumer in detail page', async () => {
    // Click the Edit button in the detail page
    await page.getByRole('button', { name: 'Edit' }).click();

    // Update the description field
    const descriptionField = page.getByRole('textbox', { name: 'Description' });
    await descriptionField.fill('Updated description for testing');

    // Click the Save button to save changes
    const saveBtn = page.getByRole('button', { name: 'Save' });
    await saveBtn.click();

    // Verify the update was successful
    await uiHasToastMsg(page, {
      hasText: 'success',
    });

    // Verify we're back in detail view mode
    await consumersPom.isDetailPage(page);

    // Verify the updated fields
    await expect(page.getByRole('textbox', { name: 'Description' })).toHaveValue(
      'Updated description for testing'
    );
  });

  await test.step('consumer should exist in list page', async () => {
    await consumersPom.getConsumerNavBtn(page).click();
    await consumersPom.isIndexPage(page);
    await expect(page.getByRole('cell', { name: consumerUsername })).toBeVisible();

    // Click on the view button to go to the detail page
    await page
      .getByRole('row', { name: consumerUsername })
      .getByRole('button', { name: 'View' })
      .click();
    await consumersPom.isDetailPage(page);
  });

  await test.step('delete consumer in detail page', async () => {
    // We're already on the detail page from the previous step

    // Delete the consumer
    await page.getByRole('button', { name: 'Delete' }).click();

    await page
      .getByRole('dialog', { name: 'Delete Consumer' })
      .getByRole('button', { name: 'Delete' })
      .click();

    // Verify deletion was successful with toast
    await uiHasToastMsg(page, {
      hasText: 'Delete Consumer Successfully',
    });
    
    // Navigate to consumers index to verify consumer is gone
    await consumersPom.toIndex(page);
    await consumersPom.isIndexPage(page);
    await expect(page.getByRole('cell', { name: consumerUsername })).toBeHidden();
  });
});
