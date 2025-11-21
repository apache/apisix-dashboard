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
import { consumerGroupsPom } from '@e2e/pom/consumer_groups';
import { e2eReq } from '@e2e/utils/req';
import { test } from '@e2e/utils/test';
import {
  uiFillMonacoEditor,
  uiGetMonacoEditor,
  uiHasToastMsg,
} from '@e2e/utils/ui';
import { expect } from '@playwright/test';

import { deleteAllConsumerGroups } from '@/apis/consumer_groups';

test.beforeAll(async () => {
  await deleteAllConsumerGroups(e2eReq);
});

test('should CRUD Consumer Group with all fields', async ({ page }) => {
  test.slow();

  const testId = 'test-consumer-group-all-fields';
  const testDesc = 'Consumer Group with all fields for testing';

  await consumerGroupsPom.toIndex(page);
  await consumerGroupsPom.isIndexPage(page);

  await test.step('create consumer group with all fields', async () => {
    // Navigate to add page
    await consumerGroupsPom.getAddConsumerGroupBtn(page).click();
    await consumerGroupsPom.isAddPage(page);

    // Fill in the ID
    const idField = page.getByRole('textbox', { name: 'ID', exact: true });
    await idField.clear();
    await idField.fill(testId);

    // Fill in the description
    const descField = page.getByRole('textbox', { name: 'Description' });
    await descField.fill(testDesc);

    // Add plugins
    const selectPluginsBtn = page.getByRole('button', {
      name: 'Select Plugins',
    });
    await selectPluginsBtn.click();

    // Add basic-auth plugin (simpler than limit-count which requires redis)
    const selectPluginsDialog = page.getByRole('dialog', {
      name: 'Select Plugins',
    });
    const searchInput = selectPluginsDialog.getByPlaceholder('Search');
    await searchInput.fill('basic-auth');

    await selectPluginsDialog
      .getByTestId('plugin-basic-auth')
      .getByRole('button', { name: 'Add' })
      .click();

    const addPluginDialog = page.getByRole('dialog', { name: 'Add Plugin' });
    const pluginEditor = await uiGetMonacoEditor(page, addPluginDialog);
    await uiFillMonacoEditor(
      page,
      pluginEditor,
      '{"hide_credentials": true}'
    );
    // add plugin
    await addPluginDialog.getByRole('button', { name: 'Add' }).click();
    await expect(addPluginDialog).toBeHidden();

    // Submit the form
    await consumerGroupsPom.getAddBtn(page).click();
    await uiHasToastMsg(page, {
      hasText: 'Add Consumer Group Successfully',
    });

    // Should navigate to detail page
    await consumerGroupsPom.isDetailPage(page);
  });

  await test.step('verify all fields in detail page', async () => {
    // Verify ID
    const idField = page.getByRole('textbox', { name: 'ID', exact: true });
    await expect(idField).toHaveValue(testId);
    await expect(idField).toBeDisabled();

    // Verify description
    const descField = page.getByRole('textbox', { name: 'Description' });
    await expect(descField).toHaveValue(testDesc);
    await expect(descField).toBeDisabled();

    // Verify plugin is added
    await expect(page.getByText('basic-auth')).toBeVisible();
  });

  await test.step('edit and update consumer group', async () => {
    // Click Edit button
    await page.getByRole('button', { name: 'Edit' }).click();

    // Verify we're in edit mode
    const descField = page.getByRole('textbox', { name: 'Description' });
    await expect(descField).toBeEnabled();

    // Update description
    await descField.clear();
    await descField.fill('Updated description with all fields');

    // Save changes
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await uiHasToastMsg(page, {
      hasText: 'success',
    });

    // Verify we're back in detail view
    await consumerGroupsPom.isDetailPage(page);

    // Verify updated description
    await expect(descField).toHaveValue('Updated description with all fields');
    await expect(descField).toBeDisabled();
  });

  await test.step('verify consumer group exists in list', async () => {
    // Navigate to list page
    await consumerGroupsPom.getConsumerGroupNavBtn(page).click();
    await consumerGroupsPom.isIndexPage(page);

    // Verify consumer group exists
    await expect(page.getByRole('cell', { name: testId, exact: true })).toBeVisible();
    await expect(
      page.getByRole('cell', { name: 'Updated description with all fields' })
    ).toBeVisible();
  });

  await test.step('delete consumer group', async () => {
    // Click View to go to detail page
    await page
      .getByRole('row', { name: new RegExp(testId) })
      .getByRole('button', { name: 'View' })
      .click();
    await consumerGroupsPom.isDetailPage(page);

    // Delete consumer group
    await page.getByRole('button', { name: 'Delete' }).click();

    await page
      .getByRole('dialog', { name: 'Delete Consumer Group' })
      .getByRole('button', { name: 'Delete' })
      .click();

    // Should redirect to list page
    await consumerGroupsPom.isIndexPage(page);
    await uiHasToastMsg(page, {
      hasText: 'Delete Consumer Group Successfully',
    });

    // Verify deletion
    await expect(page.getByRole('cell', { name: testId, exact: true })).toBeHidden();
  });
});
