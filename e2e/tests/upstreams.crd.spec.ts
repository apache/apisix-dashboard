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
import { test } from '@e2e/utils/test';
import { uiHasToastMsg } from '@e2e/utils/ui';
import { expect } from '@playwright/test';

import type { APISIXType } from '@/types/schema/apisix';

const upstreamName = randomId('test-upstream');
const nodes: APISIXType['UpstreamNode'][] = [
  { host: 'test.com' },
  { host: 'test2.com', port: 80 },
];

test('should add upstream with required fields, and delete in detail page', async ({
  page,
}) => {
  await upstreamsPom.toIndex(page);
  await upstreamsPom.isIndexPage(page);

  await upstreamsPom.getAddUpstreamBtn(page).click();
  await upstreamsPom.isAddPage(page);

  const addBtn = page.getByRole('button', { name: 'Add', exact: true });
  await test.step('cannot submit without required fields', async () => {
    await addBtn.click();
    await upstreamsPom.isAddPage(page);
    await uiHasToastMsg(page, {
      hasText: 'invalid configuration: value ',
    });
  });

  await test.step('submit with required fields', async () => {
    await page.getByLabel('Name', { exact: true }).fill(upstreamName);

    const nodesSection = page.getByRole('group', { name: 'Nodes' });
    const noData = nodesSection.getByText('No Data');
    const addNodeBtn = page.getByRole('button', { name: 'Add a Node' });

    await expect(noData).toBeVisible();

    await addNodeBtn.click();
    await expect(noData).toBeHidden();
    const rows = nodesSection.locator('tr.ant-table-row');
    const firstRowHost = rows.nth(0).getByRole('textbox').first();
    await firstRowHost.fill(nodes[1].host);
    await expect(firstRowHost).toHaveValue(nodes[1].host);
    await nodesSection.click();

    // add a new node then remove it
    // have to use force to click the delete button
    await addNodeBtn.click();
    await expect(rows.nth(1)).toBeVisible();
    const secondRowHost = rows.nth(1).getByRole('textbox').first();
    await secondRowHost.fill(nodes[0].host);
    await expect(secondRowHost).toHaveValue(nodes[0].host);
    await nodesSection.click();

    // we need to replace the antd component to help fix this issue
    await addNodeBtn.click();
    rows.nth(2).getByRole('button', { name: 'Delete' }).click();
    await expect(rows).toHaveCount(2);

    await addBtn.click();
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
    // Verify the upstream name
    const name = page.getByLabel('Name', { exact: true });
    await expect(name).toHaveValue(upstreamName);
    await expect(name).toBeDisabled();
    // Verify the upstream nodes
    const nodesSection = page.getByRole('group', { name: 'Nodes' });

    await expect(
      nodesSection.getByRole('cell', { name: nodes[1].host })
    ).toBeVisible();
    await expect(
      nodesSection.getByRole('cell', { name: nodes[0].host })
    ).toBeVisible();
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
