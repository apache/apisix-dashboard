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
import { uiGoto } from '@e2e/utils/ui';
import { expect, type Page } from '@playwright/test';

const locator = {
  getPluginConfigNavBtn: (page: Page) =>
    page.getByRole('link', { name: 'Plugin Configs', exact: true }),
  getAddPluginConfigBtn: (page: Page) =>
    page.getByRole('button', { name: 'Add Plugin Config', exact: true }),
  getAddBtn: (page: Page) =>
    page.getByRole('button', { name: 'Add', exact: true }),
};

const assert = {
  isIndexPage: async (page: Page) => {
    await expect(page).toHaveURL((url) =>
      url.pathname.endsWith('/plugin_configs')
    );
    const title = page.getByRole('heading', { name: 'Plugin Configs' });
    await expect(title).toBeVisible();
  },
  isAddPage: async (page: Page) => {
    await expect(page).toHaveURL((url) =>
      url.pathname.endsWith('/plugin_configs/add')
    );
    const title = page.getByRole('heading', { name: 'Add Plugin Config' });
    await expect(title).toBeVisible();
  },
  isDetailPage: async (page: Page) => {
    await expect(page).toHaveURL((url) =>
      url.pathname.includes('/plugin_configs/detail')
    );
    const title = page.getByRole('heading', { name: 'Plugin Config Detail' });
    await expect(title).toBeVisible();
  },
};

const goto = {
  toIndex: (page: Page) => uiGoto(page, '/plugin_configs'),
  toAdd: (page: Page) => uiGoto(page, '/plugin_configs/add'),
};

export const pluginConfigsPom = {
  ...locator,
  ...assert,
  ...goto,
};