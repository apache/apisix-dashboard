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

// Edge: typing syntactically-invalid JSON in the plugin config editor must
// either prevent submission or surface a visible error — never round-trip a
// broken config to the Admin API.

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
const invalidJson = '{ "allow_origins": "*", '; // missing closing brace + trailing comma

test.beforeAll(async () => {
  await deleteAllRoutes(e2eReq);
});

test.afterAll(async () => {
  await deleteAllRoutes(e2eReq);
});

test('invalid JSON in plugin editor cannot be saved', async ({ page }) => {
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
  const editor = await uiGetMonacoEditor(page, addPluginDialog, false);
  await uiFillMonacoEditor(page, editor, invalidJson);

  await addPluginDialog.getByRole('button', { name: 'Add' }).click();

  // The dialog must remain open OR an error must surface — what we forbid
  // is silently accepting invalid JSON and closing the dialog as if it
  // were valid.
  await page.waitForTimeout(1000);
  const dialogStillOpen = await addPluginDialog
    .isVisible()
    .catch(() => false);
  const errorVisible = await page
    .getByText(/(invalid|json|parse|syntax)/i)
    .first()
    .isVisible()
    .catch(() => false);

  expect(
    dialogStillOpen || errorVisible,
    'invalid JSON must NOT silently close the editor as if accepted'
  ).toBe(true);
});
