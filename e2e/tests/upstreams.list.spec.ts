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

import { expect } from '@playwright/test';
import { UpstreamsPOM } from '@pom/upstreams';
import { deleteAllUpstreams, putUpstreamReq } from '@src/apis/upstreams';
import { API_UPSTREAMS } from '@src/config/constant';
import type { APISIXType } from '@src/types/schema/apisix';
import { e2eReq } from '@utils/req';
import { test } from '@utils/test';

const upstreams: APISIXType['Upstream'][] = Array.from(
  { length: 11 },
  (_, i) => ({
    id: `upstream_${i + 1}`,
    name: `upstream_${i + 1}`,
    nodes: [
      {
        host: `node_${i + 1}`,
        port: 80,
        weight: 100,
      },
    ],
  })
);

test('should navigate to upstreams page', async ({ page }) => {
  const upstreamsPom = new UpstreamsPOM(page);
  await test.step('navigate to upstreams page', async () => {
    await upstreamsPom.upstreamNavBtn.click();
    await upstreamsPom.isListPage();
  });

  await test.step('verify upstreams page components', async () => {
    await expect(upstreamsPom.addUpstreamBtn).toBeVisible();

    // list table exists
    const table = page.getByRole('table');
    await expect(table).toBeVisible();
    await expect(table.getByText('ID', { exact: true })).toBeVisible();
    await expect(table.getByText('Name', { exact: true })).toBeVisible();
    await expect(table.getByText('Labels', { exact: true })).toBeVisible();
    await expect(table.getByText('Actions', { exact: true })).toBeVisible();
  });
});

test.describe('page and page_size should works correctly', () => {
  test.beforeAll(async () => {
    await deleteAllUpstreams(e2eReq);
    await Promise.all(upstreams.map((d) => putUpstreamReq(e2eReq, d)));
  });

  test.afterAll(async () => {
    await Promise.all(
      upstreams.map((d) => e2eReq.delete(`${API_UPSTREAMS}/${d.id}`))
    );
  });

  test('can switch using tables normally.', async ({ page }) => {
    const upstreamsPom = new UpstreamsPOM(page);
    await test.step('navigate to upstreams page', async () => {
      await upstreamsPom.goto();
      await upstreamsPom.isListPage();
    });

    const defaultPageSize = 10;
    const defaultPageNum = 1;
    const pageNum = defaultPageNum;
    let pageSize = defaultPageSize;

    const getPageSizeSelection = (size: number) =>
      page
        .locator('.ant-select-selection-item')
        .filter({ hasText: new RegExp(`${size} / page`) })
        .first();
    const getPageSizeOption = (size: number) =>
      page.getByRole('option', { name: `${size} / page` });
    const getPageNum = (num: number) =>
      page.getByRole('listitem', { name: `${num}` });

    await test.step('default page info should exists', async () => {
      // pageSize should exist in url
      await expect(page).toHaveURL(
        (url) => url.searchParams.get('pageSize') === pageSize.toString()
      );
      // pageSize should exist in table
      await expect(getPageSizeSelection(pageSize)).toBeVisible();

      // pageNum should exist in url
      await expect(page).toHaveURL(
        (url) => url.searchParams.get('page') === pageNum.toString()
      );
      // pageNum should exist in table
      await expect(getPageNum(pageNum)).toBeVisible();
    });

    await test.step('can switch page size', async () => {
      await getPageSizeSelection(pageSize).click();
      pageSize = 20;
      await getPageSizeOption(pageSize).click();

      await expect(getPageSizeSelection(pageSize)).toBeVisible();
      await expect(getPageNum(pageNum)).toBeVisible();
      // old pageSize should be hidden
      await expect(getPageSizeSelection(defaultPageSize)).toBeHidden();

      // pageSize should exist in url
      await expect(page).toHaveURL(
        (url) => url.searchParams.get('pageSize') === pageSize.toString()
      );
      // pageNum should exist in url
      await expect(page).toHaveURL(
        (url) => url.searchParams.get('page') === pageNum.toString()
      );
    });
  });
});

