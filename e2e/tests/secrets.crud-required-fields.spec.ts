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
import { secretsPom } from '@e2e/pom/secrets';
import { e2eReq } from '@e2e/utils/req';
import { test } from '@e2e/utils/test';
import { expect } from '@playwright/test';

import { API_SECRETS } from '@/config/constant';

const createdSecretId = 'test-vault-secret-required';
const manager = 'vault';

test.describe('CRUD secret with required fields only (Vault)', () => {
  test.describe.configure({ mode: 'serial' });

  test.afterAll(async () => {
    // cleanup: delete the secret
    if (createdSecretId) {
      await e2eReq.delete(`${API_SECRETS}/${manager}/${createdSecretId}`).catch((err) => {
        // ignore 404 error if secret doesn't exist, rethrow others
        if (err.response?.status !== 404 && !err.message.includes('404')) {
          throw err;
        }
      });
    }
  });

  test('should create a secret with required fields', async ({ page }) => {
    await test.step('create secret via UI', async () => {
      await secretsPom.toIndex(page);
      await secretsPom.getAddSecretBtn(page).click();
      await secretsPom.isAddPage(page);

      await page.getByLabel('ID').fill(createdSecretId);

      // Vault is default
      await page.getByLabel('URI').fill('http://vault.example.com:8200');
      await page.getByLabel('Prefix').fill('/secret/test');
      await page.getByLabel('Token').fill('test-vault-token-123');

      await secretsPom.getAddBtn(page).click();
    });

    await test.step('verify secret appears in UI', async () => {
      await secretsPom.isIndexPage(page);
      const row = page.locator('tr').filter({ hasText: createdSecretId });
      await expect(row).toBeVisible();
    });
  });

  test('should read/view the secret details', async ({ page }) => {
    await test.step('navigate to secret details page and verify UI', async () => {
      await secretsPom.toIndex(page);
      await secretsPom.isIndexPage(page);

      // Find and click the View button for the created secret
      const row = page.locator('tr').filter({ hasText: createdSecretId });
      await row.getByRole('button', { name: 'View' }).click();
      await secretsPom.isDetailPage(page);

      // Assert Vault field values using input selectors
      await expect(page.getByLabel('URI')).toHaveValue('http://vault.example.com:8200');
      await expect(page.getByLabel('Prefix')).toHaveValue('/secret/test');
      await expect(page.getByLabel('Token')).toHaveValue('test-vault-token-123');
    });
  });

  test('should update the secret', async ({ page }) => {
    const updatedFields = {
      URI: 'http://vault-updated.example.com:8200',
      Prefix: '/secret/updated',
      Token: 'updated-vault-token-456',
    };

    await test.step('navigate to secret detail page', async () => {
      await secretsPom.toIndex(page);
      await secretsPom.isIndexPage(page);

      const row = page.locator('tr').filter({ hasText: createdSecretId });
      await row.getByRole('button', { name: 'View' }).click();
      await secretsPom.isDetailPage(page);
    });

    await test.step('enter edit mode and update fields', async () => {
      await page.getByRole('button', { name: 'Edit' }).click();

      // Update Vault fields
      for (const [label, value] of Object.entries(updatedFields)) {
        await page.getByLabel(label).clear();
        await page.getByLabel(label).fill(value);
      }
    });

    await test.step('save the changes', async () => {
      await page.getByRole('button', { name: 'Save' }).click();
      await secretsPom.isDetailPage(page);
    });

    await test.step('verify secret was updated via UI', async () => {
      for (const [label, value] of Object.entries(updatedFields)) {
        await expect(page.getByLabel(label)).toHaveValue(value);
      }
    });
  });

  test('should delete the secret', async ({ page }) => {
    await test.step('navigate to detail page and delete', async () => {
      await secretsPom.toIndex(page);
      await secretsPom.isIndexPage(page);

      const row = page.locator('tr').filter({ hasText: createdSecretId });
      await row.getByRole('button', { name: 'View' }).click();
      await secretsPom.isDetailPage(page);

      await page.getByRole('button', { name: 'Delete' }).click();

      const deleteDialog = page.getByRole('dialog', { name: 'Delete Secret' });
      await expect(deleteDialog).toBeVisible();
      await deleteDialog.getByRole('button', { name: 'Delete' }).click();
    });

    await test.step('verify deletion and redirect', async () => {
      await secretsPom.isIndexPage(page);
      await expect(page.getByRole('cell', { name: createdSecretId })).toBeHidden();
    });

    await test.step('verify secret was deleted via API', async () => {
      await expect(async () => {
        await e2eReq.get(`${API_SECRETS}/${manager}/${createdSecretId}`);
      }).rejects.toThrow();
    });
  });
});
