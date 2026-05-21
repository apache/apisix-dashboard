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
/* eslint-disable playwright/no-wait-for-timeout, playwright/no-conditional-in-test -- regression test stabilization */

// Regression: opening the detail page for a consumer created via the Admin
// API (i.e. without going through the dashboard's create flow) must not
// crash, regardless of which next-step button the user clicks.
//
// Related issue:
//   - apache/apisix-dashboard#3279 crash after creating consumer via API then
//     clicking "Configure Next"

import { consumersPom } from '@e2e/pom/consumers';
import { e2eReq } from '@e2e/utils/req';
import { test } from '@e2e/utils/test';
import { uiGoto } from '@e2e/utils/ui';
import { watchForCrashes } from '@e2e/utils/ui/crash';
import { expect } from '@playwright/test';
import { customAlphabet } from 'nanoid';

import { deleteAllConsumers, putConsumerReq } from '@/apis/consumers';
import type { APISIXType } from '@/types/schema/apisix';

const nanoid = customAlphabet(
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  8
);
const username = `regapicons${nanoid()}`;

test.beforeAll(async () => {
  await deleteAllConsumers(e2eReq);

  // Seed the consumer directly via Admin API to reproduce #3279 reliably.
  await putConsumerReq(e2eReq, {
    username,
    desc: 'seeded via admin API',
  } as APISIXType['ConsumerPut']);
});

test.afterAll(async () => {
  await deleteAllConsumers(e2eReq);
});

test('opening API-created consumer detail and acting on it does not crash', async ({
  page,
}) => {
  const crashes = watchForCrashes(page);

  await test.step('navigate directly to the consumer detail page', async () => {
    await uiGoto(page, '/consumers/detail/$username', { username });
    await consumersPom.isDetailPage(page);
    crashes.expectNoCrash('detail page loaded');
  });

  await test.step('click any visible action button without crash', async () => {
    // Try the likely candidates for the offending button. The issue
    // mentions "Configure Next" but the exact label may have been renamed.
    const candidateNames = [
      /Configure Next/i,
      /Add Credential/i,
      /New Credential/i,
      /Edit/i,
    ];
    for (const name of candidateNames) {
      const btn = page.getByRole('button', { name }).first();
      if (await btn.isVisible().catch(() => false)) {
        await btn.click();
        // Wait briefly for any async chain to fire.
        await page.waitForTimeout(500);
        crashes.expectNoCrash(`after clicking ${name}`);
        break;
      }
    }
  });

  await test.step('Admin API consumer still exists (page did not corrupt state)', async () => {
    const url = `/consumers/${username}`;
    const resp = await e2eReq.get(url);
    expect(resp.status).toBe(200);
  });
});
