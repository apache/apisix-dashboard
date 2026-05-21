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

// Edge: long route names. The Admin API has its own length limits — the
// dashboard must surface those clearly. Two boundary cases:
//   1. 100 chars (typical APISIX max) → must accept
//   2. 1000 chars (way over) → must reject with a visible error

import { routesPom } from '@e2e/pom/routes';
import { e2eReq } from '@e2e/utils/req';
import { test } from '@e2e/utils/test';
import { uiHasToastMsg } from '@e2e/utils/ui';
import { uiFillUpstreamRequiredFields } from '@e2e/utils/ui/upstreams';
import { expect } from '@playwright/test';

import { deleteAllRoutes, getRouteReq } from '@/apis/routes';
import type { APISIXType } from '@/types/schema/apisix';

const nodes: APISIXType['UpstreamNode'][] = [
  { host: 'long-a.local', port: 80, weight: 100 },
  { host: 'long-b.local', port: 80, weight: 100 },
];

test.beforeAll(async () => {
  await deleteAllRoutes(e2eReq);
});

test.afterAll(async () => {
  await deleteAllRoutes(e2eReq);
});

test('100-char route name is accepted', async ({ page }) => {
  const longName = 'a'.repeat(100);
  await routesPom.toAdd(page);
  await routesPom.isAddPage(page);

  await page.getByLabel('Name', { exact: true }).first().fill(longName);
  await page.getByLabel('URI', { exact: true }).fill('/edge/long/100');
  await page.getByRole('textbox', { name: 'HTTP Methods' }).click();
  await page.getByRole('option', { name: 'GET' }).click();
  await page.keyboard.press('Escape');

  const upstreamSection = page.getByRole('group', {
    name: 'Upstream',
    exact: true,
  });
  await uiFillUpstreamRequiredFields(
    upstreamSection,
    { nodes, name: 'edge-long-up-100', desc: 'edge' }
  );

  await routesPom.getAddBtn(page).click();
  await uiHasToastMsg(page, { hasText: 'Add Route Successfully' });
  await routesPom.isDetailPage(page);

  const routeId = page.url().split('/').pop()!;
  const route = (await getRouteReq(e2eReq, routeId)).value;
  expect(route.name).toBe(longName);
});

test('1000-char route name is rejected with visible feedback', async ({
  page,
}) => {
  const tooLong = 'b'.repeat(1000);
  await routesPom.toAdd(page);
  await routesPom.isAddPage(page);

  await page.getByLabel('Name', { exact: true }).first().fill(tooLong);
  await page.getByLabel('URI', { exact: true }).fill('/edge/long/1000');
  await page.getByRole('textbox', { name: 'HTTP Methods' }).click();
  await page.getByRole('option', { name: 'GET' }).click();
  await page.keyboard.press('Escape');

  const upstreamSection = page.getByRole('group', {
    name: 'Upstream',
    exact: true,
  });
  await uiFillUpstreamRequiredFields(
    upstreamSection,
    { nodes, name: 'edge-long-up-1000', desc: 'edge' }
  );

  await routesPom.getAddBtn(page).click();

  // Either the form's inline validation prevents submit OR the API rejects
  // and a toast surfaces the error. We require at least one of:
  //   - we never reach the detail page
  //   - an alert toast appears
  const successToast = page
    .getByRole('alert')
    .filter({ hasText: 'Add Route Successfully' });
  const errorToast = page
    .getByRole('alert')
    .filter({ hasText: /(fail|error|invalid|too long|exceed|length)/i });

  const result = await Promise.race([
    successToast.first().waitFor({ state: 'visible', timeout: 10000 })
      .then(() => 'success' as const)
      .catch(() => 'no-success' as const),
    errorToast.first().waitFor({ state: 'visible', timeout: 10000 })
      .then(() => 'error' as const)
      .catch(() => 'no-error' as const),
  ]);

  expect(result, 'a 1000-char name must NOT silently succeed').not.toBe(
    'success'
  );
});
