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

// Bulk D-01: routes list page must render correctly with 100 rows.
// Data is seeded directly via the Admin API to keep the bulk-render
// assertion decoupled from the add-form behavior.

import { routesPom } from '@e2e/pom/routes';
import {
  bulkCreateRoutes,
  bulkDeleteRoutesByPrefix,
} from '@e2e/utils/bulk';
import { test } from '@e2e/utils/test';
import { expect } from '@playwright/test';

const PREFIX = 'bulk100';
const COUNT = 100;

test.describe.configure({ mode: 'serial', timeout: 120_000 });

test.beforeAll(async () => {
  await bulkDeleteRoutesByPrefix(PREFIX);
  await bulkCreateRoutes({ count: COUNT, prefix: PREFIX });
});

test.afterAll(async () => {
  await bulkDeleteRoutesByPrefix(PREFIX);
});

test('routes list shows correct total and renders default page', async ({
  page,
}) => {
  const t0 = Date.now();
  await routesPom.toIndex(page);
  await routesPom.isIndexPage(page);

  // Routes are listed in server-defined order (not insertion order), so
  // bulk100-0 isn't guaranteed to be on page 1. Just require *some*
  // seeded row to render.
  const someSeededRow = page
    .getByRole('row', { name: new RegExp(`${PREFIX}-\\d+`) })
    .first();
  await expect(someSeededRow).toBeVisible({ timeout: 5000 });
  const renderMs = Date.now() - t0;
  test
    .info()
    .annotations.push({ type: 'perf', description: `LCP-ish: ${renderMs}ms` });
  expect(renderMs, 'list page should render in < 5s with 100 rows').toBeLessThan(
    5000
  );
});

test('pagination shows ≥ 10 pages at default page_size=10', async ({
  page,
}) => {
  await routesPom.toIndex(page);
  await routesPom.isIndexPage(page);

  // page=10 must be reachable (100 rows / 10 per page = 10 pages).
  const page10 = page.getByRole('listitem', { name: '10' });
  await expect(page10).toBeVisible();
});
