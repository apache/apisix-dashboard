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
import { upstreamsPom } from '@e2e/pom/upstreams';
import { randomId } from '@e2e/utils/common';
import { e2eReq } from '@e2e/utils/req';
import { test } from '@e2e/utils/test';
import { uiHasToastMsg } from '@e2e/utils/ui';
import { expect } from '@playwright/test';

import { deleteAllUpstreams } from '@/apis/upstreams';

test.beforeAll(async () => {
    await deleteAllUpstreams(e2eReq);
});

/**
 * Test for GitHub issue #3294
 * Bug: pass_host is reset to default value "pass" when editing upstream nodes
 * @see https://github.com/apache/apisix-dashboard/issues/3294
 */
test('should preserve pass_host value when editing upstream nodes', async ({
    page,
}) => {
    const upstreamName = randomId('test-pass-host');

    // Navigate to upstream add page
    await upstreamsPom.toIndex(page);
    await upstreamsPom.isIndexPage(page);
    await upstreamsPom.getAddUpstreamBtn(page).click();
    await upstreamsPom.isAddPage(page);

    await test.step('create upstream with pass_host=node via UI', async () => {
        // Fill in the Name field
        await page.getByLabel('Name', { exact: true }).fill(upstreamName);

        // Add a node
        const nodesSection = page.getByRole('group', { name: 'Nodes' });
        const addNodeBtn = page.getByRole('button', { name: 'Add a Node' });

        await addNodeBtn.click();
        const rows = nodesSection.locator('tr.ant-table-row');
        const firstRow = rows.first();
        await expect(firstRow).toBeVisible();

        const hostInput = firstRow.locator('input').first();
        await hostInput.click();
        await hostInput.fill('my-service.my-namespace.svc');

        // Click outside to trigger update
        await nodesSection.click();

        // Set pass_host to "node"
        const passHostSection = page.getByRole('group', { name: 'Pass Host' });
        await passHostSection.getByRole('textbox', { name: 'Pass Host' }).click();
        await page.getByRole('option', { name: 'node' }).click();

        // Submit the form
        await upstreamsPom.getAddBtn(page).click();
        await uiHasToastMsg(page, {
            hasText: 'Add Upstream Successfully',
        });
    });

    await test.step('verify auto navigate to detail page', async () => {
        await upstreamsPom.isDetailPage(page);
    });

    await test.step('verify initial pass_host value is "node"', async () => {
        const passHostSection = page.getByRole('group', { name: 'Pass Host' });
        const passHostField = passHostSection.getByRole('textbox', {
            name: 'Pass Host',
            exact: true,
        });
        await expect(passHostField).toHaveValue('node');
        await expect(passHostField).toBeDisabled();
    });

    await test.step('click edit and add a new node', async () => {
        await page.getByRole('button', { name: 'Edit' }).click();

        const nodesSection = page.getByRole('group', { name: 'Nodes' });
        const addNodeBtn = page.getByRole('button', { name: 'Add a Node' });

        // Add a new node
        await addNodeBtn.click();

        // Fill in the new node details
        const rows = nodesSection.locator('tr.ant-table-row');
        const newRow = rows.nth(1);
        await expect(newRow).toBeVisible();

        const hostInput = newRow.locator('input').first();
        await hostInput.click();
        await hostInput.fill('another-service.svc');

        const portInput = newRow.locator('input').nth(1);
        await portInput.click();
        await portInput.fill('8080');

        const weightInput = newRow.locator('input').nth(2);
        await weightInput.click();
        await weightInput.fill('1');

        // Click outside to trigger the update
        await nodesSection.click();
    });

    await test.step('verify pass_host is still "node" before saving', async () => {
        const passHostSection = page.getByRole('group', { name: 'Pass Host' });
        const passHostField = passHostSection.getByRole('textbox', {
            name: 'Pass Host',
            exact: true,
        });
        // This is the bug check - pass_host should still be "node" not reset to "pass"
        await expect(passHostField).toHaveValue('node');
    });

    await test.step('save and verify pass_host is preserved', async () => {
        const saveBtn = page.getByRole('button', { name: 'Save' });
        await saveBtn.click();

        await uiHasToastMsg(page, {
            hasText: 'Edit Upstream Successfully',
        });

        // Verify we're back in detail view mode
        await upstreamsPom.isDetailPage(page);

        const passHostSection = page.getByRole('group', { name: 'Pass Host' });
        const passHostField = passHostSection.getByRole('textbox', {
            name: 'Pass Host',
            exact: true,
        });
        await expect(passHostField).toHaveValue('node');
        await expect(passHostField).toBeDisabled();
    });

    await test.step('verify pass_host is preserved after page reload', async () => {
        await page.reload();
        await page.waitForLoadState('load');
        await upstreamsPom.isDetailPage(page);

        const passHostSection = page.getByRole('group', { name: 'Pass Host' });
        const passHostField = passHostSection.getByRole('textbox', {
            name: 'Pass Host',
            exact: true,
        });
        await expect(passHostField).toHaveValue('node');
    });

    await test.step('delete upstream via UI', async () => {
        // Navigate to list page first to avoid ambiguity with node delete buttons
        await upstreamsPom.getUpstreamNavBtn(page).click();
        await upstreamsPom.isIndexPage(page);

        const row = page.getByRole('row', { name: upstreamName });
        await row.getByRole('button', { name: 'Delete' }).click();

        await page
            .getByRole('dialog', { name: 'Delete Upstream' })
            .getByRole('button', { name: 'Delete' })
            .click();

        await uiHasToastMsg(page, {
            hasText: 'Delete Upstream Successfully',
        });
        await expect(page.getByRole('cell', { name: upstreamName })).toBeHidden();
    });
});

/**
 * Additional test to verify pass_host=rewrite is also preserved
 */
test('should preserve pass_host value "rewrite" when editing upstream nodes', async ({
    page,
}) => {
    const upstreamName = randomId('test-pass-host-rewrite');

    // Navigate to upstream add page
    await upstreamsPom.toIndex(page);
    await upstreamsPom.isIndexPage(page);
    await upstreamsPom.getAddUpstreamBtn(page).click();
    await upstreamsPom.isAddPage(page);

    await test.step('create upstream with pass_host=rewrite via UI', async () => {
        // Fill in the Name field
        await page.getByLabel('Name', { exact: true }).fill(upstreamName);

        // Add a node
        const nodesSection = page.getByRole('group', { name: 'Nodes' });
        const addNodeBtn = page.getByRole('button', { name: 'Add a Node' });

        await addNodeBtn.click();
        const rows = nodesSection.locator('tr.ant-table-row');
        const firstRow = rows.first();
        await expect(firstRow).toBeVisible();

        const hostInput = firstRow.locator('input').first();
        await hostInput.click();
        await hostInput.fill('my-service.svc');

        // Click outside to trigger update
        await nodesSection.click();

        // Set pass_host to "rewrite"
        const passHostSection = page.getByRole('group', { name: 'Pass Host' });
        await passHostSection.getByRole('textbox', { name: 'Pass Host' }).click();
        await page.getByRole('option', { name: 'rewrite' }).click();

        // Fill upstream_host (required when pass_host is "rewrite")
        await page.getByLabel('Upstream Host').fill('custom.host.example.com');

        // Submit the form
        await upstreamsPom.getAddBtn(page).click();
        await uiHasToastMsg(page, {
            hasText: 'Add Upstream Successfully',
        });
    });

    await test.step('verify auto navigate to detail page', async () => {
        await upstreamsPom.isDetailPage(page);
    });

    await test.step('verify initial values', async () => {
        const passHostSection = page.getByRole('group', { name: 'Pass Host' });
        const passHostField = passHostSection.getByRole('textbox', {
            name: 'Pass Host',
            exact: true,
        });
        await expect(passHostField).toHaveValue('rewrite');
        await expect(passHostField).toBeDisabled();

        const upstreamHostField = page.getByLabel('Upstream Host');
        await expect(upstreamHostField).toHaveValue('custom.host.example.com');
    });

    await test.step('edit and modify nodes', async () => {
        await page.getByRole('button', { name: 'Edit' }).click();

        const nodesSection = page.getByRole('group', { name: 'Nodes' });
        const rows = nodesSection.locator('tr.ant-table-row');
        const firstRow = rows.first();

        // Modify the existing node's weight
        const weightInput = firstRow.locator('input').nth(2);
        await weightInput.click();
        await weightInput.fill('10');

        // Click outside to trigger the update
        await nodesSection.click();
    });

    await test.step('verify values before saving', async () => {
        const passHostSection = page.getByRole('group', { name: 'Pass Host' });
        const passHostField = passHostSection.getByRole('textbox', {
            name: 'Pass Host',
            exact: true,
        });
        await expect(passHostField).toHaveValue('rewrite');

        const upstreamHostField = page.getByLabel('Upstream Host');
        await expect(upstreamHostField).toHaveValue('custom.host.example.com');
    });

    await test.step('save and verify values are preserved', async () => {
        const saveBtn = page.getByRole('button', { name: 'Save' });
        await saveBtn.click();

        await uiHasToastMsg(page, {
            hasText: 'Edit Upstream Successfully',
        });

        const passHostSection = page.getByRole('group', { name: 'Pass Host' });
        const passHostField = passHostSection.getByRole('textbox', {
            name: 'Pass Host',
            exact: true,
        });
        await expect(passHostField).toHaveValue('rewrite');
    });

    await test.step('delete upstream via UI', async () => {
        await upstreamsPom.getUpstreamNavBtn(page).click();
        await upstreamsPom.isIndexPage(page);

        const row = page.getByRole('row', { name: upstreamName });
        await row.getByRole('button', { name: 'Delete' }).click();

        await page
            .getByRole('dialog', { name: 'Delete Upstream' })
            .getByRole('button', { name: 'Delete' })
            .click();

        await uiHasToastMsg(page, {
            hasText: 'Delete Upstream Successfully',
        });
        await expect(page.getByRole('cell', { name: upstreamName })).toBeHidden();
    });
});
