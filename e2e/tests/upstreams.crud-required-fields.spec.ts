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
import { uiCannotSubmitEmptyForm, uiHasToastMsg } from '@e2e/utils/ui';
import {
  uiCheckUpstreamRequiredFields,
  uiFillUpstreamRequiredFields,
} from '@e2e/utils/ui/upstreams';
import { expect } from '@playwright/test';

import { deleteAllUpstreams } from '@/apis/upstreams';
import type { APISIXType } from '@/types/schema/apisix';

const upstreamName = randomId('test-upstream');
const nodes: APISIXType['UpstreamNode'][] = [
  { host: 'test.com' },
  { host: 'test2.com', port: 80 },
];

test.beforeAll(async () => {
  await deleteAllUpstreams(e2eReq);
});

test('should CRUD upstream with required fields', async ({ page }) => {
  await upstreamsPom.toIndex(page);
  await upstreamsPom.isIndexPage(page);

  await upstreamsPom.getAddUpstreamBtn(page).click();
  await upstreamsPom.isAddPage(page);

  await test.step('cannot submit without required fields', async () => {
    await uiCannotSubmitEmptyForm(page, upstreamsPom);
  });

  await test.step('submit with required fields', async () => {
    await uiFillUpstreamRequiredFields(page, {
      name: upstreamName,
      nodes,
    });
    await upstreamsPom.getAddBtn(page).click();
    await uiHasToastMsg(page, {
      hasText: 'Add Upstream Successfully',
    });
  });

  await test.step('auto navigate to upstream detail page', async () => {
    await upstreamsPom.isDetailPage(page);
    // Verify ID exists
    const ID = page.getByRole('textbox', { name: 'ID', exact: true });
    await expect(ID).toBeVisible();
    await expect(ID).toBeDisabled();
    await uiCheckUpstreamRequiredFields(page, {
      name: upstreamName,
      nodes,
    });
  });

  await test.step('can see upstream in list page', async () => {
    await upstreamsPom.getUpstreamNavBtn(page).click();
    await expect(page.getByRole('cell', { name: upstreamName })).toBeVisible();
  });

  await test.step('navigate to upstream detail page', async () => {
    // Click on the upstream name to go to the detail page
    await page
      .getByRole('row', { name: upstreamName })
      .getByRole('button', { name: 'View' })
      .click();
    await upstreamsPom.isDetailPage(page);
    const name = page.getByLabel('Name', { exact: true });
    await expect(name).toHaveValue(upstreamName);
  });

  await test.step('edit and update upstream in detail page', async () => {
    // Click the Edit button in the detail page
    await page.getByRole('button', { name: 'Edit' }).click();

    // Verify we're in edit mode - fields should be editable now
    const nameField = page.getByLabel('Name', { exact: true });
    await expect(nameField).toBeEnabled();

    // Update the description field
    const descriptionField = page.getByLabel('Description');
    await descriptionField.fill('Updated description for testing');

    // Add a simple label (key:value format)
    const labelsField = page.getByRole('textbox', { name: 'Labels' });
    await expect(labelsField).toBeEnabled();

    // Add a single label in key:value format
    await labelsField.click();
    await labelsField.fill('version:v1');
    await labelsField.press('Enter');

    // Verify the label was added by checking if the input is cleared
    // This indicates the tag was successfully created
    await expect(labelsField).toHaveValue('');

    // Update a node - change the host of the first node
    const nodesSection = page.getByRole('group', { name: 'Nodes' });
    const rows = nodesSection.locator('tr.ant-table-row');
    const firstRowHost = rows.nth(0).getByRole('textbox').first();
    await firstRowHost.fill('updated-test.com');
    await expect(firstRowHost).toHaveValue('updated-test.com');
    await nodesSection.click();

    // Click the Save button to save changes
    const saveBtn = page.getByRole('button', { name: 'Save' });
    await saveBtn.click();

    // Verify the update was successful
    await uiHasToastMsg(page, {
      hasText: 'success',
    });

    // Verify we're back in detail view mode
    await upstreamsPom.isDetailPage(page);

    // Verify the updated fields
    await expect(page.getByLabel('Description')).toHaveValue(
      'Updated description for testing'
    );

    // Check if the updated node host text is visible somewhere in the nodes section
    await expect(nodesSection).toBeVisible();
    await expect(nodesSection.getByText('updated-test.com')).toBeVisible();

    // check labels
    await expect(page.getByText('version:v1')).toBeVisible();

    // Return to list page and verify the upstream exists
    await upstreamsPom.getUpstreamNavBtn(page).click();
    await upstreamsPom.isIndexPage(page);

    // Find the row with our upstream
    const row = page.getByRole('row', { name: upstreamName });
    await expect(row).toBeVisible();
  });

  await test.step('delete upstream in detail page', async () => {
    await page.getByRole('button', { name: 'Delete' }).click();

    await page
      .getByRole('dialog', { name: 'Delete Upstream' })
      .getByRole('button', { name: 'Delete' })
      .click();

    // will redirect to upstreams page
    await upstreamsPom.isIndexPage(page);
    await uiHasToastMsg(page, {
      hasText: 'Delete Upstream Successfully',
    });
    await expect(page.getByRole('cell', { name: upstreamName })).toBeHidden();
  });
});
