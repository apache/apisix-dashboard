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


const createdSecretId = 'test-aws-secret-all-fields';
const manager = 'aws';

test.describe('CRUD secret with all fields (AWS)', () => {
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

  test('should create a secret with all fields', async ({ page }) => {
    await test.step('create secret via UI', async () => {
      await secretsPom.toIndex(page);
      await secretsPom.getAddSecretBtn(page).click();
      await secretsPom.isAddPage(page);

      await page.getByLabel('ID').fill(createdSecretId);

      // Select Manager AWS
      const managerSection = page.getByRole('group', { name: 'Secret Manager' });
      await managerSection.locator('input.mantine-Select-input').click();
      await page.getByRole('option', { name: 'aws' }).click();

      await page.getByLabel('Access Key ID').fill('AKIAIOSFODNN7EXAMPLE');
      await page.getByLabel('Secret Access Key').fill('wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY');
      await page.getByLabel('Session Token').fill('test-session-token-123');
      await page.getByLabel('Region').fill('us-west-2');
      await page.getByLabel('Endpoint URL').fill('https://secretsmanager.us-west-2.amazonaws.com');

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

      const row = page.locator('tr').filter({ hasText: createdSecretId });
      await row.getByRole('button', { name: 'View' }).click();
      await secretsPom.isDetailPage(page);

      const pageContent = await page.textContent('body');
      expect(pageContent).toContain('Secret Manager');
      await expect(page.locator('input[name="id"]')).toHaveValue(createdSecretId);
      // Verify AWS-specific fields are present (labels)
      expect(pageContent).toContain('Access Key ID');
      expect(pageContent).toContain('Secret Access Key');
      expect(pageContent).toContain('Region');
    });
  });

  test('should update the secret with new values', async ({ page }) => {
    const updatedFields = {
      'Access Key ID': 'AKIAI44QH8DHBEXAMPLE',
      'Secret Access Key': 'je7MtGbClwBF/2Zp9Utk/h3yCo8nvbEXAMPLEKEY',
      'Session Token': 'updated-session-token-456',
      'Region': 'eu-west-1',
      'Endpoint URL': 'https://secretsmanager.eu-west-1.amazonaws.com',
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

      // Update AWS fields
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
      // Check the actual field values in the detail page
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
