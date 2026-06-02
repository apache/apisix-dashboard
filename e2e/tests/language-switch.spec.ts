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

import { test } from '@e2e/utils/test';
import { expect } from '@playwright/test';

// All non-default languages to switch to (default is 'en')
const switchTargets = ['Deutsch', '中文', 'Español', 'Türkçe', 'English'];

test(
  'switching all languages should not crash the page',
  { tag: '@i18n' },
  async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));

    for (const lang of switchTargets) {
      await test.step(`switch to ${lang}`, async () => {
        const langMenuTrigger = page.locator('button[aria-haspopup="menu"]');
        await langMenuTrigger.click();

        const menuItem = page.getByRole('menuitem', { name: lang });
        await expect(menuItem).toBeVisible();
        await menuItem.click();

        // Verify the page didn't crash
        await expect(page.locator('header')).toBeVisible();
      });
    }

    expect(errors).toEqual([]);
  }
);

test(
  'language menu shows all supported languages',
  { tag: '@i18n' },
  async ({ page }) => {
    const allLanguages = ['English', 'Deutsch', '中文', 'Español', 'Türkçe'];

    const langMenuTrigger = page.locator('button[aria-haspopup="menu"]');
    await langMenuTrigger.click();

    for (const lang of allLanguages) {
      await expect(
        page.getByRole('menuitem', { name: lang })
      ).toBeVisible();
    }
  }
);
