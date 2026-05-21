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
/* eslint-disable playwright/no-wait-for-timeout, playwright/no-conditional-in-test, playwright/no-conditional-expect -- regression test stabilization */

// Edge: XSS payloads in user-controlled fields must never execute. The
// route name is a representative free-text field that flows through list,
// detail, and Match Rules rendering.

import { routesPom } from '@e2e/pom/routes';
import { randomId } from '@e2e/utils/common';
import { e2eReq } from '@e2e/utils/req';
import { test } from '@e2e/utils/test';
import { uiHasToastMsg } from '@e2e/utils/ui';
import { uiFillUpstreamRequiredFields } from '@e2e/utils/ui/upstreams';
import { expect } from '@playwright/test';

import { deleteAllRoutes, getRouteReq } from '@/apis/routes';
import type { APISIXType } from '@/types/schema/apisix';

const xssPayload = '<img src=x onerror="window.__xss_fired=true">';
const routeName = `xss-${xssPayload}-${randomId('edge-xss')}`;
const routeUri = '/edge/xss-payload';
const nodes: APISIXType['UpstreamNode'][] = [
  { host: 'xss-a.local', port: 80, weight: 100 },
  { host: 'xss-b.local', port: 80, weight: 100 },
];

test.beforeAll(async () => {
  await deleteAllRoutes(e2eReq);
});

test.afterAll(async () => {
  await deleteAllRoutes(e2eReq);
});

test('XSS payload in route name is rendered as text, not executed', async ({
  page,
}) => {
  // Also assert: a real browser `alert()` would surface as a `dialog`
  // event. We deliberately do NOT auto-accept; an unexpected dialog will
  // fail the test.
  page.on('dialog', async (d) => {
    throw new Error(`Unexpected dialog from XSS payload: "${d.message()}"`);
  });

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
    { nodes, name: randomId('edge-up'), desc: 'edge' }
  );

  await routesPom.getAddBtn(page).click();

  // The route may be accepted (with the literal string stored) or rejected.
  // What MUST NOT happen is silent script execution.
  await Promise.race([
    uiHasToastMsg(page, { hasText: /(success|fail|error|invalid)/i }),
    page.waitForTimeout(8000),
  ]);

  const xssFired = await page.evaluate(
    () => (window as unknown as { __xss_fired?: boolean }).__xss_fired === true
  );
  expect(xssFired, 'XSS payload must not execute').toBe(false);

  // If saved, the round trip preserves the literal payload text.
  if (page.url().includes('/routes/detail/')) {
    const routeId = page.url().split('/').pop()!;
    const route = (await getRouteReq(e2eReq, routeId)).value;
    expect(route.name).toBe(routeName);
  }
});
