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

// Regression for the "plugin cards are wrapped in Combobox/role=option
// semantics with nested interactive buttons and no keyboard wiring" a11y item
// of apache/apisix-dashboard#3417, explicitly deferred by #3442.
//
// The card grid was rendered inside a Combobox whose store was never wired to
// a target and whose onOptionSubmit was never set, so every card carried
// role="option" while containing a real button and a real link. That is an
// aria-allowed-descendants violation (axe: nested-interactive), and it lied to
// screen readers about a listbox the user could not operate as one.

import { AxeBuilder } from '@axe-core/playwright';
import { routesPom } from '@e2e/pom/routes';
import { test } from '@e2e/utils/test';
import { expect } from '@playwright/test';

const openSelectPluginsDrawer = async (page: Parameters<typeof routesPom.toAdd>[0]) => {
  await routesPom.toAdd(page);
  await routesPom.isAddPage(page);
  await page.getByRole('button', { name: 'Select Plugins' }).click();
  const drawer = page.getByRole('dialog', { name: 'Select Plugins' });
  await expect(drawer).toBeVisible();
  await expect(drawer.getByTestId(/^plugin-/).first()).toBeVisible();
  return drawer;
};

test('the plugin card grid is a list, not a fake listbox', async ({ page }) => {
  const drawer = await openSelectPluginsDrawer(page);

  // no combobox semantics remain anywhere in the drawer
  await expect(drawer.locator('[role="listbox"]')).toHaveCount(0);
  await expect(drawer.locator('[role="option"]')).toHaveCount(0);

  // the cards are a real list, so a screen reader announces the item count
  const list = drawer.getByRole('list');
  await expect(list).toHaveCount(1);
  // one list item per rendered plugin card
  const cardCount = await drawer.getByTestId(/^plugin-/).count();
  expect(cardCount).toBeGreaterThan(0);
  await expect(list.getByRole('listitem')).toHaveCount(cardCount);
});

test('plugin cards expose no nested-interactive violations', async ({
  page,
}) => {
  await openSelectPluginsDrawer(page);

  const results = await new AxeBuilder({ page })
    .include('[role="dialog"]')
    .withRules(['nested-interactive', 'aria-required-children', 'aria-required-parent'])
    .analyze();

  expect(results.violations).toEqual([]);
});

test('the card action buttons are reachable and operable by keyboard', async ({
  page,
}) => {
  const drawer = await openSelectPluginsDrawer(page);

  const firstAdd = drawer.getByRole('button', { name: 'Add' }).first();
  await expect(firstAdd).toBeVisible();
  // focusable in document order rather than needing listbox key handling,
  // which the Combobox never provided
  await firstAdd.focus();
  await expect(firstAdd).toBeFocused();
});

test('the search clear button and the drawer close button have names', async ({
  page,
}) => {
  const drawer = await openSelectPluginsDrawer(page);

  await expect(drawer.getByRole('button', { name: 'Clear search' })).toBeVisible();
  await expect(drawer.getByRole('button', { name: 'Close' })).toBeVisible();
});
