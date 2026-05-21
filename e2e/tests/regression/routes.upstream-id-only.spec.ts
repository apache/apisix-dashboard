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
/* eslint-disable playwright/no-wait-for-timeout -- regression test stabilization */

// Regression: routes upstream_id from form.
// Related issues:
//   - apache/apisix-dashboard#3209 cannot set Route upstream_id
//   - apache/apisix-dashboard#3147 same
//   - apache/apisix-dashboard#3217 wrong API params on /apisix/admin/routes
// User expectation: opening Add Route, filling required fields plus only
// upstream_id (no inline upstream nodes) succeeds and persists upstream_id
// to the Admin API.

import { routesPom } from '@e2e/pom/routes';
import { safeClean } from '@e2e/utils/clean';
import { randomId } from '@e2e/utils/common';
import { e2eReq } from '@e2e/utils/req';
import { test } from '@e2e/utils/test';
import { uiHasToastMsg } from '@e2e/utils/ui';
import { expect } from '@playwright/test';

import { deleteAllRoutes, getRouteReq } from '@/apis/routes';
import { deleteAllUpstreams, putUpstreamReq } from '@/apis/upstreams';
import type { APISIXType } from '@/types/schema/apisix';

const upstreamName = randomId('reg-up');
const upstreamNodes: APISIXType['UpstreamNode'][] = [
  { host: 'test-upstream-id-only.local', port: 80, weight: 100 },
];
const routeName = randomId('reg-route-up-id');
const routeUri = '/regression/upstream-id-only';

let preCreatedUpstreamId: string;

test.describe('routes upstream_id only', () => {
  // The two tests share a pre-created upstream and would race each other on
  // the global delete-all cleanup if they split across workers.
  test.describe.configure({ mode: 'serial' });

  test.beforeAll(async () => {
    await safeClean(
      () => deleteAllRoutes(e2eReq),
      () => deleteAllUpstreams(e2eReq)
    );

    const res = await putUpstreamReq(e2eReq, {
      name: upstreamName,
      nodes: upstreamNodes,
    } as APISIXType['Upstream']);
    preCreatedUpstreamId = res.data.value.id;
    expect(preCreatedUpstreamId).toBeTruthy();
  });

  test.afterAll(async () => {
    await safeClean(
      () => deleteAllRoutes(e2eReq),
      () => deleteAllUpstreams(e2eReq)
    );
  });

  test('should accept route with only upstream_id (no inline upstream nodes)', async ({
    page,
  }) => {
  await routesPom.toAdd(page);
  await routesPom.isAddPage(page);

  await test.step('fill required fields and only upstream_id', async () => {
    await page.getByLabel('Name', { exact: true }).first().fill(routeName);
    await page.getByLabel('URI', { exact: true }).fill(routeUri);
    await page.getByRole('textbox', { name: 'HTTP Methods' }).click();
    await page.getByRole('option', { name: 'GET' }).click();
    await page.keyboard.press('Escape');

    const upstreamSection = page.getByRole('group', {
      name: 'Upstream',
      exact: true,
    });
    await upstreamSection
      .locator('input[name="upstream_id"]')
      .fill(preCreatedUpstreamId);
    await expect(
      upstreamSection.locator('input[name="upstream_id"]')
    ).toHaveValue(preCreatedUpstreamId);
  });

  await test.step('submit and reach detail page', async () => {
    await routesPom.getAddBtn(page).click();
    await uiHasToastMsg(page, { hasText: 'Add Route Successfully' });
    await routesPom.isDetailPage(page);
  });

  await test.step('Admin API has upstream_id and no inline upstream', async () => {
    const routeId = page.url().split('/').pop()!;
    const resp = await getRouteReq(e2eReq, routeId);
    const route = resp.value as APISIXType['Route'];
    expect(route.upstream_id).toBe(preCreatedUpstreamId);
    expect(route.upstream).toBeUndefined();
  });
  });

  test('should accept upstream_id when editing a route that originally had inline upstream', async ({
    page,
  }) => {
  const editRouteName = randomId('reg-route-up-id-edit');
  const editRouteUri = '/regression/upstream-id-only-edit';

  await routesPom.toAdd(page);
  await routesPom.isAddPage(page);

  await test.step('create route with inline upstream first', async () => {
    await page.getByLabel('Name', { exact: true }).first().fill(editRouteName);
    await page.getByLabel('URI', { exact: true }).fill(editRouteUri);
    await page.getByRole('textbox', { name: 'HTTP Methods' }).click();
    await page.getByRole('option', { name: 'POST' }).click();
    await page.keyboard.press('Escape');

    const upstreamSection = page.getByRole('group', {
      name: 'Upstream',
      exact: true,
    });
    const addNodeBtn = page.getByRole('button', { name: 'Add a Node' });
    await addNodeBtn.click();
    const rows = upstreamSection.locator('tr.ant-table-row');
    const hostInput = rows.first().locator('input').first();
    const portInput = rows.first().locator('input').nth(1);
    const weightInput = rows.first().locator('input').nth(2);
    await hostInput.click();
    await hostInput.fill('inline.local');
    await portInput.click();
    await portInput.fill('80');
    await weightInput.click();
    await weightInput.fill('1');
    await weightInput.blur();
    await page.waitForTimeout(500);

    await routesPom.getAddBtn(page).click();
    await uiHasToastMsg(page, { hasText: 'Add Route Successfully' });
    await routesPom.isDetailPage(page);
  });

  await test.step('edit and switch to upstream_id', async () => {
    await page.getByRole('button', { name: 'Edit' }).click();

    const upstreamSection = page.getByRole('group', {
      name: 'Upstream',
      exact: true,
    });
    const upstreamIdInput = upstreamSection.locator(
      'input[name="upstream_id"]'
    );
    await upstreamIdInput.fill(preCreatedUpstreamId);
    await expect(upstreamIdInput).toHaveValue(preCreatedUpstreamId);

    await page.getByRole('button', { name: 'Save' }).click();
    await uiHasToastMsg(page, { hasText: 'success' });
  });

  await test.step('Admin API reflects upstream_id and clears inline upstream', async () => {
    const routeId = page.url().split('/').pop()!;
    const resp = await getRouteReq(e2eReq, routeId);
    const route = resp.value as APISIXType['Route'];
    expect(route.upstream_id).toBe(preCreatedUpstreamId);
    expect(route.upstream).toBeUndefined();
  });
  });
});
