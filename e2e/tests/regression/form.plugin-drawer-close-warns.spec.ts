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
/* eslint-disable playwright/no-conditional-in-test -- regression test stabilization */

// Regression: closing the Add Plugin drawer while it holds unsaved JSON
// config must warn the user — not silently discard.
//
// Related issue:
//   - apache/apisix-dashboard#3326 unsaved plugin config silently discarded
//     on drawer close

import { routesPom } from '@e2e/pom/routes';
import { e2eReq } from '@e2e/utils/req';
import { test } from '@e2e/utils/test';
import {
  uiFillMonacoEditor,
  uiGetMonacoEditor,
} from '@e2e/utils/ui';
import { expect } from '@playwright/test';

import { deleteAllRoutes } from '@/apis/routes';

const pluginName = 'cors';

test.beforeAll(async () => {
  await deleteAllRoutes(e2eReq);
});

test.afterAll(async () => {
  await deleteAllRoutes(e2eReq);
});

test('closing Add Plugin drawer with unsaved edits warns the user', async ({
  page,
}) => {
  await routesPom.toAdd(page);
  await routesPom.isAddPage(page);

  await page.getByRole('button', { name: 'Select Plugins' }).click();
  const selectDialog = page.getByRole('dialog', { name: 'Select Plugins' });
  await selectDialog.getByPlaceholder('Search').fill(pluginName);
  await selectDialog
    .getByTestId(`plugin-${pluginName}`)
    .getByRole('button', { name: 'Add' })
    .click();

  const addPluginDialog = page.getByRole('dialog', { name: 'Add Plugin' });
  await expect(addPluginDialog).toBeVisible();

  // Dirty the editor — non-default JSON is the trigger condition.
  const editor = await uiGetMonacoEditor(page, addPluginDialog, false);
  await uiFillMonacoEditor(
    page,
    editor,
    JSON.stringify({ allow_origins: 'https://reg-unsaved.local' })
  );

  // Try the drawer Close affordance — Mantine drawers typically have a
  // close X button, otherwise click outside / press Escape.
  const closeBtn = addPluginDialog.getByRole('button', { name: /close/i });
  if (await closeBtn.first().isVisible().catch(() => false)) {
    await closeBtn.first().click();
  } else {
    await page.keyboard.press('Escape');
  }

  // A confirmation dialog must appear before the drawer fully closes.
  // Use the specific dialog name to avoid matching the still-open Add Plugin
  // drawer (which also contains "unsaved" from the allow_origins URL we typed).
  const warning = page.getByRole('dialog', { name: /unsaved changes/i });
  await expect(warning).toBeVisible({ timeout: 5000 });

  // The Add Plugin drawer should still be visible until the user confirms.
  await expect(addPluginDialog).toBeVisible();
});
