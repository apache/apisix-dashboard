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

// Regression: zOneOf validators must accept the form when exactly one of the
// mutually-exclusive alternatives is provided.
//
// Related issue:
//   - apache/apisix-dashboard#3296 zOneOf validation fires even when one
//     field is provided
//
// We use Service form as a concrete instance: a service must have either
// inline `upstream` config OR an `upstream_id`. Filling only the inline
// upstream must satisfy validation and submit successfully.

import { servicesPom } from '@e2e/pom/services';
import { safeClean } from '@e2e/utils/clean';
import { randomId } from '@e2e/utils/common';
import { e2eReq } from '@e2e/utils/req';
import { test } from '@e2e/utils/test';
import { uiHasToastMsg } from '@e2e/utils/ui';
import { uiFillUpstreamRequiredFields } from '@e2e/utils/ui/upstreams';
import { expect } from '@playwright/test';

import { deleteAllServices, getServiceReq } from '@/apis/services';
import type { APISIXType } from '@/types/schema/apisix';

const nodes: APISIXType['UpstreamNode'][] = [
  { host: 'reg-zoneof.local', port: 80, weight: 100 },
  { host: 'reg-zoneof-2.local', port: 80, weight: 100 },
];

test.beforeAll(async () => {
  await safeClean(() => deleteAllServices(e2eReq));
});

test.afterAll(async () => {
  await safeClean(() => deleteAllServices(e2eReq));
});

test('Service with only inline upstream (zOneOf alt 1) submits cleanly', async ({
  page,
}) => {
  const serviceName = randomId('reg-zoneof-inline');

  await servicesPom.toAdd(page);
  await servicesPom.isAddPage(page);

  await page.getByLabel('Name', { exact: true }).first().fill(serviceName);

  const upstreamSection = page.getByRole('group', {
    name: 'Upstream',
    exact: true,
  });
  await uiFillUpstreamRequiredFields(
    upstreamSection,
    { nodes, name: randomId('reg-up'), desc: 'reg' }
  );

  await servicesPom.getAddBtn(page).click();
  await uiHasToastMsg(page, { hasText: 'success' });
  await servicesPom.isDetailPage(page);

  const serviceId = page.url().split('/').pop()!;
  const svc = (await getServiceReq(e2eReq, serviceId)).value;
  expect(svc.upstream).toBeDefined();
  expect(svc.upstream_id).toBeUndefined();
});
