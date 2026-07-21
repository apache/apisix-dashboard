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
// the stream-route form reused the HTTP-route plugins section, which
// renders a "Plugin Config ID" input — a field the stream_routes
// resource does not have (the Admin API rejects it with 400, and the
// dashboard's zod resolver strips it before the request): anything the
// user typed there was silently discarded on a "successful" save.

import { routesPom } from '@e2e/pom/routes';
import { streamRoutesPom } from '@e2e/pom/stream_routes';
import { randomId } from '@e2e/utils/common';
import { e2eReq } from '@e2e/utils/req';
import { test } from '@e2e/utils/test';
import { uiGoto } from '@e2e/utils/ui';
import { expect } from '@playwright/test';

import { deleteAllStreamRoutes } from '@/apis/stream_routes';
import type { APISIXType } from '@/types/schema/apisix';

test.beforeAll(async () => {
  await deleteAllStreamRoutes(e2eReq);
});

test.afterAll(async () => {
  await deleteAllStreamRoutes(e2eReq);
});

test('stream route forms do not offer the unsupported Plugin Config ID', async ({
  page,
}) => {
  await streamRoutesPom.toAdd(page);
  await streamRoutesPom.isAddPage(page);
  // the plugins section itself must stay
  await expect(
    page.getByRole('button', { name: 'Select Plugins' })
  ).toBeVisible();
  await expect(page.getByLabel('Plugin Config ID')).toHaveCount(0);

  const name = randomId('reg-no-pcid');
  const res = await e2eReq.put<{ value: APISIXType['StreamRoute'] }>(
    `/stream_routes/${name}`,
    {
      server_port: 9100,
      upstream: { type: 'roundrobin', nodes: { 'no-pcid.local:80': 1 } },
    }
  );
  await uiGoto(page, '/stream_routes/detail/$id', { id: res.data.value.id });
  await streamRoutesPom.isDetailPage(page);
  await expect(page.getByLabel('Plugin Config ID')).toHaveCount(0);
});

test('the HTTP route form still offers Plugin Config ID', async ({ page }) => {
  await routesPom.toIndex(page);
  await routesPom.isIndexPage(page);
  await routesPom.getAddRouteBtn(page).click();
  await routesPom.isAddPage(page);
  await expect(page.getByLabel('Plugin Config ID')).toBeVisible();
});
