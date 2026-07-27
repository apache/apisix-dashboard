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

// Regression: the gateway accepts `scheme: "kafka"` on an upstream ("for
// specific protocols, it can be kafka"), but the dashboard's zod enum and
// scheme dropdown only offered the L7/L4 values, so a kafka-scheme upstream
// could not be created via the form. Surfaced by the gateway-schema contract
// test (#3417). This pins the fix: kafka is selectable and round-trips.

import { upstreamsPom } from '@e2e/pom/upstreams';
import { randomId } from '@e2e/utils/common';
import { e2eReq } from '@e2e/utils/req';
import { test } from '@e2e/utils/test';
import { uiHasToastMsg } from '@e2e/utils/ui';
import { uiFillUpstreamRequiredFields } from '@e2e/utils/ui/upstreams';
import { expect } from '@playwright/test';

import { deleteAllUpstreams, getUpstreamReq } from '@/apis/upstreams';
import type { APISIXType } from '@/types/schema/apisix';

test.beforeAll(async () => {
  await deleteAllUpstreams(e2eReq);
});

test.afterAll(async () => {
  await deleteAllUpstreams(e2eReq);
});

test('an upstream with scheme "kafka" can be created via the form', async ({
  page,
}) => {
  const name = randomId('reg-kafka');
  await upstreamsPom.toAdd(page);
  await upstreamsPom.isAddPage(page);

  await uiFillUpstreamRequiredFields(page, {
    name,
    nodes: [
      { host: 'kafka1.local', port: 9092, weight: 1 },
      { host: 'kafka2.local', port: 9092, weight: 1 },
    ],
  });

  // Pick the kafka scheme from the (newly added) "Specific" group.
  await page.getByRole('textbox', { name: 'Scheme' }).click();
  await page.getByRole('option', { name: 'kafka', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'Scheme' })).toHaveValue(
    'kafka'
  );

  await upstreamsPom.getAddBtn(page).click();
  await uiHasToastMsg(page, { hasText: /success/i });
  await upstreamsPom.isDetailPage(page);

  const id = page.url().split('/').pop()!;
  const stored = (await getUpstreamReq(e2eReq, id))
    .value as APISIXType['Upstream'];
  expect(stored.scheme).toBe('kafka');
});
