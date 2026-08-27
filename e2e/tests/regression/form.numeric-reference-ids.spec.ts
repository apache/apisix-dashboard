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
import { consumersPom } from '@e2e/pom/consumers';
import { routesPom } from '@e2e/pom/routes';
import { servicesPom } from '@e2e/pom/services';
import { safeClean } from '@e2e/utils/clean';
import { e2eReq } from '@e2e/utils/req';
import { test } from '@e2e/utils/test';
import { uiGoto } from '@e2e/utils/ui';
import { expect, type Page } from '@playwright/test';

import {
  API_CONSUMER_GROUPS,
  API_CONSUMERS,
  API_PLUGIN_CONFIGS,
  API_ROUTES,
  API_SERVICES,
  API_UPSTREAMS,
} from '@/config/constant';

const UPSTREAM_ID = 10001;
const UPSTREAM_NAME = 'numeric-id upstream';
const PLUGIN_CONFIG_ID = 10002;
const PLUGIN_CONFIG_NAME = 'numeric-id plugin config';
const GROUP_ID = 10003;
const ROUTE_ID = 'numeric-ref-route';
const SERVICE_ID = 'numeric-ref-service';
const CONSUMER_NAME = 'numeric_ref_consumer';

const clean = () =>
  safeClean(
    () => e2eReq.delete(`${API_ROUTES}/${ROUTE_ID}`),
    () => e2eReq.delete(`${API_SERVICES}/${SERVICE_ID}`),
    () => e2eReq.delete(`${API_CONSUMERS}/${CONSUMER_NAME}`),
    () => e2eReq.delete(`${API_UPSTREAMS}/${UPSTREAM_ID}`),
    () => e2eReq.delete(`${API_PLUGIN_CONFIGS}/${PLUGIN_CONFIG_ID}`),
    () => e2eReq.delete(`${API_CONSUMER_GROUPS}/${GROUP_ID}`)
  );

test.describe.configure({ mode: 'serial' });

test.beforeAll(async () => {
  await clean();
  await e2eReq.put(`${API_UPSTREAMS}/${UPSTREAM_ID}`, {
    name: UPSTREAM_NAME,
    type: 'roundrobin',
    nodes: { 'numeric.local:80': 1 },
  });
  await e2eReq.put(`${API_PLUGIN_CONFIGS}/${PLUGIN_CONFIG_ID}`, {
    name: PLUGIN_CONFIG_NAME,
    plugins: {},
  });
  await e2eReq.put(`${API_CONSUMER_GROUPS}/${GROUP_ID}`, { plugins: {} });
  await e2eReq.put(`${API_ROUTES}/${ROUTE_ID}`, {
    name: ROUTE_ID,
    uri: '/numeric-ref',
    upstream_id: UPSTREAM_ID,
    plugin_config_id: PLUGIN_CONFIG_ID,
  });
  await e2eReq.put(`${API_SERVICES}/${SERVICE_ID}`, {
    name: SERVICE_ID,
    upstream_id: UPSTREAM_ID,
  });
  await e2eReq.put(API_CONSUMERS, {
    username: CONSUMER_NAME,
    group_id: GROUP_ID,
  });
});

test.afterAll(clean);

const saveUntouched = async (page: Page, resource: string) => {
  await page.getByRole('button', { name: 'Edit', exact: true }).click();
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByText(`Edit ${resource} Successfully`)).toBeVisible();
  await expect(page.getByText('Expected string, received number')).toHaveCount(
    0
  );
};

test('a route whose references are numbers renders, resolves and saves', async ({
  page,
}) => {
  await uiGoto(page, '/routes/detail/$id', { id: ROUTE_ID });
  await routesPom.isDetailPage(page);

  // The field shows the id as typed by the other client, and the reference
  // resolves: the link is the proof that the lookup ran with a usable id.
  await expect(
    page
      .getByRole('group', { name: 'Upstream ID', exact: true })
      .locator('input[name="upstream_id"]')
  ).toHaveValue(String(UPSTREAM_ID));
  await expect(
    page.getByRole('link', { name: `View Upstream: ${UPSTREAM_NAME}` })
  ).toBeVisible();
  await expect(
    page.getByRole('link', {
      name: `View Plugin Config: ${PLUGIN_CONFIG_NAME}`,
    })
  ).toBeVisible();

  await saveUntouched(page, 'Route');

  // The references survive the round trip. Their JSON type is the
  // dashboard's business (it always writes strings, which `id_schema`
  // accepts); pointing at the same resources is the contract.
  const { data } = await e2eReq.get(`${API_ROUTES}/${ROUTE_ID}`);
  expect(String(data.value.upstream_id)).toBe(String(UPSTREAM_ID));
  expect(String(data.value.plugin_config_id)).toBe(String(PLUGIN_CONFIG_ID));
});

test('a service whose upstream_id is a number renders, resolves and saves', async ({
  page,
}) => {
  await uiGoto(page, '/services/detail/$id', { id: SERVICE_ID });
  await servicesPom.isDetailPage(page);

  await expect(
    page.getByRole('link', { name: `View Upstream: ${UPSTREAM_NAME}` })
  ).toBeVisible();

  await saveUntouched(page, 'Service');

  const { data } = await e2eReq.get(`${API_SERVICES}/${SERVICE_ID}`);
  expect(String(data.value.upstream_id)).toBe(String(UPSTREAM_ID));
});

test('a consumer whose group_id is a number renders, resolves and saves', async ({
  page,
}) => {
  await uiGoto(page, '/consumers/detail/$username', {
    username: CONSUMER_NAME,
  });
  await consumersPom.isDetailPage(page);

  // Consumer groups carry no `name`, so the link falls back to the bare
  // "View Consumer Group" label.
  await expect(
    page.getByRole('link', { name: 'View Consumer Group' })
  ).toBeVisible();

  await saveUntouched(page, 'Consumer');

  const { data } = await e2eReq.get(`${API_CONSUMERS}/${CONSUMER_NAME}`);
  expect(String(data.value.group_id)).toBe(String(GROUP_ID));
});
