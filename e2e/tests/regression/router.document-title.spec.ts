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
import { randomId } from '@e2e/utils/common';
import { e2eReq } from '@e2e/utils/req';
import { test } from '@e2e/utils/test';
import { uiGoto } from '@e2e/utils/ui';
import { expect } from '@playwright/test';

import { deleteAllConsumers } from '@/apis/consumers';
import { API_SECRETS } from '@/config/constant';

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

// #3441 review: a nested resource page must be classified by the deepest
// matched route, not by the parent `detail/$id` in the middle of the path.
test('nested resource pages get their own title, not the parent detail', async ({
  page,
}) => {
  const username = randomId('title_c');
  await e2eReq.put(`/consumers/${username}`, { username });

  await uiGoto(page, '/consumers/detail/$username', { username });
  await expect(page).toHaveTitle(/^Consumers Detail - /);

  await uiGoto(page, '/consumers/detail/$username/credentials/add', {
    username,
  });
  // must be the credential add page, NOT "Consumers Detail"
  await expect(page).toHaveTitle(/^Add Credentials - /);

  await deleteAllConsumers(e2eReq);
});

// #3441 review: /secrets/detail/$manager/$id ends with TWO params; a
// classifier that only inspected the second-to-last segment fell through
// to the list branch and produced the generic application title.
test('a detail route with two trailing params still gets its title', async ({
  page,
}) => {
  const id = randomId('title-secret');
  const manager = 'vault';
  await e2eReq.put(`${API_SECRETS}/${manager}/${id}`, {
    uri: 'http://vault.example.com:8200',
    prefix: 'apisix',
    token: 'title-token',
  });

  await uiGoto(page, '/secrets/detail/$manager/$id', { manager, id });
  await expect(page).toHaveTitle(/^Secrets Detail - /);

  await e2eReq.delete(`${API_SECRETS}/${manager}/${id}`).catch(() => {});
});
