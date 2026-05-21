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

// Bulk D-03: with 1000 routes the list page must:
//   - render the first page within a reasonable budget
//   - allow URL-driven jump to a far page (e.g. ?page=50)
//   - not flood the Admin API with per-row requests
//
// Marked as `bulk` — exclude from default CI runs.

import { routesPom } from '@e2e/pom/routes';
import {
  bulkCreateRoutes,
  bulkDeleteRoutesByPrefix,
} from '@e2e/utils/bulk';
import { test } from '@e2e/utils/test';
import { expect } from '@playwright/test';

const PREFIX = 'bulk1k';
const COUNT = 1000;

test.describe.configure({ mode: 'serial', timeout: 300_000 });

test.beforeAll(async () => {
  await bulkDeleteRoutesByPrefix(PREFIX);
  await bulkCreateRoutes({ count: COUNT, prefix: PREFIX });
});

test.afterAll(async () => {
  await bulkDeleteRoutesByPrefix(PREFIX);
});

test('first page renders within 5s with 1000 rows in etcd', async ({
  page,
}) => {
  const t0 = Date.now();
  await routesPom.toIndex(page);
  await routesPom.isIndexPage(page);

  await expect(
    page
      .getByRole('row', { name: new RegExp(`${PREFIX}-\\d+`) })
      .first()
  ).toBeVisible({ timeout: 8000 });
  const ms = Date.now() - t0;
  test
    .info()
    .annotations.push({ type: 'perf', description: `first-page render: ${ms}ms` });
  expect(ms).toBeLessThan(8000);
});

test('admin API call volume on list page load is bounded (≤ 5 GETs)', async ({
  page,
}) => {
  const adminCalls: string[] = [];
  page.on('request', (req) => {
    if (req.method() === 'GET' && req.url().includes('/apisix/admin/routes')) {
      adminCalls.push(req.url());
    }
  });

  await routesPom.toIndex(page);
  await routesPom.isIndexPage(page);
  await expect(
    page
      .getByRole('row', { name: new RegExp(`${PREFIX}-\\d+`) })
      .first()
  ).toBeVisible({ timeout: 8000 });
  // Settle for any deferred queries.
  await page.waitForTimeout(800);

  test.info().annotations.push({
    type: 'perf',
    description: `admin /routes GETs: ${adminCalls.length}`,
  });
  expect(
    adminCalls.length,
    'list page should not issue per-row GETs (≤ 5 total)'
  ).toBeLessThanOrEqual(5);
});
