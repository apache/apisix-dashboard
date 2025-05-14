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

import { expect, type Page } from '@playwright/test';
import { UpstreamsPom } from '@pom/upstreams';
import { deleteAllUpstreams, putUpstreamReq } from '@src/apis/upstreams';
import type { APISIXType } from '@src/types/schema/apisix';
import { e2eReq } from '@utils/req';
import { test } from '@utils/test';

const upstreams: APISIXType['Upstream'][] = Array.from(
  { length: 11 },
  (_, i) => ({
    id: `upstream_id_${i + 1}`,
    name: `upstream_name_${i + 1}`,
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
  const upstreamsPom = new UpstreamsPom(page);
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

  // test.afterAll(async () => {
  //   await Promise.all(
  //     upstreams.map((d) => e2eReq.delete(`${API_UPSTREAMS}/${d.id}`))
  //   );
  // });

  const defaultPageSize = 10;
  const newPageSize = 20;
  const defaultPageNum = 1;
  const getPageSizeSelection = (page: Page, size: number) => {
    return page
      .locator('.ant-select-selection-item')
      .filter({ hasText: new RegExp(`${size} / page`) })
      .first();
  };
  const getPageSizeOption = (page: Page, size: number) => {
    return page.getByRole('option', { name: `${size} / page` });
  };
  const getPageNum = (page: Page, num: number) => {
    return page.getByRole('listitem', { name: `${num}` });
  };
  const filterItemsNotInPage = async (page: Page) => {
    // filter the item  which not in the current page
    // it should be random, so we need get all items in the table
    const itemsInPage = await page
      .getByRole('cell', { name: /upstream_name_/ })
      .all();
    const names = await Promise.all(itemsInPage.map((v) => v.textContent()));
    const itemsNotInPage = upstreams.filter((d) => !names.includes(d.name));
    return itemsNotInPage;
  };

  test('can switch using tables normally.', async ({ page }) => {
    const upstreamsPom = new UpstreamsPom(page);
    await test.step('navigate to upstreams page', async () => {
      await upstreamsPom.goto();
      await upstreamsPom.isListPage();
    });

    const itemsNotInPage = await filterItemsNotInPage(page);

    await test.step('default page info should exists', async () => {
      // pageSize should exist in url
      await expect(page).toHaveURL(
        (url) => url.searchParams.get('pageSize') === defaultPageSize.toString()
      );
      // pageSize should exist in table
      await expect(getPageSizeSelection(page, defaultPageSize)).toBeVisible();

      // pageNum should exist in url
      await expect(page).toHaveURL(
        (url) => url.searchParams.get('page') === defaultPageNum.toString()
      );
      // pageNum should exist in table
      await expect(getPageNum(page, defaultPageNum)).toBeVisible();

      // items not in page should not be visible
      itemsNotInPage.forEach(async (item) => {
        await expect(
          page.getByRole('cell', { name: item.name, exact: true })
        ).toBeHidden();
      });
    });

    await test.step('can switch page size', async () => {
      // click page size selection, then click new page size option
      await getPageSizeSelection(page, defaultPageSize).click();
      await getPageSizeOption(page, newPageSize).click();

      await expect(getPageSizeSelection(page, newPageSize)).toBeVisible();
      await expect(getPageNum(page, defaultPageNum)).toBeVisible();
      // old pageSize should be hidden
      await expect(getPageSizeSelection(page, defaultPageSize)).toBeHidden();

      // pageSize should exist in url
      await expect(page).toHaveURL(
        (url) => url.searchParams.get('pageSize') === newPageSize.toString()
      );
      // pageNum should exist in url
      await expect(page).toHaveURL(
        (url) => url.searchParams.get('page') === defaultPageNum.toString()
      );

      // all items should be visible
      upstreams.forEach(async (item) => {
        await expect(
          page.getByRole('cell', { name: item.name, exact: true })
        ).toBeVisible();
      });
    });

    await test.step('switch to default', async () => {
      await getPageSizeSelection(page, newPageSize).click();
      await getPageSizeOption(page, defaultPageSize).click();

      await expect(getPageSizeSelection(page, defaultPageSize)).toBeVisible();
      await expect(getPageNum(page, defaultPageNum)).toBeVisible();
      // old pageSize should be hidden
      await expect(getPageSizeSelection(page, newPageSize)).toBeHidden();

      // items not in page should not be visible
      itemsNotInPage.forEach(async (item) => {
        await expect(
          page.getByRole('cell', { name: item.name, exact: true })
        ).toBeHidden();
      });
    });

    const newPageNum = 2;
    await test.step(`can switch page num to ${newPageNum}`, async () => {
      // click page num
      await getPageNum(page, defaultPageNum).click();
      await getPageNum(page, newPageNum).click();

      // pageNum should exist in url
      await expect(page).toHaveURL(
        (url) => url.searchParams.get('page') === newPageNum.toString()
      );
      await upstreamsPom.isListPage();

      // items not in page should be visible
      itemsNotInPage.forEach(async (item) => {
        await expect(
          page.getByRole('cell', { name: item.name, exact: true })
        ).toBeVisible();
      });
    });
  });
});

