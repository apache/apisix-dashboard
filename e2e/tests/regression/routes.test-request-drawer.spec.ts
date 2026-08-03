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

test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

const ROUTE_ID = 'reg-test-request-drawer';

const clean = () => safeClean(() => deleteAllRoutes(e2eReq));

test.beforeAll(async () => {
  await clean();
  await putRouteReq(e2eReq, {
    id: ROUTE_ID,
    name: ROUTE_ID,
    uri: '/reg-test-hello',
    hosts: ['ex.example.com'],
    methods: ['GET'],
    plugins: {
      mocking: {
        content_type: 'application/json',
        response_status: 200,
        response_example: '{"message":"it works!"}',
      },
    },
  } as APISIXType['Route']);
});

test.afterAll(clean);

test('route test-request drawer prefills curl, updates live, and falls back when unreachable', async ({
  page,
}) => {
  await uiGoto(page, `/routes/detail/${ROUTE_ID}`);

  await page.getByRole('button', { name: 'Test', exact: true }).click();

  // Set a gateway base so curl is concrete.
  await page.getByLabel('Gateway URL').fill('http://127.0.0.1:9080');

  // curl preview reflects the route's prefill (method, path, Host header).
  const curl = page.getByText(/^curl -X GET/);
  await expect(curl).toContainText("'http://127.0.0.1:9080/reg-test-hello'");
  await expect(curl).toContainText('Host: ex.example.com');

  // Editing the path updates the preview live.
  await page.getByLabel('Path').fill('/changed');
  await expect(curl).toContainText("'http://127.0.0.1:9080/changed'");

  // Copy shows the copied state.
  await page.getByRole('button', { name: 'Copy', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Copied', exact: true })).toBeVisible();

  // Send against an unreachable base → deterministic honest fallback.
  await page.getByLabel('Gateway URL').fill('http://127.0.0.1:6553');
  await page.getByRole('button', { name: 'Send request', exact: true }).click();
  await expect(
    page.getByText(/couldn't read a response/i)
  ).toBeVisible();
});
