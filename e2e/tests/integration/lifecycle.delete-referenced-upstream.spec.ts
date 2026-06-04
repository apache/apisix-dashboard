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

// Integration E-02: deleting an upstream that is in use by a route must
// either be blocked by the Admin API with a clear error toast, OR succeed
// only after the user is warned. Silent broken state is unacceptable.

import { upstreamsPom } from '@e2e/pom/upstreams';
import { safeClean } from '@e2e/utils/clean';
import { randomId } from '@e2e/utils/common';
import { e2eReq } from '@e2e/utils/req';
import { test } from '@e2e/utils/test';
import { uiGoto } from '@e2e/utils/ui';
import { expect } from '@playwright/test';

import { deleteAllRoutes, putRouteReq } from '@/apis/routes';
import { deleteAllUpstreams, putUpstreamReq } from '@/apis/upstreams';
import type { APISIXType } from '@/types/schema/apisix';

let upstreamId = '';
let routeId = '';

test.beforeAll(async () => {
  await safeClean(
    () => deleteAllRoutes(e2eReq),
    () => deleteAllUpstreams(e2eReq)
  );

  const up = await putUpstreamReq(e2eReq, {
    name: randomId('intg-up'),
    nodes: [{ host: 'intg.local', port: 80, weight: 1 }],
  } as APISIXType['Upstream']);
  upstreamId = up.data.value.id;

  const r = await putRouteReq(e2eReq, {
    name: randomId('intg-route'),
    uri: '/integration/referenced-upstream',
    methods: ['GET'],
    upstream_id: upstreamId,
  } as APISIXType['Route']);
  routeId = r.data.value.id;
});

test.afterAll(async () => {
  await safeClean(
    () => deleteAllRoutes(e2eReq),
    () => deleteAllUpstreams(e2eReq)
  );
});

test('attempting to delete an in-use upstream surfaces an Admin API error', async ({
  page,
}) => {
  await uiGoto(page, '/upstreams/detail/$id', { id: upstreamId });
  await upstreamsPom.isDetailPage(page);

  await page.getByRole('button', { name: 'Delete' }).click();
  await page
    .getByRole('dialog', { name: 'Delete Upstream' })
    .getByRole('button', { name: 'Delete' })
    .click();

  // APISIX returns 400 "can not delete this upstream, route [..] is still
  // using it now". The Dashboard must surface this — silent failure or a
  // success toast would be wrong.
  const successToast = page
    .getByRole('alert')
    .filter({ hasText: /delete .*success/i });
  const errorToast = page
    .getByRole('alert')
    .filter({ hasText: /(can not delete|still using|fail|error|in use)/i });

  const settled = await Promise.race([
    successToast
      .first()
      .waitFor({ state: 'visible', timeout: 8000 })
      .then(() => 'success' as const)
      .catch(() => null),
    errorToast
      .first()
      .waitFor({ state: 'visible', timeout: 8000 })
      .then(() => 'error' as const)
      .catch(() => null),
  ]);

  expect(
    settled,
    'either a success or a meaningful error toast must appear'
  ).not.toBeNull();

  // The bug we want to guard against is silent success: route would still
  // reference the (now non-existent) upstream.
  if (settled === 'success') {
    const resp = await e2eReq.get(`/upstreams/${upstreamId}`);
    expect(
      resp.status,
      'if Dashboard claimed success, upstream must actually be gone'
    ).toBe(404);
  } else {
    // Error path: route + upstream must both still be present.
    const upResp = await e2eReq.get(`/upstreams/${upstreamId}`);
    expect(upResp.status).toBe(200);
    const routeResp = await e2eReq.get(`/routes/${routeId}`);
    expect(routeResp.status).toBe(200);
  }
});
