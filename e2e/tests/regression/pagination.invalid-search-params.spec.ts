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

// Regression: pageSearchSchema accepted any string for page/page_size and
// transformed it with Number(), so `?page=abc` sent page=NaN to the Admin
// API, and malformed inputs that failed the union (e.g. duplicated params
// parsed as arrays) threw a ZodError out of validateSearch. The schema now
// coerces and falls back to the defaults (page=1, page_size=10) for any
// invalid input, so hand-edited URLs and stale bookmarks degrade
// gracefully instead of failing.
//
// Part of apache/apisix-dashboard#3417 (error handling item 8).

import { test } from '@e2e/utils/test';
import { watchForCrashes } from '@e2e/utils/ui/crash';
import { expect } from '@playwright/test';

test('?page=abc degrades to page=1 instead of sending NaN', async ({
  page,
  baseURL,
}) => {
  const crashes = watchForCrashes(page);

  const listRequests: string[] = [];
  await page.route(
    (url) => url.pathname.endsWith('/apisix/admin/routes'),
    async (route) => {
      if (route.request().method() === 'GET') {
        listRequests.push(route.request().url());
      }
      await route.fallback();
    }
  );

  await page.goto(`${baseURL}routes?page=abc&page_size=xyz`);

  // The list must render normally on the fallback values.
  await expect(
    page.getByRole('heading', { name: 'Routes', exact: true })
  ).toBeVisible({ timeout: 15_000 });
  crashes.expectNoCrash('routes list with ?page=abc');

  expect(listRequests.length).toBeGreaterThan(0);
  for (const url of listRequests) {
    const params = new URL(url).searchParams;
    expect(params.get('page')).toBe('1');
    expect(params.get('page_size')).toBe('10');
  }
});

test('duplicated pagination params do not crash the list page', async ({
  page,
  baseURL,
}) => {
  const crashes = watchForCrashes(page);

  await page.goto(`${baseURL}routes?page=1&page=2`);

  await expect(
    page.getByRole('heading', { name: 'Routes', exact: true })
  ).toBeVisible({ timeout: 15_000 });
  crashes.expectNoCrash('routes list with duplicated page params');
});
