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

// Regression: StreamRoutesErrorComponent special-cases 400 responses to
// show APISIX's error_msg, but dereferenced `err.response?.data.error_msg`
// — guarding response, not data. A 400 with an empty or non-JSON body
// rendered an empty error area (or crashed the error component itself for
// nullish data). It now guards data and falls back to the axios error
// message so the error area is never blank.
//
// Part of apache/apisix-dashboard#3417 (error handling item 2, residual).

import { test } from '@e2e/utils/test';
import { uiGoto } from '@e2e/utils/ui';
import { watchForCrashes } from '@e2e/utils/ui/crash';
import { expect } from '@playwright/test';

test('stream routes 400 without a body renders a visible error, not a blank page', async ({
  page,
}) => {
  const crashes = watchForCrashes(page);

  // A 400 with an EMPTY body: axios cannot parse error_msg out of it.
  await page.route(
    (url) => url.pathname.endsWith('/apisix/admin/stream_routes'),
    async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({ status: 400, body: '' });
      } else {
        await route.fallback();
      }
    }
  );

  await uiGoto(page, '/stream_routes');

  // Queries retry 3 times (~7s) before the loader error surfaces.
  await expect(
    page.getByText('Request failed with status code 400')
  ).toBeVisible({ timeout: 15_000 });

  crashes.expectNoCrash('stream_routes 400-no-body error render');
});
