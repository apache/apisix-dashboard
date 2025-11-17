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
import type { APISIXType } from '@/types/schema/apisix';

let createdSecretId: string;
const manager = 'vault';

test.describe('CRUD secret with required fields only (Vault)', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeAll(async () => {
    createdSecretId = 'test-vault-secret-required';
  });

  test.afterAll(async () => {
    // cleanup: delete the secret
    if (createdSecretId) {
      await e2eReq.delete(`${API_SECRETS}/${manager}/${createdSecretId}`).catch(() => {
        // ignore error if secret doesn't exist
      });
    }
  });

  test('should create a secret with required fields', async () => {
    await test.step('create secret via API', async () => {
      await e2eReq.put(`${API_SECRETS}/${manager}/${createdSecretId}`, {
        uri: 'http://vault.example.com:8200',
        prefix: '/secret/test',
        token: 'test-vault-token-123',
      });
    });

    await test.step('verify secret was created via API', async () => {
      const secret = await e2eReq
        .get<unknown, APISIXType['RespSecretDetail']>(
          `${API_SECRETS}/${manager}/${createdSecretId}`
        )
        .then((v) => v.data);

      expect(secret.value).toBeDefined();
      // Note: manager is not in the response, it's part of the ID (vault/id)
      const vaultSecret = secret.value as APISIXType['VaultSecret'];
      expect(vaultSecret.uri).toBe('http://vault.example.com:8200');
      expect(vaultSecret.prefix).toBe('/secret/test');
      expect(vaultSecret.token).toBe('test-vault-token-123');
    });
  });

  test('should read/view the secret details', async ({ page }) => {
    await test.step('verify secret can be retrieved via API', async () => {
      const secret = await e2eReq
        .get<unknown, APISIXType['RespSecretDetail']>(
          `${API_SECRETS}/${manager}/${createdSecretId}`
        )
        .then((v) => v.data);

      expect(secret.value?.id).toContain(createdSecretId);
      // Note: manager is not in the response, it's part of the ID
      const vaultSecret = secret.value as APISIXType['VaultSecret'];
      expect(vaultSecret.uri).toBe('http://vault.example.com:8200');
      expect(vaultSecret.prefix).toBe('/secret/test');
      expect(vaultSecret.token).toBe('test-vault-token-123');
    });

    await test.step('navigate to secret details page and verify UI', async () => {
      await secretsPom.toIndex(page);
      await secretsPom.isIndexPage(page);

      // Find and click the View button for the created secret
      const row = page.locator('tr').filter({ hasText: createdSecretId });
      await row.getByRole('button', { name: 'View' }).click();
      
      await secretsPom.isDetailPage(page);

      // Verify the page shows Secret Manager and ID
      const pageContent = await page.textContent('body');
      expect(pageContent).toContain('Secret Manager');
      expect(pageContent).toContain(createdSecretId);
      // Verify Vault-specific fields are present (labels)
      expect(pageContent).toContain('URI');
      expect(pageContent).toContain('Prefix');
      expect(pageContent).toContain('Token');
    });
  });

  test('should update the secret', async ({ page }) => {
    const updatedUri = 'http://vault-updated.example.com:8200';
    const updatedPrefix = '/secret/updated';
    const updatedToken = 'updated-vault-token-456';

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
      await page.getByLabel('URI').clear();
      await page.getByLabel('URI').fill(updatedUri);
      await page.getByLabel('Prefix').clear();
      await page.getByLabel('Prefix').fill(updatedPrefix);
      await page.getByLabel('Token').clear();
      await page.getByLabel('Token').fill(updatedToken);
    });

    await test.step('save the changes', async () => {
      await page.getByRole('button', { name: 'Save' }).click();
      await secretsPom.isDetailPage(page);
    });

    await test.step('verify secret was updated', async () => {
      const pageContent = await page.textContent('body');
      // Verify we're still on detail page with proper fields
      expect(pageContent).toContain('Secret Manager');
      expect(pageContent).toContain(createdSecretId);

      // Verify via API
      const secret = await e2eReq
        .get<unknown, APISIXType['RespSecretDetail']>(
          `${API_SECRETS}/${manager}/${createdSecretId}`
        )
        .then((v) => v.data);

      const vaultSecret = secret.value as APISIXType['VaultSecret'];
      expect(vaultSecret.uri).toBe(updatedUri);
      expect(vaultSecret.prefix).toBe(updatedPrefix);
      expect(vaultSecret.token).toBe(updatedToken);
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
