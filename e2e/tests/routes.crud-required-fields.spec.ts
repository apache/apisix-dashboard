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
import { uiFillUpstreamRequiredFields } from '@e2e/utils/ui/upstreams';
import { expect } from '@playwright/test';

import { deleteAllRoutes } from '@/apis/routes';
import type { APISIXType } from '@/types/schema/apisix';

const routeName = randomId('test-route');
const routeUri = '/test-route';
const nodes: APISIXType['UpstreamNode'][] = [
  { host: 'test.com', port: 80, weight: 100 },
  { host: 'test2.com', port: 80, weight: 100 },
];

test.beforeAll(async () => {
  await deleteAllRoutes(e2eReq);
});

test('should CRUD route with required fields', async ({ page }) => {
  await routesPom.toIndex(page);
  await routesPom.isIndexPage(page);

  await routesPom.getAddRouteBtn(page).click();
  await routesPom.isAddPage(page);

  await test.step('cannot submit without required fields', async () => {
    await routesPom.getAddBtn(page).click();
    await routesPom.isAddPage(page);
    await uiHasToastMsg(page, {
      hasText: 'invalid configuration',
    });
  });

  await test.step('submit with required fields', async () => {
    // Fill in the Name field
    await page.getByLabel('Name', { exact: true }).first().fill(routeName);
    await page.getByLabel('URI', { exact: true }).fill(routeUri);

    // Select HTTP method
    await page.getByRole('textbox', { name: 'HTTP Methods' }).click();
    await page.getByRole('option', { name: 'GET' }).click();

    // Add upstream nodes
    // Reusing the pattern from upstreams test
    const upstreamSection = page.getByRole('group', {
      name: 'Upstream',
      exact: true,
    });
    await uiFillUpstreamRequiredFields(upstreamSection, {
      nodes,
      name: 'test-upstream',
      desc: 'test',
    });
    // Submit the form
    await routesPom.getAddBtn(page).click();
    await uiHasToastMsg(page, {
      hasText: 'Add Route Successfully',
    });
  });

  await test.step('redirects to routes list page after creation', async () => {
    // After creation, we should be redirected to the routes list page
    await routesPom.isIndexPage(page);
    
    // Verify our newly created route appears in the list
    await expect(page.getByRole('cell', { name: routeName })).toBeVisible();
  });

  // We've already verified the route is in the list page in the previous step

  await test.step('navigate to route detail page', async () => {
    // Click on the route name to go to the detail page
    await page
      .getByRole('row', { name: routeName })
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
    await expect(name).toHaveValue(routeName);
    await expect(name).toBeDisabled();
    
    // Verify the route URI
    const uri = page.getByLabel('URI', { exact: true });
    await expect(uri).toHaveValue(routeUri);
    await expect(uri).toBeDisabled();
  });

  await test.step('edit and update route in detail page', async () => {
    // Click the Edit button in the detail page
    await page.getByRole('button', { name: 'Edit' }).click();

    // Verify we're in edit mode - fields should be editable now
    const nameField = page.getByLabel('Name', { exact: true }).first();
    await expect(nameField).toBeEnabled();

    // Update the description field
    const descriptionField = page.getByLabel('Description').first();
    await descriptionField.fill('Updated description for testing');

    // Update URI
    const uriField = page.getByLabel('URI', { exact: true });
    await uriField.fill(`${routeUri}-updated`);

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
      'Updated description for testing'
    );

    // Check if the updated URI is visible
    await expect(page.getByLabel('URI', { exact: true })).toHaveValue(
      `${routeUri}-updated`
    );

    // Return to list page and verify the route exists
    await routesPom.getRouteNavBtn(page).click();
    await routesPom.isIndexPage(page);

    // Find the row with our route
    const row = page.getByRole('row', { name: routeName });
    await expect(row).toBeVisible();
  });

  await test.step('delete route in detail page', async () => {
    // We're already on the detail page from the previous step

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
    await expect(page.getByRole('cell', { name: routeName })).toBeHidden();
  });
});
