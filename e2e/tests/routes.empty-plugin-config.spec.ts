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
import { expect } from '@playwright/test';

import { deleteAllRoutes, postRouteReq } from '@/apis/routes';
import { API_ROUTES } from '@/config/constant';

const routeNameWithEmptyPlugin = randomId('test-route-empty-plugin');
const routeUri = '/test-empty-plugin';

let createdRouteId: string;

test.beforeAll(async () => {
    await deleteAllRoutes(e2eReq);

    // Create a route via API with key-auth plugin having empty configuration
    const response = await postRouteReq(e2eReq, {
        name: routeNameWithEmptyPlugin,
        uri: routeUri,
        plugins: {
            'key-auth': {},
        },
        upstream: {
            nodes: [{ host: 'httpbin.org', port: 80, weight: 1 }],
            type: 'roundrobin',
        },
    });

    createdRouteId = response.data.value.id;
});

test.afterAll(async () => {
    // Cleanup via API
    if (createdRouteId) {
        try {
            await e2eReq.delete(`${API_ROUTES}/${createdRouteId}`);
        } catch {
            // Route may already be deleted
        }
    }
});

test('should preserve plugin with empty configuration (key-auth) after edit', async ({
    page,
}) => {
    // Navigate to the route detail page
    await routesPom.toIndex(page);
    await routesPom.isIndexPage(page);

    // Click on the route to view details
    await page
        .getByRole('row', { name: routeNameWithEmptyPlugin })
        .getByRole('button', { name: 'View' })
        .click();
    await routesPom.isDetailPage(page);

    await test.step('verify key-auth plugin is visible in detail page', async () => {
        // Verify the plugin is visible (not removed by empty object cleaner during initial load)
        await expect(page.getByTestId('plugin-key-auth')).toBeVisible();

        // Verify the route name
        const name = page.getByLabel('Name', { exact: true }).first();
        await expect(name).toHaveValue(routeNameWithEmptyPlugin);
    });

    await test.step('edit route and verify key-auth plugin persists after save', async () => {
        // Click the Edit button in the detail page
        await page.getByRole('button', { name: 'Edit' }).click();

        // Verify we're in edit mode
        const nameField = page.getByLabel('Name', { exact: true }).first();
        await expect(nameField).toBeEnabled();

        // Verify the key-auth plugin is still visible in edit mode
        await expect(page.getByTestId('plugin-key-auth')).toBeVisible();

        // Update the description field (make a change to trigger save)
        const descriptionField = page.getByLabel('Description').first();
        await descriptionField.fill('Updated description with key-auth plugin');

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
