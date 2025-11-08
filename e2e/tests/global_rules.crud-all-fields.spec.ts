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

import { globalRulePom } from '@e2e/pom/global_rules';
import { test } from '@e2e/utils/test';
import {
  uiFillMonacoEditor,
  uiGetMonacoEditor,
  uiHasToastMsg,
} from '@e2e/utils/ui';
import { expect } from '@playwright/test';

test('should CRUD global rule with multiple plugins', async ({ page }) => {
  let globalRuleId: string;

  await test.step('navigate to add global rule page', async () => {
    await globalRulePom.toAdd(page);
    await globalRulePom.isAddPage(page);
  });

  await test.step('add global rule with multiple plugins', async () => {
    // ID field should be auto-generated
    const idInput = page.getByLabel('ID');
    await expect(idInput).toBeVisible();
    await expect(idInput).not.toHaveValue('');
    globalRuleId = await idInput.inputValue();

    // Add first plugin - response-rewrite
    const selectPluginBtn = page.getByRole('button', {
      name: 'Select Plugins',
    });
    await selectPluginBtn.click();

    const dialog = page.getByRole('dialog', { name: 'Select Plugins' });
    await expect(dialog).toBeVisible();

    const searchInput = dialog.getByPlaceholder('Search');
    await searchInput.fill('response-rewrite');

    await dialog
      .getByTestId('plugin-response-rewrite')
      .getByRole('button', { name: 'Add' })
      .click();

    const pluginDialog = page.getByRole('dialog', { name: 'Add Plugin' });
    await expect(pluginDialog).toBeVisible();

    // Configure response-rewrite with custom configuration using Monaco editor
    const pluginEditor = await uiGetMonacoEditor(page, pluginDialog);
    await uiFillMonacoEditor(
      page,
      pluginEditor,
      JSON.stringify({
        body: 'test response',
        headers: {
          set: {
            'X-Global-Rule': 'test-global-rule',
          },
        },
      })
    );

    await pluginDialog.getByRole('button', { name: 'Add' }).click();
    await expect(pluginDialog).toBeHidden();

    // Add second plugin - cors
    await selectPluginBtn.click();

    const corsDialog = page.getByRole('dialog', { name: 'Select Plugins' });
    await expect(corsDialog).toBeVisible();

    const corsSearchInput = corsDialog.getByPlaceholder('Search');
    await corsSearchInput.fill('cors');

    await corsDialog
      .getByTestId('plugin-cors')
      .getByRole('button', { name: 'Add' })
      .click();

    const corsPluginDialog = page.getByRole('dialog', { name: 'Add Plugin' });
    await expect(corsPluginDialog).toBeVisible();

    // Submit with simple configuration for cors
    const corsEditor = await uiGetMonacoEditor(page, corsPluginDialog);
    await uiFillMonacoEditor(page, corsEditor, '{}');

    await corsPluginDialog.getByRole('button', { name: 'Add' }).click();
    await expect(corsPluginDialog).toBeHidden();

    // Submit the form
    await globalRulePom.getAddBtn(page).click();

    await uiHasToastMsg(page, {
      hasText: 'success',
    });

    await globalRulePom.isDetailPage(page);
  });

  await test.step('verify global rule with multiple plugins', async () => {
    await expect(page).toHaveURL(
      (url) => url.pathname.endsWith(`/global_rules/detail/${globalRuleId}`)
    );

    // Verify we're on the detail page
    await globalRulePom.isDetailPage(page);
  });

  await test.step('delete global rule from detail page', async () => {
    await page.getByRole('button', { name: 'Delete' }).click();

    await page
      .getByRole('dialog', { name: 'Delete Global Rule' })
      .getByRole('button', { name: 'Delete' })
      .click();

    await globalRulePom.isIndexPage(page);
    
    await uiHasToastMsg(page, {
      hasText: 'success',
    });
  });
});
