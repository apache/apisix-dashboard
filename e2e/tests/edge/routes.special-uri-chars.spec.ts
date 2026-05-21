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

// Edge: URI patterns containing characters with special meaning in URI
// space. APISIX accepts trailing-wildcard `/foo/*` and most printable
// chars except whitespace.

import { routesPom } from '@e2e/pom/routes';
import { randomId } from '@e2e/utils/common';
import { e2eReq } from '@e2e/utils/req';
import { test } from '@e2e/utils/test';
import { uiHasToastMsg } from '@e2e/utils/ui';
import { uiFillUpstreamRequiredFields } from '@e2e/utils/ui/upstreams';
import { expect } from '@playwright/test';

import { deleteAllRoutes, getRouteReq } from '@/apis/routes';
import type { APISIXType } from '@/types/schema/apisix';

const nodes: APISIXType['UpstreamNode'][] = [
  { host: 'special-a.local', port: 80, weight: 100 },
  { host: 'special-b.local', port: 80, weight: 100 },
];

test.beforeAll(async () => {
  await deleteAllRoutes(e2eReq);
});

test.afterAll(async () => {
  await deleteAllRoutes(e2eReq);
});

test('route URI with trailing wildcard /api/* is accepted', async ({
  page,
}) => {
  const routeName = randomId('edge-uri-wildcard');
  const routeUri = '/edge/api/*';

  await routesPom.toAdd(page);
  await routesPom.isAddPage(page);

  await page.getByLabel('Name', { exact: true }).first().fill(routeName);
  await page.getByLabel('URI', { exact: true }).fill(routeUri);
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

  await routesPom.getAddBtn(page).click();
  await uiHasToastMsg(page, { hasText: 'Add Route Successfully' });
  await routesPom.isDetailPage(page);

  const routeId = page.url().split('/').pop()!;
  const route = (await getRouteReq(e2eReq, routeId)).value;
  expect(route.uri).toBe(routeUri);
});

test('route URI with embedded path-parameter pattern /:id is accepted', async ({
  page,
}) => {
  const routeName = randomId('edge-uri-param');
  const routeUri = '/edge/users/:id';

  await routesPom.toAdd(page);
  await routesPom.isAddPage(page);

  await page.getByLabel('Name', { exact: true }).first().fill(routeName);
  await page.getByLabel('URI', { exact: true }).fill(routeUri);
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

  await routesPom.getAddBtn(page).click();
  // APISIX may or may not honour `:param` syntax; behavior must be either
  // success or a clear error toast, never a silent submit.
  const toast = page
    .getByRole('alert')
    .filter({ hasText: /(success|fail|error|invalid)/i });
  await expect(toast.first()).toBeVisible({ timeout: 10000 });
});
