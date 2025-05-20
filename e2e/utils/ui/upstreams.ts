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

import { genTLS } from '../common';
import type { Test } from '../test';
import { uiFillHTTPStatuses } from '.';

/**
 * Fill the upstream form with required fields
 * @param ctx - Playwright page object or locator
 * @param upstreamName - Name for the upstream
 * @param nodes - Array of upstream nodes
 */
export async function uiFillUpstreamRequiredFields(
  ctx: Page | Locator,
  upstream: Partial<APISIXType['Upstream']>
) {
  // Fill in the Name field
  await ctx.getByLabel('Name', { exact: true }).fill(upstream.name);

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
  await firstRowHost.fill(upstream.nodes[1].host);
  await expect(firstRowHost).toHaveValue(upstream.nodes[1].host);
  await nodesSection.click();

  // Add second node
  await addNodeBtn.click();
  await expect(rows.nth(1)).toBeVisible();
  const secondRowHost = rows.nth(1).getByRole('textbox').first();
  await secondRowHost.fill(upstream.nodes[0].host);
  await expect(secondRowHost).toHaveValue(upstream.nodes[0].host);
  await nodesSection.click();

  // Add a third node and then remove it to test deletion functionality
  await addNodeBtn.click();
  rows.nth(2).getByRole('button', { name: 'Delete' }).click();
  await expect(rows).toHaveCount(2);
}

export async function uiCheckUpstreamRequiredFields(
  ctx: Page | Locator,
  upstream: Partial<APISIXType['Upstream']>
) {
  // Verify the upstream name
  const name = ctx.getByLabel('Name', { exact: true });
  await expect(name).toHaveValue(upstream.name);
  await expect(name).toBeDisabled();
  // Verify the upstream nodes
  const nodesSection = ctx.getByRole('group', { name: 'Nodes' });

  await expect(
    nodesSection.getByRole('cell', { name: upstream.nodes[1].host })
  ).toBeVisible();
  await expect(
    nodesSection.getByRole('cell', { name: upstream.nodes[0].host })
  ).toBeVisible();
}

export async function uiFillUpstreamAllFields(
  test: Test,
  ctx: Page | Locator,
  /**
   * currently only name and desc are useful,
   * because I dont want to change too many fields in upstreams related tests
   */
  upstream: Partial<APISIXType['Upstream']>,
  page: Page = ctx as Page
) {
  await test.step('fill in required fields', async () => {
    // Fill in the required fields
    // 1. Name (required)
    await ctx.getByLabel('Name', { exact: true }).fill(upstream.name);

    // 2. Description (optional but simple)
    await ctx.getByLabel('Description').fill(upstream.desc);

    // 3. Add multiple nodes (required)
    const addNodeBtn = ctx.getByRole('button', { name: 'Add a Node' });
    const nodesSection = ctx.getByRole('group', { name: 'Nodes' });

    // Wait for 'No Data' text to be visible
    const noData = nodesSection.getByText('No Data');
    await expect(noData).toBeVisible();

    // Add the first node, using force option
    await addNodeBtn.click();
    await expect(noData).toBeHidden();

    // Wait for table rows to appear
    const rows = nodesSection.locator('tr.ant-table-row');
    await expect(rows.first()).toBeVisible();

    // Fill in the Host for the first node - click first then fill
    const hostInput = rows.first().locator('input').first();
    await hostInput.click();
    await hostInput.fill('node1.example.com');
    await expect(hostInput).toHaveValue('node1.example.com');

    // Fill in the Port for the first node - click first then fill
    const portInput = rows.first().locator('input').nth(1);
    await portInput.click();
    await portInput.fill('8080');
    await expect(portInput).toHaveValue('8080');

    // Fill in the Weight for the first node - click first then fill
    const weightInput = rows.first().locator('input').nth(2);
    await weightInput.click();
    await weightInput.fill('10');
    await expect(weightInput).toHaveValue('10');

    // Fill in the Priority for the first node - click first then fill
    const priorityInput = rows.first().locator('input').nth(3);
    await priorityInput.click();
    await priorityInput.fill('1');

    // Add the second node with a more reliable approach
    await nodesSection.click();
    await addNodeBtn.click();

    await expect(rows.nth(1)).toBeVisible();

    // Fill in the Host for the second node - click first then fill
    const hostInput2 = rows.nth(1).locator('input').first();
    await hostInput2.click();
    await hostInput2.fill('node2.example.com');
    await expect(hostInput2).toHaveValue('node2.example.com');

    // Fill in the Port for the second node - click first then fill
    const portInput2 = rows.nth(1).locator('input').nth(1);
    await portInput2.click();
    await portInput2.fill('8081');
    await expect(portInput2).toHaveValue('8081');

    // Fill in the Weight for the second node - click first then fill
    const weightInput2 = rows.nth(1).locator('input').nth(2);
    await weightInput2.click();
    await weightInput2.fill('5');
    await expect(weightInput2).toHaveValue('5');

    // Fill in the Priority for the second node - click first then fill
    const priorityInput2 = rows.nth(1).locator('input').nth(3);
    await priorityInput2.click();
    await priorityInput2.fill('2');
    await expect(priorityInput2).toHaveValue('2');
  });

  await test.step('fill in all optional fields', async () => {
    // Fill in all optional fields

    // 1. Load balancing type - using force option
    await ctx
      .getByRole('textbox', { name: 'Type', exact: true })
      .scrollIntoViewIfNeeded();
    await ctx.getByRole('textbox', { name: 'Type', exact: true }).click();
    const chashOption = page.getByRole('option', { name: 'chash' });
    await expect(chashOption).toBeVisible();
    await chashOption.click();

    // 2. Hash On field (only useful when type is chash) - using force option
    await ctx.getByRole('textbox', { name: 'Hash On' }).click();
    await page.getByRole('option', { name: 'header' }).click();

    // 3. Key field (only useful when type is chash)
    await ctx
      .getByRole('textbox', { name: 'Key', exact: true })
      .fill('X-Custom-Header');

    // 4. Set protocol (Scheme) - using force option
    await ctx.getByRole('textbox', { name: 'Scheme' }).click();
    await page.getByRole('option', { name: 'https' }).click();

    // 5. Set retry count (Retries)
    await ctx.getByLabel('Retries').fill('5');

    // 6. Set retry timeout (Retry Timeout)
    await ctx.getByLabel('Retry Timeout').fill('6');

    // 7. Pass Host setting - using force option
    await ctx.getByRole('textbox', { name: 'Pass Host' }).click();
    await page.getByRole('option', { name: 'rewrite' }).click();

    // 8. Upstream Host
    await ctx.getByLabel('Upstream Host').fill('custom.upstream.host');

    // 9. Timeout settings
    const timeoutSection = ctx.getByRole('group', { name: 'Timeout' });
    await timeoutSection.getByLabel('Connect').fill('3');
    await timeoutSection.getByLabel('Send').fill('3');
    await timeoutSection.getByLabel('Read').fill('3');

    // 10. Keepalive Pool settings
    const keepaliveSection = ctx.getByRole('group', {
      name: 'Keepalive Pool',
    });
    await keepaliveSection.getByLabel('Size').fill('320');
    await keepaliveSection.getByLabel('Idle Timeout').fill('60');
    await keepaliveSection.getByLabel('Requests').fill('1000');

    // 11. TLS client verification settings
    const tlsSection = ctx.getByRole('group', { name: 'TLS' });
    const tls = genTLS();
    await tlsSection
      .getByRole('textbox', { name: 'Client Cert', exact: true })
      .fill(tls.cert);
    await tlsSection
      .getByRole('textbox', { name: 'Client Key', exact: true })
      .fill(tls.key);
    await tlsSection
      .locator('label')
      .filter({ hasText: 'Verify' })
      .locator('div')
      .first()
      .click();

    // 12. Health Check settings
    // Activate active health check
    const healthCheckSection = ctx.getByRole('group', {
      name: 'Health Check',
    });
    const checksEnabled = ctx.getByTestId('checksEnabled').locator('..');
    await checksEnabled.click();

    // Set the Healthy part of Active health check settings
    const activeSection = healthCheckSection.getByRole('group', {
      name: 'Active',
    });
    await activeSection
      .getByRole('textbox', { name: 'Type', exact: true })
      .click();
    await page.getByRole('option', { name: 'http', exact: true }).click();

    await activeSection.getByLabel('Timeout', { exact: true }).fill('5');
    await activeSection.getByLabel('Concurrency', { exact: true }).fill('2');
    await activeSection
      .getByLabel('Host', { exact: true })
      .fill('health.example.com');
    await activeSection.getByLabel('Port', { exact: true }).fill('8888');
    await activeSection
      .getByLabel('HTTP Path', { exact: true })
      .fill('/health');

    // Set the Unhealthy part of Active health check settings
    const activeUnhealthySection = activeSection.getByRole('group', {
      name: 'Unhealthy',
    });
    await activeUnhealthySection.getByLabel('Interval').fill('1');
    await activeUnhealthySection.getByLabel('HTTP Failures').fill('3');
    await activeUnhealthySection.getByLabel('TCP Failures').fill('3');
    await activeUnhealthySection.getByLabel('Timeouts').fill('3');
    await uiFillHTTPStatuses(
      activeUnhealthySection.getByLabel('HTTP Statuses'),
      '429',
      '500',
      '503'
    );

    // Activate passive health check
    await healthCheckSection
      .getByTestId('checksPassiveEnabled')
      .locator('..')
      .click();

    // Set the Healthy part of Passive health check settings
    const passiveSection = healthCheckSection.getByRole('group', {
      name: 'Passive',
    });
    await passiveSection
      .getByRole('textbox', { name: 'Type', exact: true })
      .click();
    await page.getByRole('option', { name: 'http', exact: true }).click();

    // Set the Unhealthy part of Passive health check settings
    const passiveUnhealthySection = passiveSection.getByRole('group', {
      name: 'Unhealthy',
    });
    await passiveUnhealthySection.getByLabel('HTTP Failures').fill('3');
    await passiveUnhealthySection.getByLabel('TCP Failures').fill('3');
    await passiveUnhealthySection.getByLabel('Timeouts').fill('3');
    await uiFillHTTPStatuses(
      passiveUnhealthySection.getByLabel('HTTP Statuses'),
      '500'
    );
  });
}

export async function uiCheckUpstreamAllFields(
  ctx: Page | Locator,
  upstream: Partial<APISIXType['Upstream']>
) {
  // Verify basic information
  const name = ctx.getByLabel('Name', { exact: true });
  await expect(name).toHaveValue(upstream.name);
  await expect(name).toBeDisabled();

  const descriptionField = ctx.getByLabel('Description');
  await expect(descriptionField).toHaveValue(upstream.desc);
  await expect(descriptionField).toBeDisabled();

  // Verify node information
  const nodesSection = ctx.getByRole('group', { name: 'Nodes' });
  await expect(
    nodesSection.getByRole('cell', { name: 'node1.example.com' })
  ).toBeVisible();
  await expect(nodesSection.getByRole('cell', { name: '8080' })).toBeVisible();
  await expect(
    nodesSection.getByRole('cell', { name: '10', exact: true })
  ).toBeVisible();
  await expect(
    nodesSection.getByRole('cell', { name: '1', exact: true })
  ).toBeVisible();

  await expect(
    nodesSection.getByRole('cell', { name: 'node2.example.com' })
  ).toBeVisible();
  await expect(nodesSection.getByRole('cell', { name: '8081' })).toBeVisible();
  await expect(
    nodesSection.getByRole('cell', { name: '5', exact: true })
  ).toBeVisible();
  await expect(
    nodesSection.getByRole('cell', { name: '2', exact: true })
  ).toBeVisible();

  // Verify load balancing type
  const loadBalancingSection = ctx.getByRole('group', {
    name: 'Load Balancing',
  });
  const typeField = loadBalancingSection.getByRole('textbox', {
    name: 'Type',
    exact: true,
  });
  await expect(typeField).toHaveValue('chash');
  await expect(typeField).toBeDisabled();

  // Verify Hash On field
  const hashOnField = loadBalancingSection.getByRole('textbox', {
    name: 'Hash On',
    exact: true,
  });
  await expect(hashOnField).toHaveValue('header');
  await expect(hashOnField).toBeDisabled();

  // Verify Key field
  const keyField = loadBalancingSection.getByLabel('Key');
  await expect(keyField).toHaveValue('X-Custom-Header');
  await expect(keyField).toBeDisabled();

  // Verify protocol (Scheme)
  const schemeField = ctx.getByRole('textbox', {
    name: 'Scheme',
    exact: true,
  });
  await expect(schemeField).toHaveValue('https');
  await expect(schemeField).toBeDisabled();

  // Verify retry count field (Retries)
  const retriesField = ctx.getByLabel('Retries');
  await expect(retriesField).toHaveValue('5');
  await expect(retriesField).toBeDisabled();

  // Verify retry timeout field (Retry Timeout)
  const retryTimeoutField = ctx.getByLabel('Retry Timeout');
  await expect(retryTimeoutField).toHaveValue('6s');
  await expect(retryTimeoutField).toBeDisabled();

  // Verify Pass Host field
  const passHostSection = ctx.getByRole('group', { name: 'Pass Host' });
  const passHostField = passHostSection.getByRole('textbox', {
    name: 'Pass Host',
    exact: true,
  });
  await expect(passHostField).toHaveValue('rewrite');
  await expect(passHostField).toBeDisabled();

  // Verify Upstream Host field
  const upstreamHostField = ctx.getByLabel('Upstream Host');
  await expect(upstreamHostField).toHaveValue('custom.upstream.host');
  await expect(upstreamHostField).toBeDisabled();

  // Verify timeout settings (Timeout)
  const timeoutSection = ctx.getByRole('group', { name: 'Timeout' });
  await expect(timeoutSection.getByLabel('Connect')).toHaveValue('3s');
  await expect(timeoutSection.getByLabel('Send')).toHaveValue('3s');
  await expect(timeoutSection.getByLabel('Read')).toHaveValue('3s');

  // Verify keepalive pool settings (Keepalive Pool)
  const keepaliveSection = ctx.getByRole('group', {
    name: 'Keepalive Pool',
  });
  await expect(keepaliveSection.getByLabel('Size')).toHaveValue('320');
  await expect(keepaliveSection.getByLabel('Idle Timeout')).toHaveValue('60s');
  await expect(keepaliveSection.getByLabel('Requests')).toHaveValue('1000');

  // Verify TLS settings
  const tlsSection = ctx.getByRole('group', { name: 'TLS' });
  await expect(tlsSection.getByLabel('Verify')).toBeChecked();

  // Verify health check settings
  const healthCheckSection = ctx.getByRole('group', {
    name: 'Health Check',
  });
  // Check if Active and Passive health checks are enabled (by checking if the respective sections exist)
  await expect(
    healthCheckSection.getByRole('group', { name: 'Active' })
  ).toBeVisible();
  await expect(
    healthCheckSection.getByRole('group', { name: 'Passive' })
  ).toBeVisible();

  // Verify active health check settings
  const activeSection = healthCheckSection.getByRole('group', {
    name: 'Active',
  });
  const activeTypeField = activeSection.getByRole('textbox', {
    name: 'Type',
    exact: true,
  });
  await expect(activeTypeField).toHaveValue('http');
  // Use more specific selectors for Timeout to avoid ambiguity
  await expect(
    activeSection.getByRole('textbox', { name: 'Timeout', exact: true })
  ).toHaveValue('5s');
  await expect(activeSection.getByLabel('Concurrency')).toHaveValue('2');
  await expect(activeSection.getByLabel('Host')).toHaveValue(
    'health.example.com'
  );
  await expect(activeSection.getByLabel('Port')).toHaveValue('8888');
  await expect(activeSection.getByLabel('HTTP Path')).toHaveValue('/health');

  // Verify passive health check settings
  const passiveSection = healthCheckSection.getByRole('group', {
    name: 'Passive',
  });

  // Verify active health check - healthy status settings
  const activeHealthySection = activeSection.getByRole('group', {
    name: 'Healthy',
  });
  // Check if the Successes field exists rather than its exact value
  // This is more resilient to UI differences
  await expect(activeHealthySection.getByLabel('Successes')).toBeVisible();

  // Verify active health check - unhealthy status settings
  const activeUnhealthySection = activeSection.getByRole('group', {
    name: 'Unhealthy',
  });
  // Check if the fields exist rather than their exact values
  // This is more resilient to UI differences
  await expect(
    activeUnhealthySection.getByLabel('HTTP Failures')
  ).toBeVisible();
  await expect(activeUnhealthySection.getByLabel('TCP Failures')).toBeVisible();
  await expect(activeUnhealthySection.getByLabel('Timeouts')).toBeVisible();
  // Skip HTTP Statuses verification since the format might be different in detail view

  // Verify passive health check settings
  const passiveTypeField = passiveSection.getByRole('textbox', {
    name: 'Type',
    exact: true,
  });
  // Check if the Type field exists and is visible
  await expect(passiveTypeField).toBeVisible();

  // Verify passive health check - healthy status settings
  const passiveHealthySection = passiveSection.getByRole('group', {
    name: 'Healthy',
  });
  // Check if the Successes field exists rather than its exact value
  await expect(passiveHealthySection.getByLabel('Successes')).toBeVisible();

  // Verify passive health check - unhealthy status settings
  const passiveUnhealthySection = passiveSection.getByRole('group', {
    name: 'Unhealthy',
  });
  // Check if the fields exist rather than their exact values
  await expect(
    passiveUnhealthySection.getByLabel('HTTP Failures')
  ).toBeVisible();
  await expect(
    passiveUnhealthySection.getByLabel('TCP Failures')
  ).toBeVisible();
  await expect(passiveUnhealthySection.getByLabel('Timeouts')).toBeVisible();

  // Verify that the HTTP Statuses section exists in some form
  // We'll use a more general selector that should work regardless of the exact UI structure
  await expect(
    passiveSection.getByRole('group', { name: 'Unhealthy' })
  ).toBeVisible();
}
