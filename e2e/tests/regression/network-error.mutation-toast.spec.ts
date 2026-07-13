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

// Regression: network-level failures (Admin API unreachable / timeout / CORS
// preflight failure) reject without an `err.response`, and the global Axios
// interceptor in src/config/req.ts used to be gated on `err.response` — so
// every mutation failed with zero user feedback. The interceptor now toasts
// on responseless errors too, in the one place all request paths flow
// through: useMutation sites, raw `req.delete` in DeleteResourceBtn, and
// query refetches alike.
//
// Reproduction strategy: aborting the request in the browser triggers exactly
// the `error.response === undefined` branch on Axios — the same shape as a
// real backend outage.
//
// Also pinned here: the routes detail page previously had its own local
// onError toast on top of the global one (double toast). It was removed, so
// a failing route edit must surface exactly ONE alert.

import { routesPom } from '@e2e/pom/routes';
import { e2eReq } from '@e2e/utils/req';
import { test } from '@e2e/utils/test';
import { uiGoto, uiHasToastMsg } from '@e2e/utils/ui';
import { expect } from '@playwright/test';
import { customAlphabet } from 'nanoid';

import { getConsumerReq, putConsumerReq } from '@/apis/consumers';
import { putRouteReq } from '@/apis/routes';
import { API_CONSUMERS, API_ROUTES } from '@/config/constant';
import type { APISIXType } from '@/types/schema/apisix';

const nanoid = customAlphabet(
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  8
);

const deleteTargetUsername = `regnetdel${nanoid()}`;
const createUsername = `regnetadd${nanoid()}`;
const timeoutUsername = `regnethang${nanoid()}`;
const routeId = `regnetroute${nanoid()}`;

test.beforeAll(async () => {
  await putConsumerReq(e2eReq, {
    username: deleteTargetUsername,
  } as APISIXType['ConsumerPut']);
  await putRouteReq(e2eReq, {
    id: routeId,
    name: routeId,
    uri: `/${routeId}`,
    methods: ['GET'],
    upstream: {
      type: 'roundrobin',
      nodes: { '127.0.0.1:1980': 1 },
    },
  } as unknown as APISIXType['Route']);
});

test.afterAll(async () => {
  await e2eReq
    .delete(`${API_CONSUMERS}/${deleteTargetUsername}`)
    .catch(() => undefined);
  await e2eReq
    .delete(`${API_CONSUMERS}/${createUsername}`)
    .catch(() => undefined);
  await e2eReq
    .delete(`${API_CONSUMERS}/${timeoutUsername}`)
    .catch(() => undefined);
  await e2eReq.delete(`${API_ROUTES}/${routeId}`).catch(() => undefined);
});

test('consumer create shows an error toast when the request gets no response', async ({
  page,
}) => {
  // Abort the PUT the add form issues; leave reads untouched.
  await page.route('**/apisix/admin/consumers', async (route) => {
    if (route.request().method() === 'PUT') {
      await route.abort('failed');
    } else {
      await route.fallback();
    }
  });

  await uiGoto(page, '/consumers/add');
  await page.getByRole('textbox', { name: 'Username' }).fill(createUsername);
  await page.getByRole('button', { name: 'Add', exact: true }).click();

  // Before the fix: nothing at all happened. Now the interceptor toasts.
  await uiHasToastMsg(page, { hasText: /network error/i });

  // The success path navigates to the detail page; a failed create must not.
  await expect(page).toHaveURL((url) => url.pathname.endsWith('/consumers/add'));
});

test('consumer delete (raw req.delete) shows an error toast when the request gets no response', async ({
  page,
}) => {
  // DeleteResourceBtn bypasses react-query entirely (raw req.delete in the
  // confirm modal), so this pins the interceptor-level coverage that a
  // MutationCache-only fix would miss.
  await page.route(
    (url) =>
      url.pathname.endsWith(`/apisix/admin/consumers/${deleteTargetUsername}`),
    async (route) => {
      if (route.request().method() === 'DELETE') {
        await route.abort('failed');
      } else {
        await route.fallback();
      }
    }
  );

  await uiGoto(page, '/consumers/detail/$username', {
    username: deleteTargetUsername,
  });
  await page.getByRole('button', { name: 'Delete' }).click();
  await page
    .getByRole('dialog', { name: 'Delete Consumer' })
    .getByRole('button', { name: 'Delete' })
    .click();

  await uiHasToastMsg(page, { hasText: /network error/i });

  // The success path must not have run: no green toast, consumer untouched.
  await expect(
    page.getByRole('alert').filter({ hasText: /successfully/i })
  ).toBeHidden();
  const consumer = await getConsumerReq(e2eReq, deleteTargetUsername);
  expect(consumer.value.username).toBe(deleteTargetUsername);
});

test('route edit shows exactly one error toast when the request gets no response', async ({
  page,
}) => {
  // The routes detail page once stacked a local onError toast on top of the
  // global interceptor toast. Pin the single-toast contract.
  await page.route(
    (url) => url.pathname.endsWith(`/apisix/admin/routes/${routeId}`),
    async (route) => {
      if (route.request().method() === 'PUT') {
        await route.abort('failed');
      } else {
        await route.fallback();
      }
    }
  );

  await uiGoto(page, '/routes/detail/$id', { id: routeId });
  await routesPom.isDetailPage(page);

  await page.getByRole('button', { name: 'Edit' }).click();
  await page.getByLabel('Description').first().fill('network error regression');
  await page.getByRole('button', { name: 'Save' }).click();

  const errorToasts = page
    .getByRole('alert')
    .filter({ hasText: /network error/i });
  await expect(errorToasts.first()).toBeVisible({ timeout: 10000 });

  // Give a hypothetical second toast time to render, then require one only.
  // Monaco editors contribute empty role=alert live regions, so count only
  // alerts that carry text (i.e. actual toasts).
  await page.waitForTimeout(1000);
  await expect(errorToasts).toHaveCount(1);
  await expect(page.getByRole('alert').filter({ hasText: /\S/ })).toHaveCount(1);
});

test('consumer create shows a timeout toast when the backend hangs', async ({
  page,
}) => {
  // A hung backend (connection accepted, response never sent) used to keep
  // the request pending for minutes with zero feedback: axios had no timeout
  // configured, so nothing rejected until the browser gave up. API_TIMEOUT_MS
  // now bounds this — the request aborts client-side (ECONNABORTED, no
  // response) and the interceptor toasts. This test genuinely waits out the
  // 60s timeout; it is the only honest way to exercise the real code path.
  test.setTimeout(120_000);

  // Stall the PUT forever: never fulfill, continue, or abort.
  await page.route('**/apisix/admin/consumers', (route) => {
    if (route.request().method() === 'PUT') {
      return new Promise<never>(() => {});
    }
    return route.fallback();
  });

  await uiGoto(page, '/consumers/add');
  await page.getByRole('textbox', { name: 'Username' }).fill(timeoutUsername);
  await page.getByRole('button', { name: 'Add', exact: true }).click();

  const timeoutToast = page
    .getByRole('alert')
    .filter({ hasText: /timeout of \d+ms exceeded/i });
  await expect(timeoutToast.first()).toBeVisible({ timeout: 75_000 });

  // Still on the add page — the create did not go through.
  await expect(page).toHaveURL((url) => url.pathname.endsWith('/consumers/add'));
});
