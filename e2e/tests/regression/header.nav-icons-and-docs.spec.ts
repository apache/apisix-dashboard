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
import { test } from '@e2e/utils/test';
import { uiGoto } from '@e2e/utils/ui';
import { expect } from '@playwright/test';

// NOTE: do not import from `@/config/navRoutes` here — it pulls in `~icons/*`,
// a Vite-only virtual module that the Playwright node runtime cannot resolve.

// The nav items gained decorative icons, and the header gained a Docs link
// while the language control grew a visible label. Each of those can silently
// break the accessible names that ~20 specs and every resource POM locate by.

test('nav icons stay decorative: link names are the label alone', async ({
  page,
}) => {
  await uiGoto(page, '/routes');

  // Every nav entry renders an icon; none of them may leak into the
  // accessible name (the POMs match with `exact: true`).
  const names = [
    'Services',
    'Routes',
    'Stream Routes',
    'Upstreams',
    'Consumers',
    'Consumer Groups',
    'SSLs',
    'Global Rules',
    'Plugin Metadata',
    'Plugin Configs',
    'Secrets',
    'Protos',
  ];
  for (const name of names) {
    await expect(
      page.getByRole('link', { name, exact: true }),
      `nav link "${name}" must keep an exact accessible name`
    ).toBeVisible();
  }

  // Catches a nav entry added without extending this guard.
  await expect(
    page.getByRole('navigation').getByRole('link'),
    'every nav entry must be covered by the names above'
  ).toHaveCount(names.length);
});

test('the header exposes a Docs link to the upstream documentation', async ({
  page,
}) => {
  await routesPom.toIndex(page);
  await routesPom.isIndexPage(page);

  const docs = page.getByRole('link', { name: 'Docs' });
  await expect(docs).toBeVisible();
  await expect(docs).toHaveAttribute('href', 'https://apisix.apache.org/docs/');
  await expect(docs).toHaveAttribute('target', '_blank');
  // opening a new tab without this is a tabnabbing footgun
  await expect(docs).toHaveAttribute('rel', /noopener/);
});

test('the language control shows the active language and keeps its a11y name', async ({
  page,
}) => {
  await routesPom.toIndex(page);
  await routesPom.isIndexPage(page);

  // Visible label states the current language; the accessible name still
  // announces the control's purpose and contains that label (WCAG 2.5.3).
  const langBtn = page.getByRole('button', { name: 'Select language' });
  await expect(langBtn).toBeVisible();
  await expect(langBtn).toHaveAccessibleName('Select language: English');
  await expect(langBtn).toContainText('English');

  await langBtn.click();
  await page.getByRole('menuitem', { name: 'Deutsch' }).click();

  await expect(
    page.getByRole('button', { name: 'Select language' })
  ).toHaveAccessibleName('Select language: Deutsch');
});
