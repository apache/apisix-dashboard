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

// Regression: viewing an upstream that has node weights summing to zero
// (or absent) must not produce a `Cannot read properties of undefined
// (reading 'percent')` crash.
//
// Related issue:
//   - apache/apisix-dashboard#3381 percent undefined crash
//
// Reproduction strategy: weight percentage is computed from node weights.
// When all weights are zero or missing, division-by-zero yields NaN /
// undefined and any defensive code that forgets to guard `.percent` will
// crash.

import { upstreamsPom } from '@e2e/pom/upstreams';
import { safeClean } from '@e2e/utils/clean';
import { randomId } from '@e2e/utils/common';
import { e2eReq } from '@e2e/utils/req';
import { test } from '@e2e/utils/test';
import { uiGoto } from '@e2e/utils/ui';
import { watchForCrashes } from '@e2e/utils/ui/crash';
import { expect } from '@playwright/test';

import { deleteAllRoutes } from '@/apis/routes';
import { deleteAllServices } from '@/apis/services';
import { deleteAllUpstreams, putUpstreamReq } from '@/apis/upstreams';
import type { APISIXType } from '@/types/schema/apisix';

// Clean routes + services first so deleteAllUpstreams doesn't trip on
// foreign-key-style references from leftover resources of earlier specs.
const broadClean = () =>
  safeClean(
    () => deleteAllRoutes(e2eReq),
    () => deleteAllServices(e2eReq),
    () => deleteAllUpstreams(e2eReq)
  );

test.beforeAll(broadClean);

test.afterAll(broadClean);

test('upstream with all zero weights renders detail without "percent" crash', async ({
  page,
}) => {
  const crashes = watchForCrashes(page);

  const upstream: APISIXType['Upstream'] = {
    name: randomId('reg-percent'),
    nodes: [
      { host: 'zero-w-a.local', port: 80, weight: 0 },
      { host: 'zero-w-b.local', port: 80, weight: 0 },
    ],
  } as APISIXType['Upstream'];

  const created = await putUpstreamReq(e2eReq, upstream);
  const upstreamId = created.data.value.id;

  await uiGoto(page, '/upstreams/detail/$id', { id: upstreamId });
  await upstreamsPom.isDetailPage(page);

  // Allow any async rendering / charts to settle.
  await page.waitForTimeout(1500);

  crashes.expectNoCrash('upstream detail with zero weights');

  // Nodes table should still render the hosts even if percentages can't be
  // computed.
  await expect(
    page.getByRole('cell', { name: 'zero-w-a.local' })
  ).toBeVisible();
  await expect(
    page.getByRole('cell', { name: 'zero-w-b.local' })
  ).toBeVisible();
});
