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
const manager = 'aws';

test.describe('CRUD secret with all fields (AWS)', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeAll(async () => {
    createdSecretId = 'test-aws-secret-all-fields';
  });

  test.afterAll(async () => {
    // cleanup: delete the secret
    if (createdSecretId) {
      await e2eReq.delete(`${API_SECRETS}/${manager}/${createdSecretId}`).catch(() => {
        // ignore error if secret doesn't exist
      });
    }
  });

  test('should create a secret with all fields', async () => {
    await test.step('create secret via API', async () => {
      await e2eReq.put(`${API_SECRETS}/${manager}/${createdSecretId}`, {
        access_key_id: 'AKIAIOSFODNN7EXAMPLE',
        secret_access_key: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
        session_token: 'test-session-token-123',
        region: 'us-west-2',
        endpoint_url: 'https://secretsmanager.us-west-2.amazonaws.com',
      });
    });

    await test.step('verify secret was created via API', async () => {
      const secret = await e2eReq
        .get<unknown, APISIXType['RespSecretDetail']>(
          `${API_SECRETS}/aws/${createdSecretId}`
        )
        .then((v) => v.data);

      expect(secret.value).toBeDefined();
      // Note: manager is not in the response, it's part of the ID (aws/id)
      const awsSecret = secret.value as APISIXType['AWSSecret'];
      expect(awsSecret.access_key_id).toBe('AKIAIOSFODNN7EXAMPLE');
      expect(awsSecret.secret_access_key).toBe(
        'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'
      );
      expect(awsSecret.session_token).toBe('test-session-token-123');
      expect(awsSecret.region).toBe('us-west-2');
      expect(awsSecret.endpoint_url).toBe(
        'https://secretsmanager.us-west-2.amazonaws.com'
      );
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
      const awsSecret = secret.value as APISIXType['AWSSecret'];
      expect(awsSecret.access_key_id).toBe('AKIAIOSFODNN7EXAMPLE');
      expect(awsSecret.secret_access_key).toBe('wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY');
      expect(awsSecret.session_token).toBe('test-session-token-123');
      expect(awsSecret.region).toBe('us-west-2');
      expect(awsSecret.endpoint_url).toBe('https://secretsmanager.us-west-2.amazonaws.com');
    });
  });

  test('should update the secret with new values', async () => {
    const updatedAccessKeyId = 'AKIAI44QH8DHBEXAMPLE';
    const updatedSecretAccessKey = 'je7MtGbClwBF/2Zp9Utk/h3yCo8nvbEXAMPLEKEY';
    const updatedSessionToken = 'updated-session-token-456';
    const updatedRegion = 'eu-west-1';
    const updatedEndpointUrl = 'https://secretsmanager.eu-west-1.amazonaws.com';

    await test.step('update secret via API', async () => {
      await e2eReq.put(`${API_SECRETS}/${manager}/${createdSecretId}`, {
        access_key_id: updatedAccessKeyId,
        secret_access_key: updatedSecretAccessKey,
        session_token: updatedSessionToken,
        region: updatedRegion,
        endpoint_url: updatedEndpointUrl,
      });
    });

    await test.step('verify secret was updated via API', async () => {
      const secret = await e2eReq
        .get<unknown, APISIXType['RespSecretDetail']>(
          `${API_SECRETS}/${manager}/${createdSecretId}`
        )
        .then((v) => v.data);

      // Note: manager is not in the response, it's part of the ID
      const awsSecret = secret.value as APISIXType['AWSSecret'];
      expect(awsSecret.access_key_id).toBe(updatedAccessKeyId);
      expect(awsSecret.secret_access_key).toBe(updatedSecretAccessKey);
      expect(awsSecret.session_token).toBe(updatedSessionToken);
      expect(awsSecret.region).toBe(updatedRegion);
      expect(awsSecret.endpoint_url).toBe(updatedEndpointUrl);
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
