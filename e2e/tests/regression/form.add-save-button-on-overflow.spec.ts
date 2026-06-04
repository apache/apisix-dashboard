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

// Regression: when the route form has enough content to overflow the
// viewport, the Add / Save button must still be reachable.
//
// Related issue:
//   - apache/apisix-dashboard#3335 Add / Save button hidden behind overflow

import { routesPom } from '@e2e/pom/routes';
import { test } from '@e2e/utils/test';
import { expect } from '@playwright/test';

test('Add Route page Add button stays reachable after scrolling to bottom', async ({
  page,
}) => {
  await routesPom.toAdd(page);
  await routesPom.isAddPage(page);

  // Scroll the main scrolling region all the way down. Mantine AppShell
  // uses the document scroll, so window scroll is the right target.
  await page.evaluate(() =>
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' })
  );

  const addBtn = routesPom.getAddBtn(page);
  await expect(addBtn).toBeVisible();
  // `inViewport` ensures the button is not just rendered but actually
  // reachable for a real user click.
  await expect(addBtn).toBeInViewport({ ratio: 0.9 });
  await expect(addBtn).toBeEnabled();
});
