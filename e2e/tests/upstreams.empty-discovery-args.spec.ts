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
import { upstreamsPom } from '@e2e/pom/upstreams';
import { e2eReq } from '@e2e/utils/req';
import { test } from '@e2e/utils/test';
import { uiHasToastMsg } from '@e2e/utils/ui';
import { expect } from '@playwright/test';

import { deleteAllUpstreams, putUpstreamReq } from '@/apis/upstreams';
import { API_UPSTREAMS } from '@/config/constant';
import type { APISIXType } from '@/types/schema/apisix';

/**
 * Test that editing an upstream with service discovery and empty discovery_args
 * does not cause the discovery_args field to be dropped.
 * Regression test for: https://github.com/apache/apisix-dashboard/issues/3270
 */
const upstream: APISIXType['Upstream'] = {
  id: 'upstream_discovery_test',
  name: 'upstream_discovery_test',
  desc: 'Upstream with service discovery',
  discovery_type: 'nacos',
  service_name: 'test-service',
  discovery_args: {},
};

test.beforeAll(async () => {
  await deleteAllUpstreams(e2eReq);
  await putUpstreamReq(e2eReq, upstream);
});

test.afterAll(async () => {
  await deleteAllUpstreams(e2eReq);
});

test('should preserve empty discovery_args after editing upstream', async ({
  page,
}) => {
  await test.step('verify upstream exists and has discovery fields', async () => {
    // Verify upstream was created with discovery_args via API
    const resp = await e2eReq.get(`${API_UPSTREAMS}/${upstream.id}`);
    const data = resp.data;
    expect(data.value.discovery_type).toBe('nacos');
    expect(data.value.service_name).toBe('test-service');
    expect(data.value.discovery_args).toEqual({});
  });

  await test.step('navigate to upstream detail page', async () => {
    await upstreamsPom.toIndex(page);
    await upstreamsPom.isIndexPage(page);

    // Click on the upstream to view details
    const row = page.locator('tr').filter({ hasText: upstream.name });
    await expect(row).toBeVisible();
    await row.getByRole('button', { name: 'View' }).click();
    await upstreamsPom.isDetailPage(page);
  });

  await test.step('edit upstream description and save', async () => {
    // Click Edit button
    await page.getByRole('button', { name: 'Edit' }).click();

    // Verify we're in edit mode
    const nameField = page.getByLabel('Name', { exact: true }).first();
    await expect(nameField).toBeEnabled();

    // Verify discovery fields are visible
    const discoverySection = page.getByRole('group', {
      name: 'Service Discovery',
    });
    await expect(discoverySection).toBeVisible();

    // Update the description to trigger a change
    const descriptionField = page.getByLabel('Description').first();
    await descriptionField.fill(
      'Updated description to verify discovery_args persists'
    );

    // Save the changes
    const saveBtn = page.getByRole('button', { name: 'Save' });
    await saveBtn.click();

    // Verify the update was successful
    await uiHasToastMsg(page, {
      hasText: 'success',
    });

    // Verify we're back in detail view mode
    await upstreamsPom.isDetailPage(page);
  });

  await test.step('verify discovery_args is preserved after edit', async () => {
    // Verify via API that discovery_args was not dropped
    const resp = await e2eReq.get(`${API_UPSTREAMS}/${upstream.id}`);
    const data = resp.data;
    expect(data.value.discovery_type).toBe('nacos');
    expect(data.value.service_name).toBe('test-service');
    expect(data.value.discovery_args).toEqual({});
    expect(data.value.desc).toBe(
      'Updated description to verify discovery_args persists'
    );
  });
});
