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

// Regression for a UX item of apache/apisix-dashboard#3417: the form
// table of contents never refreshed when sections appeared or
// disappeared dynamically — `refreshTOC` built a debounced function on
// every call and discarded it without invoking, so Mantine's
// TableOfContents reinitialize hook was never actually called. Enabling
// the health-check switch rendered the new sections in the form while
// the TOC kept showing the stale initial list.

import { upstreamsPom } from '@e2e/pom/upstreams';
import { test } from '@e2e/utils/test';
import { expect } from '@playwright/test';

test('TOC gains and loses entries as sections toggle', async ({ page }) => {
  await upstreamsPom.toAdd(page);
  await upstreamsPom.isAddPage(page);

  const toc = page.locator('.mantine-TableOfContents-root');
  await expect(toc).toBeVisible();
  // the always-present Nodes section proves the TOC scanned the form
  await expect(toc.getByText('Nodes', { exact: true })).toBeVisible();
  await expect(toc.getByText('Active', { exact: true })).toBeHidden();

  const checksTrack = page
    .getByTestId('checksEnabled')
    .locator('..')
    .locator('.mantine-Switch-track');

  // enabling health checks mounts the Active section in the form…
  await checksTrack.click();
  await expect(
    page.getByRole('group', { name: 'Active', exact: true })
  ).toBeVisible();
  // …and the TOC must pick it up (debounced refresh, auto-retried here)
  await expect(toc.getByText('Active', { exact: true })).toBeVisible();

  // and drop it again when the section unmounts
  await checksTrack.click();
  await expect(
    page.getByRole('group', { name: 'Active', exact: true })
  ).toBeHidden();
  await expect(toc.getByText('Active', { exact: true })).toBeHidden();
});
