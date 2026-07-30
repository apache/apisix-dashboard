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

// #3453 item 2: every detail heading read "Route Detail", so identifying
// which of a dozen similarly-named routes you had opened meant reading the
// id field further down the form. #3441 fixed the browser-tab title; the
// on-page heading stayed generic.

const ROUTE_ID = 'reg-heading-identity';
// A name distinct from the id, so an assertion on the heading cannot pass
// by accidentally matching the name.
const ROUTE_NAME = 'reg heading identity route';

const clean = () => safeClean(() => deleteAllRoutes(e2eReq));

test.beforeAll(async () => {
  await clean();
  await putRouteReq(e2eReq, {
    id: ROUTE_ID,
    name: ROUTE_NAME,
    uri: '/reg-heading-identity',
    methods: ['GET'],
    // A route needs one of plugins / upstream / service_id alongside its
    // uri, or the Admin API rejects it.
    upstream: { type: 'roundrobin', nodes: { 'heading.local:80': 1 } },
  } as APISIXType['Route']);
});

test.afterAll(clean);

test('the detail heading names the resource, and edit mode is unchanged', async ({
  page,
}) => {
  await uiGoto(page, '/routes/detail/$id', { id: ROUTE_ID });

  // Scoped to the page body: Mantine renders a modal's title as an `h2` too
  // (the settings modal lets itself in uninvited — hence
  // `uiEnsureSettingsClosed`), and an unscoped level-2 lookup would then
  // resolve two elements and die on strict mode instead of on the assertion
  // below.
  const heading = page.getByRole('main').getByRole('heading', { level: 2 });
  await expect(heading).toHaveText(`Route · ${ROUTE_ID}`);

  // The identity belongs to the read-only heading only. Edit mode has its
  // own string (`info.edit.title`); wiring the new key into that branch by
  // mistake would leave the user with no "you are editing" signal.
  await page.getByRole('button', { name: 'Edit', exact: true }).click();
  await expect(heading).toHaveText('Edit Route');
});
