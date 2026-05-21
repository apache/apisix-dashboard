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

// Positive regression: the global Axios interceptor in src/config/req.ts
// shows a red Mantine notification whenever a mutation returns a 4xx/5xx
// with a response body. This test pins that contract so a future refactor
// of the interceptor doesn't silently break user feedback on failures.
//
// Related context:
//   - apache/apisix-dashboard#3356 (CLOSED) — previously claimed mutations
//     failed silently. The interceptor was already in place; this test
//     guards it.

import { routesPom } from '@e2e/pom/routes';
import { randomId } from '@e2e/utils/common';
import { e2eReq } from '@e2e/utils/req';
import { test } from '@e2e/utils/test';
import { uiFillUpstreamRequiredFields } from '@e2e/utils/ui/upstreams';
import { expect } from '@playwright/test';

import { deleteAllRoutes } from '@/apis/routes';
import type { APISIXType } from '@/types/schema/apisix';

const nodes: APISIXType['UpstreamNode'][] = [
  { host: 'mut-fail.local', port: 80, weight: 100 },
  { host: 'mut-fail-2.local', port: 80, weight: 100 },
];

test.beforeAll(async () => {
  await deleteAllRoutes(e2eReq);
});

test.afterAll(async () => {
  await deleteAllRoutes(e2eReq);
});

test('route create surface a visible error when the Admin API replies 500', async ({
  page,
}) => {
  // Intercept the POST that the route Add form issues to /apisix/admin/routes
  // and force a 500 with a server-style error_msg payload.
  await page.route('**/apisix/admin/routes', async (route) => {
    const req = route.request();
    if (req.method() === 'POST' || req.method() === 'PUT') {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error_msg: 'forced 500 for regression' }),
      });
    } else {
      await route.fallback();
    }
  });

  await routesPom.toAdd(page);
  await routesPom.isAddPage(page);

  await page
    .getByLabel('Name', { exact: true })
    .first()
    .fill(randomId('reg-mut-fail'));
  await page.getByLabel('URI', { exact: true }).fill('/regression/mut-fail');
  await page.getByRole('textbox', { name: 'HTTP Methods' }).click();
  await page.getByRole('option', { name: 'GET' }).click();
  await page.keyboard.press('Escape');

  const upstreamSection = page.getByRole('group', {
    name: 'Upstream',
    exact: true,
  });
  await uiFillUpstreamRequiredFields(
    upstreamSection,
    { nodes, name: randomId('reg-up'), desc: 'reg' }
  );

  await routesPom.getAddBtn(page).click();

  // The toast can contain the server-supplied message OR a generic failure
  // string — either way it must appear as an alert role.
  const errorToast = page
    .getByRole('alert')
    .filter({ hasText: /forced 500|fail|error/i });
  await expect(errorToast.first()).toBeVisible({ timeout: 10000 });
});
