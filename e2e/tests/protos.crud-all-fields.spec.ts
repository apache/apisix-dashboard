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
package test;

message TestMessage {
  string name = 1;
  int32 age = 2;
  string email = 3;
}`;

let createdProtoId: string;

test.describe('CRUD proto with all fields', () => {
  test.describe.configure({ mode: 'serial' });

  test.afterAll(async () => {
    // cleanup: delete the proto
    if (createdProtoId) {
      await e2eReq.delete(`${API_PROTOS}/${createdProtoId}`).catch(() => {
        // ignore error if proto doesn't exist
      });
    }
  });

  test('should create a proto with all fields', async ({ page }) => {
    await test.step('navigate to add proto page', async () => {
      await protosPom.toAdd(page);
      await protosPom.isAddPage(page);
    });

    await test.step('fill in all fields', async () => {
      // Fill Content (ID is auto-generated, proto only has content field)
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

      // Find the proto with our content (search for exact package name)
      const createdProto = protos.list.find((p) =>
        p.value.content?.includes('package test;')
      );
      expect(createdProto).toBeDefined();
      expect(createdProto?.value.id).toBeDefined();
      // eslint-disable-next-line playwright/no-conditional-in-test
      createdProtoId = createdProto?.value.id || '';

      // Verify content matches
      expect(createdProto?.value.content).toBe(protoContent);
    });
  });

  test('should read/view the proto details', async () => {
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
  });

  test('should update the proto with new values', async () => {
    const updatedContent = `syntax = "proto3";
package test_updated;

message UpdatedTestMessage {
  string updated_name = 1;
  int32 updated_age = 2;
  string email = 3;
  bool is_active = 4;
}`;

    await test.step('update proto via API', async () => {
      await e2eReq.put(`${API_PROTOS}/${createdProtoId}`, {
        content: updatedContent,
      });
    });

    await test.step('verify proto was updated via API', async () => {
      const proto = await e2eReq
        .get<unknown, APISIXType['RespProtoDetail']>(
          `${API_PROTOS}/${createdProtoId}`
        )
        .then((v) => v.data);

      expect(proto.value?.id).toBe(createdProtoId);
      expect(proto.value?.content).toBe(updatedContent);
    });
  });

  test('should delete the proto', async () => {
    await test.step('delete proto via API', async () => {
      await e2eReq.delete(`${API_PROTOS}/${createdProtoId}`);
    });

    await test.step('verify proto was deleted via API', async () => {
      await expect(async () => {
        await e2eReq.get(`${API_PROTOS}/${createdProtoId}`);
      }).rejects.toThrow();
    });
  });
});
