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
// the Labels widget split every tag on EVERY colon and required exactly
// two parts. A label value containing a colon (e.g. a registry address —
// accepted and stored by the Admin API) could not be typed in, and once
// stored via the API its mere presence made every subsequent edit of the
// tag set (adding or removing ANY tag) error out and be discarded — the
// resource's labels were permanently uneditable from the dashboard.

import { routesPom } from '@e2e/pom/routes';
import { randomId } from '@e2e/utils/common';
import { e2eReq } from '@e2e/utils/req';
import { test } from '@e2e/utils/test';
import { uiGoto } from '@e2e/utils/ui';
import { expect } from '@playwright/test';

import { deleteAllRoutes } from '@/apis/routes';
import type { APISIXType } from '@/types/schema/apisix';

test.beforeAll(async () => {
  await deleteAllRoutes(e2eReq);
});

test.afterAll(async () => {
  await deleteAllRoutes(e2eReq);
});

test('tag set stays editable when a stored label value contains a colon', async ({
  page,
}) => {
  const name = randomId('reg-colon-label');
  const res = await e2eReq.put<{ value: APISIXType['Route'] }>(
    `/routes/${name}`,
    {
      name,
      uri: `/reg-colon-label/${name}`,
      labels: { registry: 'docker.io:5000', env: 'prod' },
      upstream: { type: 'roundrobin', nodes: { 'colon-label.local:80': 1 } },
    }
  );
  const id = res.data.value.id;

  await uiGoto(page, '/routes/detail/$id', { id });
  await routesPom.isDetailPage(page);
  // the stored labels display as joined tags
  await expect(page.getByText('registry:docker.io:5000')).toBeVisible();

  await page.getByRole('button', { name: 'Edit' }).click();

  // adding a tag re-parses the whole set: unfixed, the colon-value
  // survivor fails the exactly-one-colon check, an error shows, and the
  // addition is discarded
  const labelsInput = page.getByLabel('Labels', { exact: true }).first();
  await labelsInput.fill('team:gateway');
  await labelsInput.press('Enter');
  await expect(page.getByText('team:gateway')).toBeVisible();

  await page.getByRole('button', { name: 'Save' }).click();
  await expect(
    page.getByRole('alert').filter({ hasText: /success/i })
  ).toBeVisible();

  const after = await e2eReq.get<{ value: APISIXType['Route'] }>(
    `/routes/${id}`
  );
  expect(after.data.value.labels).toEqual({
    registry: 'docker.io:5000',
    env: 'prod',
    team: 'gateway',
  });
});

test('a new label whose value contains a colon can be typed in', async ({
  page,
}) => {
  const name = randomId('reg-colon-label-input');
  const res = await e2eReq.put<{ value: APISIXType['Route'] }>(
    `/routes/${name}`,
    {
      name,
      uri: `/reg-colon-label-input/${name}`,
      upstream: { type: 'roundrobin', nodes: { 'colon-label.local:80': 1 } },
    }
  );
  const id = res.data.value.id;

  await uiGoto(page, '/routes/detail/$id', { id });
  await routesPom.isDetailPage(page);
  await page.getByRole('button', { name: 'Edit' }).click();

  const labelsInput = page.getByLabel('Labels', { exact: true }).first();
  await labelsInput.fill('mirror:registry.local:5443');
  await labelsInput.press('Enter');
  await expect(page.getByText('mirror:registry.local:5443')).toBeVisible();

  await page.getByRole('button', { name: 'Save' }).click();
  await expect(
    page.getByRole('alert').filter({ hasText: /success/i })
  ).toBeVisible();

  const after = await e2eReq.get<{ value: APISIXType['Route'] }>(
    `/routes/${id}`
  );
  expect(after.data.value.labels).toEqual({
    mirror: 'registry.local:5443',
  });
});
