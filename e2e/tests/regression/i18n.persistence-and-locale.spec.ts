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

// Regression for an i18n item of apache/apisix-dashboard#3417:
// - the language choice was never persisted or detected (`lng: 'en'`
//   hardcoded): a reload reset a zh user to English while the admin key
//   IS persisted right next to it;
// - antd's ConfigProvider was hardwired to enUS, so antd-rendered
//   surfaces (list pagination etc.) stayed English after switching;
// - the delete confirmation was assembled from three concatenated pieces
//   (sentence + bold target + a '?'/'¿?' mark), producing garbled output
//   in languages whose sentence already ends the question or places the
//   verb last (es/de/tr).

import { routesPom } from '@e2e/pom/routes';
import { randomId } from '@e2e/utils/common';
import { e2eReq } from '@e2e/utils/req';
import { test } from '@e2e/utils/test';
import { expect } from '@playwright/test';

import { deleteAllRoutes } from '@/apis/routes';

const switchLanguage = async (
  page: import('@playwright/test').Page,
  label: string
) => {
  await page.locator('button[aria-haspopup="menu"]').click();
  await page.getByRole('menuitem', { name: label }).click();
};

test.beforeEach(async () => {
  await deleteAllRoutes(e2eReq);
});

test.afterEach(async ({ page }) => {
  await page
    .evaluate(() => localStorage.removeItem('settings:lang'))
    .catch(() => {});
});

test.afterAll(async () => {
  await deleteAllRoutes(e2eReq);
});

test('language choice survives a reload', async ({ page }) => {
  await routesPom.toIndex(page);
  await routesPom.isIndexPage(page);

  await switchLanguage(page, '中文');
  await expect(page.getByRole('link', { name: '路由', exact: true })).toBeVisible();

  await page.reload();
  // unfixed: lng is hardcoded to 'en' and the choice is lost
  await expect(page.getByRole('link', { name: '路由', exact: true })).toBeVisible();
});

test('antd-rendered pagination follows the app language', async ({ page }) => {
  const names = Array.from({ length: 11 }, () => randomId('reg-antd-locale'));
  for (const name of names) {
    await e2eReq.put(`/routes/${name}`, {
      name,
      uri: `/reg-antd-locale/${name}`,
      upstream: { type: 'roundrobin', nodes: { 'antd-locale.local:80': 1 } },
    });
  }

  await routesPom.toIndex(page);
  await routesPom.isIndexPage(page);
  await switchLanguage(page, '中文');
  await expect(page.getByRole('link', { name: '路由', exact: true })).toBeVisible();

  // 11 rows → pagination size changer renders; its text comes from the
  // antd locale (unfixed: hardwired enUS → "10 / page")
  await expect(page.getByText(/条\/页/)).toBeVisible();
});

test('delete confirmation is one proper sentence in Spanish', async ({
  page,
}) => {
  const name = randomId('reg-es-delete');
  await e2eReq.put(`/routes/${name}`, {
    name,
    uri: `/reg-es-delete/${name}`,
    upstream: { type: 'roundrobin', nodes: { 'es-delete.local:80': 1 } },
  });

  await routesPom.toIndex(page);
  await routesPom.isIndexPage(page);
  await switchLanguage(page, 'Español');

  await page
    .getByRole('row', { name })
    .getByRole('button', { name: 'Eliminar' })
    .click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();

  const text = (await dialog.innerText()).replace(/\s+/g, ' ');
  // unfixed: the es sentence already ends with '?', then the code appends
  // the target and a literal '¿?' mark → '…la Ruta? <name> ¿?'
  expect(text).not.toContain('¿?');
  expect(text).toMatch(/¿[^?]+\?/);
});
