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

// Regression for the 401 interceptor behavior (apache/apisix-dashboard#3415):
// the axios interceptor used to convert a 401 into a *resolved* response with
// fabricated `{ data: {} }`. That made a 401'd DELETE show the green
// "Delete ... Successfully" toast (and fed `{}` into onSuccess handlers,
// crashing add/detail pages). The interceptor must open the Settings modal
// AND reject, so callers take their normal error path.

import { routesPom } from '@e2e/pom/routes';
import { randomId } from '@e2e/utils/common';
import { e2eReq } from '@e2e/utils/req';
import { test } from '@e2e/utils/test';
import { expect } from '@playwright/test';

import { deleteAllRoutes, putRouteReq } from '@/apis/routes';
import type { APISIXType } from '@/types/schema/apisix';

test.beforeAll(async () => {
  await deleteAllRoutes(e2eReq);
});

test.afterAll(async () => {
  await deleteAllRoutes(e2eReq);
});

test('a 401 response must not produce a success toast', async ({ page }) => {
  const name = randomId('reg-401');
  await putRouteReq(e2eReq, {
    name,
    uri: `/regression/401/${name}`,
    upstream: {
      type: 'roundrobin',
      nodes: { 'reg-401.local:80': 1 },
    },
  } as APISIXType['Route']);

  await routesPom.toIndex(page);
  await routesPom.isIndexPage(page);

  const row = page.getByRole('row', { name });
  await expect(row).toBeVisible();

  // Force the DELETE to come back as a 401, the way an expired/rotated
  // admin key would.
  await page.route('**/apisix/admin/routes/**', async (route) => {
    if (route.request().method() === 'DELETE') {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'failed to check token' }),
      });
    } else {
      await route.fallback();
    }
  });

  await row.getByRole('button', { name: 'Delete' }).click();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Delete' })
    .click();

  // The settings modal must open so the user can fix the key ...
  await expect(page.getByRole('dialog', { name: 'Settings' })).toBeVisible();

  // ... and no success toast may appear; the row must survive.
  const successToast = page
    .getByRole('alert')
    .filter({ hasText: /successfully/i });
  await expect(successToast).toHaveCount(0);
  await expect(row).toBeVisible();
});
