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

// Edge: a multi-KB plugin config must round-trip through Monaco + Admin API
// without truncation. We use serverless-pre-function which accepts an
// arbitrary phase / functions structure, allowing us to compose a payload
// that is provably ~10KB on the wire.

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
  { host: 'large-cfg-a.local', port: 80, weight: 100 },
  { host: 'large-cfg-b.local', port: 80, weight: 100 },
];

test.beforeAll(async () => {
  await deleteAllRoutes(e2eReq);
});

test.afterAll(async () => {
  await deleteAllRoutes(e2eReq);
});

test('10KB plugin config survives a UI round trip', async ({ page }) => {
  // Build a CORS allow_origins value padded to ~10KB. CORS plugin tolerates
  // any string for allow_origins, so the test is purely about payload size,
  // not semantics.
  const padding = 'x'.repeat(10240);
  const pluginConfig = { allow_origins: `https://${padding}.local` };

  await routesPom.toAdd(page);
  await routesPom.isAddPage(page);

  await page
    .getByLabel('Name', { exact: true })
    .first()
    .fill(randomId('edge-large-cfg'));
  await page.getByLabel('URI', { exact: true }).fill('/edge/large-cfg');
  await page.getByRole('textbox', { name: 'HTTP Methods' }).click();
  await page.getByRole('option', { name: 'GET' }).click();
  await page.keyboard.press('Escape');

  const upstreamSection = page.getByRole('group', {
    name: 'Upstream',
    exact: true,
  });
  await uiFillUpstreamRequiredFields(
    upstreamSection,
    { nodes, name: randomId('edge-up'), desc: 'edge' }
  );

  await page.getByRole('button', { name: 'Select Plugins' }).click();
  const selectDialog = page.getByRole('dialog', { name: 'Select Plugins' });
  await selectDialog.getByPlaceholder('Search').fill('cors');
  await selectDialog
    .getByTestId('plugin-cors')
    .getByRole('button', { name: 'Add' })
    .click();

  const addPluginDialog = page.getByRole('dialog', { name: 'Add Plugin' });
  const editor = await uiGetMonacoEditor(page, addPluginDialog, false);
  await uiFillMonacoEditor(page, editor, JSON.stringify(pluginConfig));
  await addPluginDialog
    .getByRole('button', { name: 'Add' })
    .click();
  await expect(addPluginDialog).toBeHidden({ timeout: 10000 });

  await routesPom.getAddBtn(page).click();
  await uiHasToastMsg(page, { hasText: 'Add Route Successfully' });
  await routesPom.isDetailPage(page);

  const routeId = page.url().split('/').pop()!;
  const route = (await getRouteReq(e2eReq, routeId)).value;
  expect(route.plugins).toBeDefined();
  expect(route.plugins!.cors).toBeDefined();
  expect(
    (route.plugins!.cors as { allow_origins: string }).allow_origins
  ).toBe(pluginConfig.allow_origins);
});
