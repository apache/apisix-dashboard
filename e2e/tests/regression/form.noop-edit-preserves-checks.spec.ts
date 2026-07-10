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

// Regression for apache/apisix-dashboard#3414: opening a route/service whose
// INLINE upstream has health checks, clicking Edit, and saving WITHOUT
// changing anything silently deleted `upstream.checks`. Root cause: the
// detail pages reset the form with `produceToNestedUpstreamForm`, which set
// the `__checksEnabled` UI flag nested under `upstream.` while the checks
// section reads it from the form ROOT — the section unmounted and
// `shouldUnregister: true` dropped `checks` from the PUT body.
//
// A save that changes nothing must be a no-op.

import { routesPom } from '@e2e/pom/routes';
import { servicesPom } from '@e2e/pom/services';
import { randomId } from '@e2e/utils/common';
import { e2eReq } from '@e2e/utils/req';
import { test } from '@e2e/utils/test';
import { uiGoto } from '@e2e/utils/ui';
import { expect } from '@playwright/test';

import { deleteAllRoutes } from '@/apis/routes';
import { deleteAllServices } from '@/apis/services';
import type { APISIXType } from '@/types/schema/apisix';

const checks = {
  active: {
    type: 'http',
    http_path: '/health',
    healthy: { interval: 2, successes: 2 },
    unhealthy: { interval: 2, http_failures: 3 },
  },
};

const upstream = {
  type: 'roundrobin',
  nodes: { 'noop-edit.local:80': 1 },
  checks,
};

// The detail pages reset the form again when the mount-time background
// refetch returns — that reset is exactly what used to wipe the checks
// flags. Waiting until the resource GETs have settled makes the spec
// exercise the post-reset state instead of racing ahead of it.
const waitForDetailQueriesToSettle = async (getCount: () => number) => {
  let lastSeen = -1;
  await expect
    .poll(
      () => {
        const settled = getCount() > 0 && getCount() === lastSeen;
        lastSeen = getCount();
        return settled;
      },
      { timeout: 15000, intervals: [1000] }
    )
    .toBe(true);
};

test.beforeAll(async () => {
  await deleteAllRoutes(e2eReq);
  await deleteAllServices(e2eReq);
});

test.afterAll(async () => {
  await deleteAllRoutes(e2eReq);
  await deleteAllServices(e2eReq);
});

test('no-op edit-save preserves route inline upstream health checks', async ({
  page,
}) => {
  const name = randomId('reg-noop-route');
  const res = await e2eReq.put<{
    value: APISIXType['Route'];
  }>(`/routes/${name}`, { name, uri: `/reg-noop/${name}`, upstream });
  const id = res.data.value.id;

  // load the detail page directly (full page load): the bug only
  // reproduces on a fresh mount, not via SPA navigation from the list
  let routeGets = 0;
  page.on('response', (res) => {
    if (
      res.request().method() === 'GET' &&
      res.url().includes(`/apisix/admin/routes/${id}`)
    )
      routeGets += 1;
  });

  await uiGoto(page, '/routes/detail/$id', { id });
  await routesPom.isDetailPage(page);
  await waitForDetailQueriesToSettle(() => routeGets);
  // deterministic discriminator: after the post-refetch reset, the form
  // must still show health checks as enabled — the bug's first visible
  // symptom was this switch reading off
  await expect(page.getByTestId('checksEnabled')).toBeChecked();

  await page.getByRole('button', { name: 'Edit' }).click();
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(
    page.getByRole('alert').filter({ hasText: /success/i })
  ).toBeVisible();

  const after = await e2eReq.get<{ value: APISIXType['Route'] }>(
    `/routes/${id}`
  );
  expect(after.data.value.upstream?.checks).toBeTruthy();
  expect(after.data.value.upstream?.checks?.active?.http_path).toBe(
    '/health'
  );
});

test('no-op edit-save preserves service inline upstream health checks', async ({
  page,
}) => {
  const name = randomId('reg-noop-service');
  const res = await e2eReq.put<{
    value: APISIXType['Service'];
  }>(`/services/${name}`, { name, upstream });
  const id = res.data.value.id;

  // load the detail page directly (full page load): the bug only
  // reproduces on a fresh mount, not via SPA navigation from the list
  let serviceGets = 0;
  page.on('response', (res) => {
    if (
      res.request().method() === 'GET' &&
      res.url().includes(`/apisix/admin/services/${id}`)
    )
      serviceGets += 1;
  });

  await uiGoto(page, '/services/detail/$id', { id });
  await servicesPom.isDetailPage(page);
  await waitForDetailQueriesToSettle(() => serviceGets);
  // deterministic discriminator (see the route variant above)
  await expect(page.getByTestId('checksEnabled')).toBeChecked();

  await page.getByRole('button', { name: 'Edit' }).click();
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(
    page.getByRole('alert').filter({ hasText: /success/i })
  ).toBeVisible();

  const after = await e2eReq.get<{ value: APISIXType['Service'] }>(
    `/services/${id}`
  );
  expect(after.data.value.upstream?.checks).toBeTruthy();
  expect(after.data.value.upstream?.checks?.active?.http_path).toBe(
    '/health'
  );
});
