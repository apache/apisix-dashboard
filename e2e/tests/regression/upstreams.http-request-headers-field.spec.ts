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
// `checks.active.http_request_headers` is typed `array<string>` (matching
// the Admin API) but was rendered with the Labels widget, which expects
// an OBJECT value. Both directions were broken: stored header lines
// displayed as an empty field (the widget's array guard returns []), and
// anything typed in produced an object that failed the zod array schema
// on submit — the field was unusable.

import { upstreamsPom } from '@e2e/pom/upstreams';
import { randomId } from '@e2e/utils/common';
import { e2eReq } from '@e2e/utils/req';
import { test } from '@e2e/utils/test';
import { uiGoto } from '@e2e/utils/ui';
import { expect } from '@playwright/test';

import { deleteAllUpstreams } from '@/apis/upstreams';
import type { APISIXType } from '@/types/schema/apisix';

const headers = ['User-Agent: apisix-probe', 'X-Check: 1'];

test.beforeAll(async () => {
  await deleteAllUpstreams(e2eReq);
});

test.afterAll(async () => {
  await deleteAllUpstreams(e2eReq);
});

test('active health-check request headers display and round-trip', async ({
  page,
}) => {
  const name = randomId('reg-hdr-field');
  const res = await e2eReq.put<{ value: APISIXType['Upstream'] }>(
    `/upstreams/${name}`,
    {
      name,
      type: 'roundrobin',
      nodes: { 'hdr-field.local:80': 1 },
      checks: {
        active: {
          http_path: '/health',
          http_request_headers: headers,
          unhealthy: { interval: 2, http_failures: 3 },
        },
      },
    }
  );
  const id = res.data.value.id;

  await uiGoto(page, '/upstreams/detail/$id', { id });
  await upstreamsPom.isDetailPage(page);

  // stored header lines must be visible (unfixed: the field renders empty)
  await expect(page.getByText(headers[0], { exact: true })).toBeVisible();
  await expect(page.getByText(headers[1], { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Edit' }).click();

  // typed input must survive submit as an array member
  const field = page.getByRole('textbox', {
    name: 'HTTP Request Headers',
    exact: true,
  });
  await field.fill('X-Extra: 2');
  await field.press('Enter');
  await expect(page.getByText('X-Extra: 2', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Save' }).click();
  await expect(
    page.getByRole('alert').filter({ hasText: /success/i })
  ).toBeVisible();

  const after = await e2eReq.get<{ value: APISIXType['Upstream'] }>(
    `/upstreams/${id}`
  );
  expect(after.data.value.checks?.active?.http_request_headers).toEqual([
    ...headers,
    'X-Extra: 2',
  ]);
});
