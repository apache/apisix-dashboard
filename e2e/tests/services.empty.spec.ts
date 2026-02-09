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

import { servicesPom } from '@e2e/pom/services';
import { e2eReq } from '@e2e/utils/req';
import { test } from '@e2e/utils/test';
import { expect } from '@playwright/test';

import { deleteAllServices } from '@/apis/services';

test.describe('Services Empty State', () => {
    test.describe.configure({ mode: 'serial' });

    test.beforeAll(async () => {
        await deleteAllServices(e2eReq);
    });

    test('should display custom empty state when no services exist', async ({ page }) => {
        await test.step('navigate to services page', async () => {
            await servicesPom.getServiceNavBtn(page).click();
            await servicesPom.isIndexPage(page);
        });

        await test.step('verify empty state is displayed', async () => {
            const table = page.getByRole('table');
            await expect(table).toBeVisible();

            const emptyDescription = page.getByText('No services found. Click Add Service to create your first one.');
            await expect(emptyDescription).toBeVisible();

            const emptyImage = page.locator('.ant-empty-image');
            await expect(emptyImage).toBeVisible();
        });

        await test.step('verify no service rows are displayed', async () => {
            const serviceRows = page.getByRole('cell', { name: /service_name_/ });
            await expect(serviceRows).toHaveCount(0);
        });

        await test.step('verify add button is still accessible', async () => {
            const addButton = servicesPom.getAddServiceBtn(page);
            await expect(addButton).toBeVisible();
            await expect(addButton).toBeEnabled();
        });
    });
});
