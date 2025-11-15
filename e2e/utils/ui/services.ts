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

import type { Test } from '../test';

/**
 * Fill the service form with required fields
 * Note: Services have no strictly required fields, but name is commonly used
 */
export async function uiFillServiceRequiredFields(
  ctx: Page | Locator,
  service: Partial<APISIXType['Service']>
) {
  // Fill in the Service Name field (not the upstream name)
  // Use a more specific selector to avoid conflicts with upstream.name
  const nameField = (ctx as Page).getByRole('textbox', { name: 'Name' }).first();
  await nameField.fill(service.name);
}

export async function uiCheckServiceRequiredFields(
  ctx: Page | Locator,
  service: Partial<APISIXType['Service']>
) {
  // Verify the service name (not the upstream name)
  const name = (ctx as Page).getByRole('textbox', { name: 'Name' }).first();
  await expect(name).toHaveValue(service.name);
  await expect(name).toBeDisabled();
}

export async function uiFillServiceAllFields(
  test: Test,
  ctx: Page | Locator,
  service: Partial<APISIXType['Service']>
) {
  await test.step('fill in basic fields', async () => {
    // 1. Name - use first() to get service name, not upstream name
    await (ctx as Page).getByRole('textbox', { name: 'Name' }).first().fill(service.name);

    // 2. Description - use first() to get service description, not upstream description
    await ctx.getByLabel('Description').first().fill(service.desc);

    // 3. Labels - use placeholder to get service labels field, not upstream labels
    const labelsField = (ctx as Page).getByPlaceholder('Input text like `key:value`,').first();
    await expect(labelsField).toBeEnabled();
    await labelsField.click();
    await labelsField.fill('env:production');
    await labelsField.press('Enter');
    await labelsField.fill('version:v1');
    await labelsField.press('Enter');
    await expect(labelsField).toHaveValue('');
  });

  await test.step('fill in upstream configuration', async () => {
    // Configure upstream
    const upstreamSection = ctx
      .getByRole('group', { name: 'Upstream' })
      .first();
    
    // Add nodes
    const addNodeBtn = ctx.getByRole('button', { name: 'Add a Node' });
    const noData = upstreamSection.getByText('No Data');
    await expect(noData).toBeVisible();

    // Add first node
    await addNodeBtn.click();
    await expect(noData).toBeHidden();
    const rows = upstreamSection.locator('tr.ant-table-row');
    await expect(rows.first()).toBeVisible();

    const hostInput = rows.first().locator('input').first();
    await hostInput.click();
    await hostInput.fill('service-node1.example.com');
    await expect(hostInput).toHaveValue('service-node1.example.com');

    const portInput = rows.first().locator('input').nth(1);
    await portInput.click();
    await portInput.fill('8080');
    await expect(portInput).toHaveValue('8080');

    const weightInput = rows.first().locator('input').nth(2);
    await weightInput.click();
    await weightInput.fill('100');
    await expect(weightInput).toHaveValue('100');

    // Add second node
    await upstreamSection.click();
    await addNodeBtn.click();
    await expect(rows.nth(1)).toBeVisible();

    const hostInput2 = rows.nth(1).locator('input').first();
    await hostInput2.click();
    await hostInput2.fill('service-node2.example.com');
    await expect(hostInput2).toHaveValue('service-node2.example.com');

    const portInput2 = rows.nth(1).locator('input').nth(1);
    await portInput2.click();
    await portInput2.fill('8081');
    await expect(portInput2).toHaveValue('8081');

    const weightInput2 = rows.nth(1).locator('input').nth(2);
    await weightInput2.click();
    await weightInput2.fill('50');
    await expect(weightInput2).toHaveValue('50');
  });

  await test.step('fill in additional fields', async () => {
    // 5. Enable WebSocket
    const websocketSwitchInput = ctx
      .locator('input[name="enable_websocket"]')
      .first();
    await websocketSwitchInput.evaluate((el) => {
      (el as HTMLElement).click();
    });
    await expect(websocketSwitchInput).toBeChecked();

    // 6. Hosts
    const hostsField = ctx.getByRole('textbox', { name: 'Hosts' });
    await expect(hostsField).toBeEnabled();
    await hostsField.click();
    await hostsField.fill('api.example.com');
    await hostsField.press('Enter');
    await hostsField.fill('www.example.com');
    await hostsField.press('Enter');
    await expect(hostsField).toHaveValue('');
  });
}

export async function uiCheckServiceAllFields(
  ctx: Page | Locator,
  service: Partial<APISIXType['Service']>
) {
  // Verify basic information - use first() to get service name, not upstream name
  const name = (ctx as Page).getByRole('textbox', { name: 'Name' }).first();
  await expect(name).toHaveValue(service.name);
  await expect(name).toBeDisabled();

  const descriptionField = ctx.getByLabel('Description').first();
  await expect(descriptionField).toHaveValue(service.desc);
  await expect(descriptionField).toBeDisabled();

  // Verify labels
  await expect(ctx.getByText('env:production')).toBeVisible();
  await expect(ctx.getByText('version:v1')).toBeVisible();

  // Verify upstream nodes
  const upstreamSection = ctx
    .getByRole('group', { name: 'Upstream' })
    .first();
  await expect(
    upstreamSection.getByRole('cell', { name: 'service-node1.example.com' })
  ).toBeVisible();
  await expect(
    upstreamSection.getByRole('cell', { name: '8080' })
  ).toBeVisible();
  await expect(
    upstreamSection.getByRole('cell', { name: '100', exact: true })
  ).toBeVisible();

  await expect(
    upstreamSection.getByRole('cell', { name: 'service-node2.example.com' })
  ).toBeVisible();
  await expect(
    upstreamSection.getByRole('cell', { name: '8081' })
  ).toBeVisible();
  await expect(
    upstreamSection.getByRole('cell', { name: '50', exact: true })
  ).toBeVisible();

  // Verify WebSocket is enabled
  const websocketSwitch = ctx
    .locator('input[name="enable_websocket"]').first();
  await expect(websocketSwitch).toBeChecked();

  // Verify hosts
  await expect(ctx.getByText('api.example.com')).toBeVisible();
  await expect(ctx.getByText('www.example.com')).toBeVisible();
}
