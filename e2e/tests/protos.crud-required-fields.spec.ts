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

import { protosPom } from '@e2e/pom/protos';
import { e2eReq } from '@e2e/utils/req';
import { test } from '@e2e/utils/test';
import { expect } from '@playwright/test';

import { API_PROTOS } from '@/config/constant';
import type { APISIXType } from '@/types/schema/apisix';

const protoContent = `syntax = "proto3";
package test_required;

message TestMessageRequired {
  string name = 1;
  int32 age = 2;
}`;

let createdProtoId: string;

test.describe('CRUD proto with required fields only', () => {
  test.describe.configure({ mode: 'serial' });

  test.afterAll(async () => {
    // cleanup: delete the proto
    if (createdProtoId) {
      await e2eReq.delete(`${API_PROTOS}/${createdProtoId}`).catch(() => {
        // ignore error if proto doesn't exist
      });
    }
  });

  test('should create a proto with required fields', async ({ page }) => {
    await test.step('navigate to add proto page', async () => {
      await protosPom.toAdd(page);
      await protosPom.isAddPage(page);
    });

    await test.step('fill in required fields', async () => {
      // Fill Content (ID is auto-generated)
      await page.getByLabel('Content').fill(protoContent);
    });

    await test.step('submit the form', async () => {
      await page.getByRole('button', { name: 'Add', exact: true }).click();

      // Should redirect to list page after successful creation
      await protosPom.isIndexPage(page);
    });

    await test.step('verify proto was created via API', async () => {
      // Get the list of protos to find the created one
      const protos = await e2eReq
        .get<unknown, APISIXType['RespProtoList']>(API_PROTOS)
        .then((v) => v.data);

      // Find the proto with our content
      const createdProto = protos.list.find((p) =>
        p.value.content?.includes('package test_required')
      );
      expect(createdProto).toBeDefined();
      expect(createdProto?.value.id).toBeDefined();
      // eslint-disable-next-line playwright/no-conditional-in-test
      createdProtoId = createdProto?.value.id || '';

      // Verify content matches
      expect(createdProto?.value.content).toBe(protoContent);
    });
  });

  test('should read/view the proto details', async ({ page }) => {
    await test.step('verify proto can be retrieved via API', async () => {
      const proto = await e2eReq
        .get<unknown, APISIXType['RespProtoDetail']>(
          `${API_PROTOS}/${createdProtoId}`
        )
        .then((v) => v.data);

      expect(proto.value?.id).toBe(createdProtoId);
      expect(proto.value?.content).toBe(protoContent);
      expect(proto.value?.create_time).toBeDefined();
      expect(proto.value?.update_time).toBeDefined();
    });

    await test.step('navigate to proto details page and verify UI', async () => {
      // Navigate to protos list page first
      await protosPom.toIndex(page);
      await protosPom.isIndexPage(page);

      // Find and click the View button for the created proto
      const row = page.locator('tr').filter({ hasText: createdProtoId });
      await row.getByRole('button', { name: 'View' }).click();
      
      // Verify we're on the detail page
      await protosPom.isDetailPage(page);

      // Verify the content is displayed correctly on the details page
      const pageContent = await page.textContent('body');
      expect(pageContent).toContain('package test_required');
      expect(pageContent).toContain('TestMessageRequired');
    });
  });

  test('should update the proto', async ({ page }) => {
    const updatedContent = `syntax = "proto3";
package test_updated;

message UpdatedTestMessage {
  string updated_name = 1;
  int32 updated_age = 2;
  string email = 3;
}`;

    await test.step('navigate to proto detail page', async () => {
      // Should already be on detail page from previous test, but navigate to be safe
      await protosPom.toIndex(page);
      await protosPom.isIndexPage(page);

      const row = page.locator('tr').filter({ hasText: createdProtoId });
      await row.getByRole('button', { name: 'View' }).click();
      await protosPom.isDetailPage(page);
    });

    await test.step('enter edit mode and update content', async () => {
      // Click Edit button to enter edit mode
      await page.getByRole('button', { name: 'Edit' }).click();

      // Clear and fill the content field
      const contentField = page.getByLabel('Content');
      await contentField.clear();
      await contentField.fill(updatedContent);
    });

    await test.step('save the changes', async () => {
      // Click Save button
      await page.getByRole('button', { name: 'Save' }).click();

      // Verify we're back in detail view mode
      await protosPom.isDetailPage(page);
    });

    await test.step('verify proto was updated', async () => {
      // Verify the updated content is displayed
      const pageContent = await page.textContent('body');
      expect(pageContent).toContain('package test_updated');
      expect(pageContent).toContain('UpdatedTestMessage');

      // Also verify via API
      const proto = await e2eReq
        .get<unknown, APISIXType['RespProtoDetail']>(
          `${API_PROTOS}/${createdProtoId}`
        )
        .then((v) => v.data);

      expect(proto.value?.id).toBe(createdProtoId);
      expect(proto.value?.content).toBe(updatedContent);
    });
  });

  test('should delete the proto', async ({ page }) => {
    await test.step('navigate to detail page and delete', async () => {
      // Navigate to protos list page first
      await protosPom.toIndex(page);
      await protosPom.isIndexPage(page);

      // Find and click the View button
      const row = page.locator('tr').filter({ hasText: createdProtoId });
      await row.getByRole('button', { name: 'View' }).click();
      await protosPom.isDetailPage(page);

      // Click Delete button
      await page.getByRole('button', { name: 'Delete' }).click();

      // Confirm deletion in the dialog
      const deleteDialog = page.getByRole('dialog', { name: 'Delete Proto' });
      await expect(deleteDialog).toBeVisible();
      await deleteDialog.getByRole('button', { name: 'Delete' }).click();
    });

    await test.step('verify deletion and redirect', async () => {
      // Should redirect to list page after deletion
      await protosPom.isIndexPage(page);

      // Verify proto is not in the list (check in table cells specifically)
      await expect(page.getByRole('cell', { name: createdProtoId })).toBeHidden();
    });

    await test.step('verify proto was deleted via API', async () => {
      await expect(async () => {
        await e2eReq.get(`${API_PROTOS}/${createdProtoId}`);
      }).rejects.toThrow();
    });
  });
});
