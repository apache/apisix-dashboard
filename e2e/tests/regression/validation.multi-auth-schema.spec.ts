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

// Regression: the multi-auth plugin schema must accept a valid
// configuration in the dashboard's plugin editor.
//
// Related issue:
//   - apache/apisix-dashboard#3289 multi-auth schema validation wrong

import { routesPom } from '@e2e/pom/routes';
import { randomId } from '@e2e/utils/common';
import { e2eReq } from '@e2e/utils/req';
import { test } from '@e2e/utils/test';
import {
  uiFillMonacoEditor,
  uiGetMonacoEditor,
  uiHasToastMsg,
} from '@e2e/utils/ui';
import { uiFillUpstreamRequiredFields } from '@e2e/utils/ui/upstreams';
import { expect } from '@playwright/test';

import { deleteAllRoutes, getRouteReq } from '@/apis/routes';
import type { APISIXType } from '@/types/schema/apisix';

const nodes: APISIXType['UpstreamNode'][] = [
  { host: 'reg-multiauth.local', port: 80, weight: 100 },
  { host: 'reg-multiauth-2.local', port: 80, weight: 100 },
];

const validMultiAuthConfig = {
  auth_plugins: [
    { 'key-auth': {} },
    { 'jwt-auth': {} },
  ],
};

test.beforeAll(async () => {
  await deleteAllRoutes(e2eReq);
});

test.afterAll(async () => {
  await deleteAllRoutes(e2eReq);
});

test('Route accepts multi-auth plugin with valid config', async ({ page }) => {
  await routesPom.toAdd(page);
  await routesPom.isAddPage(page);

  await page
    .getByLabel('Name', { exact: true })
    .first()
    .fill(randomId('reg-multiauth'));
  await page.getByLabel('URI', { exact: true }).fill('/regression/multi-auth');
  await page.getByRole('textbox', { name: 'HTTP Methods' }).click();
  await page.getByRole('option', { name: 'GET' }).click();
  await page.keyboard.press('Escape');

  const upstreamSection = page.getByRole('group', {
    name: 'Upstream',
    exact: true,
  });
  await uiFillUpstreamRequiredFields(
    upstreamSection,
    { nodes, name: randomId('reg-up'), desc: 'reg' }
  );

  await test.step('add multi-auth plugin with a valid 2-plugin config', async () => {
    await page.getByRole('button', { name: 'Select Plugins' }).click();
    const selectDialog = page.getByRole('dialog', { name: 'Select Plugins' });
    await selectDialog.getByPlaceholder('Search').fill('multi-auth');
    await selectDialog
      .getByTestId('plugin-multi-auth')
      .getByRole('button', { name: 'Add' })
      .click();

    const addPluginDialog = page.getByRole('dialog', { name: 'Add Plugin' });
    const editor = await uiGetMonacoEditor(page, addPluginDialog, false);
    await uiFillMonacoEditor(
      page,
      editor,
      JSON.stringify(validMultiAuthConfig)
    );
    await addPluginDialog.getByRole('button', { name: 'Add' }).click();
    await expect(addPluginDialog).toBeHidden({ timeout: 10000 });
  });

  await test.step('submit route — schema must accept the valid config', async () => {
    await routesPom.getAddBtn(page).click();
    await uiHasToastMsg(page, { hasText: 'Add Route Successfully' });
    await routesPom.isDetailPage(page);
  });

  await test.step('Admin API contains the multi-auth plugin', async () => {
    const routeId = page.url().split('/').pop()!;
    const route = (await getRouteReq(e2eReq, routeId)).value;
    expect(route.plugins).toBeDefined();
    expect(route.plugins).toHaveProperty('multi-auth');
  });
});
