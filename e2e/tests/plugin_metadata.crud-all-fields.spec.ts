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
    // Verify changes via API
    const response = await e2eReq.get(`${API_PLUGIN_METADATA}/http-logger`);
    const metadata = response.data;

    // Check that the configuration contains the updated fields
    expect(metadata.value).toMatchObject({
      log_format: {
        time: '$time_iso8601',
        user_agent: '$http_user_agent',
        host: '$host',
        client_ip: '$remote_addr',
      },
    });
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
