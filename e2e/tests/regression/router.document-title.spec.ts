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

// Regression for a UX/IA item of apache/apisix-dashboard#3417: every page
// shipped the same static document.title. Titles are now derived per
// route (section name + Add/Detail qualifier) from the nav route table.

import { routesPom } from '@e2e/pom/routes';
import { test } from '@e2e/utils/test';
import { uiGoto } from '@e2e/utils/ui';
import { expect } from '@playwright/test';

test('each page has a distinct, section-specific document title', async ({
  page,
}) => {
  await routesPom.toIndex(page);
  await routesPom.isIndexPage(page);
  await expect(page).toHaveTitle(/^Routes - /);

  await uiGoto(page, '/upstreams');
  await expect(page).toHaveTitle(/^Upstreams - /);

  // longest-prefix match: /consumer_groups must not resolve as /consumers
  await uiGoto(page, '/consumer_groups');
  await expect(page).toHaveTitle(/^Consumer Groups - /);

  await uiGoto(page, '/consumers');
  await expect(page).toHaveTitle(/^Consumers - /);

  // add and detail qualifiers
  await routesPom.toIndex(page);
  await routesPom.getAddRouteBtn(page).click();
  await routesPom.isAddPage(page);
  await expect(page).toHaveTitle(/Add .* - /);
});
