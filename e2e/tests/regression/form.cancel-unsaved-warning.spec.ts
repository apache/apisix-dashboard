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

// Regression: clicking Cancel on a resource's Edit form while the form is
// dirty must warn the user before discarding changes. PR #3333 already
// covers the in-form PluginEditorDrawer scope; this guards the
// resource-level Edit→Cancel flow described in #3344.

import { routesPom } from '@e2e/pom/routes';
import { randomId } from '@e2e/utils/common';
import { e2eReq } from '@e2e/utils/req';
import { test } from '@e2e/utils/test';
import { uiGoto } from '@e2e/utils/ui';
import { expect } from '@playwright/test';

import { deleteAllRoutes, putRouteReq } from '@/apis/routes';
import type { APISIXType } from '@/types/schema/apisix';

let seededRouteId = '';
const originalName = randomId('reg-edit-cancel');

test.beforeAll(async () => {
  await deleteAllRoutes(e2eReq);
  const res = await putRouteReq(e2eReq, {
    name: originalName,
    uri: '/regression/edit-cancel',
    methods: ['GET'],
    upstream: {
      type: 'roundrobin',
      nodes: { 'reg-cancel.local:80': 1 },
    },
  } as APISIXType['Route']);
  seededRouteId = res.data.value.id;
});

test.afterAll(async () => {
  await deleteAllRoutes(e2eReq);
});

test('route detail Edit → Cancel with unsaved changes warns the user', async ({
  page,
}) => {
  await uiGoto(page, '/routes/detail/$id', { id: seededRouteId });
  await routesPom.isDetailPage(page);

  await test.step('enter edit mode and modify a tracked field', async () => {
    await page.getByRole('button', { name: 'Edit' }).click();
    // URI is part of the route schema and definitely tracked by
    // react-hook-form — mutate it to a non-empty new value.
    const uriField = page.getByLabel('URI', { exact: true });
    await uriField.fill('/regression/edit-cancel-dirty');
    await expect(uriField).toHaveValue('/regression/edit-cancel-dirty');
  });

  await test.step('click Cancel — confirmation modal must appear', async () => {
    await page
      .getByRole('button', { name: 'Cancel', exact: true })
      .click();

    const modal = page
      .getByRole('dialog')
      .filter({ hasText: /(unsaved|discard|leave|changes)/i });
    await expect(modal).toBeVisible({ timeout: 5000 });

    // Dirty value still showing — the user has not confirmed yet.
    const uriField = page.getByLabel('URI', { exact: true });
    await expect(uriField).toHaveValue('/regression/edit-cancel-dirty');
  });

  await test.step('confirming discard reverts the form and exits edit mode', async () => {
    const modal = page
      .getByRole('dialog')
      .filter({ hasText: /(unsaved|discard|leave|changes)/i });
    // The confirm button label is "Discard Changes" per info.unsaved.confirm.
    await modal.getByRole('button', { name: /discard/i }).click();
    await expect(modal).toBeHidden();

    // The form is back in view mode (URI disabled) and reverted to the
    // seeded value.
    const uriField = page.getByLabel('URI', { exact: true });
    await expect(uriField).toBeDisabled();
    await expect(uriField).toHaveValue('/regression/edit-cancel');
  });
});

test('route detail Edit → Cancel always confirms before discarding (even with no changes)', async ({
  page,
}) => {
  // Note: this app calls `form.reset(...)` from a useEffect whenever the
  // backing query data is refreshed, which wipes react-hook-form's dirty
  // state. The guard therefore always confirms — see useEditCancelGuard.
  await uiGoto(page, '/routes/detail/$id', { id: seededRouteId });
  await routesPom.isDetailPage(page);

  await page.getByRole('button', { name: 'Edit' }).click();
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();

  const modal = page
    .getByRole('dialog')
    .filter({ hasText: /(unsaved|discard|leave|changes)/i });
  await expect(modal).toBeVisible({ timeout: 5000 });

  // Backing out of the modal (Cancel button) keeps the user in edit mode.
  await modal.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(modal).toBeHidden();

  // Still in Edit mode (URI field still enabled).
  await expect(page.getByLabel('URI', { exact: true })).toBeEnabled();
});
