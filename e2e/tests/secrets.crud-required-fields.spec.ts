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
import { e2eReq } from '@e2e/utils/req';
import { test } from '@e2e/utils/test';
import { expect } from '@playwright/test';

import { API_SECRETS } from '@/config/constant';
import type { APISIXType } from '@/types/schema/apisix';

let createdSecretId: string;
const manager = 'vault';

test.describe('CRUD secret with required fields only (Vault)', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeAll(async () => {
    createdSecretId = 'test-vault-secret-required';
  });

  test.afterAll(async () => {
    // cleanup: delete the secret
    if (createdSecretId) {
      await e2eReq.delete(`${API_SECRETS}/${manager}/${createdSecretId}`).catch(() => {
        // ignore error if secret doesn't exist
      });
    }
  });

  test('should create a secret with required fields', async () => {
    await test.step('create secret via API', async () => {
      await e2eReq.put(`${API_SECRETS}/${manager}/${createdSecretId}`, {
        uri: 'http://vault.example.com:8200',
        prefix: '/secret/test',
        token: 'test-vault-token-123',
      });
    });

    await test.step('verify secret was created via API', async () => {
      const secret = await e2eReq
        .get<unknown, APISIXType['RespSecretDetail']>(
          `${API_SECRETS}/${manager}/${createdSecretId}`
        )
        .then((v) => v.data);

      expect(secret.value).toBeDefined();
      // Note: manager is not in the response, it's part of the ID (vault/id)
      const vaultSecret = secret.value as APISIXType['VaultSecret'];
      expect(vaultSecret.uri).toBe('http://vault.example.com:8200');
      expect(vaultSecret.prefix).toBe('/secret/test');
      expect(vaultSecret.token).toBe('test-vault-token-123');
    });
  });

  test('should read/view the secret details', async () => {
    await test.step('verify secret can be retrieved via API', async () => {
      const secret = await e2eReq
        .get<unknown, APISIXType['RespSecretDetail']>(
          `${API_SECRETS}/${manager}/${createdSecretId}`
        )
        .then((v) => v.data);

      expect(secret.value?.id).toContain(createdSecretId);
      // Note: manager is not in the response, it's part of the ID
      const vaultSecret = secret.value as APISIXType['VaultSecret'];
      expect(vaultSecret.uri).toBe('http://vault.example.com:8200');
      expect(vaultSecret.prefix).toBe('/secret/test');
      expect(vaultSecret.token).toBe('test-vault-token-123');
    });
  });

  test('should update the secret', async () => {
    const updatedUri = 'http://vault-updated.example.com:8200';
    const updatedPrefix = '/secret/updated';
    const updatedToken = 'updated-vault-token-456';

    await test.step('update secret via API', async () => {
      await e2eReq.put(`${API_SECRETS}/${manager}/${createdSecretId}`, {
        uri: updatedUri,
        prefix: updatedPrefix,
        token: updatedToken,
      });
    });

    await test.step('verify secret was updated via API', async () => {
      const secret = await e2eReq
        .get<unknown, APISIXType['RespSecretDetail']>(
          `${API_SECRETS}/${manager}/${createdSecretId}`
        )
        .then((v) => v.data);

      // Note: manager is not in the response, it's part of the ID
      const vaultSecret = secret.value as APISIXType['VaultSecret'];
      expect(vaultSecret.uri).toBe(updatedUri);
      expect(vaultSecret.prefix).toBe(updatedPrefix);
      expect(vaultSecret.token).toBe(updatedToken);
    });
  });

  test('should delete the secret', async () => {
    await test.step('delete secret via API', async () => {
      await e2eReq.delete(`${API_SECRETS}/${manager}/${createdSecretId}`);
    });

    await test.step('verify secret was deleted via API', async () => {
      await expect(async () => {
        await e2eReq.get(`${API_SECRETS}/${manager}/${createdSecretId}`);
      }).rejects.toThrow();
    });
  });
});
