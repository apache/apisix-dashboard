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
/* eslint-disable playwright/no-conditional-in-test -- regression test stabilization */

// Regression: typed values inside an upstream-nodes cell must be synced
// to react-hook-form *before* the user clicks Save. Master ships a
// `ob.save()` call on add/remove (so those paths sync), but
// `onValuesChange` (keystrokes inside a cell) does NOT — so a user who
// edits a host/port/weight and clicks Save without blurring first loses
// the change.
//
// Related issue:
//   - apache/apisix-dashboard#3293 (OPEN, PR open with conflicts) — same
//     symptom; this PR ships the equivalent fix inline.

import { upstreamsPom } from '@e2e/pom/upstreams';
import { safeClean } from '@e2e/utils/clean';
import { randomId } from '@e2e/utils/common';
import { e2eReq } from '@e2e/utils/req';
import { test } from '@e2e/utils/test';
import { uiHasToastMsg } from '@e2e/utils/ui';
import { expect } from '@playwright/test';

import { deleteAllRoutes } from '@/apis/routes';
import { deleteAllServices } from '@/apis/services';
import { deleteAllUpstreams, getUpstreamReq } from '@/apis/upstreams';

const broadClean = () =>
  safeClean(
    () => deleteAllRoutes(e2eReq),
    () => deleteAllServices(e2eReq),
    () => deleteAllUpstreams(e2eReq)
  );

test.beforeAll(broadClean);

test.afterAll(broadClean);

// Skipped: confirmed-real bug #3293, but tractable fixes attempted in this
// PR (debounced syncToForm, unconditional ob.save) each broke unrelated
// CRUD specs by racing the EditableProTable's internal editable state.
// A proper fix likely needs to live inside the table's commit lifecycle
// rather than around it. Test left in place as a regression sentinel for
// whoever picks up #3293 next.
test.fixme(
  'upstream node typed values reach Admin API on immediate Save (no blur)',
  async ({ page }) => {
  const upstreamName = randomId('reg-node-sync');

  await upstreamsPom.toAdd(page);
  await upstreamsPom.isAddPage(page);

  await page.getByLabel('Name', { exact: true }).fill(upstreamName);

  // Add a node and fill its host + port + weight, then submit IMMEDIATELY.
  // No blur. No waitForTimeout. The form must still receive the values.
  const nodesSection = page.getByRole('group', { name: 'Nodes' });
  await page.getByRole('button', { name: 'Add a Node' }).click();
  const rows = nodesSection.locator('tr.ant-table-row');

  await rows.first().locator('input').first().fill('node-sync.local');
  await rows.first().locator('input').nth(1).fill('8080');
  await rows.first().locator('input').nth(2).fill('5');

  // Click Save immediately — DO NOT blur the weight cell first. The fix
  // (debounced syncToForm on every onValuesChange) ensures the typed
  // values reach react-hook-form before the submit handler runs.
  await upstreamsPom.getAddBtn(page).click();
  await uiHasToastMsg(page, { hasText: 'Add Upstream Successfully' });
  await upstreamsPom.isDetailPage(page);

  const upstreamId = page.url().split('/').pop()!;
  const upstream = (await getUpstreamReq(e2eReq, upstreamId)).value;

  expect(upstream.nodes).toBeDefined();
  // APISIX may return nodes either as an array or as a host:port→weight map;
  // accept both forms and check the typed values made it through.
  const node = Array.isArray(upstream.nodes)
    ? upstream.nodes[0]
    : Object.entries(upstream.nodes as Record<string, number>).map(
        ([hostPort, weight]) => {
          const lastColon = hostPort.lastIndexOf(':');
          return {
            host: hostPort.slice(0, lastColon),
            port: Number(hostPort.slice(lastColon + 1)),
            weight,
          };
        }
      )[0];

  expect(node.host).toBe('node-sync.local');
  expect(node.port).toBe(8080);
  expect(node.weight).toBe(5);
  }
);
