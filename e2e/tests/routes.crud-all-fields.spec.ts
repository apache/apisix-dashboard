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
import { uiHasToastMsg } from '@e2e/utils/ui';
import { uiFillUpstreamAllFields } from '@e2e/utils/ui/upstreams';
import { expect } from '@playwright/test';

import { deleteAllRoutes } from '@/apis/routes';
import type { APISIXType } from '@/types/schema/apisix';

const routeNameWithAllFields = randomId('test-route-full');
const routeUri = '/test-route-all-fields';
const description = 'This is a test description for the route with all fields';
// Define nodes to be used in the upstream section
const nodes: APISIXType['UpstreamNode'][] = [
  { host: 'test.com', port: 80, weight: 100 },
  { host: 'test2.com', port: 80, weight: 100 },
];

test.beforeAll(async () => {
  await deleteAllRoutes(e2eReq);
});

test('should CRUD route with all fields', async ({ page }) => {
  test.setTimeout(30000);

  // Navigate to the route list page
  await routesPom.toIndex(page);
  await routesPom.isIndexPage(page);

  // Click the add route button
  await routesPom.getAddRouteBtn(page).click();
  await routesPom.isAddPage(page);

  await test.step('fill in all fields', async () => {
    // Fill in basic fields
    await page
      .getByLabel('Name', { exact: true })
      .first()
      .fill(routeNameWithAllFields);
    await page.getByLabel('Description').first().fill(description);
    await page.getByLabel('URI', { exact: true }).fill(routeUri);

    // Select HTTP methods
    await page.getByRole('textbox', { name: 'HTTP Methods' }).click();
    await page.getByRole('option', { name: 'GET' }).click();
    await page.getByRole('option', { name: 'POST' }).click();
    await page.getByRole('option', { name: 'PUT' }).click();
    await page.getByRole('option', { name: 'DELETE' }).click();
    await page.keyboard.press('Escape');

    // Fill in Host field - using more specific selector
    await page.getByLabel('Host', { exact: true }).first().fill('example.com');

    // Fill in Remote Address field - using more specific selector
    await page
      .getByLabel('Remote Address', { exact: true })
      .first()
      .fill('192.168.1.0/24');

    // Set Priority
    await page.getByLabel('Priority', { exact: true }).first().fill('100');

    // Toggle Status
    const status = page.getByRole('textbox', { name: 'Status', exact: true });
    await status.click();
    // Ensure it's checked after the click
    await page.getByRole('option', { name: 'Disabled' }).click();
    await expect(status).toHaveValue('Disabled');

    // Add upstream nodes
    const upstreamSection = page.getByRole('group', {
      name: 'Upstream',
      exact: true,
    });
    await uiFillUpstreamAllFields(
      test,
      upstreamSection,
      {
        nodes: nodes,
        name: randomId('test-upstream-full'),
        desc: 'test',
      },
      page
    );

    // Add plugins
    const selectPluginsBtn = page.getByRole('button', {
      name: 'Select Plugins',
    });
    await selectPluginsBtn.click();

    // Add basic-auth plugin
    const selectPluginsDialog = page.getByRole('dialog', {
      name: 'Select Plugins',
    });
    const searchInput = selectPluginsDialog.getByPlaceholder('Search');
    await searchInput.fill('basic-auth');

    await selectPluginsDialog
      .getByTestId('plugin-basic-auth')
      .getByRole('button', { name: 'Add' })
      .click();

    const clearEditor = async () => {
      await page.evaluate(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).monaco.editor.getEditors()[0]?.setValue('');
      });
    };

    const addPluginDialog = page.getByRole('dialog', { name: 'Add Plugin' });
    const editorLoading = addPluginDialog.getByTestId('editor-loading');
    await expect(editorLoading).toBeHidden();
    const editor = addPluginDialog.getByRole('code').getByRole('textbox');
    await clearEditor();
    await editor.fill('{"hide_credentials": true}');
    // add plugin
    await addPluginDialog.getByRole('button', { name: 'Add' }).click();
    await expect(addPluginDialog).toBeHidden();

    const pluginsSection = page.getByRole('group', { name: 'Plugins' });
    const basicAuthPlugin = pluginsSection.getByTestId('plugin-basic-auth');
    await basicAuthPlugin.getByRole('button', { name: 'Edit' }).click();

    // should show edit plugin dialog
    const editPluginDialog = page.getByRole('dialog', { name: 'Edit Plugin' });
    await expect(editorLoading).toBeHidden();

    await expect(editPluginDialog.getByText('hide_credentials')).toBeVisible();
    // save edit plugin dialog
    await editPluginDialog.getByRole('button', { name: 'Save' }).click();
    await expect(editPluginDialog).toBeHidden();

    // delete basic-auth plugin
    await basicAuthPlugin.getByRole('button', { name: 'Delete' }).click();
    await expect(basicAuthPlugin).toBeHidden();

    // add real-ip plugin
    await selectPluginsBtn.click();

    await searchInput.fill('real-ip');
    await selectPluginsDialog
      .getByTestId('plugin-real-ip')
      .getByRole('button', { name: 'Add' })
      .click();
    // real-ip need config, otherwise it will show an error
    await addPluginDialog.getByRole('button', { name: 'Add' }).click();
    await expect(addPluginDialog).toBeVisible();
    await expect(editorLoading).toBeHidden();
    await expect(
      addPluginDialog.getByText('Missing property "source"')
    ).toBeVisible();

    // clear the editor, will show JSON format is not valid
    await clearEditor();
    await editor.fill('');
    await expect(
      addPluginDialog.getByText('JSON format is not valid')
    ).toBeVisible();
    // try add, will show invalid configuration
    await addPluginDialog.getByRole('button', { name: 'Add' }).click();
    await expect(addPluginDialog).toBeVisible();
    await expect(
      addPluginDialog.getByText('JSON format is not valid')
    ).toBeVisible();

    // add a valid config
    await editor.fill('{"source": "X-Forwarded-For"}');
    await addPluginDialog.getByRole('button', { name: 'Add' }).click();
    await expect(addPluginDialog).toBeHidden();

    // check real-ip plugin in edit dialog
    const realIpPlugin = page.getByTestId('plugin-real-ip');
    await realIpPlugin.getByRole('button', { name: 'Edit' }).click();
    await expect(editPluginDialog).toBeVisible();
    await expect(editorLoading).toBeHidden();
    await expect(editPluginDialog.getByText('X-Forwarded-For')).toBeVisible();
    // close
    await editPluginDialog.getByRole('button', { name: 'Save' }).click();
    await expect(editPluginDialog).toBeHidden();

    // Submit the form
    await routesPom.getAddBtn(page).click();
    await uiHasToastMsg(page, {
      hasText: 'Add Route Successfully',
    });
  });

  await test.step('verify route in list page after creation', async () => {
    // After creation, we should be redirected to the routes list page
    await routesPom.isIndexPage(page);

    // Verify our newly created route appears in the list
    await expect(
      page.getByRole('cell', { name: routeNameWithAllFields })
    ).toBeVisible();
  });

  await test.step('navigate to route detail page and verify all fields', async () => {
    // Click on the route name to go to the detail page
    await page
      .getByRole('row', { name: routeNameWithAllFields })
      .getByRole('button', { name: 'View' })
      .click();
    await routesPom.isDetailPage(page);

    // Verify the route details
    // Verify ID exists
    const ID = page.getByRole('textbox', { name: 'ID', exact: true });
    await expect(ID).toBeVisible();
    await expect(ID).toBeDisabled();

    // Verify the route name
    const name = page.getByLabel('Name', { exact: true }).first();
    await expect(name).toHaveValue(routeNameWithAllFields);
    await expect(name).toBeDisabled();

    // Verify the description
    const desc = page.getByLabel('Description').first();
    await expect(desc).toHaveValue(description);
    await expect(desc).toBeDisabled();

    // Verify the route URI
    const uri = page.getByLabel('URI', { exact: true });
    await expect(uri).toHaveValue(routeUri);
    await expect(uri).toBeDisabled();

    // Verify HTTP methods
    const methods = page
      .getByRole('textbox', { name: 'HTTP Methods' })
      .locator('..');
    await expect(methods).toContainText('GET');
    await expect(methods).toContainText('POST');
    await expect(methods).toContainText('PUT');
    await expect(methods).toContainText('DELETE');

    // Verify Host
    await expect(page.getByLabel('Host', { exact: true }).first()).toHaveValue(
      'example.com'
    );

    // Verify Remote Address
    await expect(
      page.getByLabel('Remote Address', { exact: true }).first()
    ).toHaveValue('192.168.1.0/24');

    // Verify Priority
    await expect(
      page.getByLabel('Priority', { exact: true }).first()
    ).toHaveValue('100');

    // Verify Status
    const status = page.getByRole('textbox', { name: 'Status', exact: true });
    await expect(status).toHaveValue('Disabled');

    // Verify Plugins
    await expect(page.getByText('basic-auth')).toBeHidden();
    await expect(page.getByText('real-ip')).toBeVisible();
  });

  await test.step('edit and update route in detail page', async () => {
    // Click the Edit button in the detail page
    await page.getByRole('button', { name: 'Edit' }).click();

    // Verify we're in edit mode - fields should be editable now
    const nameField = page.getByLabel('Name', { exact: true }).first();
    await expect(nameField).toBeEnabled();

    // Update the description field
    const descriptionField = page.getByLabel('Description').first();
    await descriptionField.fill('Updated description for testing all fields');

    // Update URI
    const uriField = page.getByLabel('URI', { exact: true });
    await uriField.fill(`${routeUri}-updated`);

    // Update Host
    await page
      .getByLabel('Host', { exact: true })
      .first()
      .fill('updated-example.com');

    // Update Priority
    await page.getByLabel('Priority', { exact: true }).first().fill('200');

    // Click the Save button to save changes
    const saveBtn = page.getByRole('button', { name: 'Save' });
    await saveBtn.click();

    // Verify the update was successful
    await uiHasToastMsg(page, {
      hasText: 'success',
    });

    // Verify we're back in detail view mode
    await routesPom.isDetailPage(page);

    // Verify the updated fields
    // Verify description
    await expect(page.getByLabel('Description').first()).toHaveValue(
      'Updated description for testing all fields'
    );

    // Check if the updated URI is visible
    await expect(page.getByLabel('URI', { exact: true })).toHaveValue(
      `${routeUri}-updated`
    );

    // Verify updated Host
    await expect(page.getByLabel('Host', { exact: true }).first()).toHaveValue(
      'updated-example.com'
    );

    // Verify updated Priority
    await expect(
      page.getByLabel('Priority', { exact: true }).first()
    ).toHaveValue('200');

    // Return to list page and verify the route exists
    await routesPom.getRouteNavBtn(page).click();
    await routesPom.isIndexPage(page);

    // Find the row with our route
    const row = page.getByRole('row', { name: routeNameWithAllFields });
    await expect(row).toBeVisible();
  });

  await test.step('delete route in detail page', async () => {
    // Navigate to detail page
    await page
      .getByRole('row', { name: routeNameWithAllFields })
      .getByRole('button', { name: 'View' })
      .click();
    await routesPom.isDetailPage(page);

    // Delete the route
    await page.getByRole('button', { name: 'Delete' }).click();

    await page
      .getByRole('dialog', { name: 'Delete Route' })
      .getByRole('button', { name: 'Delete' })
      .click();

    // Will redirect to routes page
    await routesPom.isIndexPage(page);
    await uiHasToastMsg(page, {
      hasText: 'Delete Route Successfully',
    });
    await expect(
      page.getByRole('cell', { name: routeNameWithAllFields })
    ).toBeHidden();

    // Final verification: Reload the page and check again to ensure it's really gone
    await page.reload();
    await routesPom.isIndexPage(page);

    // After reload, the route should still be gone
    await expect(
      page.getByRole('cell', { name: routeNameWithAllFields })
    ).toBeHidden();
  });
});
