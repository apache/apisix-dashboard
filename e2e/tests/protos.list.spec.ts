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

import { protosPom } from '@e2e/pom/protos';
import { setupPaginationTests } from '@e2e/utils/pagination-test-helper';
import { e2eReq } from '@e2e/utils/req';
import { test } from '@e2e/utils/test';
import { expect, type Page } from '@playwright/test';

import { putProtoReq } from '@/apis/protos';
import { API_PROTOS } from '@/config/constant';
import type { APISIXType } from '@/types/schema/apisix';

test('should navigate to protos page', async ({ page }) => {
  await test.step('navigate to protos page', async () => {
    await protosPom.getProtoNavBtn(page).click();
    await protosPom.isIndexPage(page);
  });

  await test.step('verify protos page components', async () => {
    await expect(protosPom.getAddProtoBtn(page)).toBeVisible();

    // list table exists
    const table = page.getByRole('table');
    await expect(table).toBeVisible();
    await expect(table.getByText('ID', { exact: true })).toBeVisible();
    await expect(table.getByText('Actions', { exact: true })).toBeVisible();
  });
});

const protos: APISIXType['Proto'][] = Array.from({ length: 11 }, (_, i) => ({
  id: `proto_id_${i + 1}`,
  desc: `proto_desc_${i + 1}`,
  content: `syntax = "proto3";
package test${i + 1};

message TestMessage${i + 1} {
  string field = 1;
}`,
}));

test.describe('page and page_size should work correctly', () => {
  test.describe.configure({ mode: 'serial' });
  test.beforeAll(async () => {
    // Delete all existing protos
    const existingProtos = await e2eReq
      .get<unknown, APISIXType['RespProtoList']>(API_PROTOS)
      .then((v) => v.data);
    await Promise.all(
      (existingProtos.list || []).map((d) =>
        e2eReq.delete(`${API_PROTOS}/${d.value.id}`)
      )
    );

    // Create test protos
    await Promise.all(protos.map((d) => putProtoReq(e2eReq, d)));
  });

  test.afterAll(async () => {
    await Promise.all(
      protos.map((d) => e2eReq.delete(`${API_PROTOS}/${d.id}`))
    );
  });

  // Setup pagination tests with proto-specific configurations
  const filterItemsNotInPage = async (page: Page) => {
    // filter the item which not in the current page
    // it should be random, so we need get all items in the table
    const itemsInPage = await page
      .getByRole('cell', { name: /proto_id_/ })
      .all();
    const ids = await Promise.all(itemsInPage.map((v) => v.textContent()));
    return protos.filter((d) => !ids.includes(d.id));
  };

  setupPaginationTests(test, {
    pom: protosPom,
    items: protos,
    filterItemsNotInPage,
    getCell: (page, item) => page.getByRole('cell', { name: item.id }).first(),
  });
});
