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

// Regression: Route Vars editor must accept empty and round-trip non-empty.
// Related issues:
//   - apache/apisix-dashboard#3362 Route Vars cannot be left empty although
//     the field is optional
//   - apache/apisix-dashboard#3145 route vars cannot be displayed or edited
// User expectation:
//   (1) Submitting Add Route without touching `vars` succeeds (it is optional).
//   (2) A route created with vars via the Admin API renders the vars on the
//       detail page after a UI navigation.

import { routesPom } from '@e2e/pom/routes';
import { randomId } from '@e2e/utils/common';
import { e2eReq } from '@e2e/utils/req';
import { test } from '@e2e/utils/test';
import { uiGoto, uiHasToastMsg } from '@e2e/utils/ui';
import { uiFillUpstreamRequiredFields } from '@e2e/utils/ui/upstreams';
import { expect } from '@playwright/test';

import { deleteAllRoutes, getRouteReq, putRouteReq } from '@/apis/routes';
import type { APISIXType } from '@/types/schema/apisix';

const nodes: APISIXType['UpstreamNode'][] = [
  { host: 'reg-vars.local', port: 80, weight: 100 },
  { host: 'reg-vars-2.local', port: 80, weight: 100 },
];

test.describe('routes vars editor', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeAll(async () => {
    await deleteAllRoutes(e2eReq);
  });

  test.afterAll(async () => {
    await deleteAllRoutes(e2eReq);
  });

  test('Add Route succeeds without touching vars (vars is optional)', async ({
    page,
  }) => {
    const routeName = randomId('reg-vars-empty');
    const routeUri = '/regression/vars-empty';

    await routesPom.toAdd(page);
    await routesPom.isAddPage(page);

    await page.getByLabel('Name', { exact: true }).first().fill(routeName);
    await page.getByLabel('URI', { exact: true }).fill(routeUri);
    await page.getByRole('textbox', { name: 'HTTP Methods' }).click();
    await page.getByRole('option', { name: 'GET' }).click();
    await page.keyboard.press('Escape');

    const upstreamSection = page.getByRole('group', {
      name: 'Upstream',
      exact: true,
    });
    await uiFillUpstreamRequiredFields(
      upstreamSection,
      { nodes, name: randomId('reg-up'), desc: 'reg' }
    );

    await routesPom.getAddBtn(page).click();
    await uiHasToastMsg(page, { hasText: 'Add Route Successfully' });
    await routesPom.isDetailPage(page);

    const routeId = page.url().split('/').pop()!;
    const route = (await getRouteReq(e2eReq, routeId)).value;
    expect(route.vars).toBeUndefined();
  });

  test('Route created via Admin API with vars renders them on detail page', async ({
    page,
  }) => {
    const routeName = randomId('reg-vars-display');
    const routeUri = '/regression/vars-display';
    const vars = [['http_x_foo', '==', 'bar']] as unknown;

    const created = await putRouteReq(e2eReq, {
      name: routeName,
      uri: routeUri,
      methods: ['GET'],
      vars,
      upstream: {
        type: 'roundrobin',
        nodes: { 'reg-vars-display.local:80': 1 },
      },
    } as unknown as APISIXType['Route']);
    const routeId = created.data.value.id;

    await uiGoto(page, '/routes/detail/$id', { id: routeId });
    await routesPom.isDetailPage(page);

    // The Match Rules section must render the vars region; both the variable
    // name and the comparison value should be present in the page text.
    const matchRules = page.getByRole('group', { name: 'Match Rules' });
    await expect(matchRules).toBeVisible();
    await expect(matchRules).toContainText('http_x_foo');
    await expect(matchRules).toContainText('bar');
  });
});
