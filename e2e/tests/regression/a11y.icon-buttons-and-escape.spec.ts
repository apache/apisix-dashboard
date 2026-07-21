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

// Regression for a11y items of apache/apisix-dashboard#3417: the header's
// icon-only buttons (settings, language) had no accessible name, and the
// Select Plugins drawer disabled Escape-to-close despite having no unsaved
// state to protect.

import { routesPom } from '@e2e/pom/routes';
import { test } from '@e2e/utils/test';
import { expect } from '@playwright/test';

test('header icon buttons expose accessible names', async ({ page }) => {
  await routesPom.toIndex(page);
  await routesPom.isIndexPage(page);

  await expect(
    page.getByRole('button', { name: 'Open settings' })
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Select language' })
  ).toBeVisible();
});

test('the Select Plugins drawer closes on Escape', async ({ page }) => {
  await routesPom.toIndex(page);
  await routesPom.isIndexPage(page);
  await routesPom.getAddRouteBtn(page).click();
  await routesPom.isAddPage(page);

  await page.getByRole('button', { name: 'Select Plugins' }).click();
  const drawer = page.getByRole('dialog', { name: 'Select Plugins' });
  await expect(drawer).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(drawer).toBeHidden();
});
