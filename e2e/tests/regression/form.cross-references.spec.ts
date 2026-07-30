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
import { safeClean } from '@e2e/utils/clean';
import { e2eReq } from '@e2e/utils/req';
import { test } from '@e2e/utils/test';
import { uiGoto } from '@e2e/utils/ui';
import { expect } from '@playwright/test';

import {
  deleteAllConsumerGroups,
  putConsumerGroupReq,
} from '@/apis/consumer_groups';
import { deleteAllConsumers, putConsumerReq } from '@/apis/consumers';
import { deleteAllRoutes, putRouteReq } from '@/apis/routes';
import { deleteAllUpstreams, putUpstreamReq } from '@/apis/upstreams';
import type { APISIXType } from '@/types/schema/apisix';

// #3453 item 4: `upstream_id` and friends rendered as a plain text input
// holding a bare id — no name, nothing to click — so answering "which
// upstream is this route actually using?" meant copying the id, navigating
// to Upstreams, and searching.

const UPSTREAM_ID = 'xref-upstream';
// The `&` is load-bearing: it is the one character i18next's interpolation
// escaping mangles into `&amp;` if `viewNamed` ever loses its
// `escapeValue: false`. A fixture name with no such character can't catch
// that regression.
const UPSTREAM_NAME = 'xref R&D backend';
const ROUTE_ID = 'xref-route';
const DANGLING_ROUTE_ID = 'xref-dangling-route';
const MISSING_UPSTREAM_ID = 'xref-no-such-upstream';

const clean = () =>
  safeClean(async () => {
    await deleteAllRoutes(e2eReq);
    await deleteAllUpstreams(e2eReq);
    await deleteAllConsumers(e2eReq);
    await deleteAllConsumerGroups(e2eReq);
  });

test.beforeAll(async () => {
  await clean();
  await putUpstreamReq(e2eReq, {
    id: UPSTREAM_ID,
    name: UPSTREAM_NAME,
    type: 'roundrobin',
    nodes: { 'xref.local:80': 1 },
  } as APISIXType['Upstream']);
  await putRouteReq(e2eReq, {
    id: ROUTE_ID,
    name: 'xref route',
    uri: '/xref',
    upstream_id: UPSTREAM_ID,
  } as APISIXType['Route']);
  // A dangling reference cannot be written directly: the Admin API rejects a
  // route whose upstream_id does not resolve. It can still be reached — and
  // therefore must be handled by the UI — by force-deleting an upstream that
  // is still referenced, which leaves the route pointing at nothing.
  await putUpstreamReq(e2eReq, {
    id: MISSING_UPSTREAM_ID,
    name: 'xref soon deleted upstream',
    type: 'roundrobin',
    nodes: { 'xref-gone.local:80': 1 },
  } as APISIXType['Upstream']);
  await putRouteReq(e2eReq, {
    id: DANGLING_ROUTE_ID,
    name: 'xref dangling route',
    uri: '/xref-dangling',
    upstream_id: MISSING_UPSTREAM_ID,
  } as APISIXType['Route']);
  // `force` goes in the URL, not in axios `params`: the Playwright request
  // adapter in `@e2e/utils/req` builds its URL from `config.url` alone and
  // never serialises `params`.
  await e2eReq.delete(`/upstreams/${MISSING_UPSTREAM_ID}?force=true`);
});

test.afterAll(clean);

test('a resolved reference is a real link to the referenced resource', async ({
  page,
}) => {
  await uiGoto(page, '/routes/detail/$id', { id: ROUTE_ID });

  // getByRole('link') is load-bearing: it fails if the control regresses to
  // a button, which would be dead inside a disabled fieldset.
  const link = page.getByRole('link', { name: UPSTREAM_NAME });
  await expect(link).toBeVisible();
  // The accessible name has to say what the link does, not just name the
  // resource: "link, xref upstream backend" tells a screen reader user
  // nothing about where it goes.
  await expect(link).toHaveAccessibleName(`View Upstream: ${UPSTREAM_NAME}`);

  await link.click();
  await expect(page).toHaveURL(new RegExp(`/upstreams/detail/${UPSTREAM_ID}`));
});

test('a dangling reference warns and is not clickable', async ({ page }) => {
  await uiGoto(page, '/routes/detail/$id', { id: DANGLING_ROUTE_ID });

  // Deliberately tight. Inheriting the global retry policy made a 404 take
  // ~8s of backoff to settle; the field's own retry predicate brings that
  // to ~1.1s, so 3s is roughly 3x margin and a return of the backoff fails
  // here rather than passing slowly and unnoticed.
  await expect(
    page.getByRole('img', { name: 'No Upstream with this ID' })
  ).toBeVisible({ timeout: 3_000 });

  // The point of the warning state: a reference that resolves to nothing
  // must not send the user to a page that only says so.
  await expect(
    page.locator(`a[href*="/upstreams/detail/${MISSING_UPSTREAM_ID}"]`)
  ).toHaveCount(0);
});

test('the resolved state follows what is typed into the field', async ({
  page,
}) => {
  await uiGoto(page, '/routes/detail/$id', { id: ROUTE_ID });
  await expect(page.getByRole('link', { name: UPSTREAM_NAME })).toBeVisible();

  await page.getByRole('button', { name: 'Edit', exact: true }).click();

  // The field carries no label of its own — "Upstream ID" is the legend of
  // the fieldset around it, which names the group, not the input.
  const field = page
    .getByRole('group', { name: 'Upstream ID', exact: true })
    .locator('input[name="upstream_id"]');
  await field.fill(MISSING_UPSTREAM_ID);

  // Proves the field is live, not resolved once at mount. 3s again: this
  // is the 300ms debounce plus one request (~0.4s measured), and it is the
  // path a retried 404 punished once per typing pause.
  await expect(
    page.getByRole('img', { name: 'No Upstream with this ID' })
  ).toBeVisible({ timeout: 3_000 });
  await expect(page.getByRole('link', { name: UPSTREAM_NAME })).toHaveCount(0);
});

const GROUP_ID = 'xref-group';
const GROUP_DESC = 'xref consumer group';
const CONSUMER_NAME = 'xref_consumer';

test('a consumer group reference resolves on the consumer page', async ({
  page,
}) => {
  // A second field on a different resource, so the wiring is not proven
  // for one call site only.
  await putConsumerGroupReq(e2eReq, {
    id: GROUP_ID,
    desc: GROUP_DESC,
    plugins: {},
  });
  await putConsumerReq(e2eReq, {
    username: CONSUMER_NAME,
    group_id: GROUP_ID,
  });

  await uiGoto(page, '/consumers/detail/$username', {
    username: CONSUMER_NAME,
  });

  // Consumer groups have no `name` field at all
  // (`ConsumerGroup = PluginConfig.omit({ name: true })`), so the link's
  // accessible name falls back to the `form.ref.view` string.
  const link = page.getByRole('link', { name: 'View Consumer Group' });
  await expect(link).toBeVisible();
  await link.click();
  await expect(page).toHaveURL(
    new RegExp(`/consumer_groups/detail/${GROUP_ID}`)
  );
});
