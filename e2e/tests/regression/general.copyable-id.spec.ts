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
import { safeClean } from '@e2e/utils/clean';
import { e2eReq } from '@e2e/utils/req';
import { test } from '@e2e/utils/test';
import { uiGoto } from '@e2e/utils/ui';
import { expect } from '@playwright/test';

import { deleteAllRoutes, putRouteReq } from '@/apis/routes';
import type { APISIXType } from '@/types/schema/apisix';

// #3453 item 3: a resource id is the string you paste into a curl against
// the Admin API, into a declarative config, or into another resource's
// `upstream_id` — but the only way to get it out of the dashboard was to
// select the text by hand.
//
// The control lives in the list's identifier cell rather than on the detail
// page's id field: detail sections render as a disabled <fieldset> to
// express read-only, and the HTML spec disables every form control inside
// one, so a button there is dead exactly where it is most wanted.

const ROUTE_ID = 'reg-copyable-id';
// A distinct name: an id that also appears in the Name column would make
// the assertion below ambiguous.
const ROUTE_NAME = 'reg copyable id route';

const clean = () => safeClean(() => deleteAllRoutes(e2eReq));

test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

test.beforeAll(async () => {
  await clean();
  await putRouteReq(e2eReq, {
    id: ROUTE_ID,
    name: ROUTE_NAME,
    uri: '/reg-copyable-id',
    methods: ['GET'],
    // A route needs one of plugins / upstream / service_id alongside its
    // uri, or the Admin API rejects it.
    upstream: { type: 'roundrobin', nodes: { 'copyable.local:80': 1 } },
  } as APISIXType['Route']);
});

test.afterAll(clean);

test('a list row id can be copied to the clipboard', async ({ page }) => {
  await uiGoto(page, '/routes');

  const table = page.getByRole('table');
  await expect(table.getByText(ROUTE_ID, { exact: true })).toBeVisible();

  const copyBtn = table.getByRole('button', { name: 'Copy', exact: true });
  await copyBtn.click();

  // The state flip is the visible feedback...
  await expect(
    table.getByRole('button', { name: 'Copied', exact: true })
  ).toBeVisible();

  // ...but only the clipboard proves it copied the right thing. A control
  // that flips to "Copied" while writing the wrong value — or nothing at
  // all — would still satisfy the assertion above.
  const clipboard = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboard).toBe(ROUTE_ID);
});
