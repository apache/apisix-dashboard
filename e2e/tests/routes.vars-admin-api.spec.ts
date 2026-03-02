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
import { e2eReq } from '@e2e/utils/req';
import { test } from '@e2e/utils/test';
import { expect } from '@playwright/test';

import { deleteAllRoutes, putRouteReq } from '@/apis/routes';

const routeId = 'test-vars-admin-api';

test.beforeAll(async () => {
    await deleteAllRoutes(e2eReq);
});

test('route with vars created via Admin API', async ({ page }) => {
    await test.step('create route with vars via Admin API', async () => {
        await putRouteReq(e2eReq, {
            id: routeId,
            name: routeId,
            uri: '/test-vars-route',
            methods: ['GET', 'POST'],
            upstream: {
                type: 'roundrobin',
                nodes: [{ host: 'httpbin.org', port: 80, weight: 1 }],
            },
            vars: [
                [
                    'uri',
                    '~~',
                    '^/(.*)/v1beta/models/(gemini-3-pro-preview)(?::[A-Za-z0-9._-]+)?$',
                ],
            ],
        });
    });

    await test.step('view route detail without error', async () => {
        // Navigate to routes list
        await routesPom.toIndex(page);
        await routesPom.isIndexPage(page);

        // Find and click "View on our route"
        await page
            .getByRole('row', { name: routeId })
            .getByRole('button', { name: 'View' })
            .click();

        // Verify the detail page loaded successfully
        await routesPom.isDetailPage(page);

        const name = page.getByLabel('Name', { exact: true }).first();
        await expect(name).toHaveValue(routeId);
    });
});

test.afterAll(async () => {
    await deleteAllRoutes(e2eReq);
});