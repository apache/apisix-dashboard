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
// object-form nodes (`{"host:port": weight}` — the Admin API's documented
// shorthand, also valid without a port and with IPv6 keys) were parsed
// with `key.split(':')`. An IPv6 key `[::1]:1980` displayed as host "["
// with port 1, and a port-less key got an invented `port: 1`; the table's
// flush-on-mousedown sync then persisted the corruption on any edit-save
// (a port-less node resolves its port by scheme at runtime — port 1 does
// not). Both corrupted shapes were accepted by the Admin API, so a no-op
// Edit → Save silently destroyed a working upstream.

import { upstreamsPom } from '@e2e/pom/upstreams';
import { randomId } from '@e2e/utils/common';
import { e2eReq } from '@e2e/utils/req';
import { test } from '@e2e/utils/test';
import { uiGoto } from '@e2e/utils/ui';
import { expect } from '@playwright/test';

import { deleteAllUpstreams } from '@/apis/upstreams';
import type { APISIXType } from '@/types/schema/apisix';

test.beforeAll(async () => {
  await deleteAllUpstreams(e2eReq);
});

test.afterAll(async () => {
  await deleteAllUpstreams(e2eReq);
});

test('object-form nodes survive display and no-op edit-save', async ({
  page,
}) => {
  const name = randomId('reg-obj-nodes');
  const res = await e2eReq.put<{ value: APISIXType['Upstream'] }>(
    `/upstreams/${name}`,
    {
      name,
      type: 'roundrobin',
      scheme: 'http',
      nodes: { 'httpbin.org': 1, '[::1]:1980': 2 },
    }
  );
  const id = res.data.value.id;

  await uiGoto(page, '/upstreams/detail/$id', { id });
  await upstreamsPom.isDetailPage(page);

  // display must not shred the IPv6 host nor invent a port for the
  // port-less node (unfixed: host "[" / port "1" for both rows)
  await expect(page.getByRole('cell', { name: '[::1]', exact: true })).toBeVisible();
  await expect(page.getByRole('cell', { name: '1980', exact: true })).toBeVisible();
  const portlessRow = page.getByRole('row', { name: /httpbin\.org/ });
  await expect(portlessRow).toBeVisible();
  await expect(portlessRow.getByRole('cell', { name: '1', exact: true })).toHaveCount(1); // weight only, no port=1 cell

  await page.getByRole('button', { name: 'Edit' }).click();
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(
    page.getByRole('alert').filter({ hasText: /success/i })
  ).toBeVisible();

  const after = await e2eReq.get<{ value: APISIXType['Upstream'] }>(
    `/upstreams/${id}`
  );
  const nodes = after.data.value.nodes as APISIXType['UpstreamNode'][];
  expect(Array.isArray(nodes)).toBe(true);
  const byHost = Object.fromEntries(nodes.map((n) => [n.host, n]));
  // the port-less node must stay port-less (scheme decides at runtime)
  expect(byHost['httpbin.org']).toBeTruthy();
  expect(byHost['httpbin.org'].port).toBeUndefined();
  expect(byHost['httpbin.org'].weight).toBe(1);
  // the IPv6 node must keep its bracketed host and real port
  expect(byHost['[::1]']).toBeTruthy();
  expect(byHost['[::1]'].port).toBe(1980);
  expect(byHost['[::1]'].weight).toBe(2);
});
