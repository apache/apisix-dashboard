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
import { servicesPom } from '@e2e/pom/services';
import { upstreamsPom } from '@e2e/pom/upstreams';
import { randomId } from '@e2e/utils/common';
import { e2eReq } from '@e2e/utils/req';
import { test } from '@e2e/utils/test';
import {
  uiFillMonacoEditor,
  uiGetMonacoEditor,
  uiHasToastMsg,
} from '@e2e/utils/ui';
import { expect } from '@playwright/test';

import { deleteAllRoutes } from '@/apis/routes';
import { deleteAllServices } from '@/apis/services';
import { deleteAllUpstreams } from '@/apis/upstreams';
import { API_SERVICES, API_UPSTREAMS } from '@/config/constant';
import type { APISIXType } from '@/types/schema/apisix';

test.afterAll(async () => {
  await deleteAllRoutes(e2eReq);
  await deleteAllServices(e2eReq);
  await deleteAllUpstreams(e2eReq);
});

test('can create upstream -> service -> route', async ({ page }) => {
  const selectPluginsBtn = page.getByRole('button', {
    name: 'Select Plugins',
  });
  const selectPluginsDialog = page.getByRole('dialog', {
    name: 'Select Plugins',
  });

  /**
   * 1. Create Upstream
   * Name: HTTPBIN Server
   * Node
   * Host:Port: httpbin.org:443
   * Scheme: HTTPS
   */
  const upstream: Partial<APISIXType['Upstream']> = {
    // will be set in test
    id: undefined,
    name: randomId('HTTPBIN Server'),
    scheme: 'https',
    nodes: [{ host: 'httpbin.org', port: 443 }],
  };
  await test.step('create upstream', async () => {
    // Navigate to the upstream list page
    await upstreamsPom.toIndex(page);
    await upstreamsPom.isIndexPage(page);

    // Click the add upstream button
    await upstreamsPom.getAddUpstreamBtn(page).click();
    await upstreamsPom.isAddPage(page);

    // Fill in basic fields
    await page.getByLabel('Name', { exact: true }).fill(upstream.name);

    // Configure nodes section
    const nodesSection = page.getByRole('group', { name: 'Nodes' });
    const addNodeBtn = page.getByRole('button', { name: 'Add a Node' });

    // Add node
    await addNodeBtn.click();
    const rows = nodesSection.locator('tr.ant-table-row');

    // Fill host
    const hostInput = rows.first().locator('input').first();
    await hostInput.click();
    await hostInput.fill(upstream.nodes[0].host);

    // Fill port
    const portInput = rows.first().locator('input').nth(1);
    await portInput.click();
    await portInput.fill(upstream.nodes[0].port.toString());

    // Set scheme to HTTPS
    await page.getByRole('textbox', { name: 'Scheme' }).click();
    await page.getByRole('option', { name: upstream.scheme }).click();

    const postReq = page.waitForResponse(
      (r) => r.url().includes(API_UPSTREAMS) && r.request().method() === 'POST'
    );
    // Submit the form
    await upstreamsPom.getAddBtn(page).click();

    // Intercept the response, get id from response
    const res = await postReq;
    const data = (await res.json()) as APISIXType['RespUpstreamDetail']['data'];
    expect(data).toHaveProperty('value.id');

    // Wait for success message
    await uiHasToastMsg(page, {
      hasText: 'Add Upstream Successfully',
    });
    // Verify automatic redirection to detail page
    await upstreamsPom.isDetailPage(page);

    // Get id from url
    const url = page.url();
    const id = url.split('/').pop();
    expect(id).toBeDefined();
    expect(data.value.id).toBe(id);

    // Set id to upstream
    upstream.id = id;

    // Verify the upstream name
    const name = page.getByLabel('Name', { exact: true });
    await expect(name).toHaveValue(upstream.name);
    await expect(name).toBeDisabled();

    // Verify scheme
    const schemeField = page.getByRole('textbox', {
      name: 'Scheme',
      exact: true,
    });
    await expect(schemeField).toHaveValue(upstream.scheme);
    await expect(schemeField).toBeDisabled();
  });

  /**
   * 2. Create Service
   * Name: HTTPBIN Service
   * Upstream: Reference the upstream created above
   * Plugins: Enable limit-count with custom configuration
   */
  const servicePluginName = 'limit-count';
  const service = {
    // will be set in test
    id: undefined,
    name: randomId('HTTPBIN Service'),
    upstream_id: upstream.id,
    plugins: {
      [servicePluginName]: {
        count: 10,
        time_window: 60,
        rejected_code: 429,
        key: 'remote_addr',
        policy: 'local',
      },
    },
  } satisfies Partial<APISIXType['Service']>;
  await test.step('create service', async () => {
    // upstream id should be set
    expect(service.upstream_id).not.toBeUndefined();

    // Navigate to the services list page
    await servicesPom.toIndex(page);
    await servicesPom.isIndexPage(page);

    // Click the add service button
    await servicesPom.getAddServiceBtn(page).click();
    await servicesPom.isAddPage(page);

    // Fill in basic fields
    await page.getByLabel('Name', { exact: true }).first().fill(service.name);

    // Select upstream
    const upstreamSection = page.getByRole('group', {
      name: 'Upstream',
      exact: true,
    });

    // Set upstream id
    await upstreamSection
      .locator('input[name="upstream_id"]')
      .fill(upstream.id);

    // Add plugins
    await selectPluginsBtn.click();

    // Search for plugin
    const selectPluginsDialog = page.getByRole('dialog', {
      name: 'Select Plugins',
    });
    const searchInput = selectPluginsDialog.getByPlaceholder('Search');
    await searchInput.fill(servicePluginName);

    // Add the plugin
    await selectPluginsDialog
      .getByTestId(`plugin-${servicePluginName}`)
      .getByRole('button', { name: 'Add' })
      .click();

    // Configure the plugin
    const addPluginDialog = page.getByRole('dialog', { name: 'Add Plugin' });
    const pluginEditor = await uiGetMonacoEditor(page, addPluginDialog);

    // Add plugin configuration
    await uiFillMonacoEditor(
      page,
      pluginEditor,
      JSON.stringify(service.plugins?.[servicePluginName])
    );

    // Add the plugin
    await addPluginDialog.getByRole('button', { name: 'Add' }).click();
    await expect(addPluginDialog).toBeHidden();

    // Verify the plugin was added
    const pluginsSection = page.getByRole('group', { name: 'Plugins' });
    await expect(
      pluginsSection.getByTestId(`plugin-${servicePluginName}`)
    ).toBeVisible();

    const postReq = page.waitForResponse(
      (r) => r.url().includes(API_SERVICES) && r.request().method() === 'POST'
    );
    // Submit the form
    await servicesPom.getAddBtn(page).click();

    // intercept the response, get id from response
    const response = await postReq;
    const data =
      (await response.json()) as APISIXType['RespServiceDetail']['data'];
    expect(data).toHaveProperty('value.id');

    // Wait for success message
    await uiHasToastMsg(page, {
      hasText: 'Add Service Successfully',
    });
    // Verify we're on the service detail page
    await servicesPom.isDetailPage(page);

    // Get id from url
    const url = page.url();
    const id = url.split('/').pop();
    expect(id).toBeDefined();
    expect(data.value.id).toBe(id);

    // Set id to service
    service.id = id;

    // Verify the service name
    const name = page.getByLabel('Name', { exact: true }).first();
    await expect(name).toHaveValue(service.name);
    await expect(name).toBeDisabled();
  });

  /**
   * 3. Create Route
   * Name: Generate UUID
   * Uri: /uuid
   * Methods: GET
   * Service: Reference the service created above
   * Plugins: Enable CORS plugin with custom configuration (constraint allow_origins = "httpbin.local")
   */
  const routePluginName = 'cors';
  const route: Partial<APISIXType['Route']> = {
    name: randomId('Generate UUID'),
    uri: '/uuid',
    methods: ['GET'],
    service_id: service.id,
    plugins: {
      [routePluginName]: {
        allow_origins: 'https://httpbin.local:80',
      },
    },
  };
  await test.step('create route', async () => {
    // service id should be set
    expect(route.service_id).not.toBeUndefined();

    // Navigate to the route list page
    await routesPom.toIndex(page);
    await routesPom.isIndexPage(page);

    // Click the add route button
    await routesPom.getAddRouteBtn(page).click();
    await routesPom.isAddPage(page);

    // Fill in basic fields
    await page.getByLabel('Name', { exact: true }).first().fill(route.name);
    await page.getByLabel('URI', { exact: true }).fill(route.uri);

    // Select HTTP methods
    await page.getByRole('textbox', { name: 'HTTP Methods' }).click();
    await page.getByRole('option', { name: 'GET' }).click();
    await page.keyboard.press('Escape');

    // Select service reference
    const serviceSection = page.getByRole('group', { name: 'Service' });
    await serviceSection.locator('input[name="service_id"]').fill(service.id);

    // Add plugins
    await selectPluginsBtn.click();

    // Search for plugin
    const searchInput = selectPluginsDialog.getByPlaceholder('Search');
    await searchInput.fill(routePluginName);

    // Add the plugin
    await selectPluginsDialog
      .getByTestId(`plugin-${routePluginName}`)
      .getByRole('button', { name: 'Add' })
      .click();

    // Configure the plugin
    const addPluginDialog = page.getByRole('dialog', { name: 'Add Plugin' });
    const pluginEditor = await uiGetMonacoEditor(page, addPluginDialog);

    // Add plugin configuration
    await uiFillMonacoEditor(
      page,
      pluginEditor,
      JSON.stringify(route.plugins?.[routePluginName])
    );

    // Add the plugin
    await addPluginDialog.getByRole('button', { name: 'Add' }).click();
    await expect(addPluginDialog).toBeHidden();

    // Verify the plugin was added
    const pluginsSection = page.getByRole('group', { name: 'Plugins' });
    await expect(
      pluginsSection.getByTestId(`plugin-${routePluginName}`)
    ).toBeVisible();

    // Submit the form
    await routesPom.getAddBtn(page).click();

    // Wait for success message
    await uiHasToastMsg(page, {
      hasText: 'Add Route Successfully',
    });

    // Verify we're on the route detail page
    await routesPom.isDetailPage(page);

    // Verify the route name
    const name = page.getByLabel('Name', { exact: true }).first();
    await expect(name).toHaveValue(route.name);
    await expect(name).toBeDisabled();
  });

  /**
   * 4. Verification
   * Ensure all created values exist
   */
  await test.step('verify all created resources', async () => {
    // Verify upstream exists in list
    await upstreamsPom.toIndex(page);
    await upstreamsPom.isIndexPage(page);
    await expect(page.getByRole('cell', { name: upstream.name })).toBeVisible();

    // Verify service exists in list
    await page.getByRole('link', { name: 'Services' }).click();
    await expect(page.getByRole('heading', { name: 'Services' })).toBeVisible();
    await expect(page.getByRole('cell', { name: service.name })).toBeVisible();

    // Verify route exists in list
    await routesPom.toIndex(page);
    await routesPom.isIndexPage(page);
    await expect(page.getByRole('cell', { name: route.name })).toBeVisible();

    // Navigate to route detail to verify service and plugin
    await page
      .getByRole('row', { name: route.name })
      .getByRole('button', { name: 'View' })
      .click();
    await routesPom.isDetailPage(page);

    // Verify URI
    const uri = page.getByLabel('URI', { exact: true });
    await expect(uri).toHaveValue(route.uri);

    // Verify HTTP methods
    const methods = page
      .getByRole('textbox', { name: 'HTTP Methods' })
      .locator('..');
    await expect(methods).toContainText('GET');

    // Verify CORS plugin is present
    await expect(page.getByText('cors')).toBeVisible();

    // Verify service id is present
    await expect(page.locator('input[name="service_id"]')).toHaveValue(
      service.id
    );

    // Navigate to service detail to verify upstream and plugin
    await servicesPom.toIndex(page);
    await servicesPom.isIndexPage(page);
    await page
      .getByRole('row', { name: service.name })
      .getByRole('button', { name: 'View' })
      .click();

    // Verify limit-count plugin is present
    await expect(page.getByText(servicePluginName)).toBeVisible();

    // Verify upstream id is present
    await expect(page.locator('input[name="upstream_id"]').first()).toHaveValue(
      upstream.id
    );

    // Verify service name is present
    await expect(
      page.getByRole('textbox', { name: 'Name', exact: true }).first()
    ).toHaveValue(service.name);

    // Navigate to upstream detail to verify nodes
    await upstreamsPom.toIndex(page);
    await upstreamsPom.isIndexPage(page);
    await page
      .getByRole('row', { name: upstream.name })
      .getByRole('button', { name: 'View' })
      .click();

    // Verify nodes are present
    await expect(
      page.getByRole('cell', { name: upstream.nodes[0].host })
    ).toBeVisible();

    // Verify upstream name is present
    await expect(
      page.getByRole('textbox', { name: 'Name', exact: true })
    ).toHaveValue(upstream.name);
  });
});
