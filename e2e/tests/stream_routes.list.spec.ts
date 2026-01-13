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
import { streamRoutesPom } from '@e2e/pom/stream_routes';
import { setupPaginationTests } from '@e2e/utils/pagination-test-helper';
import { e2eReq } from '@e2e/utils/req';
import { test } from '@e2e/utils/test';
import { expect, type Page } from '@playwright/test';

import { deleteAllStreamRoutes } from '@/apis/stream_routes';
import { API_STREAM_ROUTES } from '@/config/constant';
import type { APISIXType } from '@/types/schema/apisix';

test('should navigate to stream routes page', async ({ page }) => {
  await test.step('navigate to stream routes page', async () => {
    await streamRoutesPom.toIndex(page);
    await streamRoutesPom.isIndexPage(page);
  });

  await test.step('verify stream routes page components', async () => {
    // list table exists
    const table = page.getByRole('table');
    await expect(table).toBeVisible();
    await expect(table.getByText('ID', { exact: true })).toBeVisible();
    await expect(
      table.getByText('Server Address', { exact: true })
    ).toBeVisible();
    await expect(
      table.getByText('Server Port', { exact: true })
    ).toBeVisible();
    await expect(table.getByText('Actions', { exact: true })).toBeVisible();
  });
});

const streamRoutes: APISIXType['StreamRoute'][] = Array.from(
  { length: 11 },
  (_, i) => ({
    id: `stream_route_id_${i + 1}`,
    server_addr: `127.0.0.${i + 1}`,
    server_port: 9000 + i,
    create_time: Date.now(),
    update_time: Date.now(),
  })
);

test.describe('page and page_size should work correctly', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeAll(async () => {
    await deleteAllStreamRoutes(e2eReq);
    await Promise.all(
      streamRoutes.map((d) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, create_time: _createTime, update_time: _updateTime, ...rest } = d;
        return e2eReq.put(`${API_STREAM_ROUTES}/${id}`, rest);
      })
    );
  });

  test.afterAll(async () => {
    await Promise.all(
      streamRoutes.map((d) =>
        e2eReq.delete(`${API_STREAM_ROUTES}/${d.id}`).catch(() => { })
      )
    );
  });

  // Setup pagination tests with stream route-specific configurations
  const filterItemsNotInPage = async (page: Page) => {
    // filter the item which not in the current page
    // it should be random, so we need get all items in the table
    const itemsInPage = await page
      .getByRole('cell', { name: /stream_route_id_/ })
      .all();
    const ids = await Promise.all(itemsInPage.map((v) => v.textContent()));
    return streamRoutes.filter((d) => !ids.includes(d.id));
  };

  setupPaginationTests(test, {
    pom: streamRoutesPom,
    items: streamRoutes,
    filterItemsNotInPage,
    getCell: (page, item) =>
      page.getByRole('cell', { name: item.id }).first(),
  });
});

