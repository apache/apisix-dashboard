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
import { sslsPom } from '@e2e/pom/ssls';
import { genTLS } from '@e2e/utils/common';
import { e2eReq } from '@e2e/utils/req';
import { test } from '@e2e/utils/test';
import { uiHasToastMsg } from '@e2e/utils/ui';
import { uiCheckLabels } from '@e2e/utils/ui/labels';
import { uiFillSSLRequiredFields } from '@e2e/utils/ui/ssls';
import { expect } from '@playwright/test';

import { deleteAllSSLs } from '@/apis/ssls';
import type { APISIXType } from '@/types/schema/apisix';

const snis = [
  'full-test.example.com',
  'www.full-test.example.com',
  'api.full-test.example.com',
];
const { cert, key } = genTLS();

const initialLabels = {
  env: 'production',
  version: 'v1',
  team: 'backend',
};

const sslDataAllFields: Partial<APISIXType['SSL']> = {
  snis,
  cert,
  key,
  labels: initialLabels,
  status: 1, // Enabled
};

test.beforeAll(async () => {
  await deleteAllSSLs(e2eReq);
});

test('should CRUD SSL with all fields', async ({ page }) => {
  test.slow();

  await sslsPom.toIndex(page);
  await sslsPom.isIndexPage(page);

  await sslsPom.getAddSSLBtn(page).click();
  await sslsPom.isAddPage(page);

  await test.step('fill in all fields', async () => {
    // Fill in required fields
    await uiFillSSLRequiredFields(page, sslDataAllFields);

    // Set Status to Enabled
    const statusField = page.getByRole('textbox', {
      name: 'Status',
      exact: true,
    });
    await statusField.click();
    await page.getByRole('option', { name: 'Enabled' }).click();
    await expect(statusField).toHaveValue('Enabled');

    // Add SSL Protocols
    const sslProtocolsField = page.getByRole('textbox', {
      name: 'SSL Protocols',
    });
    await sslProtocolsField.click();
    await page.getByRole('option', { name: 'TLSv1.2' }).click();
    await page.getByRole('option', { name: 'TLSv1.3' }).click();
    await page.keyboard.press('Escape');

    // Verify protocols are selected
    const protocolsContainer = sslProtocolsField.locator('..');
    await expect(protocolsContainer).toContainText('TLSv1.2');
    await expect(protocolsContainer).toContainText('TLSv1.3');

    // Submit the form
    await sslsPom.getAddBtn(page).click();
    await uiHasToastMsg(page, {
      hasText: 'Add SSL Successfully',
    });

    // Navigate back to list
    await sslsPom.isIndexPage(page);
  });

  await test.step('navigate to detail and verify all fields', async () => {
    // Click View to go to detail page
    const firstSni = snis[0];
    await page
      .getByRole('row', { name: firstSni })
      .getByRole('button', { name: 'View' })
      .click();
    await sslsPom.isDetailPage(page);

    // Verify ID exists
    const ID = page.getByRole('textbox', { name: 'ID', exact: true });
    await expect(ID).toBeVisible();
    await expect(ID).toBeDisabled();

    // Verify SNIs
    for (const sniValue of snis) {
      await expect(page.getByText(sniValue, { exact: true })).toBeVisible();
    }

    // Verify certificate
    const cert1Field = page.getByRole('textbox', { name: 'Certificate 1' });
    await expect(cert1Field).toBeVisible();
    await expect(cert1Field).toBeDisabled();

    // Verify Status
    const statusField = page.getByRole('textbox', {
      name: 'Status',
      exact: true,
    });
    await expect(statusField).toHaveValue('Enabled');

    // Verify SSL Protocols
    const protocolsField = page.getByRole('textbox', {
      name: 'SSL Protocols',
    });
    const protocolsContainer = protocolsField.locator('..');
    await expect(protocolsContainer).toContainText('TLSv1.2');
    await expect(protocolsContainer).toContainText('TLSv1.3');

    // Verify Labels
    await uiCheckLabels(page, initialLabels);
  });

  await test.step('verify can enter edit mode', async () => {
    // Click the Edit button
    await page.getByRole('button', { name: 'Edit' }).click();

    // Verify we're in edit mode
    const cert1Field = page.getByRole('textbox', { name: 'Certificate 1' });
    await expect(cert1Field).toBeEnabled();

    // Cancel without making changes
    await page.getByRole('button', { name: 'Cancel' }).click();

    // Return to list page
    await sslsPom.getSSLNavBtn(page).click();
    await sslsPom.isIndexPage(page);
  });

  await test.step('delete SSL in detail page', async () => {
    // Navigate to detail page
    const firstSni = snis[0];
    await page
      .getByRole('row', { name: firstSni })
      .getByRole('button', { name: 'View' })
      .click();
    await sslsPom.isDetailPage(page);

    // Delete the SSL
    await page.getByRole('button', { name: 'Delete' }).click();

    await page
      .getByRole('dialog', { name: 'Delete SSL' })
      .getByRole('button', { name: 'Delete' })
      .click();

    // Will redirect to SSLs page
    await sslsPom.isIndexPage(page);
    await uiHasToastMsg(page, {
      hasText: 'Delete SSL Successfully',
    });
    await expect(page.getByRole('cell', { name: firstSni })).toBeHidden();

    // Final verification: Reload the page and check again
    await page.reload();
    await sslsPom.isIndexPage(page);

    // After reload, the SSL should still be gone
    await expect(page.getByRole('cell', { name: firstSni })).toBeHidden();
  });
});
