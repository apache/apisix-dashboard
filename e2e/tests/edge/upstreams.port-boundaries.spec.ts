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

// Edge: upstream node port boundaries. APISIX accepts 1..65535 (TCP/UDP).
// Out-of-range and non-positive ports must be rejected with clear feedback.

import { upstreamsPom } from '@e2e/pom/upstreams';
import { safeClean } from '@e2e/utils/clean';
import { randomId } from '@e2e/utils/common';
import { e2eReq } from '@e2e/utils/req';
import { test } from '@e2e/utils/test';
import { uiHasToastMsg } from '@e2e/utils/ui';
import { expect } from '@playwright/test';

import { deleteAllRoutes } from '@/apis/routes';
import { deleteAllServices } from '@/apis/services';
import { deleteAllUpstreams, getUpstreamReq } from '@/apis/upstreams';

const broadClean = () =>
  safeClean(
    () => deleteAllRoutes(e2eReq),
    () => deleteAllServices(e2eReq),
    () => deleteAllUpstreams(e2eReq)
  );

test.beforeAll(broadClean);

test.afterAll(broadClean);

const fillSingleNode = async (
  page: import('@playwright/test').Page,
  name: string,
  host: string,
  port: string
) => {
  await upstreamsPom.toAdd(page);
  await upstreamsPom.isAddPage(page);
  await page.getByLabel('Name', { exact: true }).fill(name);

  const nodesSection = page.getByRole('group', { name: 'Nodes' });
  await page.getByRole('button', { name: 'Add a Node' }).click();
  const rows = nodesSection.locator('tr.ant-table-row');
  const hostInput = rows.first().locator('input').first();
  const portInput = rows.first().locator('input').nth(1);
  const weightInput = rows.first().locator('input').nth(2);

  await hostInput.click();
  await hostInput.fill(host);
  await portInput.click();
  await portInput.fill(port);
  // Weight must be a positive integer for APISIX to accept the upstream.
  await weightInput.click();
  await weightInput.fill('1');
  await weightInput.blur();
  // Allow useClickOutside / form-state debounce to settle before submit.
  await page.waitForTimeout(500);
};

test('port 65535 is accepted', async ({ page }) => {
  const name = randomId('edge-port-max');
  await fillSingleNode(page, name, 'max-port.local', '65535');

  await upstreamsPom.getAddBtn(page).click();
  await uiHasToastMsg(page, { hasText: 'Add Upstream Successfully' });
  await upstreamsPom.isDetailPage(page);

  const upstreamId = page.url().split('/').pop()!;
  const up = (await getUpstreamReq(e2eReq, upstreamId)).value;
  expect(up.nodes?.[0]?.port).toBe(65535);
});

test('port 0 is rejected', async ({ page }) => {
  const name = randomId('edge-port-zero');
  await fillSingleNode(page, name, 'zero-port.local', '0');
  await upstreamsPom.getAddBtn(page).click();

  const success = page
    .getByRole('alert')
    .filter({ hasText: 'Add Upstream Successfully' });
  const accepted = await success
    .first()
    .waitFor({ state: 'visible', timeout: 5000 })
    .then(() => true)
    .catch(() => false);
  expect(accepted, 'port 0 must NOT be silently accepted').toBe(false);
});

test('port 65536 (out of range) is rejected', async ({ page }) => {
  const name = randomId('edge-port-overflow');
  await fillSingleNode(page, name, 'over-port.local', '65536');
  await upstreamsPom.getAddBtn(page).click();

  const success = page
    .getByRole('alert')
    .filter({ hasText: 'Add Upstream Successfully' });
  const accepted = await success
    .first()
    .waitFor({ state: 'visible', timeout: 5000 })
    .then(() => true)
    .catch(() => false);
  expect(accepted, 'port 65536 must NOT be silently accepted').toBe(false);
});
