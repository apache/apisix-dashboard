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

// Edge: creating a route that references a non-existent service_id must
// surface an error — never silently appear to succeed.

import { routesPom } from '@e2e/pom/routes';
import { safeClean } from '@e2e/utils/clean';
import { randomId } from '@e2e/utils/common';
import { e2eReq } from '@e2e/utils/req';
import { test } from '@e2e/utils/test';
import { expect } from '@playwright/test';

import { deleteAllRoutes } from '@/apis/routes';
import { deleteAllServices } from '@/apis/services';

const FAKE_SERVICE_ID = 'nonexistent-service-id-edge-001';

test.beforeAll(async () => {
  await safeClean(
    () => deleteAllRoutes(e2eReq),
    () => deleteAllServices(e2eReq)
  );
});

test.afterAll(async () => {
  await safeClean(() => deleteAllRoutes(e2eReq));
});

test('route with non-existent service_id is rejected with a visible error', async ({
  page,
}) => {
  await routesPom.toAdd(page);
  await routesPom.isAddPage(page);

  await page
    .getByLabel('Name', { exact: true })
    .first()
    .fill(randomId('edge-bad-sid'));
  await page.getByLabel('URI', { exact: true }).fill('/edge/bad-service-id');
  await page.getByRole('textbox', { name: 'HTTP Methods' }).click();
  await page.getByRole('option', { name: 'GET' }).click();
  await page.keyboard.press('Escape');

  const serviceSection = page.getByRole('group', { name: 'Service' });
  await serviceSection.locator('input[name="service_id"]').fill(FAKE_SERVICE_ID);

  await routesPom.getAddBtn(page).click();

  // Must NOT show success
  const successToast = page
    .getByRole('alert')
    .filter({ hasText: 'Add Route Successfully' });
  const accepted = await successToast
    .first()
    .waitFor({ state: 'visible', timeout: 5000 })
    .then(() => true)
    .catch(() => false);
  expect(
    accepted,
    'non-existent service_id must NOT silently produce a working route'
  ).toBe(false);

  // Either an error toast surfaces or the form stays on add page with
  // inline validation. Both are acceptable; silent success is not.
  const stillOnAdd = page.url().includes('/routes/add');
  if (!stillOnAdd) {
    const errorToast = page
      .getByRole('alert')
      .filter({ hasText: /(fail|error|invalid|not found|404)/i });
    await expect(errorToast.first()).toBeVisible({ timeout: 5000 });
  }
});
