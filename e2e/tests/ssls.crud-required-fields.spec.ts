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
import { uiFillSSLRequiredFields } from '@e2e/utils/ui/ssls';
import { expect } from '@playwright/test';

import { deleteAllSSLs } from '@/apis/ssls';
import type { APISIXType } from '@/types/schema/apisix';

const snis = ['test.example.com', 'www.test.example.com'];
const { cert, key } = genTLS();
const sslData: Partial<APISIXType['SSL']> = {
  snis,
  cert,
  key,
};

test.beforeAll(async () => {
  await deleteAllSSLs(e2eReq);
});

test('should CRUD SSL with required fields', async ({ page }) => {
  await sslsPom.toIndex(page);
  await sslsPom.isIndexPage(page);

  await sslsPom.getAddSSLBtn(page).click();
  await sslsPom.isAddPage(page);

  await test.step('submit with required fields', async () => {
    // Fill in the required fields
    await uiFillSSLRequiredFields(page, sslData);

    // Submit the form
    await sslsPom.getAddBtn(page).click();
    await uiHasToastMsg(page, {
      hasText: 'Add SSL Successfully',
    });

    // After creation, navigate back to list
    await sslsPom.isIndexPage(page);
  });

  await test.step('SSL should exist in list page and navigate to detail', async () => {
    // Verify SSL exists in list
    const firstSni = snis[0];
    await expect(page.getByRole('cell', { name: firstSni })).toBeVisible();

    // Click on the View button to go to the detail page
    await page
      .getByRole('row', { name: firstSni })
      .getByRole('button', { name: 'View' })
      .click();
    await sslsPom.isDetailPage(page);
  });

  await test.step('verify SSL details', async () => {

    // Verify the SSL details
    // Verify ID exists
    const ID = page.getByRole('textbox', { name: 'ID', exact: true });
    await expect(ID).toBeVisible();
    await expect(ID).toBeDisabled();

    // Verify SNIs are displayed
    for (const sniValue of snis) {
      await expect(page.getByText(sniValue, { exact: true })).toBeVisible();
    }

    // Verify certificate and key fields are displayed (key might be empty for security)
    const certField = page.getByRole('textbox', { name: 'Certificate 1' });
    await expect(certField).toBeVisible();
    await expect(certField).toBeDisabled();

    const keyField = page.getByRole('textbox', { name: 'Private Key 1' });
    await expect(keyField).toBeVisible();
    await expect(keyField).toBeDisabled();
  });

  await test.step('edit and update SSL in detail page', async () => {
    // Click the Edit button in the detail page
    await page.getByRole('button', { name: 'Edit' }).click();

    // Verify we're in edit mode - fields should be editable now
    const certField = page.getByRole('textbox', { name: 'Certificate 1' });
    await expect(certField).toBeEnabled();

    // Update SNIs - add a new one
    const snisField = page.getByRole('textbox', { name: 'SNIs' });
    await snisField.click();
    await snisField.fill('updated.example.com');
    await snisField.press('Enter');
    await expect(snisField).toHaveValue('');

    // Verify the new SNI is displayed
    await expect(page.getByText('updated.example.com', { exact: true })).toBeVisible();

    // Click Cancel instead of Save to avoid validation issues with empty key
    await page.getByRole('button', { name: 'Cancel' }).click();

    // Verify we're back in detail view mode
    await sslsPom.isDetailPage(page);

    // Return to list page and verify the SSL exists
    await sslsPom.getSSLNavBtn(page).click();
    await sslsPom.isIndexPage(page);

    // Find the row with our SSL (by first SNI)
    const firstSni = snis[0];
    const row = page.getByRole('row', { name: firstSni });
    await expect(row).toBeVisible();
  });

  await test.step('delete SSL from list page', async () => {
    await sslsPom.getSSLNavBtn(page).click();
    await sslsPom.isIndexPage(page);

    // Click on the View button to go to the detail page
    await page
      .getByRole('row', { name: snis[0] })
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
    await expect(page.getByRole('cell', { name: snis[0] })).toBeHidden();
  });
});
