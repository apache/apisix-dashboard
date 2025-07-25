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
import { routesPom } from '@e2e/pom/routes';
import { randomId } from '@e2e/utils/common';
import { e2eReq } from '@e2e/utils/req';
import { test } from '@e2e/utils/test';
import { uiHasToastMsg } from '@e2e/utils/ui';
import { uiDeleteRoute } from '@e2e/utils/ui/routes';
import { uiFillUpstreamRequiredFields } from '@e2e/utils/ui/upstreams';
import { expect, type Page } from '@playwright/test';

import { deleteAllRoutes, getRouteReq } from '@/apis/routes';
import { deleteAllServices, postServiceReq } from '@/apis/services';
import { deleteAllUpstreams, postUpstreamReq } from '@/apis/upstreams';
import type { APISIXType } from '@/types/schema/apisix';

const upstreamName = randomId('test-upstream');
const serviceName = randomId('test-service');
const routeNameForUpstreamId = randomId('test-route-upstream-id');
const routeNameForServiceId = randomId('test-route-service-id');
const routeUri1 = '/test-route-upstream-id';
const routeUri2 = '/test-route-service-id';

const upstreamNodes: APISIXType['UpstreamNode'][] = [
  { host: 'test.com', port: 80, weight: 100 },
  { host: 'test2.com', port: 80, weight: 100 },
];

let testUpstreamId: string;
let testServiceId: string;

// Common helper functions
async function fillBasicRouteFields(
  page: Page,
  routeName: string,
  routeUri: string,
  method: string
) {
  await page.getByLabel('Name', { exact: true }).first().fill(routeName);
  await page.getByLabel('URI', { exact: true }).fill(routeUri);

  // Select HTTP method
  await page.getByRole('textbox', { name: 'HTTP Methods' }).click();
  await page.getByRole('option', { name: method }).click();
}

async function fillUpstreamFields(
  page: Page,
  upstreamName: string,
  upstreamDesc: string
) {
  const upstreamSection = page.getByRole('group', {
    name: 'Upstream',
    exact: true,
  });

  await uiFillUpstreamRequiredFields(upstreamSection, {
    nodes: upstreamNodes,
    name: upstreamName,
    desc: upstreamDesc,
  });

  return upstreamSection;
}

async function verifyRouteData(
  page: Page,
  expectedIdField: 'upstream_id' | 'service_id',
  expectedIdValue: string
) {
  await routesPom.isDetailPage(page);

  // Get the route ID from URL
  const url = page.url();
  const routeId = url.split('/').pop();
  expect(routeId).toBeDefined();

  // Fetch route data via API to verify the upstream field was cleared
  const routeResponse = await getRouteReq(e2eReq, routeId!);
  const routeData = routeResponse.value;

  // Verify the expected ID field is preserved
  expect(routeData[expectedIdField]).toBe(expectedIdValue);

  // Verify upstream field is cleared (should be undefined or empty)
  expect(routeData.upstream).toBeUndefined();

  // Verify in UI - the ID field should have the value and be disabled
  const idField = page.locator(`input[name="${expectedIdField}"]`);
  await expect(idField).toHaveValue(expectedIdValue);
  await expect(idField).toBeDisabled();

  return routeId!;
}

async function editRouteAndAddUpstream(
  page: Page,
  upstreamName: string,
  upstreamDesc: string
) {
  // Click Edit button to enter edit mode
  await page.getByRole('button', { name: 'Edit' }).click();

  // Verify we're in edit mode
  const nameField = page.getByLabel('Name', { exact: true }).first();
  await expect(nameField).toBeEnabled();

  // Add upstream configuration
  await fillUpstreamFields(page, upstreamName, upstreamDesc);

  // Submit the changes
  await page.getByRole('button', { name: 'Save' }).click();
  await uiHasToastMsg(page, {
    hasText: 'success',
  });
}

test.beforeAll(async () => {
  // Clean up existing resources
  await deleteAllRoutes(e2eReq);
  await deleteAllServices(e2eReq);
  await deleteAllUpstreams(e2eReq);

  // Create a test upstream for testing upstream_id scenario
  const upstreamResponse = await postUpstreamReq(e2eReq, {
    name: upstreamName,
    nodes: upstreamNodes,
  });
  testUpstreamId = upstreamResponse.data.value.id;

  // Create a test service for testing service_id scenario
  const serviceResponse = await postServiceReq(e2eReq, {
    name: serviceName,
    desc: 'Test service for route upstream field clearing',
  });
  testServiceId = serviceResponse.data.value.id;
});

test.afterAll(async () => {
  await deleteAllRoutes(e2eReq);
  await deleteAllServices(e2eReq);
  await deleteAllUpstreams(e2eReq);
});

test('should clear upstream field when upstream_id exists (create and edit)', async ({
  page,
}) => {
  await routesPom.toAdd(page);

  await test.step('create route with both upstream and upstream_id', async () => {
    // Fill basic route fields
    await fillBasicRouteFields(page, routeNameForUpstreamId, routeUri1, 'GET');

    // Fill upstream fields
    const upstreamSection = await fillUpstreamFields(
      page,
      'test-upstream-inline',
      'test inline upstream'
    );

    // Set upstream_id (this should cause upstream field to be cleared)
    const upstreamIdInput = upstreamSection.locator(
      'input[name="upstream_id"]'
    );
    await upstreamIdInput.fill(testUpstreamId);

    // verify upstream_id has value
    await expect(upstreamIdInput).toHaveValue(testUpstreamId);

    // Submit the form
    await routesPom.getAddBtn(page).click();
    await uiHasToastMsg(page, {
      hasText: 'Add Route Successfully',
    });
  });

  await test.step('verify upstream field is cleared after creation', async () => {
    await verifyRouteData(page, 'upstream_id', testUpstreamId);
  });

  await test.step('edit route and add upstream configuration again', async () => {
    await editRouteAndAddUpstream(
      page,
      'test-upstream-edit-1',
      'test upstream for editing'
    );
  });

  await test.step('verify upstream field is still cleared after editing', async () => {
    await verifyRouteData(page, 'upstream_id', testUpstreamId);
    await uiDeleteRoute(page);
  });
});

test('should clear upstream field when service_id exists (create and edit)', async ({
  page,
}) => {
  await routesPom.toAdd(page);

  await test.step('create route with both upstream and service_id', async () => {
    // Fill basic route fields
    await fillBasicRouteFields(page, routeNameForServiceId, routeUri2, 'POST');

    // Fill upstream fields
    await fillUpstreamFields(
      page,
      'test-upstream-inline-2',
      'test inline upstream 2'
    );

    // Set service_id (this should cause upstream field to be cleared)
    const serviceSection = page.getByRole('group', { name: 'Service' });
    await serviceSection
      .locator('input[name="service_id"]')
      .fill(testServiceId);
    // verify service_id has value
    await expect(page.getByLabel('Service ID', { exact: true })).toHaveValue(
      testServiceId
    );

    // Submit the form
    await routesPom.getAddBtn(page).click();
    await uiHasToastMsg(page, {
      hasText: 'Add Route Successfully',
    });
  });

  await test.step('verify upstream field is cleared after creation', async () => {
    await verifyRouteData(page, 'service_id', testServiceId);
  });

  await test.step('edit route and add upstream configuration again', async () => {
    await editRouteAndAddUpstream(
      page,
      'test-upstream-edit-2',
      'test upstream for editing 2'
    );
  });

  await test.step('verify upstream field is still cleared after editing', async () => {
    await verifyRouteData(page, 'service_id', testServiceId);
    await uiDeleteRoute(page);
  });
});
