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

// Regression for the dirty-form navigation guard: leaving a form with
// unsaved edits — by sidebar link or the Cancel button — must confirm
// before discarding. Conversely a form the user has not actually changed
// must never interrogate them, which is the failure mode the raw
// react-hook-form `isDirty` flag produces on add pages whose widgets
// normalize `undefined` to empty values on mount.

import { routesPom } from '@e2e/pom/routes';
import { secretsPom } from '@e2e/pom/secrets';
import { sslsPom } from '@e2e/pom/ssls';
import { randomId } from '@e2e/utils/common';
import { e2eReq } from '@e2e/utils/req';
import { test } from '@e2e/utils/test';
import { uiGoto, uiHasToastMsg } from '@e2e/utils/ui';
import { uiFillUpstreamRequiredFields } from '@e2e/utils/ui/upstreams';
import { expect, type Page } from '@playwright/test';

import { deleteAllRoutes } from '@/apis/routes';
import type { APISIXType } from '@/types/schema/apisix';

const unsavedModal = (page: Page) =>
  page.getByRole('dialog').filter({ hasText: /unsaved/i });

test.beforeAll(async () => {
  await deleteAllRoutes(e2eReq);
});

test.afterAll(async () => {
  await deleteAllRoutes(e2eReq);
});

test('leaving a dirty add form via the sidebar warns, and backing out keeps the input', async ({
  page,
}) => {
  const name = randomId('reg-guard');
  await routesPom.toAdd(page);
  await routesPom.isAddPage(page);

  await page.locator('input[name="name"]').fill(name);

  await page.getByRole('link', { name: 'Services', exact: true }).click();

  const modal = unsavedModal(page);
  await expect(modal).toBeVisible({ timeout: 5000 });

  await modal.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(modal).toBeHidden();

  await routesPom.isAddPage(page);
  await expect(page.locator('input[name="name"]')).toHaveValue(name);
});

test('confirming the warning discards the edits and completes the navigation', async ({
  page,
}) => {
  await routesPom.toAdd(page);
  await routesPom.isAddPage(page);

  await page.locator('input[name="name"]').fill(randomId('reg-guard'));
  await page.getByRole('link', { name: 'Services', exact: true }).click();

  const modal = unsavedModal(page);
  await expect(modal).toBeVisible({ timeout: 5000 });
  await modal.getByRole('button', { name: /discard/i }).click();

  await expect(page).toHaveURL((url) => url.pathname.endsWith('/services'));
});

test('a successful submit navigates without a warning', async ({ page }) => {
  // After a successful POST the form is still dirty relative to its
  // defaults, so without `bypass()` the add page's own success redirect is
  // blocked by the guard it just installed.
  const name = randomId('reg-guard-submit');
  await routesPom.toAdd(page);
  await routesPom.isAddPage(page);

  await page.locator('input[name="name"]').fill(name);
  await page.getByLabel('URI', { exact: true }).fill(`/reg-guard/${name}`);

  const upstreamSection = page.getByRole('group', {
    name: 'Upstream',
    exact: true,
  });
  await uiFillUpstreamRequiredFields(upstreamSection, {
    name: `${name}-upstream`,
    nodes: [
      { host: 'guard-a.local', port: 80, weight: 100 },
      { host: 'guard-b.local', port: 80, weight: 100 },
    ],
  });

  await routesPom.getAddBtn(page).click();
  await uiHasToastMsg(page, { hasText: 'Add Route Successfully' });

  await expect(unsavedModal(page)).toBeHidden();
  await routesPom.isDetailPage(page);
});

test('a pristine add page navigates away without interrogating the user', async ({
  page,
}) => {
  // ssls/add is one of five add pages whose widgets normalize `undefined`
  // to empty values on mount (certs: [], keys: []), so react-hook-form
  // reports it dirty with zero user input. The guard must not.
  await sslsPom.toAdd(page);
  await sslsPom.isAddPage(page);

  await page.getByRole('link', { name: 'Services', exact: true }).click();

  await expect(unsavedModal(page)).toBeHidden();
  await expect(page).toHaveURL((url) => url.pathname.endsWith('/services'));
});

test('a pristine nanoid add page (secrets) navigates away without interrogating the user', async ({
  page,
}) => {
  // secrets/add seeds defaultValues.id with nanoid(); the id must be stable
  // across renders or the pristine form reads dirty and the guard wrongly
  // interrogates the user.
  await secretsPom.toAdd(page);
  await secretsPom.isAddPage(page);

  await page.getByRole('link', { name: 'Services', exact: true }).click();

  await expect(unsavedModal(page)).toBeHidden();
  await expect(page).toHaveURL((url) => url.pathname.endsWith('/services'));
});

test('Cancel on a pristine add page returns to the list without a warning', async ({
  page,
}) => {
  await routesPom.toAdd(page);
  await routesPom.isAddPage(page);

  await page.getByRole('button', { name: 'Cancel', exact: true }).click();

  await expect(unsavedModal(page)).toBeHidden();
  await routesPom.isIndexPage(page);
});

test('Cancel on a dirty add page warns first', async ({ page }) => {
  await routesPom.toAdd(page);
  await routesPom.isAddPage(page);

  await page.locator('input[name="name"]').fill(randomId('reg-guard-cancel'));
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();

  const modal = unsavedModal(page);
  await expect(modal).toBeVisible({ timeout: 5000 });
  await modal.getByRole('button', { name: /discard/i }).click();

  await routesPom.isIndexPage(page);
});

test('Edit then Cancel with nothing changed does not interrogate the user', async ({
  page,
}) => {
  const name = randomId('reg-guard-clean');
  const res = await e2eReq.put<{ value: APISIXType['Route'] }>(
    `/routes/${name}`,
    {
      name,
      uri: `/reg-guard-clean/${name}`,
      upstream: { type: 'roundrobin', nodes: { 'guard.local:80': 1 } },
    }
  );
  const id = res.data.value.id;

  await uiGoto(page, '/routes/detail/$id', { id });
  await routesPom.isDetailPage(page);

  await page.getByRole('button', { name: 'Edit' }).click();
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();

  await expect(unsavedModal(page)).toBeHidden();
  await expect(page.getByLabel('URI', { exact: true })).toBeDisabled();
});

test('leaving a dirty detail form via the sidebar warns', async ({ page }) => {
  const name = randomId('reg-guard-dirty');
  const res = await e2eReq.put<{ value: APISIXType['Route'] }>(
    `/routes/${name}`,
    {
      name,
      uri: `/reg-guard-dirty/${name}`,
      upstream: { type: 'roundrobin', nodes: { 'guard.local:80': 1 } },
    }
  );
  const id = res.data.value.id;

  await uiGoto(page, '/routes/detail/$id', { id });
  await routesPom.isDetailPage(page);

  await page.getByRole('button', { name: 'Edit' }).click();
  // The route detail page renders two "Description" fields (the route's own
  // and the nested upstream's), so target the route-level one by name.
  await page.locator('textarea[name="desc"]').fill('changed by the guard spec');

  await page.getByRole('link', { name: 'Services', exact: true }).click();
  await expect(unsavedModal(page)).toBeVisible({ timeout: 5000 });
});
