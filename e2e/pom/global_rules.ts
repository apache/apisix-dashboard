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
  getGlobalRuleNavBtn: (page: Page) =>
    page.getByRole('link', { name: 'Global Rules', exact: true }),
  getAddGlobalRuleBtn: (page: Page) =>
    page.getByRole('button', { name: 'Add Global Rule', exact: true }),
  getAddBtn: (page: Page) =>
    page.getByRole('button', { name: 'Add', exact: true }),
};

const assert = {
  isIndexPage: async (page: Page) => {
    await expect(page).toHaveURL((url) =>
      url.pathname.endsWith('/global_rules')
    );
    const title = page.getByRole('heading', { name: 'Global Rules' });
    await expect(title).toBeVisible();
  },
  isAddPage: async (page: Page) => {
    await expect(page).toHaveURL((url) =>
      url.pathname.endsWith('/global_rules/add')
    );
    const title = page.getByRole('heading', { name: 'Add Global Rule' });
    await expect(title).toBeVisible();
  },
  isDetailPage: async (page: Page) => {
    await expect(page).toHaveURL((url) =>
      url.pathname.includes('/global_rules/detail')
    );
    const title = page.getByRole('heading', { name: 'Global Rule Detail' });
    await expect(title).toBeVisible();
  },
};

const goto = {
  toIndex: (page: Page) => uiGoto(page, '/global_rules'),
  toAdd: (page: Page) => uiGoto(page, '/global_rules/add'),
};

export const globalRulePom = {
  ...locator,
  ...assert,
  ...goto,
};
