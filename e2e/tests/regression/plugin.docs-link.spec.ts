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
import { e2eReq } from '@e2e/utils/req';
import { test } from '@e2e/utils/test';
import { expect } from '@playwright/test';

import { deleteAllRoutes } from '@/apis/routes';

// #3461: the plugin editor never said what a plugin does. The gateway
// carries no description for any plugin (0 of 106 have a
// `schema.description`), so the docs site is the only source, and its URL
// is derivable from the plugin name.

const DOCS = 'https://apisix.apache.org';

test.beforeAll(async () => {
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

const openPicker = async (page: import('@playwright/test').Page) => {
  await routesPom.toAdd(page);
  await routesPom.isAddPage(page);
  await page.getByRole('button', { name: 'Select Plugins' }).click();
  const picker = page.getByRole('dialog', { name: 'Select Plugins' });
  await expect(picker).toBeVisible();
  return picker;
};

const openPluginDrawer = async (
  page: import('@playwright/test').Page,
  plugin: string
) => {
  const picker = await openPicker(page);
  await picker.getByPlaceholder('Search').fill(plugin);
  await picker
    .getByTestId(`plugin-${plugin}`)
    .getByRole('button', { name: 'Add' })
    .click();
  const drawer = page.getByRole('dialog', { name: 'Add Plugin' });
  await expect(drawer).toBeVisible();
  return drawer;
};

test('the plugin editor links that plugin documentation', async ({ page }) => {
  const drawer = await openPluginDrawer(page, 'key-auth');

  // getByRole('link') is the load-bearing part: it fails if the control
  // ever becomes a <button href>, which cannot be cmd-clicked or copied.
  const link = drawer.getByRole('link', { name: 'Docs' });
  await expect(link).toHaveAttribute(
    'href',
    `${DOCS}/docs/apisix/plugins/key-auth/`
  );
  await expect(link).toHaveAttribute('target', '_blank');
});

test('a plugin with no documentation page gets no link', async ({ page }) => {
  const drawer = await openPluginDrawer(page, 'example-plugin');

  // example-plugin is the gateway's sample plugin and has no docs page.
  // A link here would be a broken link, which is worse than none.
  await expect(drawer.getByRole('link', { name: 'Docs' })).toHaveCount(0);
});

test('the documentation link follows the UI language', async ({ page }) => {
  await routesPom.toIndex(page);
  await routesPom.isIndexPage(page);
  await page.locator('button[aria-haspopup="menu"]').click();
  await page.getByRole('menuitem', { name: '中文' }).click();
  await expect(
    page.getByRole('link', { name: '路由', exact: true })
  ).toBeVisible();

  await routesPom.toAdd(page);
  await page.getByRole('button', { name: '选择插件' }).click();
  const picker = page.getByRole('dialog', { name: '选择插件' });
  await picker.getByPlaceholder('搜索').fill('key-auth');
  await picker
    .getByTestId('plugin-key-auth')
    .getByRole('button', { name: '新增' })
    .click();
  const drawer = page.getByRole('dialog', { name: '添加插件' });
  await expect(drawer.getByRole('link', { name: '文档' })).toHaveAttribute(
    'href',
    `${DOCS}/zh/docs/apisix/plugins/key-auth/`
  );
});

test('a picker card links that plugin documentation', async ({ page }) => {
  const picker = await openPicker(page);
  await picker.getByPlaceholder('Search').fill('key-auth');

  // Icon-only: the accessible name is what tells a screen reader which of
  // a hundred identical icons this one belongs to.
  const link = picker
    .getByTestId('plugin-key-auth')
    .getByRole('link', { name: 'key-auth documentation' });
  await expect(link).toHaveAttribute(
    'href',
    `${DOCS}/docs/apisix/plugins/key-auth/`
  );
});

test('a picker card for an undocumented plugin has no link', async ({
  page,
}) => {
  const picker = await openPicker(page);
  await picker.getByPlaceholder('Search').fill('example-plugin');
  await expect(
    picker.getByTestId('plugin-example-plugin').getByRole('link')
  ).toHaveCount(0);
});
