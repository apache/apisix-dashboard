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
// the submit pipeline deep-cleans every empty value ({} / [] / "" /
// null), and the restore stage only brought back WHOLE plugin entries —
// meaningful empty members inside a surviving plugin config were
// silently removed on any edit-save, and `discovery_args: {}` on an
// INLINE upstream was dropped (the #3376 fix only covered the upstreams
// page's root-level field). The Admin API accepts and stores all these
// shapes (verified live); plugin configs now pass through verbatim.

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

test('no-op edit-save keeps empty members inside a plugin config', async ({
  page,
}) => {
  const pluginConfig = {
    empty_obj: {},
    empty_arr: [],
    empty_str: '',
    kept: 'x',
  };
  const name = randomId('reg-nested-empty');
  const res = await e2eReq.put<{ value: APISIXType['Route'] }>(
    `/routes/${name}`,
    {
      name,
      uri: `/reg-nested-empty/${name}`,
      plugins: { 'key-auth': pluginConfig },
      upstream: { type: 'roundrobin', nodes: { 'nested-empty.local:80': 1 } },
    }
  );
  const id = res.data.value.id;

  await uiGoto(page, '/routes/detail/$id', { id });
  await routesPom.isDetailPage(page);
  await page.getByRole('button', { name: 'Edit' }).click();
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(
    page.getByRole('alert').filter({ hasText: /success/i })
  ).toBeVisible();

  const after = await e2eReq.get<{ value: APISIXType['Route'] }>(
    `/routes/${id}`
  );
  expect(after.data.value.plugins?.['key-auth']).toEqual(pluginConfig);
});

test('no-op edit-save keeps discovery_args on an inline upstream', async ({
  page,
}) => {
  const name = randomId('reg-inline-disc');
  const res = await e2eReq.put<{ value: APISIXType['Route'] }>(
    `/routes/${name}`,
    {
      name,
      uri: `/reg-inline-disc/${name}`,
      upstream: {
        type: 'roundrobin',
        discovery_type: 'dns',
        service_name: 'svc.local',
        discovery_args: {},
      },
    }
  );
  const id = res.data.value.id;

  await uiGoto(page, '/routes/detail/$id', { id });
  await routesPom.isDetailPage(page);
  await page.getByRole('button', { name: 'Edit' }).click();
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(
    page.getByRole('alert').filter({ hasText: /success/i })
  ).toBeVisible();

  const after = await e2eReq.get<{ value: APISIXType['Route'] }>(
    `/routes/${id}`
  );
  const upstream = after.data.value.upstream as Record<string, unknown>;
  expect(upstream.discovery_type).toBe('dns');
  expect(upstream.discovery_args).toEqual({});
});
