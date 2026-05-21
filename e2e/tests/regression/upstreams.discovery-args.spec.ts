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

// Regression: upstream Service Discovery fields must persist.
// Related issues:
//   - apache/apisix-dashboard#3376 Upstreams Discovery Args not saved
//   - apache/apisix-dashboard#3270 same
//   - apache/apisix-dashboard#3287 same
// User expectation: when an upstream is configured with service discovery
// (discovery_type + service_name + discovery_args), all three fields are
// preserved through save and visible from the Admin API.

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
import type { APISIXType } from '@/types/schema/apisix';

const upstreamName = randomId('reg-discovery');
const discoveryType = 'dns';
const serviceName = 'reg-dns-service';
const discoveryArgs = { namespace_id: 'reg-namespace' };

const broadClean = () =>
  safeClean(
    () => deleteAllRoutes(e2eReq),
    () => deleteAllServices(e2eReq),
    () => deleteAllUpstreams(e2eReq)
  );

test.beforeAll(broadClean);

test.afterAll(broadClean);

test('should persist discovery_type, service_name and discovery_args', async ({
  page,
}) => {
  await upstreamsPom.toAdd(page);
  await upstreamsPom.isAddPage(page);

  await test.step('fill name and service discovery fields', async () => {
    await page.getByLabel('Name', { exact: true }).fill(upstreamName);

    // The Service Discovery section exposes three free-text fields:
    // Service Name, Discovery Type, Discovery Args (key:value tag input).
    const discoverySection = page.getByRole('group', {
      name: 'Service Discovery',
    });

    await discoverySection
      .getByRole('textbox', { name: 'Service Name' })
      .fill(serviceName);
    await discoverySection
      .getByRole('textbox', { name: 'Discovery Type' })
      .fill(discoveryType);

    // Discovery Args is a Mantine JsonInput (textarea with monospace), not
    // a tag input — write the full JSON value in one go.
    const discoveryArgsField = discoverySection.locator(
      'textarea[name="discovery_args"]'
    );
    await discoveryArgsField.fill(JSON.stringify(discoveryArgs));
    await discoveryArgsField.blur();
  });

  await test.step('submit', async () => {
    await upstreamsPom.getAddBtn(page).click();
    await uiHasToastMsg(page, { hasText: 'Add Upstream Successfully' });
    await upstreamsPom.isDetailPage(page);
  });

  await test.step('Admin API has all three discovery fields', async () => {
    const upstreamId = page.url().split('/').pop()!;
    const resp = await getUpstreamReq(e2eReq, upstreamId);
    const upstream = resp.value as APISIXType['Upstream'];

    expect(upstream.discovery_type).toBe(discoveryType);
    expect(upstream.service_name).toBe(serviceName);
    expect(upstream.discovery_args).toBeDefined();
    for (const [k, v] of Object.entries(discoveryArgs)) {
      expect((upstream.discovery_args as Record<string, string>)[k]).toBe(v);
    }
  });
});
