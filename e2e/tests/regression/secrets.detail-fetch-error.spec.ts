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

// Regression: the secrets detail page was the only detail page on plain
// useQuery, gated by `isLoading` alone. After a failed fetch, isLoading is
// false and isError was never checked, so the page rendered a blank,
// editable form over an existing secret — inviting the user to "restore"
// it and overwrite the real values. Converted to useSuspenseQuery, a fetch
// failure now lands on the root error page (RootError, #3418) instead.
//
// Part of apache/apisix-dashboard#3417 (error handling item 6).

import { e2eReq } from '@e2e/utils/req';
import { test } from '@e2e/utils/test';
import { uiGoto } from '@e2e/utils/ui';
import { expect } from '@playwright/test';
import { customAlphabet } from 'nanoid';

import { getSecretReq, putSecretReq } from '@/apis/secrets';
import { API_SECRETS } from '@/config/constant';
import type { APISIXType } from '@/types/schema/apisix';

const nanoid = customAlphabet(
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  8
);

const secretId = `regsecerr${nanoid()}`;
const vaultSecret = {
  manager: 'vault',
  id: secretId,
  uri: 'http://vault.example.com:8200',
  prefix: '/kv',
  token: 'real-token',
} as APISIXType['Secret'];

test.beforeAll(async () => {
  await putSecretReq(e2eReq, vaultSecret);
});

test.afterAll(async () => {
  await e2eReq
    .delete(`${API_SECRETS}/vault/${secretId}`)
    .catch(() => undefined);
});

test('secret detail shows the error page, not a blank editable form, when its fetch fails', async ({
  page,
}) => {
  // Abort only the detail GET; afterAll cleanup uses e2eReq (a Playwright
  // request context), which page.route does not intercept.
  await page.route(
    (url) => url.pathname.endsWith(`/apisix/admin/secrets/vault/${secretId}`),
    async (route) => {
      if (route.request().method() === 'GET') {
        await route.abort('failed');
      } else {
        await route.fallback();
      }
    }
  );

  await uiGoto(page, '/secrets/detail/$manager/$id', {
    manager: 'vault',
    id: secretId,
  });

  // react-query retries up to 3 times (~7s backoff) before the error
  // surfaces, hence the generous timeout on the first assertion.
  await expect(page.getByText('Something went wrong')).toBeVisible({
    timeout: 15_000,
  });
  await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible();

  // The lying blank form must be unreachable: no Edit path, no fields.
  await expect(page.getByRole('button', { name: 'Edit' })).toBeHidden();
  await expect(page.getByLabel('URI')).toBeHidden();

  // The real secret is untouched on the backend.
  const secret = await getSecretReq(e2eReq, {
    manager: 'vault',
    id: secretId,
  });
  expect(secret.value.uri).toBe('http://vault.example.com:8200');
});
