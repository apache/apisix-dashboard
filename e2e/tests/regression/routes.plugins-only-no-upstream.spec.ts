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

// Regression: a plugins-only route (no upstream at all) must be creatable
// and editable from the Dashboard.
// Related issue:
//   - apache/apisix-dashboard#3395 bind the route to the public-api plugin,
//     upstream is a required option in the dashboard, but it is not
//     actually needed
// The Admin API accepts a route with only `uri` + `plugins.public-api`
// (the official public-api example exposes /apisix/prometheus/metrics that
// way). The Dashboard's Route form always renders the inline upstream
// section, and its Select controls register defaults (scheme / type /
// hash_on / pass_host) the moment they mount — so an untouched upstream
// section must NOT turn into a half-built `upstream` object in the request
// body, which the Admin API rejects (upstream needs nodes or discovery).

import { routesPom } from '@e2e/pom/routes';
import { randomId } from '@e2e/utils/common';
import { e2eReq } from '@e2e/utils/req';
import { test } from '@e2e/utils/test';
import {
  uiFillMonacoEditor,
  uiGetMonacoEditor,
  uiGoto,
  uiHasToastMsg,
} from '@e2e/utils/ui';
import { expect, type Page, type Request } from '@playwright/test';

import { deleteAllRoutes, getRouteReq, putRouteReq } from '@/apis/routes';
import { API_PREFIX, API_ROUTES } from '@/config/constant';
import type { APISIXType } from '@/types/schema/apisix';

const pluginName = 'public-api';

const captureRouteWrites = (page: Page) => {
  const bodies: Record<string, unknown>[] = [];
  const isRouteWrite = (req: Request) =>
    ['POST', 'PUT', 'PATCH'].includes(req.method()) &&
    req.url().includes(`${API_PREFIX}${API_ROUTES}`);
  page.on('request', (req) => {
    if (isRouteWrite(req)) {
      bodies.push(req.postDataJSON() as Record<string, unknown>);
    }
  });
  return bodies;
};

test.beforeAll(async () => {
  await deleteAllRoutes(e2eReq);
});

test.afterAll(async () => {
  await deleteAllRoutes(e2eReq);
});

test('add page: a route with only uri + public-api and no upstream is accepted', async ({
  page,
}) => {
  const routeName = randomId('reg-plugins-only');
  const routeUri = `/regression/plugins-only/${routeName}`;
  const bodies = captureRouteWrites(page);

  await routesPom.toAdd(page);
  await routesPom.isAddPage(page);

  await test.step('fill name, uri and the public-api plugin only', async () => {
    await page.getByLabel('Name', { exact: true }).first().fill(routeName);
    await page.getByLabel('URI', { exact: true }).fill(routeUri);

    await page.getByRole('button', { name: 'Select Plugins' }).click();
    const selectPluginsDialog = page.getByRole('dialog', {
      name: 'Select Plugins',
    });
    await selectPluginsDialog.getByPlaceholder('Search').fill(pluginName);
    await selectPluginsDialog
      .getByTestId(`plugin-${pluginName}`)
      .getByRole('button', { name: 'Add' })
      .click();

    const addPluginDialog = page.getByRole('dialog', { name: 'Add Plugin' });
    const editor = await uiGetMonacoEditor(page, addPluginDialog);
    await uiFillMonacoEditor(page, editor, '{}');
    await addPluginDialog.getByRole('button', { name: 'Add' }).click();
    await expect(addPluginDialog).toBeHidden();
    await expect(
      page
        .getByRole('group', { name: 'Plugins' })
        .getByTestId(`plugin-${pluginName}`)
    ).toBeVisible();
  });

  await test.step('submit succeeds and lands on the detail page', async () => {
    await routesPom.getAddBtn(page).click();
    await uiHasToastMsg(page, { hasText: 'Add Route Successfully' });
    await routesPom.isDetailPage(page);
  });

  await test.step('request body carried no upstream object', async () => {
    expect(bodies).toHaveLength(1);
    expect(bodies[0]).not.toHaveProperty('upstream');
    expect(bodies[0]).not.toHaveProperty('upstream_id');
    expect(bodies[0]).toHaveProperty(['plugins', pluginName]);
  });

  await test.step('Admin API stored a plugins-only route', async () => {
    const routeId = page.url().split('/').pop()!;
    const route = (await getRouteReq(e2eReq, routeId))
      .value as APISIXType['Route'];
    expect(route.uri).toBe(routeUri);
    expect(route.plugins).toHaveProperty(pluginName);
    expect(route.upstream).toBeUndefined();
    expect(route.upstream_id).toBeUndefined();
    expect(route.service_id).toBeUndefined();
  });
});

test('edit page: a no-op save keeps an API-created plugins-only route upstream-free', async ({
  page,
}) => {
  const routeName = randomId('reg-plugins-only-edit');
  const routeUri = `/regression/plugins-only-edit/${routeName}`;
  const res = await putRouteReq(e2eReq, {
    id: routeName,
    name: routeName,
    uri: routeUri,
    plugins: { [pluginName]: {} },
  } as APISIXType['Route']);
  const routeId = res.data.value.id;
  const bodies = captureRouteWrites(page);

  await uiGoto(page, '/routes/detail/$id', { id: routeId });
  await routesPom.isDetailPage(page);

  await test.step('enter edit mode and save without changes', async () => {
    await page.getByRole('button', { name: 'Edit' }).click();
    await expect(
      page.getByLabel('Name', { exact: true }).first()
    ).toBeEnabled();
    await page.getByRole('button', { name: 'Save' }).click();
    await uiHasToastMsg(page, { hasText: 'success' });
    await routesPom.isDetailPage(page);
  });

  await test.step('request body carried no upstream object', async () => {
    expect(bodies).toHaveLength(1);
    expect(bodies[0]).not.toHaveProperty('upstream');
    expect(bodies[0]).toHaveProperty(['plugins', pluginName]);
  });

  await test.step('Admin API route is still plugins-only', async () => {
    const route = (await getRouteReq(e2eReq, routeId))
      .value as APISIXType['Route'];
    expect(route.uri).toBe(routeUri);
    expect(route.plugins).toHaveProperty(pluginName);
    expect(route.upstream).toBeUndefined();
  });
});
