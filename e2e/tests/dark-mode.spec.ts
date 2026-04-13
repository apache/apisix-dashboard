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
import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

const themeOptionNameByValue = {
  auto: 'System theme',
  dark: 'Dark theme',
  light: 'Light theme',
} as const;

const themeOption = (page: Page, value: keyof typeof themeOptionNameByValue) =>
  page.getByRole('radio', { name: themeOptionNameByValue[value], exact: true });

test.describe('Dark Mode', () => {
  test(
    'auto mode resolves to dark when OS prefers dark',
    { tag: '@dark-mode' },
    async ({ page }) => {
      await test.step('emulate OS dark preference', async () => {
        await page.emulateMedia({ colorScheme: 'dark' });
      });

      await test.step('activate auto mode', async () => {
        await themeOption(page, 'auto').dispatchEvent('click');
        await page.reload();
      });

      await test.step('verify dark scheme applied', async () => {
        await expect(page.locator('html')).toHaveAttribute(
          'data-mantine-color-scheme',
          'dark'
        );
      });
    }
  );

  test(
    'theme preference persists across reload',
    { tag: '@dark-mode' },
    async ({ page }) => {
      await test.step('switch to dark mode', async () => {
        await themeOption(page, 'dark').dispatchEvent('click');
        await expect(page.locator('html')).toHaveAttribute(
          'data-mantine-color-scheme',
          'dark'
        );
      });

      await test.step('reload and verify persistence', async () => {
        await page.reload();
        await expect(page.locator('html')).toHaveAttribute(
          'data-mantine-color-scheme',
          'dark'
        );
      });

      await test.step('verify localStorage value', async () => {
        const stored = await page.evaluate(() =>
          localStorage.getItem('mantine-color-scheme-value')
        );
        expect(stored).toBe('dark');
      });

      await test.step('clean up: restore auto mode', async () => {
        await themeOption(page, 'auto').dispatchEvent('click');
      });
    }
  );

  test(
    'can cycle through all theme modes',
    { tag: '@dark-mode' },
    async ({ page }) => {
      await test.step('switch to light mode', async () => {
        await themeOption(page, 'light').dispatchEvent('click');
        await expect(page.locator('html')).toHaveAttribute(
          'data-mantine-color-scheme',
          'light'
        );
      });

      await test.step('switch to dark mode', async () => {
        await themeOption(page, 'dark').dispatchEvent('click');
        await expect(page.locator('html')).toHaveAttribute(
          'data-mantine-color-scheme',
          'dark'
        );
      });

      await test.step('switch back to auto mode', async () => {
        await themeOption(page, 'auto').dispatchEvent('click');
      });

      await test.step('verify auto mode resolves correctly', async () => {
        const stored = await page.evaluate(() =>
          localStorage.getItem('mantine-color-scheme-value')
        );
        expect(stored).toBe('auto');
      });
    }
  );
});
