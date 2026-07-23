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

// Regression for a data-integrity item of apache/apisix-dashboard#3417:
// `ssls.client.skip_mtls_uri_regex` is typed `array<string>` (URI regex
// list, matching the Admin API) but was rendered as a boolean Switch.
// Both directions were broken: a stored regex list displayed as a
// meaningless "on" toggle with the actual values invisible, and toggling
// wrote a boolean that failed the zod array schema on submit.

import { sslsPom } from '@e2e/pom/ssls';
import { genTLS, randomId } from '@e2e/utils/common';
import { e2eReq } from '@e2e/utils/req';
import { test } from '@e2e/utils/test';
import { uiGoto } from '@e2e/utils/ui';
import { expect } from '@playwright/test';

import { deleteAllSSLs } from '@/apis/ssls';
import type { APISIXType } from '@/types/schema/apisix';

const regexes = ['/health.*', '/metrics'];

test.beforeAll(async () => {
  await deleteAllSSLs(e2eReq);
});

test.afterAll(async () => {
  await deleteAllSSLs(e2eReq);
});

test('client skip_mtls_uri_regex displays and round-trips', async ({
  page,
}) => {
  const { cert, key } = await genTLS();
  const sni = `${randomId('reg-mtls')}.example.com`;
  const res = await e2eReq.put<{ value: APISIXType['SSL'] }>(
    `/ssls/${randomId('reg-mtls')}`,
    {
      snis: [sni],
      cert,
      key,
      client: { ca: cert, skip_mtls_uri_regex: regexes },
    }
  );
  const id = res.data.value.id;

  await uiGoto(page, '/ssls/detail/$id', { id });
  await sslsPom.isDetailPage(page);

  // stored regexes must be visible (unfixed: a bare "on" Switch, values
  // nowhere on the page)
  await expect(page.getByText(regexes[0], { exact: true })).toBeVisible();
  await expect(page.getByText(regexes[1], { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Edit' }).click();

  const field = page.getByRole('textbox', {
    name: 'Skip mTLS URI Regex',
    exact: true,
  });
  // a regex legitimately containing a comma (quantifier {1,3}) must stay
  // ONE tag — the field must not comma-split it (#3435 review)
  const commaRegex = '^/v[0-9]{1,3}$';
  // type character by character so the comma keystroke would trigger
  // Mantine's default comma-split (the actual user path)
  await field.pressSequentially(commaRegex);
  await field.press('Enter');
  await expect(page.getByText(commaRegex, { exact: true })).toBeVisible();

  // the API does not return the private key to the form; re-fill it so
  // the PUT passes validation (same reason the crud spec cancels edits)
  await page.getByRole('textbox', { name: 'Key 1' }).fill(key);

  await page.getByRole('button', { name: 'Save' }).click();
  await expect(
    page.getByRole('alert').filter({ hasText: /success/i })
  ).toBeVisible();

  const after = await e2eReq.get<{ value: APISIXType['SSL'] }>(`/ssls/${id}`);
  expect(after.data.value.client?.skip_mtls_uri_regex).toEqual([
    ...regexes,
    commaRegex,
  ]);
});
