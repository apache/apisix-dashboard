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

import { secretsPom } from '@e2e/pom/secrets';
import { setupPaginationTests } from '@e2e/utils/pagination-test-helper';
import { e2eReq } from '@e2e/utils/req';
import { test } from '@e2e/utils/test';
import { expect, type Page } from '@playwright/test';

import { API_SECRETS } from '@/config/constant';
import type { APISIXType } from '@/types/schema/apisix';

test('should navigate to secrets page', async ({ page }) => {
  await test.step('navigate to secrets page', async () => {
    await secretsPom.getSecretNavBtn(page).click();
    await secretsPom.isIndexPage(page);
  });

  await test.step('verify secrets page components', async () => {
    await expect(secretsPom.getAddSecretBtn(page)).toBeVisible();

    // list table exists
    const table = page.getByRole('table');
    await expect(table).toBeVisible();
    await expect(table.getByText('ID', { exact: true })).toBeVisible();
    await expect(table.getByText('Secret Manager', { exact: true })).toBeVisible();
    await expect(table.getByText('Actions', { exact: true })).toBeVisible();
  });
});

const secrets: APISIXType['Secret'][] = Array.from({ length: 11 }, (_, i) => ({
  id: `secret_id_${i + 1}`,
  manager: 'vault' as const,
  uri: `http://vault-${i + 1}.example.com:8200`,
  prefix: `/secret/path${i + 1}`,
  token: `test-token-${i + 1}`,
}));

const putSecretReq = (req: typeof e2eReq, data: APISIXType['Secret']) => {
  const { manager, id, ...rest } = data;
  return req.put(`${API_SECRETS}/${manager}/${id}`, rest);
};

test.describe('page and page_size should work correctly', () => {
  test.describe.configure({ mode: 'serial' });
  
  test.beforeAll(async () => {
    // Clean up existing secrets
    const existingSecrets = await e2eReq
      .get<unknown, APISIXType['RespSecretList']>(API_SECRETS)
      .then((v) => v.data);
    await Promise.all(
      (existingSecrets.list || []).map((d) => {
        const [manager, id] = d.value.id.split('/');
        return e2eReq.delete(`${API_SECRETS}/${manager}/${id}`);
      })
    );

    // Create test secrets
    await Promise.all(secrets.map((d) => putSecretReq(e2eReq, d)));
  });

  test.afterAll(async () => {
    await Promise.all(
      secrets.map((d) => e2eReq.delete(`${API_SECRETS}/${d.manager}/${d.id}`))
    );
  });

  // Setup pagination tests with secret-specific configurations
  const filterItemsNotInPage = async (page: Page) => {
    // filter the item which not in the current page
    // it should be random, so we need get all items in the table
    const itemsInPage = await page
      .getByRole('cell', { name: /secret_id_/ })
      .all();
    const ids = await Promise.all(itemsInPage.map((v) => v.textContent()));
    return secrets.filter((d) => !ids.includes(d.id));
  };

  setupPaginationTests(test, {
    pom: secretsPom,
    items: secrets,
    filterItemsNotInPage,
    getCell: (page, item) => page.getByRole('cell', { name: item.id }).first(),
  });
});
