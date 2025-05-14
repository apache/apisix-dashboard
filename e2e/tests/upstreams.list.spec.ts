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

import { expect } from '@playwright/test';
import { UpstreamsPOM } from '@pom/upstreams';
import { test } from '@utils/test';

test(
  'should navigate to upstreams page',
  { tag: '@upstreams' },
  async ({ page }) => {
    await test.step('navigate to upstreams page', async () => {
      const upstreamsPom = new UpstreamsPOM(page);
      await upstreamsPom.addUpstreamBtn.click();
      await upstreamsPom.isListPage();
    });

    // Check page components
    await test.step('verify upstreams page components', async () => {
      // add upstream button exists
      const createButton = page.getByRole('button', { name: 'Add Upstream' });
      await expect(createButton).toBeVisible();

      // list table exists
      const table = page.getByRole('table');
      await expect(table).toBeVisible();
      await expect(page.getByText('ID')).toBeVisible();
      await expect(page.getByText('Name')).toBeVisible();
      await expect(page.getByText('Labels')).toBeVisible();
      await expect(page.getByText('Actions')).toBeVisible();
    });
  }
);
