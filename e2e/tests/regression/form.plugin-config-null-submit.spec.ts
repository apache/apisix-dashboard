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

// Regression for a data-integrity item of apache/apisix-dashboard#3417:
// `rmDoubleUnderscoreKeys` recursed into null values (`typeof null ===
// 'object'`) and threw at `Object.keys(null)`. It runs FIRST in
// pipeProduce — before the null-cleaner — so a null anywhere in the
// submit draft crashed the submit of every pipeProduce resource: no PUT
// was sent and (since the toast layer lives in the axios interceptor,
// which never ran) there was zero user feedback. The Admin API accepts
// nulls inside plugin configs, so such a resource could not be edited
// from the dashboard at all.

import { routesPom } from '@e2e/pom/routes';
import { randomId } from '@e2e/utils/common';
import { e2eReq } from '@e2e/utils/req';
import { test } from '@e2e/utils/test';
import { uiGoto } from '@e2e/utils/ui';
import { expect } from '@playwright/test';

import { deleteAllRoutes } from '@/apis/routes';
import type { APISIXType } from '@/types/schema/apisix';

test.beforeAll(async () => {
  await deleteAllRoutes(e2eReq);
});

test.afterAll(async () => {
  await deleteAllRoutes(e2eReq);
});

test('edit-save succeeds for a route whose plugin config contains null', async ({
  page,
}) => {
  const name = randomId('reg-null-plugin');
  const res = await e2eReq.put<{ value: APISIXType['Route'] }>(
    `/routes/${name}`,
    {
      name,
      uri: `/reg-null-plugin/${name}`,
      plugins: { 'key-auth': { custom_note: null } },
      upstream: { type: 'roundrobin', nodes: { 'null-plugin.local:80': 1 } },
    }
  );
  const id = res.data.value.id;

  let putCount = 0;
  page.on('request', (req) => {
    if (
      req.method() === 'PUT' &&
      req.url().includes(`/apisix/admin/routes/${id}`)
    )
      putCount += 1;
  });

  await uiGoto(page, '/routes/detail/$id', { id });
  await routesPom.isDetailPage(page);

  await page.getByRole('button', { name: 'Edit' }).click();
  await page.getByRole('button', { name: 'Save' }).click();

  // unfixed, the submit pipeline throws before the request is built:
  // no PUT fires and no feedback of any kind appears
  await expect(
    page.getByRole('alert').filter({ hasText: /success/i })
  ).toBeVisible();
  expect(putCount).toBeGreaterThan(0);

  // the plugin entry must survive the round-trip; the null member's fate
  // belongs to the existing null-cleaner/empty-plugin-restore semantics
  const after = await e2eReq.get<{ value: APISIXType['Route'] }>(
    `/routes/${id}`
  );
  expect(after.data.value.plugins?.['key-auth']).toBeTruthy();
});
