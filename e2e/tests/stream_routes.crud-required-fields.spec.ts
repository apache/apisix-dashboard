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

test('CRUD stream route with required fields', async ({ page }) => {
  // Navigate to stream routes page
  await streamRoutesPom.toIndex(page);
  await expect(page.getByRole('heading', { name: 'Stream Routes' })).toBeVisible();

  // Navigate to add page
  await streamRoutesPom.toAdd(page);
  await expect(page.getByRole('heading', { name: 'Add Stream Route' })).toBeVisible({ timeout: 30000 });

  const streamRouteData = {
    server_addr: '127.0.0.111',
    server_port: 9000,
  };

  // Fill required fields
  await uiFillStreamRouteRequiredFields(page, streamRouteData);

  // Fill upstream nodes manually
  const upstreamSection = page.getByRole('group', { name: 'Upstream', exact: true });
  const nodesSection = upstreamSection.getByRole('group', { name: 'Nodes' });
  const addBtn = nodesSection.getByRole('button', { name: 'Add a Node' });

  // Add a node
  await addBtn.click();
  const dataRows = nodesSection.locator('tr.ant-table-row');
  const firstRow = dataRows.first();

  const hostInput = firstRow.locator('input').nth(0);
  await hostInput.click();
  await hostInput.fill('127.0.0.2');

  const portInput = firstRow.locator('input').nth(1);
  await portInput.click();
  await portInput.fill('8080');

  const weightInput = firstRow.locator('input').nth(2);
  await weightInput.click();
  await weightInput.fill('1');

  // Submit and land on detail page
  await page.getByRole('button', { name: 'Add', exact: true }).click();

  // Wait for success toast before checking detail page
  await uiHasToastMsg(page, {
    hasText: 'Add Stream Route Successfully',
  });

  await streamRoutesPom.isDetailPage(page);

  // Verify created values in detail view
  await uiCheckStreamRouteRequiredFields(page, streamRouteData);

  // Enter edit mode from detail page
  await page.getByRole('button', { name: 'Edit' }).click();
  await expect(page.getByRole('heading', { name: 'Edit Stream Route' })).toBeVisible();

  // Verify pre-filled values
  await uiCheckStreamRouteRequiredFields(page, streamRouteData);

  // Edit fields - add description and labels
  const updatedData = {
    ...streamRouteData,
    desc: 'Updated stream route description',
    labels: {
      env: 'test',
      version: '1.0',
    },
  };

  await uiFillStreamRouteRequiredFields(page, {
    desc: updatedData.desc,
    labels: updatedData.labels,
  });

  // Submit edit and return to detail page
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await streamRoutesPom.isDetailPage(page);

  // Verify updated values on detail page
  await uiCheckStreamRouteRequiredFields(page, updatedData);

  // Navigate back to index and ensure the row exists
  await streamRoutesPom.toIndex(page);
  const row = page.getByRole('row').filter({ hasText: streamRouteData.server_addr });
  await expect(row.first()).toBeVisible();

  // View detail page from the list
  await row.first().getByRole('button', { name: 'View' }).click();
  await streamRoutesPom.isDetailPage(page);
  await uiCheckStreamRouteRequiredFields(page, updatedData);

  // Delete from the detail page
  await page.getByRole('button', { name: 'Delete' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click();
  await page.waitForURL((url) => url.pathname.endsWith('/stream_routes'));

  await streamRoutesPom.isIndexPage(page);
  await expect(
    page.getByRole('row').filter({ hasText: streamRouteData.server_addr })
  ).toHaveCount(0);
});
