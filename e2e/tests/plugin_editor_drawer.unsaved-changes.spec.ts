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
import { pluginConfigsPom } from '@e2e/pom/plugin_configs';
import { test } from '@e2e/utils/test';
import { uiFillMonacoEditor, uiGetMonacoEditor } from '@e2e/utils/ui';
import { expect } from '@playwright/test';

const openResponseRewriteDrawer = async (page: Parameters<typeof test>[1]['page']) => {
  await pluginConfigsPom.toAdd(page);
  await pluginConfigsPom.isAddPage(page);

  await page.getByRole('button', { name: 'Select Plugins' }).click();

  const selectPluginsDialog = page.getByRole('dialog', { name: 'Select Plugins' });
  await selectPluginsDialog.getByPlaceholder('Search').fill('response-rewrite');
  await selectPluginsDialog
    .getByTestId('plugin-response-rewrite')
    .getByRole('button', { name: 'Add' })
    .click();

  const drawer = page.getByRole('dialog', { name: 'Add Plugin' });
  await expect(drawer).toBeVisible();
  return drawer;
};

test('should show unsaved changes dialog when closing plugin editor with unsaved changes', async ({
  page,
}) => {
  const drawer = await openResponseRewriteDrawer(page);

  await test.step('make changes in the editor', async () => {
    const editor = await uiGetMonacoEditor(page, drawer);
    await uiFillMonacoEditor(page, editor, '{"body": "test"}');
  });

  await test.step('closing with unsaved changes shows confirmation dialog', async () => {
    await drawer.getByRole('button', { name: 'Close' }).click();

    const confirmModal = page.getByRole('dialog', { name: 'Unsaved Changes' });
    await expect(confirmModal).toBeVisible();
    await expect(
      confirmModal.getByText('You have unsaved changes. Are you sure you want to close?')
    ).toBeVisible();
  });

  await test.step('cancel keeps drawer open with changes preserved', async () => {
    const confirmModal = page.getByRole('dialog', { name: 'Unsaved Changes' });
    await confirmModal.getByRole('button', { name: 'Cancel' }).click();

    await expect(confirmModal).toBeHidden();
    await expect(drawer).toBeVisible();
  });

  await test.step('discard changes closes the drawer', async () => {
    await drawer.getByRole('button', { name: 'Close' }).click();

    const confirmModal = page.getByRole('dialog', { name: 'Unsaved Changes' });
    await confirmModal.getByRole('button', { name: 'Discard Changes' }).click();

    await expect(confirmModal).toBeHidden();
    await expect(drawer).toBeHidden();
  });
});

test('should close plugin editor silently when there are no unsaved changes', async ({ page }) => {
  const drawer = await openResponseRewriteDrawer(page);

  await test.step('closing without changes does not show confirmation dialog', async () => {
    await drawer.getByRole('button', { name: 'Close' }).click();

    await expect(page.getByRole('dialog', { name: 'Unsaved Changes' })).toBeHidden();
    await expect(drawer).toBeHidden();
  });
});
