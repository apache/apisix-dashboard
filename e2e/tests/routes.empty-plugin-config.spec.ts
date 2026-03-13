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
import { routesPom } from '@e2e/pom/routes';
import { randomId } from '@e2e/utils/common';
import { e2eReq } from '@e2e/utils/req';
import { test } from '@e2e/utils/test';
import {
  uiFillMonacoEditor,
  uiGetMonacoEditor,
  uiHasToastMsg,
} from '@e2e/utils/ui';
import { uiFillUpstreamRequiredFields } from '@e2e/utils/ui/upstreams';
import { expect } from '@playwright/test';

import { deleteAllRoutes } from '@/apis/routes';

const routeNameWithEmptyPlugin = randomId('test-route-empty-plugin');
const routeUri = '/test-empty-plugin';

test.beforeAll(async () => {
  await deleteAllRoutes(e2eReq);
});

test('should preserve plugin with empty configuration (key-auth) after edit', async ({
  page,
}) => {
  await routesPom.toIndex(page);
  await routesPom.isIndexPage(page);

  await test.step('create route with key-auth plugin having configuration', async () => {
    await routesPom.getAddRouteBtn(page).click();
    await routesPom.isAddPage(page);

    // Fill in required fields
    await page.getByLabel('Name', { exact: true }).first().fill(routeNameWithEmptyPlugin);
    await page.getByLabel('URI', { exact: true }).fill(routeUri);

    // Select HTTP method
    await page.getByRole('textbox', { name: 'HTTP Methods' }).click();
    await page.getByRole('option', { name: 'GET' }).click();

    // Add upstream nodes
    const upstreamSection = page.getByRole('group', {
      name: 'Upstream',
      exact: true,
    });
    await uiFillUpstreamRequiredFields(upstreamSection, {
      nodes: [
        { host: 'httpbin.org', port: 80, weight: 1 },
        { host: 'httpbin.org', port: 80, weight: 1 },
      ],
      name: 'test-upstream-empty-plugin',
    });

    // Add key-auth plugin with some configuration first
    const selectPluginsBtn = page.getByRole('button', {
      name: 'Select Plugins',
    });
    await selectPluginsBtn.click();

    const selectPluginsDialog = page.getByRole('dialog', {
      name: 'Select Plugins',
    });
    const searchInput = selectPluginsDialog.getByPlaceholder('Search');
    await searchInput.fill('key-auth');

    await selectPluginsDialog
      .getByTestId('plugin-key-auth')
      .getByRole('button', { name: 'Add' })
      .click();

    // Add plugin with initial configuration
    const addPluginDialog = page.getByRole('dialog', { name: 'Add Plugin' });
    const pluginEditor = await uiGetMonacoEditor(page, addPluginDialog);
    await uiFillMonacoEditor(page, pluginEditor, '{"hide_credentials": true}');
    await addPluginDialog.getByRole('button', { name: 'Add' }).click();
    await expect(addPluginDialog).toBeHidden();

    // Verify the plugin was added
    const pluginsSection = page.getByRole('group', { name: 'Plugins' });
    await expect(pluginsSection.getByTestId('plugin-key-auth')).toBeVisible();

    // Submit the form
    await routesPom.getAddBtn(page).click();
    await uiHasToastMsg(page, {
      hasText: 'Add Route Successfully',
    });
  });

  await test.step('verify key-auth plugin is visible in detail page', async () => {
    await routesPom.isDetailPage(page);

    // Verify the plugin is visible
    await expect(page.getByTestId('plugin-key-auth')).toBeVisible();

    // Verify the route name
    const name = page.getByLabel('Name', { exact: true }).first();
    await expect(name).toHaveValue(routeNameWithEmptyPlugin);
  });

  await test.step('edit plugin to have empty configuration and verify it persists', async () => {
    // Click the Edit button in the detail page
    await page.getByRole('button', { name: 'Edit' }).click();

    // Verify we're in edit mode
    const nameField = page.getByLabel('Name', { exact: true }).first();
    await expect(nameField).toBeEnabled();

    // Verify the key-auth plugin is visible in edit mode
    const pluginsSection = page.getByRole('group', { name: 'Plugins' });
    const keyAuthPlugin = pluginsSection.getByTestId('plugin-key-auth');
    await expect(keyAuthPlugin).toBeVisible();

    // Click edit on the plugin
    await keyAuthPlugin.getByRole('button', { name: 'Edit' }).click();

    // Edit plugin to have empty configuration
    const editPluginDialog = page.getByRole('dialog', { name: 'Edit Plugin' });
    const pluginEditor = await uiGetMonacoEditor(page, editPluginDialog);

    // Clear the editor and set empty object
    await uiFillMonacoEditor(page, pluginEditor, '{}');

    // Save the plugin
    await editPluginDialog.getByRole('button', { name: 'Save' }).click();
    await expect(editPluginDialog).toBeHidden();

    // Verify the plugin is still visible after making config empty
    await expect(keyAuthPlugin).toBeVisible();

    // Update the description field to trigger a change
    const descriptionField = page.getByLabel('Description').first();
    await descriptionField.fill('Updated description after emptying key-auth config');

    // Click the Save button to save changes
    const saveBtn = page.getByRole('button', { name: 'Save' });
    await saveBtn.click();

    // Verify the update was successful
    await uiHasToastMsg(page, {
      hasText: 'success',
    });

    // Verify we're back in detail view mode
    await routesPom.isDetailPage(page);

    // Verify the key-auth plugin is STILL visible after save (critical check for the fix)
    await expect(page.getByTestId('plugin-key-auth')).toBeVisible();
  });
});
