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

// Regression: route plugin with empty {} config must not be silently dropped.
// Related issue:
//   - apache/apisix-dashboard#3269 plugin with empty JSON config dropped on
//     Route add/edit
// User expectation: a plugin attached to a route with config={} (which is
// valid for plugins like `cors` that have all-optional fields) survives a
// no-op edit/save round trip in the Dashboard UI.
//
// To reproduce robustly we seed the route via the Admin API (the bug
// description says the dashboard ALREADY accepts the create payload from
// other tools), open the detail page, enter edit mode, and save without
// changes. The Admin API must still contain the plugin afterwards.

import { routesPom } from '@e2e/pom/routes';
import { randomId } from '@e2e/utils/common';
import { e2eReq } from '@e2e/utils/req';
import { test } from '@e2e/utils/test';
import { uiGoto, uiHasToastMsg } from '@e2e/utils/ui';
import { expect } from '@playwright/test';

import { deleteAllRoutes, getRouteReq, putRouteReq } from '@/apis/routes';
import type { APISIXType } from '@/types/schema/apisix';

const routeName = randomId('reg-empty-plugin');
const routeUri = '/regression/empty-plugin';
const pluginName = 'cors';
const seedRoute: APISIXType['Route'] = {
  name: routeName,
  uri: routeUri,
  methods: ['GET'],
  upstream: {
    type: 'roundrobin',
    nodes: { 'empty-plugin.local:80': 1 },
  },
  plugins: {
    [pluginName]: {},
  },
} as APISIXType['Route'];

let seededRouteId: string;

test.beforeAll(async () => {
  await deleteAllRoutes(e2eReq);
  const res = await putRouteReq(e2eReq, seedRoute);
  seededRouteId = res.data.value.id;
  expect(seededRouteId).toBeTruthy();
  // Sanity check: Admin API initially contains the plugin entry.
  const before = await getRouteReq(e2eReq, seededRouteId);
  expect(before.value.plugins).toHaveProperty(pluginName);
});

test.afterAll(async () => {
  await deleteAllRoutes(e2eReq);
});

test('Dashboard must preserve plugin entry with {} config on no-op save', async ({
  page,
}) => {
  await test.step('open route detail page in UI', async () => {
    await uiGoto(page, '/routes/detail/$id', { id: seededRouteId });
    await routesPom.isDetailPage(page);
  });

  await test.step('enter edit mode and save without changes', async () => {
    await page.getByRole('button', { name: 'Edit' }).click();

    // Confirm we are in edit mode (Name becomes enabled).
    const nameField = page.getByLabel('Name', { exact: true }).first();
    await expect(nameField).toBeEnabled();

    await page.getByRole('button', { name: 'Save' }).click();
    await uiHasToastMsg(page, { hasText: 'success' });
    await routesPom.isDetailPage(page);
  });

  await test.step('Admin API still contains the empty-config plugin', async () => {
    const after = await getRouteReq(e2eReq, seededRouteId);
    expect(after.value.plugins).toBeDefined();
    expect(after.value.plugins).toHaveProperty(pluginName);
  });
});
