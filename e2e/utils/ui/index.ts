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
import { type Monaco } from '@monaco-editor/react';
import { expect, type Locator, type Page } from '@playwright/test';

import type { FileRouteTypes } from '@/routeTree.gen';

import { env } from '../env';

export const uiGoto = (page: Page, path: FileRouteTypes['to']) => {
  return page.goto(`${env.E2E_TARGET_URL}${path.substring(1)}`);
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

export async function uiClearEditor(page: Page) {
  await page.evaluate(() => {
    (window as unknown as { monaco?: Monaco })?.monaco?.editor
      ?.getEditors()[0]
      ?.setValue('');
  });
};
