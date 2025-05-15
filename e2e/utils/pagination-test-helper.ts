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

import { expect, type Locator, type Page } from '@playwright/test';

import { test as realTest } from './test';

export interface PaginationTestConfig<T> {
  pom: {
    toIndex: (page: Page) => Promise<unknown>;
    isIndexPage: (page: Page) => Promise<void>;
  };
  items: T[];
  filterItemsNotInPage: (page: Page) => Promise<T[]>;
  getCell: (page: Page, item: T) => Locator;
}

export function setupPaginationTests<T>(
  test: typeof realTest,
  { pom, items, filterItemsNotInPage, getCell }: PaginationTestConfig<T>
) {
  const defaultPageNum = 1;
  const defaultPageSize = 10;
  const newPageSize = 20;
  const newPageNum = 2;

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

  const itemIsVisible = async (page: Page, item: T) => {
    const cell = getCell(page, item);
    await expect(cell).toBeVisible();
  };

  const itemIsHidden = async (page: Page, item: T) => {
    const cell = getCell(page, item);
    await expect(cell).toBeHidden();
  };

  test('can use the pagination of the table to switch', async ({ page }) => {
    await test.step('navigate to list page', async () => {
      await pom.toIndex(page);
      await pom.isIndexPage(page);
    });

    await test.step('default page info should exists', async () => {
      // page_size should exist in url
      await expect(page).toHaveURL(
        (url) =>
          url.searchParams.get('page_size') === defaultPageSize.toString()
      );
      // page_size should exist in table
      await expect(getPageSizeSelection(page, defaultPageSize)).toBeVisible();

      // pageNum should exist in url
      await expect(page).toHaveURL(
        (url) => url.searchParams.get('page') === defaultPageNum.toString()
      );
      // pageNum should exist in table
      await expect(getPageNum(page, defaultPageNum)).toBeVisible();

      const itemsNotInPage = await filterItemsNotInPage(page);
      // items not in page should not be visible
      for (const item of itemsNotInPage) {
        await itemIsHidden(page, item);
      }
    });

    await test.step(`can switch page size to ${newPageSize}`, async () => {
      // click page size selection, then click new page size option
      await getPageSizeSelection(page, defaultPageSize).click();
      await getPageSizeOption(page, newPageSize).click();

      await expect(getPageSizeSelection(page, newPageSize)).toBeVisible();
      await expect(getPageNum(page, defaultPageNum)).toBeVisible();
      // old page_size should be hidden
      await expect(getPageSizeSelection(page, defaultPageSize)).toBeHidden();

      // page_size should exist in url
      await expect(page).toHaveURL(
        (url) => url.searchParams.get('page_size') === newPageSize.toString()
      );
      // pageNum should exist in url
      await expect(page).toHaveURL(
        (url) => url.searchParams.get('page') === defaultPageNum.toString()
      );

      // all items should be visible
      for (const item of items) {
        await itemIsVisible(page, item);
      }
    });

    await test.step('switch to default', async () => {
      await getPageSizeSelection(page, newPageSize).click();
      await getPageSizeOption(page, defaultPageSize).click();

      await expect(getPageSizeSelection(page, defaultPageSize)).toBeVisible();
      await expect(getPageNum(page, defaultPageNum)).toBeVisible();
      await expect(getPageSizeSelection(page, newPageSize)).toBeHidden();
    });

    await test.step(`can switch page num to ${newPageNum}`, async () => {
      const itemsNotInPage = await filterItemsNotInPage(page);
      // click page num
      await getPageNum(page, defaultPageNum).click();
      await getPageNum(page, newPageNum).click();

      // pageNum should exist in url
      await expect(page).toHaveURL(
        (url) => url.searchParams.get('page') === newPageNum.toString()
      );
      await pom.isIndexPage(page);

      // items not in page should be visible
      for (const item of itemsNotInPage) {
        await itemIsVisible(page, item);
      }
    });
  });

  test('can use the search params in the URL to switch', async ({ page }) => {
    await test.step('navigate to list page', async () => {
      await pom.toIndex(page);
      await pom.isIndexPage(page);
    });

    await test.step('default page info should exists', async () => {
      // page_size should exist in url
      await expect(page).toHaveURL(
        (url) =>
          url.searchParams.get('page_size') === defaultPageSize.toString()
      );
      // page_size should exist in table
      await expect(getPageSizeSelection(page, defaultPageSize)).toBeVisible();

      // pageNum should exist in url
      await expect(page).toHaveURL(
        (url) => url.searchParams.get('page') === defaultPageNum.toString()
      );
      // pageNum should exist in table
      await expect(getPageNum(page, defaultPageNum)).toBeVisible();

      // items not in page should not be visible
      const itemsNotInPage = await filterItemsNotInPage(page);
      for (const item of itemsNotInPage) {
        await itemIsHidden(page, item);
      }
    });

    await test.step(`can switch page size to ${newPageSize}`, async () => {
      const url = new URL(page.url());
      url.searchParams.set('page_size', newPageSize.toString());
      await page.goto(url.toString());

      // check pagination
      await expect(getPageSizeSelection(page, newPageSize)).toBeVisible();
      await expect(getPageNum(page, defaultPageNum)).toBeVisible();
      await expect(getPageSizeSelection(page, defaultPageSize)).toBeHidden();

      // pagination should exist in url
      await expect(page).toHaveURL((url) => {
        return (
          url.searchParams.get('page_size') === newPageSize.toString() &&
          url.searchParams.get('page') === defaultPageNum.toString()
        );
      });

      // all items should be visible
      for (const item of items) {
        await itemIsVisible(page, item);
      }
    });

    await test.step('switch to default', async () => {
      const url = new URL(page.url());
      url.searchParams.set('page_size', defaultPageSize.toString());
      await page.goto(url.toString());

      await expect(getPageSizeSelection(page, defaultPageSize)).toBeVisible();
      await expect(getPageNum(page, defaultPageNum)).toBeVisible();
      await expect(getPageSizeSelection(page, newPageSize)).toBeHidden();
    });

    await test.step(`can switch page num to ${newPageNum}`, async () => {
      const itemsNotInPage = await filterItemsNotInPage(page);

      const url = new URL(page.url());
      url.searchParams.set('page', newPageNum.toString());
      await page.goto(url.toString());

      // pageNum should exist in url
      await expect(page).toHaveURL(
        (url) => url.searchParams.get('page') === newPageNum.toString()
      );
      await pom.isIndexPage(page);

      // items not in page should be visible
      for (const item of itemsNotInPage) {
        await itemIsVisible(page, item);
      }
    });
  });
}
