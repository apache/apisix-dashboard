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
/* eslint-disable playwright/no-wait-for-timeout -- regression test stabilization */

// Regression: the credentials list page must handle an Axios error that has
// no `response` (network failure) without crashing the page.
//
// Related issue:
//   - apache/apisix-dashboard#3370 credentials list crash when Axios error
//     has no response
//
// Reproduction strategy: aborting the network request triggers exactly the
// `error.response === undefined` branch on Axios — a legitimate fault
// injection that mirrors real network failures the user can experience.

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
const username = `regcred${nanoid()}`;

test.beforeAll(async () => {
  await deleteAllConsumers(e2eReq);
  await putConsumerReq(e2eReq, {
    username,
  } as APISIXType['ConsumerPut']);
});

test.afterAll(async () => {
  await deleteAllConsumers(e2eReq);
});

test('credentials list page does not crash when its request is aborted', async ({
  page,
}) => {
  const crashes = watchForCrashes(page);

  // Abort the credentials list request to simulate "no response".
  await page.route(
    (url) =>
      url.pathname.includes(`/apisix/admin/consumers/${username}/credentials`),
    (route) => route.abort('failed')
  );

  await uiGoto(page, '/consumers/detail/$username/credentials', { username });

  // Give React time to render the error path.
  await page.waitForTimeout(1500);

  crashes.expectNoCrash('credentials list page with aborted request');

  // Hard-crash symptom: the app-level error boundary takes over and shows
  // "Something went wrong!", hiding the global nav. A correctly handled
  // network failure should keep the nav intact and surface the error in
  // the page body (e.g. empty state or toast).
  await expect(
    page.getByText(/something went wrong/i)
  ).toBeHidden();
  await expect(
    page.getByRole('link', { name: 'Consumers', exact: true })
  ).toBeVisible();
});
