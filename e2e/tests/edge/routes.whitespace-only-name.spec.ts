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
/* eslint-disable playwright/no-conditional-in-test, playwright/no-conditional-expect -- regression test stabilization */

// Edge: a whitespace-only `name` value must NOT be silently accepted as a
// valid name. Either the field validation rejects it, or the API rejects
// and a toast surfaces the error.

import { routesPom } from '@e2e/pom/routes';
import { e2eReq } from '@e2e/utils/req';
import { test } from '@e2e/utils/test';
import { uiFillUpstreamRequiredFields } from '@e2e/utils/ui/upstreams';
import { expect } from '@playwright/test';

import { deleteAllRoutes } from '@/apis/routes';
import type { APISIXType } from '@/types/schema/apisix';

const nodes: APISIXType['UpstreamNode'][] = [
  { host: 'ws-a.local', port: 80, weight: 100 },
  { host: 'ws-b.local', port: 80, weight: 100 },
];

test.beforeAll(async () => {
  await deleteAllRoutes(e2eReq);
});

test.afterAll(async () => {
  await deleteAllRoutes(e2eReq);
});

test('whitespace-only route name is rejected', async ({ page }) => {
  await routesPom.toAdd(page);
  await routesPom.isAddPage(page);

  await page.getByLabel('Name', { exact: true }).first().fill('     ');
  await page.getByLabel('URI', { exact: true }).fill('/edge/whitespace');
  await page.getByRole('textbox', { name: 'HTTP Methods' }).click();
  await page.getByRole('option', { name: 'GET' }).click();
  await page.keyboard.press('Escape');

  const upstreamSection = page.getByRole('group', {
    name: 'Upstream',
    exact: true,
  });
  await uiFillUpstreamRequiredFields(
    upstreamSection,
    { nodes, name: 'edge-ws-up', desc: 'edge' }
  );

  await routesPom.getAddBtn(page).click();

  const successToast = page
    .getByRole('alert')
    .filter({ hasText: 'Add Route Successfully' });
  const stayOnAddPage = page
    .waitForURL((u) => u.pathname.endsWith('/routes/add'), { timeout: 8000 })
    .then(() => true)
    .catch(() => false);

  const accepted = await successToast
    .first()
    .waitFor({ state: 'visible', timeout: 8000 })
    .then(() => true)
    .catch(() => false);

  expect(accepted, 'whitespace-only name must NOT silently succeed').toBe(
    false
  );

  // Either we stay on Add page (frontend validation) or we have an error
  // toast (backend rejection). At least one must be true.
  const stillOnAdd = await stayOnAddPage;
  if (!stillOnAdd) {
    const errorToast = page
      .getByRole('alert')
      .filter({ hasText: /(fail|error|invalid)/i });
    await expect(errorToast.first()).toBeVisible({ timeout: 5000 });
  }
});
