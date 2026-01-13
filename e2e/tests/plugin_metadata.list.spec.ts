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

import { pluginMetadataPom } from '@e2e/pom/plugin_metadata';
import { e2eReq } from '@e2e/utils/req';
import { test } from '@e2e/utils/test';
import { expect } from '@playwright/test';

import { API_PLUGIN_METADATA } from '@/config/constant';

// Helper function to delete all plugin metadata
const deleteAllPluginMetadata = async (req: typeof e2eReq) => {
  // Plugin metadata doesn't have a list endpoint, so we'll delete known plugins
  const pluginsToClean = [
    'http-logger',
    'syslog',
    'skywalking',
    'error-log-logger',
  ];
  await Promise.all(
    pluginsToClean.map((name) =>
      req.delete(`${API_PLUGIN_METADATA}/${name}`).catch(() => {
        // Ignore errors if metadata doesn't exist
      })
    )
  );
};

test.beforeAll(async () => {
  await deleteAllPluginMetadata(e2eReq);
});

test.afterAll(async () => {
  await deleteAllPluginMetadata(e2eReq);
});

test('should navigate to plugin metadata page', async ({ page }) => {
  await test.step('navigate to plugin metadata page', async () => {
    await pluginMetadataPom.getPluginMetadataNavBtn(page).click();
    await pluginMetadataPom.isIndexPage(page);
  });

  await test.step('verify plugin metadata page components', async () => {
    // Search box should be visible
    const searchBox = page.getByPlaceholder('Search');
    await expect(searchBox).toBeVisible();

    // Select Plugins button should be visible
    await expect(pluginMetadataPom.getSelectPluginsBtn(page)).toBeVisible();
  });
});

test('should search for plugin metadata', async ({ page }) => {
  await pluginMetadataPom.toIndex(page);
  await pluginMetadataPom.isIndexPage(page);

  await test.step('search filters plugin cards', async () => {
    const searchBox = page.getByPlaceholder('Search');
    await searchBox.fill('http-logger');

    // Only http-logger related cards should be visible if they exist
    // For now just verify search box works
    await expect(searchBox).toHaveValue('http-logger');

    // Clear search
    await searchBox.clear();
    await expect(searchBox).toHaveValue('');
  });
});
