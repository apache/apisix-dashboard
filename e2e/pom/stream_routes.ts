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
  getAddBtn: (page: Page) =>
    page.getByRole('link', { name: 'Add Stream Route' }),
};

const assert = {
  isIndexPage: async (page: Page) => {
    await expect(page).toHaveURL(
      (url) => url.pathname.endsWith('/stream_routes'),
      { timeout: 15000 }
    );
    const title = page.getByRole('heading', { name: 'Stream Routes' });
    await expect(title).toBeVisible({ timeout: 15000 });
  },
  isAddPage: async (page: Page) => {
    await expect(
      page,
      { timeout: 15000 }
    ).toHaveURL((url) => url.pathname.endsWith('/stream_routes/add'));
    const title = page.getByRole('heading', { name: 'Add Stream Route' });
    await expect(title).toBeVisible({ timeout: 15000 });
  },
  isDetailPage: async (page: Page) => {
    await expect(
      page,
      { timeout: 20000 }
    ).toHaveURL((url) => url.pathname.includes('/stream_routes/detail'));
    const title = page.getByRole('heading', {
      name: 'Stream Route Detail',
    });
    await expect(title).toBeVisible({ timeout: 20000 });
  },
};

const goto = {
  toIndex: (page: Page) => uiGoto(page, '/stream_routes'),
  toAdd: (page: Page) => uiGoto(page, '/stream_routes/add'),
};

export const streamRoutesPom = {
  ...locator,
  ...assert,
  ...goto,
};
