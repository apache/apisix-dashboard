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
import { pluginMetadataPom } from '@e2e/pom/plugin_metadata';
import { e2eReq } from '@e2e/utils/req';
import { test } from '@e2e/utils/test';
import {
  uiFillMonacoEditor,
  uiGetMonacoEditor,
  uiHasToastMsg,
} from '@e2e/utils/ui';
import { expect } from '@playwright/test';

import { API_PLUGIN_METADATA } from '@/config/constant';

// Helper function to delete plugin metadata
const deletePluginMetadata = async (req: typeof e2eReq, name: string) => {
  await req.delete(`${API_PLUGIN_METADATA}/${name}`).catch(() => {
    // Ignore errors if metadata doesn't exist
  });
};

test.beforeAll(async () => {
  await deletePluginMetadata(e2eReq, 'syslog');
});

test.afterAll(async () => {
  await deletePluginMetadata(e2eReq, 'syslog');
});

test('should CRUD plugin metadata with required fields only', async ({
  page,
}) => {
  await pluginMetadataPom.toIndex(page);
  await pluginMetadataPom.isIndexPage(page);

  await test.step('add plugin metadata with simple configuration', async () => {
    // Click Select Plugins button
    await pluginMetadataPom.getSelectPluginsBtn(page).click();

    // Select Plugins dialog should appear
    const selectPluginsDialog = page.getByRole('dialog', {
      name: 'Select Plugins',
    });
    await expect(selectPluginsDialog).toBeVisible();

    // Search for syslog plugin
    const searchInput = selectPluginsDialog.getByPlaceholder('Search');
    await searchInput.fill('syslog');

    // Click Add button for syslog
    await selectPluginsDialog
      .getByTestId('plugin-syslog')
      .getByRole('button', { name: 'Add' })
      .click();

    // Add Plugin dialog should appear
    const addPluginDialog = page.getByRole('dialog', { name: 'Add Plugin' });
    await expect(addPluginDialog).toBeVisible();

    // Fill in minimal required configuration
    const pluginEditor = await uiGetMonacoEditor(page, addPluginDialog);
    await uiFillMonacoEditor(page, pluginEditor, '{"host": "127.0.0.1"}');

    // Click Add button
    await addPluginDialog.getByRole('button', { name: 'Add' }).click();

    // Should show success message
    await uiHasToastMsg(page, {
      hasText: 'success',
    });

    // Dialog should close
    await expect(addPluginDialog).toBeHidden();

    // Plugin card should now be visible
    const syslogCard = page.getByTestId('plugin-syslog');
    await expect(syslogCard).toBeVisible();
  });

  await test.step('edit plugin metadata with simple update', async () => {
    // Find the syslog card
    const syslogCard = page.getByTestId('plugin-syslog');

    // Click Edit button
    await syslogCard.getByRole('button', { name: 'Edit' }).click();

    // Edit Plugin dialog should appear
    const editPluginDialog = page.getByRole('dialog', { name: 'Edit Plugin' });
    await expect(editPluginDialog).toBeVisible();

    // Verify existing configuration is shown
    await expect(editPluginDialog.getByText('host')).toBeVisible();

    // Update the configuration
    const pluginEditor = await uiGetMonacoEditor(page, editPluginDialog);
    await uiFillMonacoEditor(
      page,
      pluginEditor,
      '{"host": "127.0.0.1", "port": 5140}'
    );

    // Click Save button
    await editPluginDialog.getByRole('button', { name: 'Save' }).click();

    // Should show success message
    await uiHasToastMsg(page, {
      hasText: 'success',
    });

    // Dialog should close
    await expect(editPluginDialog).toBeHidden();
  });

  await test.step('delete plugin metadata', async () => {
    // Find the syslog card
    const syslogCard = page.getByTestId('plugin-syslog');

    // Click Delete button
    await syslogCard.getByRole('button', { name: 'Delete' }).click();

    // Should show success message
    await uiHasToastMsg(page, {
      hasText: 'success',
    });

    // Card should be removed
    await expect(syslogCard).toBeHidden();
  });
});
