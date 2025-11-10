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
import { consumerGroupsPom } from '@e2e/pom/consumer_groups';
import { e2eReq } from '@e2e/utils/req';
import { test } from '@e2e/utils/test';
import { expect } from '@playwright/test';

import {
  deleteAllConsumerGroups,
  putConsumerGroupReq,
} from '@/apis/consumer_groups';
import type { APISIXType } from '@/types/schema/apisix';

test.beforeAll(async () => {
  await deleteAllConsumerGroups(e2eReq);
});

test('should CRUD Consumer Group with required fields', async ({ page }) => {
  const testId = 'test-consumer-group-required';
  const consumerGroupData: APISIXType['ConsumerGroupPut'] = {
    id: testId,
    plugins: {}, // plugins is required but can be empty object
  };

  await test.step('create consumer group via API', async () => {
    // Create via API since UI requires manual plugin selection
    await putConsumerGroupReq(e2eReq, consumerGroupData);
  });

  await test.step('consumer group should exist in list page', async () => {
    await consumerGroupsPom.toIndex(page);
    await consumerGroupsPom.isIndexPage(page);

    // Verify consumer group exists in list
    await expect(
      page.getByRole('cell', { name: testId, exact: true })
    ).toBeVisible();
  });

  await test.step('navigate to detail and verify', async () => {
    // Click View button to go to detail page
    await page
      .getByRole('row', { name: new RegExp(testId) })
      .getByRole('button', { name: 'View' })
      .click();
    await consumerGroupsPom.isDetailPage(page);

    // Verify the ID
    const idField = page.getByRole('textbox', { name: 'ID', exact: true });
    await expect(idField).toHaveValue(testId);
    await expect(idField).toBeDisabled();
  });

  await test.step('verify can edit consumer group', async () => {
    // Click Edit button
    await page.getByRole('button', { name: 'Edit' }).click();

    // Verify we're in edit mode
    const descField = page.getByRole('textbox', { name: 'Description' });
    await expect(descField).toBeEnabled();

    // Verify ID field is still disabled even in edit mode
    const idField = page.getByRole('textbox', { name: 'ID', exact: true });
    await expect(idField).toBeDisabled();

    // Cancel without making changes
    await page.getByRole('button', { name: 'Cancel' }).click();

    // Verify we're back in detail view
    await consumerGroupsPom.isDetailPage(page);
    await expect(descField).toBeDisabled();
  });

  await test.step('delete consumer group', async () => {
    // Click Delete button
    await page.getByRole('button', { name: 'Delete' }).click();

    // Confirm deletion in dialog
    await page
      .getByRole('dialog', { name: 'Delete Consumer Group' })
      .getByRole('button', { name: 'Delete' })
      .click();

    // Should redirect to list page
    await consumerGroupsPom.isIndexPage(page);

    // Verify consumer group is deleted
    await expect(
      page.getByRole('cell', { name: testId, exact: true })
    ).toBeHidden();
  });
});

