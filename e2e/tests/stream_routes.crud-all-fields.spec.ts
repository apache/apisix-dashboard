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
import { streamRoutesPom } from '@e2e/pom/stream_routes';
import { e2eReq } from '@e2e/utils/req';
import { test } from '@e2e/utils/test';
import { uiHasToastMsg } from '@e2e/utils/ui';
import {
  uiCheckStreamRouteRequiredFields,
  uiFillStreamRouteRequiredFields,
} from '@e2e/utils/ui/stream_routes';
import { expect } from '@playwright/test';

import { deleteAllStreamRoutes } from '@/apis/stream_routes';

test.describe.configure({ mode: 'serial' });

test.beforeAll('clean up', async () => {
  await deleteAllStreamRoutes(e2eReq);
});

test('CRUD stream route with all fields', async ({ page }) => {
  // Navigate to stream routes page
  await streamRoutesPom.toIndex(page);
  await expect(page.getByRole('heading', { name: 'Stream Routes' })).toBeVisible();

  // Navigate to add page
  await streamRoutesPom.toAdd(page);
  await expect(page.getByRole('heading', { name: 'Add Stream Route' })).toBeVisible({ timeout: 30000 });

  const streamRouteData = {
    server_addr: '127.0.0.10',
    server_port: 9100,
    remote_addr: '192.168.10.0/24',
    sni: 'edge.example.com',
    desc: 'Stream route with optional fields',
    labels: {
      env: 'production',
      version: '2.0',
      region: 'us-west',
    },
  } as const;

  await uiFillStreamRouteRequiredFields(page, streamRouteData);

  // Submit and land on detail page
  await page.getByRole('button', { name: 'Add', exact: true }).click();

  // Wait for success toast before checking detail page
  await uiHasToastMsg(page, {
    hasText: 'Add Stream Route Successfully',
  });

  await streamRoutesPom.isDetailPage(page);

  // Verify initial values in detail view
  await uiCheckStreamRouteRequiredFields(page, streamRouteData);

  // Enter edit mode from detail page
  await page.getByRole('button', { name: 'Edit' }).click();
  await expect(page.getByRole('heading', { name: 'Edit Stream Route' })).toBeVisible();
  await uiCheckStreamRouteRequiredFields(page, streamRouteData);

  // Edit fields - update description, add a label, and modify server settings
  const updatedData = {
    server_addr: '127.0.0.20',
    server_port: 9200,
    remote_addr: '10.10.0.0/16',
    sni: 'edge-updated.example.com',
    desc: 'Updated stream route with optional fields',
    labels: {
      ...streamRouteData.labels,
      updated: 'true',
    },
  } as const;

  await page
    .getByLabel('Server Address', { exact: true })
    .fill(updatedData.server_addr);
  await page
    .getByLabel('Server Port', { exact: true })
    .fill(updatedData.server_port.toString());
  await page.getByLabel('Remote Address').fill(updatedData.remote_addr);
  await page.getByLabel('SNI').fill(updatedData.sni);
  await page.getByLabel('Description').first().fill(updatedData.desc);

  const labelsField = page.getByPlaceholder('Input text like `key:value`,').first();
  await labelsField.fill('updated:true');
  await labelsField.press('Enter');

  // Submit edit and return to detail page
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await streamRoutesPom.isDetailPage(page);

  // Verify updated values from detail view
  await uiCheckStreamRouteRequiredFields(page, updatedData);

  // Navigate back to index and locate the updated row
  await streamRoutesPom.toIndex(page);
  const updatedRow = page
    .getByRole('row')
    .filter({ hasText: updatedData.server_addr });
  await expect(updatedRow).toBeVisible();

  // View detail page from the list to double-check values
  await updatedRow.getByRole('button', { name: 'View' }).click();
  await streamRoutesPom.isDetailPage(page);
  await uiCheckStreamRouteRequiredFields(page, updatedData);

  // Delete from detail page
  await page.getByRole('button', { name: 'Delete' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click();

  await streamRoutesPom.isIndexPage(page);
  await expect(
    page.getByRole('row').filter({ hasText: updatedData.server_addr })
  ).toHaveCount(0);
});
