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
import { test as baseTest } from '@playwright/test';

import { API_HEADER_KEY, API_PREFIX } from '@/config/constant';

import { getAPISIXConf } from './common';

export type Test = typeof test;

type TestOptions = {
  /**
   * Whether to authenticate Admin API requests by injecting the
   * `X-API-KEY` header at the network layer. On by default.
   *
   * The dashboard holds the admin key in memory only (it is no longer
   * persisted to `localStorage`), so auth cannot be replayed through
   * Playwright's `storageState` the way it used to be. Instead we add the
   * header to every Admin API request for the whole browser context, which
   * keeps the app authenticated across full-page navigations and reloads
   * (the e2e suite navigates with `page.goto`, i.e. fresh document loads)
   * without re-driving the Settings modal on every page.
   *
   * Tests that exercise the manual auth flow itself (`auth.spec.ts`) opt
   * out via `test.use({ injectAdminKey: false })`.
   */
  injectAdminKey: boolean;
};

export const test = baseTest.extend<TestOptions>({
  injectAdminKey: [true, { option: true }],
  page: async ({ baseURL, page, injectAdminKey }, use) => {
    if (injectAdminKey) {
      const { adminKey } = await getAPISIXConf();
      await page.route(
        (url) => url.pathname.startsWith(API_PREFIX),
        (route) =>
          route.continue({
            headers: {
              ...route.request().headers(),
              [API_HEADER_KEY.toLowerCase()]: adminKey,
            },
          })
      );
    }
    await page.goto(baseURL);
    await use(page);
  },
});
