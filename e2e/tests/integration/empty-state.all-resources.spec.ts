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

// Integration F-01: every resource list page renders an empty state when
// etcd holds no rows. The empty state must NOT show raw i18n keys like
// `services.empty` — that pattern is the symptom of #3321.

import { safeClean } from '@e2e/utils/clean';
import { e2eReq } from '@e2e/utils/req';
import { test } from '@e2e/utils/test';
import { uiGoto } from '@e2e/utils/ui';
import { watchForCrashes } from '@e2e/utils/ui/crash';
import { expect } from '@playwright/test';

import { deleteAllConsumerGroups } from '@/apis/consumer_groups';
import { deleteAllConsumers } from '@/apis/consumers';
import { deleteAllRoutes } from '@/apis/routes';
import { deleteAllServices } from '@/apis/services';
import { deleteAllSSLs } from '@/apis/ssls';
import { deleteAllUpstreams } from '@/apis/upstreams';

type Resource = {
  path: `/${string}`;
  label: string;
  apiPath: string;
};

const RESOURCES: Resource[] = [
  { path: '/services', label: 'Services', apiPath: '/services' },
  { path: '/routes', label: 'Routes', apiPath: '/routes' },
  { path: '/upstreams', label: 'Upstreams', apiPath: '/upstreams' },
  { path: '/consumers', label: 'Consumers', apiPath: '/consumers' },
  {
    path: '/consumer_groups',
    label: 'Consumer Groups',
    apiPath: '/consumer_groups',
  },
  { path: '/ssls', label: 'SSLs', apiPath: '/ssls' },
  { path: '/global_rules', label: 'Global Rules', apiPath: '/global_rules' },
  {
    path: '/plugin_configs',
    label: 'Plugin Configs',
    apiPath: '/plugin_configs',
  },
  { path: '/protos', label: 'Protos', apiPath: '/protos' },
];

// Inline delete-all for resources that don't have a product-side helper.
const purge = async (apiPath: string) => {
  const resp = await e2eReq.get(apiPath, {
    params: { page: 1, page_size: 500 },
  });
  const list = (
    resp.data as {
      list?: Array<{ value: { id?: string; username?: string } }>;
    }
  ).list;
  if (!list) return;
  await Promise.all(
    list.map((item) => {
      const id = item.value.id ?? item.value.username;
      return id ? e2eReq.delete(`${apiPath}/${id}`) : null;
    })
  );
};

test.beforeAll(async () => {
  await safeClean(
    () => deleteAllRoutes(e2eReq),
    () => deleteAllServices(e2eReq),
    () => deleteAllUpstreams(e2eReq),
    () => deleteAllConsumers(e2eReq),
    () => deleteAllConsumerGroups(e2eReq),
    () => deleteAllSSLs(e2eReq),
    () => purge('/global_rules'),
    () => purge('/plugin_configs'),
    () => purge('/protos')
  );
});

for (const resource of RESOURCES) {
  test(`${resource.label} list shows empty state without raw i18n keys`, async ({
    page,
  }) => {
    const crashes = watchForCrashes(page);
    // Cast: uiGoto's parameter is the generated FileRouteTypes['to'] union,
    // but the resource paths are exactly the route IDs by construction.
    await uiGoto(page, resource.path as unknown as never);

    await expect(
      page.getByRole('heading', { name: resource.label, exact: true })
    ).toBeVisible();

    // Hard-fail symptoms of #3321 — raw translation key in the visible UI.
    const bodyText = await page.locator('body').innerText();
    for (const suspect of [
      `${resource.path.replace('/', '')}.empty`,
      'translation key missing',
      'missing.translation',
    ]) {
      expect(
        bodyText.toLowerCase().includes(suspect.toLowerCase()),
        `raw key "${suspect}" must not appear in ${resource.label} empty state`
      ).toBe(false);
    }

    crashes.expectNoCrash(`empty ${resource.label} list`);
  });
}
