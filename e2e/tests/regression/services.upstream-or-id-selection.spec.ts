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

// Regression for the #3417 test-suite gap. This spec used to be named after
// `zOneOf` and only tested the inline-upstream-only case — a case an inverted
// implementation would also pass. In fact the Service form does NOT apply the
// `zOneOf` validator at all (that validator is unused by any form and is
// covered directly by src/utils/zod.test.ts across all four quadrants). The
// Service form instead resolves the inline-`upstream` vs `upstream_id` choice
// leniently via the submit pipeline (`produceRmUpstreamWhenHas('upstream_id')`
// drops the inline upstream when an id is given). This spec now pins that real
// behaviour across all four quadrants so an inverted or broken resolution
// cannot slip through.
//
// Related issue: apache/apisix-dashboard#3296.

import { servicesPom } from '@e2e/pom/services';
import { safeClean } from '@e2e/utils/clean';
import { randomId } from '@e2e/utils/common';
import { e2eReq } from '@e2e/utils/req';
import { test } from '@e2e/utils/test';
import { uiHasToastMsg } from '@e2e/utils/ui';
import { uiFillUpstreamRequiredFields } from '@e2e/utils/ui/upstreams';
import { expect } from '@playwright/test';

import { deleteAllServices, getServiceReq } from '@/apis/services';
import { deleteAllUpstreams } from '@/apis/upstreams';
import type { APISIXType } from '@/types/schema/apisix';

const nodes: APISIXType['UpstreamNode'][] = [
  { host: 'reg-svc-up.local', port: 80, weight: 100 },
  { host: 'reg-svc-up-2.local', port: 80, weight: 100 },
];

// A real upstream to reference by id in the upstream_id quadrants — the
// gateway rejects an upstream_id that does not resolve to an existing upstream.
let seededUpstreamId = '';

test.beforeAll(async () => {
  await safeClean(() => deleteAllServices(e2eReq));
  await safeClean(() => deleteAllUpstreams(e2eReq));
  const upstreamId = randomId('reg-svc-ref-up');
  const res = await e2eReq.put<{ value: APISIXType['Upstream'] }>(
    `/upstreams/${upstreamId}`,
    { type: 'roundrobin', nodes: { 'reg-svc-ref.local:80': 1 } }
  );
  seededUpstreamId = res.data.value.id;
});

test.afterAll(async () => {
  await safeClean(() => deleteAllServices(e2eReq));
  await safeClean(() => deleteAllUpstreams(e2eReq));
});

const submitAndRead = async (
  page: import('@playwright/test').Page
): Promise<APISIXType['Service']> => {
  await servicesPom.getAddBtn(page).click();
  await uiHasToastMsg(page, { hasText: 'success' });
  await servicesPom.isDetailPage(page);
  const serviceId = page.url().split('/').pop()!;
  return (await getServiceReq(e2eReq, serviceId)).value;
};

test('alt 1 — inline upstream only: stored as inline, no upstream_id', async ({
  page,
}) => {
  await servicesPom.toAdd(page);
  await servicesPom.isAddPage(page);
  await page.getByLabel('Name', { exact: true }).first().fill(randomId('reg-alt1'));

  const upstreamSection = page.getByRole('group', {
    name: 'Upstream',
    exact: true,
  });
  await uiFillUpstreamRequiredFields(upstreamSection, {
    nodes,
    name: randomId('reg-up'),
  });

  const svc = await submitAndRead(page);
  expect(svc.upstream).toBeDefined();
  expect(svc.upstream_id).toBeUndefined();
});

test('alt 2 — upstream_id only: stored as reference, no inline upstream', async ({
  page,
}) => {
  await servicesPom.toAdd(page);
  await servicesPom.isAddPage(page);
  await page.getByLabel('Name', { exact: true }).first().fill(randomId('reg-alt2'));

  await page.locator('input[name="upstream_id"]').fill(seededUpstreamId);

  const svc = await submitAndRead(page);
  expect(svc.upstream_id).toBe(seededUpstreamId);
  expect(svc.upstream).toBeUndefined();
});

test('both — upstream_id wins, inline upstream is dropped by the pipeline', async ({
  page,
}) => {
  await servicesPom.toAdd(page);
  await servicesPom.isAddPage(page);
  await page.getByLabel('Name', { exact: true }).first().fill(randomId('reg-both'));

  await page.locator('input[name="upstream_id"]').fill(seededUpstreamId);
  const upstreamSection = page.getByRole('group', {
    name: 'Upstream',
    exact: true,
  });
  await uiFillUpstreamRequiredFields(upstreamSection, {
    nodes,
    name: randomId('reg-up'),
  });

  const svc = await submitAndRead(page);
  expect(svc.upstream_id).toBe(seededUpstreamId);
  expect(svc.upstream).toBeUndefined();
});

test('neither — a service with no upstream at all still saves', async ({
  page,
}) => {
  await servicesPom.toAdd(page);
  await servicesPom.isAddPage(page);
  await page
    .getByLabel('Name', { exact: true })
    .first()
    .fill(randomId('reg-neither'));

  const svc = await submitAndRead(page);
  expect(svc.upstream).toBeUndefined();
  expect(svc.upstream_id).toBeUndefined();
});
