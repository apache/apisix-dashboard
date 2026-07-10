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

// Regression for apache/apisix-dashboard#3412: the Plugin Metadata page
// probes GET /plugin_metadata/{name} once per metadata-capable plugin.
// The Admin API answers 404 for every plugin whose metadata was never
// configured — the normal state for most plugins on any deployment — and
// each 404 used to fall through to the global axios interceptor as a red
// "Key not found" toast. A fresh page load must show zero error toasts.

import { pluginMetadataPom } from '@e2e/pom/plugin_metadata';
import { e2eReq } from '@e2e/utils/req';
import { test } from '@e2e/utils/test';
import { expect } from '@playwright/test';

import { API_PLUGIN_METADATA } from '@/config/constant';

// Plugin metadata has no deleteAll helper; clear plugins commonly used in
// other specs so the page probes an unconfigured state.
const deleteKnownPluginMetadata = async () => {
  const pluginsToClean = ['http-logger', 'syslog', 'skywalking', 'datadog'];
  await Promise.all(
    pluginsToClean.map((name) =>
      e2eReq.delete(`${API_PLUGIN_METADATA}/${name}`).catch(() => {
        // ignore: metadata may not exist
      })
    )
  );
};

test.beforeAll(async () => {
  await deleteKnownPluginMetadata();
});

test('page load with unconfigured plugins shows no error toasts', async ({
  page,
}) => {
  // Track the per-plugin probes so the assertion runs after the storm of
  // 404s has actually happened, not before.
  let probes = 0;
  page.on('response', (res) => {
    if (res.url().includes('/apisix/admin/plugin_metadata/')) probes += 1;
  });

  await pluginMetadataPom.toIndex(page);
  await pluginMetadataPom.isIndexPage(page);

  // The page enumerates every metadata-capable plugin; wait until the
  // probe count is non-trivial AND has stopped growing (storm settled).
  let lastSeen = -1;
  await expect
    .poll(
      () => {
        const settled = probes > 5 && probes === lastSeen;
        lastSeen = probes;
        return settled;
      },
      { timeout: 15000, intervals: [1000] }
    )
    .toBe(true);

  // A 404 probe result means "not configured" — it must not toast.
  await expect(page.getByRole('alert')).toHaveCount(0);

  // The page must remain functional: the select drawer offers plugins to
  // configure even though every probe 404'd.
  await page.getByRole('button', { name: 'Select Plugins' }).click();
  const drawer = page.getByRole('dialog');
  await expect(drawer.getByRole('button', { name: 'Add' }).first())
    .toBeVisible();
});

test('a plugin whose metadata probe fails is not offered as an empty config', async ({
  page,
}) => {
  // Fault injection: a real Admin API cannot be made to 500 a single
  // plugin's metadata GET deterministically. A failed (non-404) probe
  // must NOT be presented as "unconfigured" — saving the offered empty
  // config would overwrite the plugin's existing metadata.
  await page.route('**/apisix/admin/plugin_metadata/http-logger', (route) =>
    route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error_msg: 'injected metadata failure' }),
    })
  );

  await pluginMetadataPom.toIndex(page);
  await pluginMetadataPom.isIndexPage(page);

  // The real failure must surface to the user ...
  await expect(
    page.getByRole('alert').filter({ hasText: 'injected metadata failure' })
  ).toBeVisible({ timeout: 15000 });

  // ... and the failed plugin must not be offered in the select drawer.
  await page.getByRole('button', { name: 'Select Plugins' }).click();
  const drawer = page.getByRole('dialog');
  await expect(drawer.getByRole('button', { name: 'Add' }).first())
    .toBeVisible();
  await expect(
    drawer.getByText('http-logger', { exact: true })
  ).toHaveCount(0);
});
