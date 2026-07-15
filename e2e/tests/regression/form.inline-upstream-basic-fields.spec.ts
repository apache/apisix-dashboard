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
// the inline-upstream form section renders editable Name / Description /
// Labels inputs (FormPartBasic under NamePrefixProvider "upstream"), but
// `produceRmEmptyUpstreamFields` unconditionally `delete`s
// `upstream.name` / `upstream.desc` / `upstream.labels` from every submit
// body. Consequences, both directions:
//   - values stored via the Admin API are silently erased by any
//     dashboard edit-save of the parent resource;
//   - values the user types into those inputs on the add page are
//     silently discarded ("successful" save, nothing stored).
// The Admin API accepts all three fields on an inline upstream, so the
// deletion is not an API-compatibility workaround.

import { routesPom } from '@e2e/pom/routes';
import { randomId } from '@e2e/utils/common';
import { e2eReq } from '@e2e/utils/req';
import { test } from '@e2e/utils/test';
import { uiGoto, uiHasToastMsg } from '@e2e/utils/ui';
import { uiFillUpstreamRequiredFields } from '@e2e/utils/ui/upstreams';
import { expect } from '@playwright/test';

import { deleteAllRoutes } from '@/apis/routes';
import type { APISIXType } from '@/types/schema/apisix';

const seededUpstream = {
  name: 'inline-upstream-name',
  desc: 'inline upstream stored via admin api',
  labels: { env: 'prod', team: 'gateway' },
  type: 'roundrobin',
  nodes: { 'inline-basic.local:80': 1 },
};

test.beforeAll(async () => {
  await deleteAllRoutes(e2eReq);
});

test.afterAll(async () => {
  await deleteAllRoutes(e2eReq);
});

test('no-op edit-save preserves inline upstream name/desc/labels', async ({
  page,
}) => {
  const name = randomId('reg-inline-basic');
  const res = await e2eReq.put<{ value: APISIXType['Route'] }>(
    `/routes/${name}`,
    { name, uri: `/reg-inline-basic/${name}`, upstream: seededUpstream }
  );
  const id = res.data.value.id;

  await uiGoto(page, '/routes/detail/$id', { id });
  await routesPom.isDetailPage(page);

  // the editable surface whose content the submit pipeline discards:
  // the upstream section's own Name input must display the stored value
  const upstreamSection = page.getByRole('group', {
    name: 'Upstream',
    exact: true,
  });
  await expect(
    upstreamSection.getByLabel('Name', { exact: true })
  ).toHaveValue(seededUpstream.name);

  await page.getByRole('button', { name: 'Edit' }).click();
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(
    page.getByRole('alert').filter({ hasText: /success/i })
  ).toBeVisible();

  const after = await e2eReq.get<{ value: APISIXType['Route'] }>(
    `/routes/${id}`
  );
  expect(after.data.value.upstream?.name).toBe(seededUpstream.name);
  expect(after.data.value.upstream?.desc).toBe(seededUpstream.desc);
  expect(after.data.value.upstream?.labels).toEqual(seededUpstream.labels);
});

test('add page keeps user-typed inline upstream name and desc', async ({
  page,
}) => {
  const routeName = randomId('reg-inline-basic-add');
  const typedName = 'typed-inline-upstream';
  const typedDesc = 'typed into the add form';

  await routesPom.toIndex(page);
  await routesPom.isIndexPage(page);
  await routesPom.getAddRouteBtn(page).click();
  await routesPom.isAddPage(page);

  await page.getByLabel('Name', { exact: true }).first().fill(routeName);
  await page
    .getByLabel('URI', { exact: true })
    .fill(`/reg-inline-basic-add/${routeName}`);

  const upstreamSection = page.getByRole('group', {
    name: 'Upstream',
    exact: true,
  });
  // the helper fills the upstream section's Name input and the nodes (it
  // always adds a second node row, hence two); it does NOT fill desc
  await uiFillUpstreamRequiredFields(upstreamSection, {
    nodes: [
      { host: 'inline-a.local', port: 80, weight: 100 },
      { host: 'inline-b.local', port: 80, weight: 100 },
    ],
    name: typedName,
  });
  await upstreamSection.getByLabel('Description').fill(typedDesc);

  await routesPom.getAddBtn(page).click();
  await uiHasToastMsg(page, { hasText: 'Add Route Successfully' });
  await routesPom.isDetailPage(page);

  const list = await e2eReq.get<{
    list: { value: APISIXType['Route'] }[];
  }>('/routes');
  const created = list.data.list.find((r) => r.value.name === routeName);
  expect(created).toBeTruthy();
  expect(created?.value.upstream?.name).toBe(typedName);
  expect(created?.value.upstream?.desc).toBe(typedDesc);
});
