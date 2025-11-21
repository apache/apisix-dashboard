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

import { pluginConfigsPom } from '@e2e/pom/plugin_configs';
import { setupPaginationTests } from '@e2e/utils/pagination-test-helper';
import { e2eReq } from '@e2e/utils/req';
import { test } from '@e2e/utils/test';
import { expect, type Page } from '@playwright/test';

import { putPluginConfigReq } from '@/apis/plugin_configs';
import { API_PLUGIN_CONFIGS } from '@/config/constant';
import type { APISIXType } from '@/types/schema/apisix';

// Helper function to delete all plugin configs
const deleteAllPluginConfigs = async (req: typeof e2eReq) => {
  const response = await req.get<unknown, APISIXType['RespPluginConfigList']>(API_PLUGIN_CONFIGS);
  const list = response.data.list || [];
  await Promise.all(list.map((item) => req.delete(`${API_PLUGIN_CONFIGS}/${item.value.id}`)));
};

test('should navigate to plugin configs page', async ({ page }) => {
  await test.step('navigate to plugin configs page', async () => {
    await pluginConfigsPom.getPluginConfigNavBtn(page).click();
    await pluginConfigsPom.isIndexPage(page);
  });

  await test.step('verify plugin configs page components', async () => {
    await expect(pluginConfigsPom.getAddPluginConfigBtn(page)).toBeVisible();

    // list table exists
    const table = page.getByRole('table');
    await expect(table).toBeVisible();
    await expect(table.getByText('ID', { exact: true })).toBeVisible();
    await expect(table.getByText('Name', { exact: true })).toBeVisible();
    await expect(table.getByText('Description', { exact: true })).toBeVisible();
    await expect(table.getByText('Actions', { exact: true })).toBeVisible();
  });
});

const pluginConfigs: APISIXType['PluginConfigPut'][] = Array.from(
  { length: 11 },
  (_, i) => ({
    id: `plugin_config_id_${i + 1}`,
    name: `plugin_config_name_${i + 1}`,
    desc: `Description for plugin config ${i + 1}`,
    plugins: {
      'response-rewrite': {
        body: `test_body_${i + 1}`,
      },
    },
  })
);

test.describe('page and page_size should work correctly', () => {
  test.describe.configure({ mode: 'serial' });
  test.beforeAll(async () => {
    await deleteAllPluginConfigs(e2eReq);
    await Promise.all(pluginConfigs.map((d) => putPluginConfigReq(e2eReq, d)));
  });

  test.afterAll(async () => {
    // Clean up: delete only existing plugin configs
    const response = await e2eReq.get<unknown, APISIXType['RespPluginConfigList']>(
      API_PLUGIN_CONFIGS
    );
    const list = response.data.list || [];
    const idsToDelete = pluginConfigs
      .map((d) => d.id)
      .filter((id) => list.some((item) => item.value.id === id));
    await Promise.all(
      idsToDelete.map((id) => e2eReq.delete(`${API_PLUGIN_CONFIGS}/${id}`))
    );
  });

  // Setup pagination tests with plugin config-specific configurations
  const filterItemsNotInPage = async (page: Page) => {
    // filter the item which not in the current page
    // it should be random, so we need get all items in the table
    const itemsInPage = await page
      .getByRole('cell', { name: /plugin_config_name_/ })
      .all();
    const names = await Promise.all(itemsInPage.map((v) => v.textContent()));
    return pluginConfigs.filter((d) => !names.includes(d.name));
  };

  setupPaginationTests(test, {
    pom: pluginConfigsPom,
    items: pluginConfigs,
    filterItemsNotInPage,
    getCell: (page, item) =>
      page.getByRole('cell', { name: item.name }).first(),
  });
});
