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


let createdSecretId: string;
const manager = 'aws';

test.describe('CRUD secret with all fields (AWS)', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeAll(async () => {
    createdSecretId = 'test-aws-secret-all-fields';
  });

  test.afterAll(async () => {
    // cleanup: delete the secret
    if (createdSecretId) {
      await e2eReq.delete(`${API_SECRETS}/${manager}/${createdSecretId}`).catch(() => {
        // ignore error if secret doesn't exist
      });
    }
  });

  test('should create a secret with all fields', async ({ page }) => {
    await test.step('create secret via API', async () => {
      await e2eReq.put(`${API_SECRETS}/${manager}/${createdSecretId}`, {
        access_key_id: 'AKIAIOSFODNN7EXAMPLE',
        secret_access_key: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
        session_token: 'test-session-token-123',
        region: 'us-west-2',
        endpoint_url: 'https://secretsmanager.us-west-2.amazonaws.com',
      });
    });
    await test.step('verify secret appears in UI', async () => {
      await secretsPom.toIndex(page);
      await secretsPom.isIndexPage(page);
      const row = page.locator('tr').filter({ hasText: createdSecretId });
      await expect(row).toBeVisible();
    });
  });

  test('should read/view the secret details', async ({ page }) => {
    await test.step('navigate to secret details page and verify UI', async () => {
      await secretsPom.toIndex(page);
      await secretsPom.isIndexPage(page);

      const row = page.locator('tr').filter({ hasText: createdSecretId });
      await row.getByRole('button', { name: 'View' }).click();
      await secretsPom.isDetailPage(page);

      const pageContent = await page.textContent('body');
      expect(pageContent).toContain('Secret Manager');
      expect(pageContent).toContain(createdSecretId);
      // Verify AWS-specific fields are present (labels)
      expect(pageContent).toContain('Access Key ID');
      expect(pageContent).toContain('Secret Access Key');
      expect(pageContent).toContain('Region');
    });
  });

  test('should update the secret with new values', async ({ page }) => {
    const updatedAccessKeyId = 'AKIAI44QH8DHBEXAMPLE';
    const updatedSecretAccessKey = 'je7MtGbClwBF/2Zp9Utk/h3yCo8nvbEXAMPLEKEY';
    const updatedSessionToken = 'updated-session-token-456';
    const updatedRegion = 'eu-west-1';
    const updatedEndpointUrl = 'https://secretsmanager.eu-west-1.amazonaws.com';

    await test.step('navigate to secret detail page', async () => {
      await secretsPom.toIndex(page);
      await secretsPom.isIndexPage(page);

      const row = page.locator('tr').filter({ hasText: createdSecretId });
      await row.getByRole('button', { name: 'View' }).click();
      await secretsPom.isDetailPage(page);
    });

    await test.step('enter edit mode and update fields', async () => {
      await page.getByRole('button', { name: 'Edit' }).click();

      // Update AWS fields
      await page.getByLabel('Access Key ID').clear();
      await page.getByLabel('Access Key ID').fill(updatedAccessKeyId);
      await page.getByLabel('Secret Access Key').clear();
      await page.getByLabel('Secret Access Key').fill(updatedSecretAccessKey);
      await page.getByLabel('Session Token').clear();
      await page.getByLabel('Session Token').fill(updatedSessionToken);
      await page.getByLabel('Region').clear();
      await page.getByLabel('Region').fill(updatedRegion);
      await page.getByLabel('Endpoint URL').clear();
      await page.getByLabel('Endpoint URL').fill(updatedEndpointUrl);
    });

    await test.step('save the changes', async () => {
      await page.getByRole('button', { name: 'Save' }).click();
      await secretsPom.isDetailPage(page);
    });

    await test.step('verify secret was updated via UI', async () => {
      // Check the actual field values in the detail page
      await expect(page.getByLabel('Access Key ID')).toHaveValue(updatedAccessKeyId);
      await expect(page.getByLabel('Secret Access Key')).toHaveValue(updatedSecretAccessKey);
      await expect(page.getByLabel('Session Token')).toHaveValue(updatedSessionToken);
      await expect(page.getByLabel('Region')).toHaveValue(updatedRegion);
      await expect(page.getByLabel('Endpoint URL')).toHaveValue(updatedEndpointUrl);
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
