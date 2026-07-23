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

// Regression for a silent data-loss bug found while fixing the
// skip_mtls_uri_regex widget (#3417 follow-up): the SSL detail page
// created its form WITHOUT `defaultValues` and populated it only through
// a later `form.reset(...)`. Under `shouldUnregister: true`, a
// controlled field that mounts AFTER that reset (the whole client
// section, gated on `__clientEnabled`) has its entry in `_defaultValues`
// overwritten from `_options.defaultValues` — i.e. with undefined — by
// react-hook-form's useController mount effect. The unmount/remount
// around toggling Edit then drops the value with nothing to re-seed
// from, wiping the whole `client.*` subtree: an edit-save silently
// DELETED the mTLS client block (PUT succeeded, verification gone).
// Passing the producer output as `defaultValues` at creation (the same
// pattern routes/services/stream_routes detail pages already use) keeps
// the re-seed source populated.

import { sslsPom } from '@e2e/pom/ssls';
import { genTLS, randomId } from '@e2e/utils/common';
import { e2eReq } from '@e2e/utils/req';
import { test } from '@e2e/utils/test';
import { uiGoto } from '@e2e/utils/ui';
import { expect } from '@playwright/test';

import { deleteAllSSLs } from '@/apis/ssls';
import type { APISIXType } from '@/types/schema/apisix';

test.beforeAll(async () => {
  await deleteAllSSLs(e2eReq);
});

test.afterAll(async () => {
  await deleteAllSSLs(e2eReq);
});

test('no-op edit-save preserves the mTLS client block', async ({ page }) => {
  const { cert, key } = await genTLS();
  const sni = `${randomId('reg-client-keep')}.example.com`;
  const res = await e2eReq.put<{ value: APISIXType['SSL'] }>(
    `/ssls/${randomId('reg-client-keep')}`,
    {
      snis: [sni],
      cert,
      key,
      client: {
        ca: cert,
        depth: 2,
        skip_mtls_uri_regex: ['/health.*', '/metrics'],
      },
    }
  );
  const id = res.data.value.id;

  await uiGoto(page, '/ssls/detail/$id', { id });
  await sslsPom.isDetailPage(page);

  await page.getByRole('button', { name: 'Edit' }).click();
  // the API never returns the private key, so a save always needs it
  // re-entered — everything else must survive untouched
  await page.getByRole('textbox', { name: 'Key 1' }).fill(key);
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(
    page.getByRole('alert').filter({ hasText: /success/i })
  ).toBeVisible();

  const after = await e2eReq.get<{ value: APISIXType['SSL'] }>(`/ssls/${id}`);
  const client = after.data.value.client;
  expect(client).toBeTruthy();
  expect(client?.ca).toBe(cert);
  expect(client?.depth).toBe(2);
  expect(client?.skip_mtls_uri_regex).toEqual(['/health.*', '/metrics']);
});
