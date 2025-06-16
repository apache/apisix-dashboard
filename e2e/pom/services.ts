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
  getServiceNavBtn: (page: Page) =>
    page.getByRole('link', { name: 'Services', exact: true }),
  getAddServiceBtn: (page: Page) =>
    page.getByRole('button', { name: 'Add Service', exact: true }),
  getAddBtn: (page: Page) =>
    page.getByRole('button', { name: 'Add', exact: true }),
  // Service routes locators
  getServiceRoutesTab: (page: Page) =>
    page.getByRole('tab', { name: 'Routes', exact: true }),
  getAddRouteBtn: (page: Page) =>
    page.getByRole('button', { name: 'Add Route', exact: true }),
  // Service stream routes locators
  getServiceStreamRoutesTab: (page: Page) =>
    page.getByRole('tab', { name: 'Stream Routes', exact: true }),
  getAddStreamRouteBtn: (page: Page) =>
    page.getByRole('button', { name: 'Add Stream Route', exact: true }),
};

const assert = {
  isIndexPage: async (page: Page) => {
    await expect(page).toHaveURL((url) => url.pathname.endsWith('/services'));
    const title = page.getByRole('heading', { name: 'Services' });
    await expect(title).toBeVisible();
  },
  isAddPage: async (page: Page) => {
    await expect(page).toHaveURL((url) =>
      url.pathname.endsWith('/services/add')
    );
    const title = page.getByRole('heading', { name: 'Add Service' });
    await expect(title).toBeVisible();
  },
  isDetailPage: async (page: Page) => {
    await expect(page).toHaveURL((url) =>
      url.pathname.includes('/services/detail')
    );
    const title = page.getByRole('heading', { name: 'Service Detail' });
    await expect(title).toBeVisible();
  },
  // Service routes assertions
  isServiceRoutesPage: async (page: Page) => {
    await expect(page).toHaveURL(
      (url) =>
        url.pathname.includes('/services/detail') &&
        url.pathname.includes('/routes')
    );
    // Wait for page to load completely
    await page.waitForLoadState('networkidle');
    const title = page.getByRole('heading', { name: 'Routes' });
    await expect(title).toBeVisible();
  },
  isServiceRouteAddPage: async (page: Page) => {
    await expect(page).toHaveURL(
      (url) =>
        url.pathname.includes('/services/detail') &&
        url.pathname.includes('/routes/add')
    );
    const title = page.getByRole('heading', { name: 'Add Route' });
    await expect(title).toBeVisible();
  },
  isServiceRouteDetailPage: async (page: Page) => {
    await expect(page).toHaveURL(
      (url) =>
        url.pathname.includes('/services/detail') &&
        url.pathname.includes('/routes/detail')
    );
    const title = page.getByRole('heading', { name: 'Route Detail' });
    await expect(title).toBeVisible();
  },
  // Service stream routes assertions
  isServiceStreamRoutesPage: async (page: Page) => {
    await expect(page).toHaveURL(
      (url) =>
        url.pathname.includes('/services/detail') &&
        url.pathname.includes('/stream_routes')
    );
    // Wait for page to load completely
    await page.waitForLoadState('networkidle');
    const title = page.getByRole('heading', { name: 'Stream Routes' });
    await expect(title).toBeVisible();
  },
  isServiceStreamRouteAddPage: async (page: Page) => {
    await expect(page).toHaveURL(
      (url) =>
        url.pathname.includes('/services/detail') &&
        url.pathname.includes('/stream_routes/add')
    );
    const title = page.getByRole('heading', { name: 'Add Stream Route' });
    await expect(title).toBeVisible();
  },
  isServiceStreamRouteDetailPage: async (page: Page) => {
    await expect(page).toHaveURL(
      (url) =>
        url.pathname.includes('/services/detail') &&
        url.pathname.includes('/stream_routes/detail')
    );
    const title = page.getByRole('heading', { name: 'Stream Route Detail' });
    await expect(title).toBeVisible();
  },
};

const goto = {
  toIndex: (page: Page) => uiGoto(page, '/services'),
  toAdd: (page: Page) => uiGoto(page, '/services/add'),
  toServiceRoutes: (page: Page, serviceId: string) =>
    uiGoto(page, '/services/detail/$id/routes', { id: serviceId }),
  toServiceRouteAdd: (page: Page, serviceId: string) =>
    uiGoto(page, '/services/detail/$id/routes/add', {
      id: serviceId,
    }),
  toServiceStreamRoutes: (page: Page, serviceId: string) =>
    uiGoto(page, '/services/detail/$id/stream_routes', { id: serviceId }),
  toServiceStreamRouteAdd: (page: Page, serviceId: string) =>
    uiGoto(page, '/services/detail/$id/stream_routes/add', {
      id: serviceId,
    }),
};

export const servicesPom = {
  ...locator,
  ...assert,
  ...goto,
};
