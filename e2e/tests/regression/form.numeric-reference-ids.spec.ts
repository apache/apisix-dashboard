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
import { streamRoutesPom } from '@e2e/pom/stream_routes';
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
  API_STREAM_ROUTES,
  API_UPSTREAMS,
} from '@/config/constant';

const UPSTREAM_ID = 10001;
const UPSTREAM_NAME = 'numeric-id upstream';
const PLUGIN_CONFIG_ID = 10002;
const PLUGIN_CONFIG_NAME = 'numeric-id plugin config';
const GROUP_ID = 10003;
const ROUTE_ID = 10004;
const STREAM_ROUTE_ID = 'numeric-ref-stream-route';
const SERVICE_ID = 'numeric-ref-service';
const CONSUMER_NAME = 'numeric_ref_consumer';

const clean = () =>
  safeClean(
    () => e2eReq.delete(`${API_ROUTES}/${ROUTE_ID}`),
    () => e2eReq.delete(`${API_STREAM_ROUTES}/${STREAM_ROUTE_ID}`),
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
  await e2eReq.put(API_ROUTES, {
    id: ROUTE_ID,
    name: 'numeric-ref-route',
    uri: '/numeric-ref',
    upstream_id: UPSTREAM_ID,
    plugin_config_id: PLUGIN_CONFIG_ID,
  });
  await e2eReq.put(`${API_STREAM_ROUTES}/${STREAM_ROUTE_ID}`, {
    server_port: 9100,
    upstream_id: UPSTREAM_ID,
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

const refInput = (page: Page, name: string) =>
  page.locator(`input[name="${name}"]`);

const saveUntouched = async (page: Page, resource: string) => {
  await page.getByRole('button', { name: 'Edit', exact: true }).click();
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByText(`Edit ${resource} Successfully`)).toBeVisible();
  await expect(page.getByText('Expected string, received number')).toHaveCount(
    0
  );
};

test('a route whose id and references are numbers renders, resolves and saves', async ({
  page,
}) => {
  await uiGoto(page, '/routes/detail/$id', { id: String(ROUTE_ID) });
  await routesPom.isDetailPage(page);

  await expect(refInput(page, 'upstream_id')).toHaveValue(
    String(UPSTREAM_ID)
  );
  await expect(
    page.getByRole('link', { name: `View Upstream: ${UPSTREAM_NAME}` })
  ).toBeVisible();
  await expect(
    page.getByRole('link', {
      name: `View Plugin Config: ${PLUGIN_CONFIG_NAME}`,
    })
  ).toBeVisible();

  await saveUntouched(page, 'Route');

  const { data } = await e2eReq.get(`${API_ROUTES}/${ROUTE_ID}`);
  expect(data.value.id).toBe(String(ROUTE_ID));
  expect(data.value.upstream_id).toBe(String(UPSTREAM_ID));
  expect(data.value.plugin_config_id).toBe(String(PLUGIN_CONFIG_ID));
});

test('a stream route whose upstream_id is a number renders, resolves and saves', async ({
  page,
}) => {
  await uiGoto(page, '/stream_routes/detail/$id', { id: STREAM_ROUTE_ID });
  await streamRoutesPom.isDetailPage(page);

  await expect(refInput(page, 'upstream_id')).toHaveValue(
    String(UPSTREAM_ID)
  );
  await expect(
    page.getByRole('link', { name: `View Upstream: ${UPSTREAM_NAME}` })
  ).toBeVisible();

  await saveUntouched(page, 'Stream Route');

  const { data } = await e2eReq.get(`${API_STREAM_ROUTES}/${STREAM_ROUTE_ID}`);
  expect(data.value.upstream_id).toBe(String(UPSTREAM_ID));
});

test('a service whose upstream_id is a number renders, resolves and saves', async ({
  page,
}) => {
  await uiGoto(page, '/services/detail/$id', { id: SERVICE_ID });
  await servicesPom.isDetailPage(page);

  await expect(refInput(page, 'upstream_id')).toHaveValue(
    String(UPSTREAM_ID)
  );
  await expect(
    page.getByRole('link', { name: `View Upstream: ${UPSTREAM_NAME}` })
  ).toBeVisible();

  await saveUntouched(page, 'Service');

  const { data } = await e2eReq.get(`${API_SERVICES}/${SERVICE_ID}`);
  expect(data.value.upstream_id).toBe(String(UPSTREAM_ID));
});

test('a consumer whose group_id is a number renders, resolves and saves', async ({
  page,
}) => {
  await uiGoto(page, '/consumers/detail/$username', {
    username: CONSUMER_NAME,
  });
  await consumersPom.isDetailPage(page);

  await expect(refInput(page, 'group_id')).toHaveValue(
    String(GROUP_ID)
  );
  await expect(
    page.getByRole('link', { name: 'View Consumer Group' })
  ).toBeVisible();

  await saveUntouched(page, 'Consumer');

  const { data } = await e2eReq.get(`${API_CONSUMERS}/${CONSUMER_NAME}`);
  expect(data.value.group_id).toBe(String(GROUP_ID));
});
