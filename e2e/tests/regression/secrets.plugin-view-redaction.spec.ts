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

// Regression: a credential's key-auth key was rendered verbatim in the
// plugin card's read-only View drawer. The mask is driven by the gateway's
// own `encrypt_fields` (key-auth declares `["key"]`), not by a list kept
// here.
//
// Related issue:
//   - apache/apisix-dashboard#3416 plugin secrets leak in the read-only
//     plugin view

import { e2eReq } from '@e2e/utils/req';
import { test } from '@e2e/utils/test';
import { uiGoto } from '@e2e/utils/ui';
import { expect } from '@playwright/test';

import { deleteAllConsumers, putConsumerReq } from '@/apis/consumers';
import type { APISIXType } from '@/types/schema/apisix';

const USERNAME = 'reg_redaction_consumer';
const CREDENTIAL = 'reg-redaction-cred';
const SECRET = 'SUPER-SECRET-KEY-12345';

test.beforeAll(async () => {
  await putConsumerReq(e2eReq, {
    username: USERNAME,
  } as APISIXType['ConsumerPut']);
  await e2eReq.put(`/consumers/${USERNAME}/credentials/${CREDENTIAL}`, {
    plugins: { 'key-auth': { key: SECRET } },
  });
});

test.afterAll(async () => {
  await deleteAllConsumers(e2eReq);
});

test('the read-only plugin view hides the secret until asked', async ({
  page,
}) => {
  await uiGoto(
    page,
    '/consumers/detail/$username/credentials/detail/$id',
    { username: USERNAME, id: CREDENTIAL }
  );

  await page.getByRole('button', { name: 'View', exact: true }).click();
  const drawer = page.getByRole('dialog');
  await expect(drawer).toBeVisible();

  await expect(drawer).toContainText('••••••');
  await expect(page.locator('body')).not.toContainText(SECRET);

  // View mode must offer no way to write the redacted text back.
  await expect(drawer.getByRole('button', { name: 'Save' })).toHaveCount(0);

  await page.getByRole('button', { name: 'Show secrets' }).click();
  await expect(drawer).toContainText(SECRET);
});

// The catastrophic direction is the opposite one: if redaction ever leaked
// into a mutable mode, saving would write `••••••` over a live credential.
// `displayConfig`'s ternary is what prevents it, and nothing else pins that.
test('edit mode receives the real config, never the redacted one', async ({
  page,
}) => {
  await uiGoto(
    page,
    '/consumers/detail/$username/credentials/detail/$id',
    { username: USERNAME, id: CREDENTIAL }
  );

  // The plugin card shows View while the page is read-only and Edit once
  // the page form is editable, so the page's Edit must be clicked first.
  await page.getByRole('button', { name: 'Edit', exact: true }).click();
  await page.getByRole('button', { name: 'Edit', exact: true }).last().click();

  const drawer = page.getByRole('dialog');
  await expect(drawer).toBeVisible();
  await expect(drawer).toContainText(SECRET);
  await expect(drawer).not.toContainText('••••••');
});
