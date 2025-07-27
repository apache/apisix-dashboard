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
import type { CommonPOM } from '@e2e/pom/type';
import { expect, type Locator, type Page } from '@playwright/test';

import type { FileRouteTypes } from '@/routeTree.gen';

import { env } from '../env';

export const uiGoto = <T extends FileRouteTypes['to']>(
  page: Page,
  path: T,
  params?: T extends `${string}$${string}` ? Record<string, string> : never
) => {
  let finalPath = path as string;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      finalPath = finalPath.replace(`$${key}`, value);
    });
  }
  return page.goto(`${env.E2E_TARGET_URL}${finalPath.substring(1)}`);
};

export const uiHasToastMsg = async (
  page: Page,
  ...filterOpts: Parameters<Locator['filter']>
) => {
  const alertMsg = page.getByRole('alert').filter(...filterOpts);
  await expect(alertMsg).toBeVisible();
  await alertMsg.getByRole('button').click();
  await expect(alertMsg).not.toBeVisible();
};

export async function uiCannotSubmitEmptyForm(page: Page, pom: CommonPOM) {
  await pom.getAddBtn(page).click();
  await pom.isAddPage(page);
  await uiHasToastMsg(page, {
    hasText: 'invalid configuration',
  });
}

export async function uiFillHTTPStatuses(
  input: Locator,
  ...statuses: string[]
) {
  for (const status of statuses) {
    await input.fill(status);
    await input.press('Enter');
  }
}

export const uiClearMonacoEditor = async (page: Page, editor: Locator) => {
  await editor.click();
  await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard.press('Backspace');
  await editor.blur();
};

export const uiGetMonacoEditor = async (
  page: Page,
  parent: Locator,
  clear = true
) => {
  // Wait for Monaco editor to load
  const editorLoading = parent.getByTestId('editor-loading');
  await expect(editorLoading).toBeHidden();
  const editor = parent.locator('.monaco-editor').first();
  await expect(editor).toBeVisible({ timeout: 10000 });

  if (clear) {
    await uiClearMonacoEditor(page, editor);
  }

  return editor;
};

export const uiFillMonacoEditor = async (
  page: Page,
  editor: Locator,
  value: string
) => {
  await editor.click();
  await editor.getByRole('textbox').pressSequentially(value);
  await editor.blur();
  await page.waitForTimeout(800);
};
