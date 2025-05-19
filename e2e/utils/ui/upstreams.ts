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
import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

import type { APISIXType } from '@/types/schema/apisix';

/**
 * Fill the upstream form with required fields
 * @param ctx - Playwright page object or locator
 * @param upstreamName - Name for the upstream
 * @param nodes - Array of upstream nodes
 */
export async function uiFillUpstreamRequiredFields(
  ctx: Page | Locator,
  nodes: APISIXType['UpstreamNode'][],
  upstreamName: string = 'test-upstream'
) {
  // Fill in the Name field
  await ctx.getByLabel('Name', { exact: true }).fill(upstreamName);

  // Configure nodes section
  const nodesSection = ctx.getByRole('group', { name: 'Nodes' });
  const noData = nodesSection.getByText('No Data');
  const addNodeBtn = ctx.getByRole('button', { name: 'Add a Node' });

  await expect(noData).toBeVisible();

  // Add first node
  await addNodeBtn.click();
  await expect(noData).toBeHidden();
  const rows = nodesSection.locator('tr.ant-table-row');
  const firstRowHost = rows.nth(0).getByRole('textbox').first();
  await firstRowHost.fill(nodes[1].host);
  await expect(firstRowHost).toHaveValue(nodes[1].host);
  await nodesSection.click();

  // Add second node
  await addNodeBtn.click();
  await expect(rows.nth(1)).toBeVisible();
  const secondRowHost = rows.nth(1).getByRole('textbox').first();
  await secondRowHost.fill(nodes[0].host);
  await expect(secondRowHost).toHaveValue(nodes[0].host);
  await nodesSection.click();

  // Add a third node and then remove it to test deletion functionality
  await addNodeBtn.click();
  rows.nth(2).getByRole('button', { name: 'Delete' }).click();
  await expect(rows).toHaveCount(2);
}
