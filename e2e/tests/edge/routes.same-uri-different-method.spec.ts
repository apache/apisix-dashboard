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

// Edge: APISIX legitimately allows two routes that share a URI as long as
// their methods differ. The dashboard must not pre-block this.

import { routesPom } from '@e2e/pom/routes';
import { randomId } from '@e2e/utils/common';
import { e2eReq } from '@e2e/utils/req';
import { test } from '@e2e/utils/test';
import { uiHasToastMsg } from '@e2e/utils/ui';
import { uiFillUpstreamRequiredFields } from '@e2e/utils/ui/upstreams';
import { expect } from '@playwright/test';

import { deleteAllRoutes, getRouteListReq } from '@/apis/routes';
import type { APISIXType } from '@/types/schema/apisix';

const nodes: APISIXType['UpstreamNode'][] = [
  { host: 'same-uri-a.local', port: 80, weight: 100 },
  { host: 'same-uri-b.local', port: 80, weight: 100 },
];
const sharedUri = '/edge/same-uri';

test.describe('routes sharing URI with different methods', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeAll(async () => {
    await deleteAllRoutes(e2eReq);
  });

  test.afterAll(async () => {
    await deleteAllRoutes(e2eReq);
  });

  const addRoute = async (
    page: import('@playwright/test').Page,
    name: string,
    method: string
  ) => {
    await routesPom.toAdd(page);
    await routesPom.isAddPage(page);
    await page.getByLabel('Name', { exact: true }).first().fill(name);
    await page.getByLabel('URI', { exact: true }).fill(sharedUri);
    await page.getByRole('textbox', { name: 'HTTP Methods' }).click();
    await page.getByRole('option', { name: method }).click();
    await page.keyboard.press('Escape');

    const upstreamSection = page.getByRole('group', {
      name: 'Upstream',
      exact: true,
    });
    await uiFillUpstreamRequiredFields(
      upstreamSection,
      { nodes, name: randomId('edge-up'), desc: 'edge' }
    );

    await routesPom.getAddBtn(page).click();
    await uiHasToastMsg(page, { hasText: 'Add Route Successfully' });
    await routesPom.isDetailPage(page);
  };

  test('two routes with same URI but different methods both save', async ({
    page,
  }) => {
    await addRoute(page, randomId('edge-same-uri-get'), 'GET');
    await addRoute(page, randomId('edge-same-uri-post'), 'POST');

    const list = await getRouteListReq(e2eReq, {
      page: 1,
      page_size: 50,
    });
    const sameUriRoutes = list.list.filter(
      (r) => (r.value as APISIXType['Route']).uri === sharedUri
    );
    expect(sameUriRoutes).toHaveLength(2);
  });
});
