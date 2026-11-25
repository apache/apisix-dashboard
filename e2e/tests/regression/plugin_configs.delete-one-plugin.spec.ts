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

// Regression: deleting a single plugin from a plugin config that holds
// several, then saving, must remove only that plugin. The dashboard
// bundled with APISIX 3.17.0 wiped the whole `plugins` object instead:
// the plugin card list's MobX store captured the delete handler from the
// first render, before the fetched values reached the form, so any
// delete rewrote `plugins` from that stale empty snapshot.
//
// Related issue:
//   - apache/apisix-dashboard#3464 deleting one plugin in a plugin config
//     removes all plugins on submit

import { pluginConfigsPom } from '@e2e/pom/plugin_configs';
import { randomId } from '@e2e/utils/common';
import { e2eReq } from '@e2e/utils/req';
import { test } from '@e2e/utils/test';
import { uiGoto, uiHasToastMsg } from '@e2e/utils/ui';
import { expect } from '@playwright/test';

import { putPluginConfigReq } from '@/apis/plugin_configs';
import { API_PLUGIN_CONFIGS } from '@/config/constant';
import type { APISIXType } from '@/types/schema/apisix';

const id = randomId('del-one-plugin');
const plugins = {
  cors: { allow_origins: '*' },
  prometheus: { prefer_name: false },
  'limit-req': { rate: 1, burst: 0, key: 'remote_addr' },
};

test.beforeAll(async () => {
  await putPluginConfigReq(e2eReq, {
    id,
    plugins,
  } as APISIXType['PluginConfigPut']);
});

test.afterAll(async () => {
  await e2eReq.delete(`${API_PLUGIN_CONFIGS}/${id}`);
});

test('deleting one plugin keeps the others on save', async ({ page }) => {
  await uiGoto(page, '/plugin_configs/detail/$id', { id });
  await pluginConfigsPom.isDetailPage(page);

  await page.getByRole('button', { name: 'Edit' }).click();

  const pluginsSection = page.getByRole('group', { name: 'Plugins' });
  for (const name of Object.keys(plugins)) {
    await expect(pluginsSection.getByTestId(`plugin-${name}`)).toBeVisible();
  }

  await test.step('delete the cors plugin only', async () => {
    await pluginsSection
      .getByTestId('plugin-cors')
      .getByRole('button', { name: 'Delete' })
      .click();
    await page
      .getByRole('dialog', { name: 'Delete cors' })
      .getByRole('button', { name: 'Delete' })
      .click();
    await expect(pluginsSection.getByTestId('plugin-cors')).toBeHidden();
    await expect(pluginsSection.getByTestId('plugin-prometheus')).toBeVisible();
    await expect(pluginsSection.getByTestId('plugin-limit-req')).toBeVisible();
  });

  await test.step('save and verify the other plugins survive', async () => {
    await page.getByRole('button', { name: 'Save' }).click();
    await uiHasToastMsg(page, {
      hasText: 'Edit Plugin Config Successfully',
    });

    // the gateway is the source of truth: only cors may be gone
    const res = await e2eReq.get<
      unknown,
      APISIXType['RespPluginConfigDetail']
    >(`${API_PLUGIN_CONFIGS}/${id}`);
    expect(Object.keys(res.data.value.plugins).sort()).toEqual([
      'limit-req',
      'prometheus',
    ]);

    // and the detail page must agree after a fresh load
    await page.reload();
    await pluginConfigsPom.isDetailPage(page);
    await expect(pluginsSection.getByTestId('plugin-cors')).toBeHidden();
    await expect(pluginsSection.getByTestId('plugin-prometheus')).toBeVisible();
    await expect(pluginsSection.getByTestId('plugin-limit-req')).toBeVisible();
  });
});
