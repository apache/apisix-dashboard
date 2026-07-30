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
import { routesPom } from '@e2e/pom/routes';
import { safeClean } from '@e2e/utils/clean';
import { e2eReq } from '@e2e/utils/req';
import { test } from '@e2e/utils/test';
import { uiGoto } from '@e2e/utils/ui';
import { expect } from '@playwright/test';

import { deleteAllConsumers } from '@/apis/consumers';
import { deleteAllRoutes, putRouteReq } from '@/apis/routes';
import { deleteAllServices, putServiceReq } from '@/apis/services';
import type { APISIXType } from '@/types/schema/apisix';

// #3453 item 1. Opening a detail URL for an id that is not there used to be
// a dead end: the 404 was retried three times (~7s), then the ROOT error
// component replaced the whole app shell with axios's "Request failed with
// status code 404", plus a red toast carrying etcd's wording, "Key not
// found". In a BACKGROUND tab it never resolved at all — query-core's
// retryer pauses while `document.visibilityState === 'hidden'`
// (retryer.js `canContinue` -> focusManager), and a paused query never
// reaches `error`, so nothing was ever thrown and the page sat on its
// loading skeleton with Edit and Delete still clickable.
//
// The request COUNT below is the load-bearing assertion: a not-found panel
// can render correctly while the retry storm survives untouched, and the
// storm is what makes the state unreachable in a background tab.

const MISSING_ROUTE_ID = 'reg-not-found-route';
const MISSING_USERNAME = 'reg_not_found_consumer';
const SERVICE_ID = 'reg-not-found-service';
const MISSING_NESTED_ROUTE_ID = 'reg-not-found-nested-route';
const RECREATED_ROUTE_ID = 'reg-not-found-recreated-route';
const RECREATED_ROUTE_NAME = 'reg not found recreated route';

const clean = () =>
  safeClean(async () => {
    await deleteAllRoutes(e2eReq);
    await deleteAllConsumers(e2eReq);
    await deleteAllServices(e2eReq);
  });

test.beforeAll(async () => {
  await clean();
  // The service must exist: the nested case asserts the back link returns
  // to a real service's routes tab.
  await putServiceReq(e2eReq, {
    id: SERVICE_ID,
    name: 'reg not found service',
  });
});

test.afterAll(clean);

test('a missing route is requested once, states its absence, and offers a way back', async ({
  page,
}) => {
  const requests: string[] = [];
  page.on('request', (r) => {
    if (r.url().includes(`/apisix/admin/routes/${MISSING_ROUTE_ID}`)) {
      requests.push(r.url());
    }
  });

  await uiGoto(page, '/routes/detail/$id', { id: MISSING_ROUTE_ID });

  // Waiting for the settled state is what makes the request count
  // deterministic — no sleeps.
  await expect(
    page.getByText('This Route does not exist. It may have been deleted.')
  ).toBeVisible();

  // Load-bearing: the panel above can render correctly while the retry
  // storm survives, and the storm is what makes this state unreachable in
  // a background tab.
  expect(requests).toHaveLength(1);

  // etcd's raw "Key not found" must not appear alongside the panel.
  await expect(page.getByRole('alert')).toHaveCount(0);

  // The heading identifies the resource even though it was never fetched.
  // Scoped to the page body: a Mantine modal title is an `h2` as well, so an
  // unscoped level-2 lookup would resolve two elements and die on strict
  // mode rather than on this assertion.
  await expect(
    page.getByRole('main').getByRole('heading', { level: 2 })
  ).toHaveText(`Route · ${MISSING_ROUTE_ID}`);

  // Edit and Delete must be absent, not merely disabled: acting on a
  // resource that is not there cannot succeed.
  await expect(
    page.getByRole('button', { name: 'Edit', exact: true })
  ).toHaveCount(0);
  await expect(
    page.getByRole('button', { name: 'Delete', exact: true })
  ).toHaveCount(0);

  // The nav must survive — the old behaviour replaced the whole app shell.
  // `exact` because an accessible-name substring also matches the
  // "Stream Routes" nav item.
  await expect(
    page.getByRole('link', { name: 'Routes', exact: true })
  ).toBeVisible();

  await page.getByRole('button', { name: 'Back to Routes' }).click();
  await expect(page.getByRole('table')).toBeVisible();
});

test('the not-found state does not outlive the resource being re-created', async ({
  page,
}) => {
  // The panel must not assert something false about the user's data. A 404
  // puts the detail query into `error`, and while react-query's error-reset
  // boundary is un-reset `errorBoundaryUtils` sets `retryOnMount = false`,
  // after which `queryObserver.shouldLoadOnMount` refuses to fetch an
  // errored query. Left alone, the cached 404 is re-thrown on every later
  // mount for the whole `gcTime` (5 minutes) — so a re-created resource
  // still reads as deleted. Resetting the boundary is not enough on its own:
  // the flag is cleared again by the next query mount, which the list page
  // below performs. See `useResetQueryError`.
  //
  // Every navigation below stays INSIDE the SPA on purpose. `uiGoto` is a
  // full page load, which builds a fresh QueryClient with an empty cache and
  // would make this test pass against the very bug it exists to catch.
  await uiGoto(page, '/routes/detail/$id', { id: RECREATED_ROUTE_ID });
  const notFound = page.getByText(
    'This Route does not exist. It may have been deleted.'
  );
  await expect(notFound).toBeVisible();

  // The user re-creates the resource under the same id while the tab stays
  // open — the accidental-delete recovery this regression is about. Seeding
  // it BEFORE the list is ever opened keeps the test free of timing: the
  // list query has never run in this session, so its first mount fetches.
  // (A list already on screen would not refetch on a quick re-entry —
  // react-query's `ensureSuspenseTimers` floors a suspense query's staleTime
  // at 1s.)
  await putRouteReq(e2eReq, {
    id: RECREATED_ROUTE_ID,
    name: RECREATED_ROUTE_NAME,
    uri: '/reg-not-found-recreated',
    methods: ['GET'],
    upstream: { type: 'roundrobin', nodes: { 'recreated.local:80': 1 } },
  } as APISIXType['Route']);

  await page.getByRole('button', { name: 'Back to Routes' }).click();
  await routesPom.isIndexPage(page);
  const row = page.locator('tr').filter({ hasText: RECREATED_ROUTE_ID });
  await expect(row).toBeVisible();

  // Reached by clicking, not by URL: same session, same query cache.
  await row.getByRole('button', { name: 'View' }).click();

  await routesPom.isDetailPage(page);
  await expect(notFound).toHaveCount(0);
  // The form rendered, with the re-created resource's data in it.
  await expect(page.getByLabel('Name', { exact: true }).first()).toHaveValue(
    RECREATED_ROUTE_NAME
  );
  await expect(
    page.getByRole('button', { name: 'Edit', exact: true })
  ).toBeVisible();
});

test('a missing consumer is keyed by username, not id', async ({ page }) => {
  // A second param shape proves the wiring is not route-specific. The
  // consumer is deliberately never created — that is the point.
  await uiGoto(page, '/consumers/detail/$username', {
    username: MISSING_USERNAME,
  });

  await expect(
    page.getByText('This Consumer does not exist. It may have been deleted.')
  ).toBeVisible();
  await expect(
    page.getByRole('main').getByRole('heading', { level: 2 })
  ).toHaveText(`Consumer · ${MISSING_USERNAME}`);
  await page.getByRole('button', { name: 'Back to Consumers' }).click();
  await expect(page.getByRole('table')).toBeVisible();
});

test('a missing route under a service links back to that service', async ({
  page,
}) => {
  // The nested case is the only one whose back link needs a parent param,
  // so it is the only one that exercises the params passthrough.
  await uiGoto(page, '/services/detail/$id/routes/detail/$routeId', {
    id: SERVICE_ID,
    routeId: MISSING_NESTED_ROUTE_ID,
  });

  await expect(
    page.getByText('This Route does not exist. It may have been deleted.')
  ).toBeVisible();
  await page.getByRole('button', { name: 'Back to Routes' }).click();
  // The path must be the service's routes tab, not `/routes` and not
  // `/services`; the list adds its own pagination search params.
  await expect(page).toHaveURL(
    new RegExp(`/services/detail/${SERVICE_ID}/routes(\\?|$)`)
  );
});
