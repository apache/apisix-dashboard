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
import type { Locator } from '@playwright/test';
import { expect } from '@playwright/test';

import { API_PLUGIN_METADATA } from '@/config/constant';

// Helper function to delete plugin metadata
const deletePluginMetadata = async (req: typeof e2eReq, name: string) => {
  await req.delete(`${API_PLUGIN_METADATA}/${name}`).catch(() => {
    // Ignore errors if metadata doesn't exist
  });
};
const getMonacoEditorValue = async (editPluginDialog: Locator) => {
  let editorValue = '';
  const textarea = editPluginDialog.locator('textarea');
  if (await textarea.count() > 0) {
    editorValue = await textarea.inputValue();
  }
  if (!editorValue || editorValue.trim() === '{') {
    const lines = await editPluginDialog.locator('.view-line').allTextContents();
    editorValue = lines.join('\n').replace(/\s+/g, ' ');
  }
  if (!editorValue || editorValue.trim() === '{') {
    const allText = await editPluginDialog.textContent();
    console.log('DEBUG: editorValue fallback failed, dialog text:', allText);
  }
  return editorValue;
};

// Helper function to close edit dialog
const closeEditDialog = async (editPluginDialog: Locator) => {
  const buttons = await editPluginDialog.locator('button').allTextContents();
  console.log('DEBUG: Edit Plugin dialog buttons:', buttons);
  let closed = false;
  for (const [i, name] of buttons.entries()) {
    if (name.trim().toLowerCase() === 'cancel') {
      await editPluginDialog.locator('button').nth(i).click();
      closed = true;
      break;
    }
  }
  if (!closed && buttons.length > 0) {
    await editPluginDialog.locator('button').first().click();
  }
};

test.beforeAll(async () => {
  await deletePluginMetadata(e2eReq, 'http-logger');
});

test.afterAll(async () => {
  await deletePluginMetadata(e2eReq, 'http-logger');
});

test('should CRUD plugin metadata with all fields', async ({ page }) => {
  await pluginMetadataPom.toIndex(page);
  await pluginMetadataPom.isIndexPage(page);

  await test.step('add plugin metadata with comprehensive configuration', async () => {
    // Click Select Plugins button
    await pluginMetadataPom.getSelectPluginsBtn(page).click();

    // Select Plugins dialog should appear
    const selectPluginsDialog = page.getByRole('dialog', {
      name: 'Select Plugins',
    });
    await expect(selectPluginsDialog).toBeVisible();

    // Search for http-logger plugin
    const searchInput = selectPluginsDialog.getByPlaceholder('Search');
    await searchInput.fill('http-logger');

    // Click Add button for http-logger
    await selectPluginsDialog
      .getByTestId('plugin-http-logger')
      .getByRole('button', { name: 'Add' })
      .click();

    // Add Plugin dialog should appear
    const addPluginDialog = page.getByRole('dialog', { name: 'Add Plugin' });
    await expect(addPluginDialog).toBeVisible();

    // Fill in comprehensive configuration with all available fields
    const pluginEditor = await uiGetMonacoEditor(page, addPluginDialog);
    await uiFillMonacoEditor(
      page,
      pluginEditor,
      JSON.stringify({
        log_format: {
          host: '$host',
          client_ip: '$remote_addr',
          request_method: '$request_method',
          request_uri: '$request_uri',
          status: '$status',
          body_bytes_sent: '$body_bytes_sent',
          request_time: '$request_time',
          upstream_response_time: '$upstream_response_time',
        },
      })
    );

    // Click Add button
    await addPluginDialog.getByRole('button', { name: 'Add' }).click();

    // Should show success message
    await uiHasToastMsg(page, {
      hasText: 'success',
    });

    // Dialog should close
    await expect(addPluginDialog).toBeHidden();

    // Plugin card should now be visible
    const httpLoggerCard = page.getByTestId('plugin-http-logger');
    await expect(httpLoggerCard).toBeVisible();
  });

  await test.step('edit plugin metadata with extended fields', async () => {
    // Find the http-logger card
    const httpLoggerCard = page.getByTestId('plugin-http-logger');

    // Click Edit button
    await httpLoggerCard.getByRole('button', { name: 'Edit' }).click();

    // Edit Plugin dialog should appear
    const editPluginDialog = page.getByRole('dialog', { name: 'Edit Plugin' });
    await expect(editPluginDialog).toBeVisible();

    // Verify existing configuration is shown
    await expect(editPluginDialog.getByText('log_format')).toBeVisible();

    // Update the configuration with additional fields
    const pluginEditor = await uiGetMonacoEditor(page, editPluginDialog);
    await uiFillMonacoEditor(
      page,
      pluginEditor,
      JSON.stringify({
        log_format: {
          host: '$host',
          client_ip: '$remote_addr',
          request_method: '$request_method',
          request_uri: '$request_uri',
          status: '$status',
          body_bytes_sent: '$body_bytes_sent',
          request_time: '$request_time',
          upstream_response_time: '$upstream_response_time',
          time: '$time_iso8601',
          user_agent: '$http_user_agent',
        },
      })
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

  await test.step('verify configuration changes were saved', async () => {
    // Re-open the edit dialog via UI
    const httpLoggerCard = page.getByTestId('plugin-http-logger');
    await httpLoggerCard.getByRole('button', { name: 'Edit' }).click();
    const editPluginDialog = page.getByRole('dialog', { name: 'Edit Plugin' });
    await expect(editPluginDialog).toBeVisible();

    // Get Monaco editor value using helper
    const editorValue = await getMonacoEditorValue(editPluginDialog);
    expect(editorValue).toMatch(/"time"\s*:\s*"\$time_iso8601"/);
    expect(editorValue).toMatch(/"user_agent"\s*:\s*"\$http_user_agent"/);
    expect(editorValue).toMatch(/"host"\s*:\s*"\$host"/);
    expect(editorValue).toMatch(/"client_ip"\s*:\s*"\$remote_addr"/);

    // Close the dialog using helper
    await closeEditDialog(editPluginDialog);
    await expect(editPluginDialog).toBeHidden();
  });

  await test.step('delete plugin metadata', async () => {
    // Find the http-logger card
    const httpLoggerCard = page.getByTestId('plugin-http-logger');

    // Click Delete button
    await httpLoggerCard.getByRole('button', { name: 'Delete' }).click();

    // Should show success message
    await uiHasToastMsg(page, {
      hasText: 'success',
    });

    // Card should be removed
    await expect(httpLoggerCard).toBeHidden();
  });
});
