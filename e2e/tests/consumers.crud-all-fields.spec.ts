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
const description = 'Test consumer with all fields filled';

test.beforeAll(async () => {
  await deleteAllConsumers(e2eReq);
});

test('should CRUD consumer with all fields', async ({ page }) => {
  test.slow();

  await consumersPom.toIndex(page);
  await consumersPom.isIndexPage(page);

  await consumersPom.getAddConsumerBtn(page).click();
  await consumersPom.isAddPage(page);

  await test.step('submit with all fields', async () => {
    // Fill username (required)
    await page.getByRole('textbox', { name: 'Username' }).fill(consumerUsername);
    
    // Fill description (optional)
    await page.getByRole('textbox', { name: 'Description' }).fill(description);

    // Add labels using tags input
    const labelsInput = page.getByPlaceholder('Input text like `key:value`, then enter or blur');
    await labelsInput.fill('version:v1');
    await labelsInput.press('Enter');
    await labelsInput.fill('env:test');
    await labelsInput.press('Enter');
    await labelsInput.fill('team:engineering');
    await labelsInput.press('Enter');

    // Submit the form
    await consumersPom.getAddBtn(page).click();
    await uiHasToastMsg(page, {
      hasText: 'Add Consumer Successfully',
    });
  });

  await test.step('auto navigate to consumer detail page', async () => {
    await consumersPom.isDetailPage(page);

    // Verify the consumer username
    await expect(page.getByRole('textbox', { name: 'Username' }))
      .toHaveValue(consumerUsername);
  });

  await test.step('edit and update all fields', async () => {
    // Enter edit mode
    await page.getByRole('button', { name: 'Edit' }).click();

    // Update description
    await page.getByRole('textbox', { name: 'Description' }).fill('Updated: ' + description);

    // Update labels - remove old ones and add new ones
    // First, remove existing labels by clicking the X button
    const labelsSection = page.getByRole('group', { name: 'Basic Infomation' });
    const removeButtons = labelsSection.locator('button[aria-label^="Remove"]');
    const count = await removeButtons.count();
    for (let i = 0; i < count; i++) {
      await removeButtons.first().click();
    }
    
    // Add new labels
    const labelsInput = page.getByPlaceholder('Input text like `key:value`, then enter or blur');
    await labelsInput.fill('version:v2');
    await labelsInput.press('Enter');
    await labelsInput.fill('env:production');
    await labelsInput.press('Enter');
    await labelsInput.fill('team:platform');
    await labelsInput.press('Enter');

    // Save changes
    await page.getByRole('button', { name: 'Save' }).click();
    await uiHasToastMsg(page, {
      hasText: 'success',
    });

    // Verify updates
    await expect(page.getByRole('textbox', { name: 'Description' }))
      .toHaveValue('Updated: ' + description);
  });

  await test.step('verify consumer in list page', async () => {
    await consumersPom.getConsumerNavBtn(page).click();
    await consumersPom.isIndexPage(page);

    // Find the consumer in the list
    const row = page.getByRole('row', { name: consumerUsername });
    await expect(row).toBeVisible();
  });

  await test.step('delete consumer', async () => {
    // Navigate to detail page
    await page
      .getByRole('row', { name: consumerUsername })
      .getByRole('button', { name: 'View' })
      .click();
    await consumersPom.isDetailPage(page);

    // Delete
    await page.getByRole('button', { name: 'Delete' }).click();
    await page
      .getByRole('dialog', { name: 'Delete Consumer' })
      .getByRole('button', { name: 'Delete' })
      .click();

    // Verify deletion
    await uiHasToastMsg(page, {
      hasText: 'Delete Consumer Successfully',
    });
    
    // Navigate to consumers list to verify consumer is gone
    await consumersPom.toIndex(page);
    await consumersPom.isIndexPage(page);
    await expect(page.getByRole('cell', { name: consumerUsername })).toBeHidden();
  });
});
