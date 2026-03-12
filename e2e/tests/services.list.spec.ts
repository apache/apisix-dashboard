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

import { servicesPom } from '@e2e/pom/services';
import { setupPaginationTests } from '@e2e/utils/pagination-test-helper';
import { e2eReq } from '@e2e/utils/req';
import { test } from '@e2e/utils/test';
import { expect, type Page } from '@playwright/test';

import { deleteAllServices } from '@/apis/services';
import { API_SERVICES } from '@/config/constant';
import type { APISIXType } from '@/types/schema/apisix';

test.describe.configure({ mode: 'serial' });

test('should navigate to services page', async ({ page }) => {
  await test.step('navigate to services page', async () => {
    await servicesPom.getServiceNavBtn(page).click();
    await servicesPom.isIndexPage(page);
  });

  await test.step('verify services page components', async () => {
    await expect(servicesPom.getAddServiceBtn(page)).toBeVisible();

    // list table exists
    const table = page.getByRole('table');
    await expect(table).toBeVisible();
    await expect(table.getByText('ID', { exact: true })).toBeVisible();
    await expect(table.getByText('Name', { exact: true })).toBeVisible();
    await expect(table.getByText('Actions', { exact: true })).toBeVisible();
  });
});

const services: APISIXType['Service'][] = Array.from({ length: 11 }, (_, i) => ({
  id: `service_id_${i + 1}`,
  name: `service_name_${i + 1}`,
  desc: `Service description ${i + 1}`,
  create_time: Date.now(),
  update_time: Date.now(),
}));

test.describe('page and page_size should work correctly', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeAll(async () => {
    await deleteAllServices(e2eReq);
    await Promise.all(
      services.map((d) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, create_time: _createTime, update_time: _updateTime, ...rest } = d;
        return e2eReq.put(`${API_SERVICES}/${id}`, rest);
      })
    );
  });

  test.afterAll(async () => {
    await Promise.all(
      services.map((d) => e2eReq.delete(`${API_SERVICES}/${d.id}`))
    );
  });

  // Setup pagination tests with service-specific configurations
  const filterItemsNotInPage = async (page: Page) => {
    // filter the item which not in the current page
    // it should be random, so we need get all items in the table
    const itemsInPage = await page
      .getByRole('cell', { name: /service_name_/ })
      .all();
    const names = await Promise.all(itemsInPage.map((v) => v.textContent()));
    return services.filter((d) => !names.includes(d.name));
  };

  setupPaginationTests(test, {
    pom: servicesPom,
    items: services,
    filterItemsNotInPage,
    getCell: (page, item) =>
      page.getByRole('cell', { name: item.name }).first(),
  });
});
