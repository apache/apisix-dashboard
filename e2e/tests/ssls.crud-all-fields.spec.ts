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
import { uiCheckLabels, uiFillLabels } from '@e2e/utils/ui/labels';
import { uiFillSSLRequiredFields } from '@e2e/utils/ui/ssls';
import { expect } from '@playwright/test';

import { deleteAllSSLs } from '@/apis/ssls';
import type { APISIXType } from '@/types/schema/apisix';

const sni = 'full-test.example.com';
const snis = [
  'full-test.example.com',
  'www.full-test.example.com',
  'api.full-test.example.com',
];
const { cert, key } = genTLS();
const { cert: cert2, key: key2 } = genTLS();
const { cert: caCert } = genTLS();

const initialLabels = {
  env: 'production',
  version: 'v1',
  team: 'backend',
};

const updatedLabels = {
  env: 'staging',
  version: 'v2',
  team: 'frontend',
  region: 'us-west',
};

const sslDataAllFields: Partial<APISIXType['SSL']> = {
  sni,
  snis,
  cert,
  key,
  certs: [cert, cert2],
  keys: [key, key2],
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

    // Add second certificate and key
    await page.getByRole('button', { name: 'Add Certificate' }).click();
    await page.getByRole('textbox', { name: 'Certificate 2' }).fill(cert2);
    await page.getByRole('textbox', { name: 'Private Key 2' }).fill(key2);

    // Set Type
    const typeField = page.getByRole('textbox', { name: 'Type', exact: true });
    await typeField.click();
    await page.getByRole('option', { name: 'server' }).click();
    await expect(typeField).toHaveValue('server');

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

    // Expand Client section
    const clientSection = page.getByText('Client').locator('..');

    // Add CA certificate
    const caField = clientSection.getByRole('textbox', { name: 'CA' });
    await caField.fill(caCert);

    // Set Depth
    const depthField = clientSection.getByRole('spinbutton', {
      name: 'Depth',
    });
    await depthField.fill('2');

    // Add Skip MTLS URI Regex
    const skipMtlsField = clientSection.getByRole('textbox', {
      name: 'Skip MTLS URI Regex',
    });
    await skipMtlsField.click();
    await skipMtlsField.fill('/public/.*');
    await skipMtlsField.press('Enter');
    await expect(skipMtlsField).toHaveValue('');
    await expect(clientSection.getByText('/public/.*')).toBeVisible();

    // Submit the form
    await sslsPom.getAddBtn(page).click();
    await uiHasToastMsg(page, {
      hasText: 'Add SSL Successfully',
    });
  });

  await test.step('auto navigate to SSL detail page and verify all fields', async () => {
    await sslsPom.isDetailPage(page);

    // Verify ID exists
    const ID = page.getByRole('textbox', { name: 'ID', exact: true });
    await expect(ID).toBeVisible();
    await expect(ID).toBeDisabled();

    // Verify SNI
    const sniField = page.getByLabel('SNI', { exact: true });
    await expect(sniField).toHaveValue(sni);
    await expect(sniField).toBeDisabled();

    // Verify SNIs
    for (const sniValue of snis) {
      await expect(page.getByText(sniValue)).toBeVisible();
    }

    // Verify certificates
    const cert1Field = page.getByRole('textbox', { name: 'Certificate 1' });
    await expect(cert1Field).toBeVisible();
    await expect(cert1Field).toHaveValue(cert);
    await expect(cert1Field).toBeDisabled();

    const cert2Field = page.getByRole('textbox', { name: 'Certificate 2' });
    await expect(cert2Field).toBeVisible();
    await expect(cert2Field).toHaveValue(cert2);
    await expect(cert2Field).toBeDisabled();

    // Verify keys
    const key1Field = page.getByRole('textbox', { name: 'Private Key 1' });
    await expect(key1Field).toBeVisible();
    await expect(key1Field).toHaveValue(key);
    await expect(key1Field).toBeDisabled();

    const key2Field = page.getByRole('textbox', { name: 'Private Key 2' });
    await expect(key2Field).toBeVisible();
    await expect(key2Field).toHaveValue(key2);
    await expect(key2Field).toBeDisabled();

    // Verify Type
    const typeField = page.getByRole('textbox', { name: 'Type', exact: true });
    await expect(typeField).toHaveValue('server');

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

    // Verify Client section
    const clientSection = page.getByText('Client').locator('..');

    // Verify CA
    const caField = clientSection.getByRole('textbox', { name: 'CA' });
    await expect(caField).toHaveValue(caCert);

    // Verify Depth
    const depthField = clientSection.getByRole('spinbutton', {
      name: 'Depth',
    });
    await expect(depthField).toHaveValue('2');

    // Verify Skip MTLS URI Regex
    await expect(clientSection.getByText('/public/.*')).toBeVisible();

    // Verify Labels
    await uiCheckLabels(page, initialLabels);
  });

  await test.step('edit and update SSL in detail page', async () => {
    // Click the Edit button
    await page.getByRole('button', { name: 'Edit' }).click();

    // Verify we're in edit mode
    const cert1Field = page.getByRole('textbox', { name: 'Certificate 1' });
    await expect(cert1Field).toBeEnabled();

    // Update Type to client
    const typeField = page.getByRole('textbox', { name: 'Type', exact: true });
    await typeField.click();
    await page.getByRole('option', { name: 'client' }).click();
    await expect(typeField).toHaveValue('client');

    // Update Status to Disabled
    const statusField = page.getByRole('textbox', {
      name: 'Status',
      exact: true,
    });
    await statusField.click();
    await page.getByRole('option', { name: 'Disabled' }).click();
    await expect(statusField).toHaveValue('Disabled');

    // Update SSL Protocols - remove TLSv1.2, keep TLSv1.3
    const sslProtocolsField = page.getByRole('textbox', {
      name: 'SSL Protocols',
    });
    const protocolsContainer = sslProtocolsField.locator('..');

    // Remove TLSv1.2
    await protocolsContainer
      .getByText('TLSv1.2')
      .locator('..')
      .getByRole('button', { name: 'close' })
      .click();

    // Verify TLSv1.2 is removed
    await expect(protocolsContainer.getByText('TLSv1.2')).toBeHidden();
    await expect(protocolsContainer).toContainText('TLSv1.3');

    // Update Client section Depth
    const clientSection = page.getByText('Client').locator('..');
    const depthField = clientSection.getByRole('spinbutton', {
      name: 'Depth',
    });
    await depthField.fill('3');

    // Update Labels
    await uiFillLabels(page, updatedLabels);

    // Add another SNI
    const snisField = page.getByRole('textbox', { name: 'SNIs' });
    await snisField.click();
    await snisField.fill('new.full-test.example.com');
    await snisField.press('Enter');
    await expect(snisField).toHaveValue('');
    await expect(page.getByText('new.full-test.example.com')).toBeVisible();

    // Save changes
    const saveBtn = page.getByRole('button', { name: 'Save' });
    await saveBtn.click();

    // Verify the update was successful
    await uiHasToastMsg(page, {
      hasText: 'success',
    });

    // Verify we're back in detail view mode
    await sslsPom.isDetailPage(page);

    // Verify updated Type
    const updatedTypeField = page.getByRole('textbox', {
      name: 'Type',
      exact: true,
    });
    await expect(updatedTypeField).toHaveValue('client');

    // Verify updated Status
    const updatedStatusField = page.getByRole('textbox', {
      name: 'Status',
      exact: true,
    });
    await expect(updatedStatusField).toHaveValue('Disabled');

    // Verify updated Depth
    const updatedClientSection = page.getByText('Client').locator('..');
    const updatedDepthField = updatedClientSection.getByRole('spinbutton', {
      name: 'Depth',
    });
    await expect(updatedDepthField).toHaveValue('3');

    // Verify updated Labels
    await uiCheckLabels(page, updatedLabels);

    // Verify new SNI
    await expect(page.getByText('new.full-test.example.com')).toBeVisible();

    // Return to list page
    await sslsPom.getSSLNavBtn(page).click();
    await sslsPom.isIndexPage(page);

    // Find the row with our SSL
    const row = page.getByRole('row', { name: sni });
    await expect(row).toBeVisible();
  });

  await test.step('delete SSL in detail page', async () => {
    // Navigate to detail page
    await page
      .getByRole('row', { name: sni })
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
    await expect(page.getByRole('cell', { name: sni })).toBeHidden();

    // Final verification: Reload the page and check again
    await page.reload();
    await sslsPom.isIndexPage(page);

    // After reload, the SSL should still be gone
    await expect(page.getByRole('cell', { name: sni })).toBeHidden();
  });
});
