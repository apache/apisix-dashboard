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
/* eslint-disable playwright/no-wait-for-timeout -- the crash watcher needs a
   settle window for asynchronous errors to surface after each switch */

// Integration F-10: switching language must not crash. The dashboard ships
// `en`, `zh`, `de`, `es`, `tr` locales; de/es/tr are mostly placeholders so
// they are the highest-risk targets.
//
// Related: existing reports #3300 / #3383.

import { test } from '@e2e/utils/test';
import { uiGoto } from '@e2e/utils/ui';
import { watchForCrashes } from '@e2e/utils/ui/crash';
import { expect } from '@playwright/test';

test('switching to every offered language never crashes the page', async ({
  page,
}) => {
  const crashes = watchForCrashes(page);

  // Visit each top-level resource page to give the i18n stack a varied
  // surface area.
  const pages = ['/services', '/routes', '/upstreams', '/consumers'];

  for (const path of pages) {
    await uiGoto(page, path as unknown as never);
    crashes.expectNoCrash(`initial load of ${path}`);
  }

  // Locate the switcher structurally — it is the banner's only menu
  // trigger. Matching on rendered text does not work: this test used to
  // filter the banner's buttons by `/English|中文|.../` and silently
  // `return` when nothing matched, which is exactly what happened for as
  // long as the control was icon-only. It reported green without ever
  // running the body below. Matching on the accessible name is no better,
  // because `a11y.selectLanguage` is itself translated (zh: 选择语言), so
  // the locator would break the moment the test switched away from English.
  const languageButton = page
    .getByRole('banner')
    .locator('button[aria-haspopup="menu"]');
  await expect(languageButton).toBeVisible();

  // Every other locale, ending back on English. de/es/tr carry the most
  // placeholder copy and are the likeliest to blow up, so the point of
  // this test is to actually visit them — the previous version only ever
  // named 中文.
  const targetLanguages = ['Deutsch', '中文', 'Español', 'Türkçe', 'English'];
  for (const label of targetLanguages) {
    await languageButton.click();
    // Substring match: locales below 100% translated render a "(99%)"
    // suffix inside the same menu item.
    const option = page.getByRole('menuitem', { name: label }).first();
    // The menu disables whichever language is already active. Asserting
    // enabled keeps the loop honest — clicking a disabled item just times
    // out with no indication of why.
    await expect(option).toBeEnabled();
    await option.click();
    await page.waitForTimeout(500);
    crashes.expectNoCrash(`switched to ${label}`);
  }

  // Visit a different page after the last switch and verify no late crash.
  await uiGoto(page, '/consumers' as unknown as never);
  await page.waitForTimeout(800);
  crashes.expectNoCrash('after language switches');

  // Page must still render its main nav. Anchor the name: an unanchored
  // /Routes/ also matches "Stream Routes" and trips strict mode.
  await expect(
    page.getByRole('link', { name: /^(Routes|路由)$/ })
  ).toBeVisible();
});
