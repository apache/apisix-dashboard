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
/* eslint-disable playwright/no-conditional-in-test -- regression test stabilization */

// Regression: removing a plugin from a route form must require a confirm
// step. Silent removal causes accidental config loss.
//
// Related issue:
//   - apache/apisix-dashboard#3342 no confirmation dialog when deleting a
//     plugin

import { routesPom } from '@e2e/pom/routes';
import { randomId } from '@e2e/utils/common';
import { e2eReq } from '@e2e/utils/req';
import { test } from '@e2e/utils/test';
import { uiGoto } from '@e2e/utils/ui';
import { expect } from '@playwright/test';

import { deleteAllRoutes, putRouteReq } from '@/apis/routes';
import type { APISIXType } from '@/types/schema/apisix';

const pluginName = 'cors';
let routeId = '';

test.beforeAll(async () => {
  await deleteAllRoutes(e2eReq);
  const res = await putRouteReq(e2eReq, {
    name: randomId('reg-plugin-del'),
    uri: '/regression/plugin-delete',
    methods: ['GET'],
    upstream: {
      type: 'roundrobin',
      nodes: { 'pdc.local:80': 1 },
    },
    plugins: {
      [pluginName]: { allow_origins: '*' },
    },
  } as APISIXType['Route']);
  routeId = res.data.value.id;
});

test.afterAll(async () => {
  await deleteAllRoutes(e2eReq);
});

test('removing a plugin from a route requires confirmation', async ({
  page,
}) => {
  await uiGoto(page, '/routes/detail/$id', { id: routeId });
  await routesPom.isDetailPage(page);

  await page.getByRole('button', { name: 'Edit' }).click();

  const pluginsSection = page.getByRole('group', { name: 'Plugins' });
  const pluginChip = pluginsSection.getByTestId(`plugin-${pluginName}`);
  await expect(pluginChip).toBeVisible();

  // The remove control on the plugin chip — typically a small icon button.
  // Try the obvious candidates by role+name.
  const removeBtn = pluginChip
    .getByRole('button', { name: /(delete|remove|close)/i })
    .first();
  if (await removeBtn.isVisible().catch(() => false)) {
    await removeBtn.click();
  } else {
    // Fall back to clicking any icon inside the chip — Mantine often uses
    // ActionIcon without an accessible name.
    await pluginChip.locator('button').last().click();
  }

  // A confirmation dialog must appear before the plugin is gone.
  const dialog = page
    .getByRole('dialog')
    .filter({ hasText: /(delete|remove|confirm).*(plugin|cors)/i });
  await expect(dialog).toBeVisible({ timeout: 5000 });

  // The plugin chip must still be present until confirmation is given.
  await expect(pluginChip).toBeVisible();
});
