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

import { sslsPom } from '@e2e/pom/ssls';
import { genTLS, randomId } from '@e2e/utils/common';
import { setupPaginationTests } from '@e2e/utils/pagination-test-helper';
import { e2eReq } from '@e2e/utils/req';
import { test } from '@e2e/utils/test';
import { expect, type Page } from '@playwright/test';

import { deleteAllSSLs, putSSLReq } from '@/apis/ssls';
import { API_SSLS } from '@/config/constant';
import type { APISIXType } from '@/types/schema/apisix';

test('should navigate to SSLs page', async ({ page }) => {
  await test.step('navigate to SSLs page', async () => {
    await sslsPom.getSSLNavBtn(page).click();
    await sslsPom.isIndexPage(page);
  });

  await test.step('verify SSLs page components', async () => {
    await expect(sslsPom.getAddSSLBtn(page)).toBeVisible();

    // list table exists
    const table = page.getByRole('table');
    await expect(table).toBeVisible();
    await expect(table.getByText('ID', { exact: true })).toBeVisible();
    await expect(table.getByText('SNI', { exact: true })).toBeVisible();
    await expect(table.getByText('Status', { exact: true })).toBeVisible();
    await expect(table.getByText('Actions', { exact: true })).toBeVisible();
  });
});

const { cert, key } = genTLS();

const ssls: APISIXType['SSL'][] = Array.from({ length: 11 }, (_, i) => ({
  id: randomId('ssl_id'),
  snis: [`ssl-${i + 1}.example.com`, `www.ssl-${i + 1}.example.com`],
  cert,
  key,
  labels: {
    env: 'test',
    version: `v${i + 1}`,
  },
  status: 1,
}));

test.describe('page and page_size should work correctly', () => {
  test.describe.configure({ mode: 'serial' });
  test.beforeAll(async () => {
    await deleteAllSSLs(e2eReq);
    await Promise.all(ssls.map((d) => putSSLReq(e2eReq, d)));
  });

  test.afterAll(async () => {
    await Promise.all(ssls.map((d) => e2eReq.delete(`${API_SSLS}/${d.id}`)));
  });

  // Setup pagination tests with SSL-specific configurations
  const filterItemsNotInPage = async (page: Page) => {
    // filter the item which not in the current page
    // it should be random, so we need get all items in the table
    const itemsInPage = await page
      .getByRole('cell', { name: /ssl-\d+\.example\.com/ })
      .all();
    const sniTexts = await Promise.all(itemsInPage.map((v) => v.textContent()));
    return ssls.filter((d) => {
      const firstSni = d.snis?.[0] || d.sni;
      return !sniTexts.some((text) => text?.includes(firstSni || ''));
    });
  };

  setupPaginationTests(test, {
    pom: sslsPom,
    items: ssls,
    filterItemsNotInPage,
    getCell: (page, item) =>
      page
        .getByRole('cell', { name: item.snis?.[0] || item.sni || '' })
        .first(),
  });
});
