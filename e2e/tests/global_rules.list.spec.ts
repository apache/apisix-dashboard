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

import { globalRulePom } from '@e2e/pom/global_rules';
import { setupPaginationTests } from '@e2e/utils/pagination-test-helper';
import { e2eReq } from '@e2e/utils/req';
import { test } from '@e2e/utils/test';
import { expect, type Page } from '@playwright/test';

import { API_GLOBAL_RULES } from '@/config/constant';

test('should navigate to global rules list page', async ({ page }) => {
  await test.step('navigate to global rules page', async () => {
    await globalRulePom.getGlobalRuleNavBtn(page).click();
    await globalRulePom.isIndexPage(page);
  });

  await test.step('verify global rules page components', async () => {
    await expect(globalRulePom.getAddGlobalRuleBtn(page)).toBeVisible();

    // list table exists
    const table = page.getByRole('table');
    await expect(table).toBeVisible();
    await expect(table.getByText('ID', { exact: true })).toBeVisible();
    await expect(table.getByText('Actions', { exact: true })).toBeVisible();
  });
});

// Helper function to delete all global rules
const deleteAllGlobalRules = async (req: typeof e2eReq) => {
  const res = await req.get(API_GLOBAL_RULES);
  const globalRules = res.data?.list || [];
  await Promise.all(
    globalRules.map((item: { value: { id: string } }) =>
      req.delete(`${API_GLOBAL_RULES}/${item.value.id}`).catch(() => {
        // Ignore errors
      })
    )
  );
};

interface GlobalRule {
  id: string;
  plugins: Record<string, unknown>;
}

const globalRules: GlobalRule[] = Array.from({ length: 11 }, (_, i) => ({
  id: `global_rule_id_${i + 1}`,
  plugins: {
    'response-rewrite': {
      headers: {
        'X-Test-Rule': `global-rule-${i + 1}`,
      },
    },
  },
}));

test.describe('page and page_size should work correctly', () => {
  test.describe.configure({ mode: 'serial' });
  test.beforeAll(async () => {
    await deleteAllGlobalRules(e2eReq);
    await Promise.all(
      globalRules.map((d) =>
        e2eReq.put(`${API_GLOBAL_RULES}/${d.id}`, {
          plugins: d.plugins,
        })
      )
    );
  });

  test.afterAll(async () => {
    // Get current list and only delete those that exist
    const res = await e2eReq.get(API_GLOBAL_RULES);
    const existingRules = res.data?.list || [];
    await Promise.all(
      existingRules.map((item: { value: { id: string } }) =>
        e2eReq.delete(`${API_GLOBAL_RULES}/${item.value.id}`).catch(() => {
          // Ignore errors
        })
      )
    );
  });

  // Setup pagination tests with global-rule-specific configurations
  const filterItemsNotInPage = async (page: Page) => {
    // filter the item which not in the current page
    // it should be random, so we need get all items in the table
    const itemsInPage = await page
      .getByRole('cell', { name: /global_rule_id_/ })
      .all();
    const ids = await Promise.all(itemsInPage.map((v) => v.textContent()));
    return globalRules.filter((d) => !ids.includes(d.id));
  };

  setupPaginationTests(test, {
    pom: globalRulePom,
    items: globalRules,
    filterItemsNotInPage,
    getCell: (page, item) => page.getByRole('cell', { name: item.id }).first(),
  });
});
