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

// Regression: the Admin Key field used to fire
// queryClient.invalidateQueries() + refetchQueries() on EVERY keystroke —
// typing a 32-char key hammered the Admin API with 32 full refetch storms
// of every mounted query. The refresh must be debounced.

import { getAPISIXConf } from '@e2e/utils/common';
import { test } from '@e2e/utils/test';
import { expect } from '@playwright/test';

// start with no stored key so the settings modal is open on load
test.use({ storageState: { cookies: [], origins: [] } });

test('typing the admin key does not refetch per keystroke', async ({
  page,
}) => {
  await page.goto('./services');
  const adminKeyInput = page.getByLabel('Admin Key');
  await expect(adminKeyInput).toBeVisible();

  // count Admin API requests issued while typing
  let adminRequests = 0;
  page.on('request', (req) => {
    if (req.url().includes('/apisix/admin/')) adminRequests += 1;
  });

  const { adminKey } = await getAPISIXConf();
  // type character by character — the old implementation refetched every
  // mounted query once per character
  await adminKeyInput.pressSequentially(adminKey, { delay: 30 });

  // wait until the debounced refresh fired and the request count settled
  let lastSeen = -1;
  await expect
    .poll(
      () => {
        const settled = adminRequests > 0 && adminRequests === lastSeen;
        lastSeen = adminRequests;
        return settled;
      },
      { timeout: 10000, intervals: [1000] }
    )
    .toBe(true);

  // one debounced refresh refetches each mounted query once; allow a
  // small margin, but far below one-refetch-per-keystroke (32+)
  expect(adminRequests).toBeLessThan(8);
});
