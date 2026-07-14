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

// Regression: the route `vars` Monaco editor's field-level JSON validate
// rule is ignored by react-hook-form because the route forms attach a zod
// resolver, and the schema typed vars as a plain optional string. Invalid
// JSON therefore sailed through validation and JSON.parse threw inside
// mutationFn — a non-axios error no interceptor sees — so clicking Add did
// nothing at all. The schema now refines vars for JSON syntax, surfacing a
// field error under the editor before any request is attempted.
//
// Part of apache/apisix-dashboard#3417 (error handling item 7).

import { routesPom } from '@e2e/pom/routes';
import { randomId } from '@e2e/utils/common';
import { e2eReq } from '@e2e/utils/req';
import { test } from '@e2e/utils/test';
import {
  uiFillMonacoEditor,
  uiGetMonacoEditor,
  uiHasToastMsg,
} from '@e2e/utils/ui';
import { uiFillUpstreamRequiredFields } from '@e2e/utils/ui/upstreams';
import { expect } from '@playwright/test';

import { deleteAllRoutes } from '@/apis/routes';
import type { APISIXType } from '@/types/schema/apisix';

const nodes: APISIXType['UpstreamNode'][] = [
  { host: 'reg-vars-json.local', port: 80, weight: 100 },
  { host: 'reg-vars-json-2.local', port: 80, weight: 100 },
];

test.beforeAll(async () => {
  await deleteAllRoutes(e2eReq);
});

test.afterAll(async () => {
  await deleteAllRoutes(e2eReq);
});

test('invalid vars JSON blocks Add with a field error instead of failing silently', async ({
  page,
}) => {
  const routeName = randomId('reg-vars-json');

  // Count POSTs: an invalid submit must never reach the Admin API.
  let postCount = 0;
  await page.route('**/apisix/admin/routes', async (route) => {
    if (route.request().method() === 'POST') {
      postCount += 1;
    }
    await route.fallback();
  });

  await routesPom.toAdd(page);
  await routesPom.isAddPage(page);

  await page.getByLabel('Name', { exact: true }).first().fill(routeName);
  await page.getByLabel('URI', { exact: true }).fill('/regression/vars-json');
  await page.getByRole('textbox', { name: 'HTTP Methods' }).click();
  await page.getByRole('option', { name: 'GET' }).click();
  await page.keyboard.press('Escape');

  const upstreamSection = page.getByRole('group', {
    name: 'Upstream',
    exact: true,
  });
  await uiFillUpstreamRequiredFields(upstreamSection, {
    nodes,
    name: randomId('reg-up'),
    desc: 'reg',
  });

  const varsSection = page.getByText('Vars').locator('..');
  const varsEditor = await uiGetMonacoEditor(page, varsSection);
  await uiFillMonacoEditor(page, varsEditor, '[["arg_name", "==", "tmp"'); // missing brackets

  await routesPom.getAddBtn(page).click();

  // Field error appears under the editor; nothing was sent; still on Add.
  await expect(page.getByText('JSON format is not valid')).toBeVisible();
  expect(postCount).toBe(0);
  await expect(page).toHaveURL((url) => url.pathname.endsWith('/routes/add'));

  // Fixing the JSON lets the very same form submit successfully.
  await uiFillMonacoEditor(page, varsEditor, '[["arg_name", "==", "tmp"]]');
  await routesPom.getAddBtn(page).click();
  await uiHasToastMsg(page, { hasText: 'Add Route Successfully' });
  await routesPom.isDetailPage(page);
  expect(postCount).toBe(1);
});
