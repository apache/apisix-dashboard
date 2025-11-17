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

import { getAPISIXConf } from '@e2e/utils/common';
import { test } from '@e2e/utils/test';
import { expect } from '@playwright/test';

// use empty storage state to avoid auth
test.use({ storageState: { cookies: [], origins: [] } });

test('can auth with admin key', { tag: '@auth' }, async ({ page }) => {
  const settingsModal = page.getByRole('dialog', { name: 'Settings' });
  const adminKeyInput = page.getByLabel('Admin Key');
  const failedMsg = page.getByText('failed to check token');

  const checkSettingsModal = async () => {
    await expect(failedMsg).toBeVisible();
    await expect(settingsModal).toBeVisible();
    await expect(page.getByText('UI Commit SHA')).toBeVisible();
  };

  await test.step('fill wrong admin key, settings modal always be visible', async () => {
    await checkSettingsModal();

    await expect(adminKeyInput).toBeEmpty();
    await adminKeyInput.fill('wrong-admin-key');
    await page
      .getByRole('dialog', { name: 'Settings' })
      .getByRole('button')
      .click();

    await page.reload();
    await expect(failedMsg).toBeVisible();
    await expect(settingsModal).toBeVisible();
  });

  await test.step('fill correct admin key, settings modal can be hidden', async () => {
    await page.reload();
    await checkSettingsModal();

    const { adminKey } = await getAPISIXConf();
    await adminKeyInput.clear();
    await adminKeyInput.fill(adminKey);
    await page
      .getByRole('dialog', { name: 'Settings' })
      .getByRole('button')
      .click();

    await page.reload();
    await expect(failedMsg).toBeHidden();
  });
});

test('password input can toggle visibility', { tag: '@auth' }, async ({ page }) => {
  const settingsModal = page.getByRole('dialog', { name: 'Settings' });
  const adminKeyInput = page.getByLabel('Admin Key');
  const testPassword = 'test-admin-key-12345';

  await expect(settingsModal).toBeVisible();

  await test.step('verify password input is initially masked', async () => {
    await adminKeyInput.fill(testPassword);

    await expect(adminKeyInput).toHaveAttribute('type', 'password');
  });

  await test.step('reveal password by clicking visibility toggle', async () => {
    // Mantine PasswordInput has a button with class mantine-PasswordInput-visibilityToggle
    const toggleButton = settingsModal.locator(
      '.mantine-PasswordInput-visibilityToggle'
    );

    await toggleButton.click();

    await expect(adminKeyInput).toHaveAttribute('type', 'text');
    await expect(adminKeyInput).toHaveValue(testPassword);
  });

  await test.step('hide password by clicking visibility toggle again', async () => {
    const toggleButton = settingsModal.locator(
      '.mantine-PasswordInput-visibilityToggle'
    );

    await toggleButton.click();

    await expect(adminKeyInput).toHaveAttribute('type', 'password');
    await expect(adminKeyInput).toHaveValue(testPassword);
  });
});
