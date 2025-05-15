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
import { uiGoto } from '@e2e/utils/ui';
import { expect, type Locator, type Page } from '@playwright/test';

export class UpstreamsPom {
  readonly upstreamNavBtn: Locator;
  readonly addUpstreamBtn: Locator;
  constructor(private page: Page) {
    this.upstreamNavBtn = this.page.getByRole('link', { name: 'Upstreams' });
    this.addUpstreamBtn = this.page.getByRole('button', {
      name: 'Add Upstream',
    });
  }

  async goto() {
    await uiGoto(this.page, '/upstreams');
  }

  async isListPage() {
    await expect(this.page).toHaveURL((url) =>
      url.pathname.endsWith('/upstreams')
    );
    const title = this.page.getByRole('heading', { name: 'Upstreams' });
    await expect(title).toBeVisible();
  }

  async isAddPage() {
    await expect(this.page).toHaveURL((url) =>
      url.pathname.endsWith('/upstreams/add')
    );
    const title = this.page.getByRole('heading', { name: 'Add Upstream' });
    await expect(title).toBeVisible();
  }

  async createUpstream(name: string) {
    await this.page.getByRole('button', { name: 'Create Upstream' }).click();
    await this.page.getByLabel('Name').fill(name);
    await this.page.getByRole('button', { name: 'Create' }).click();
  }

  async deleteUpstream(name: string) {
    await this.page
      .getByRole('row', { name })
      .getByRole('button', { name: 'Delete' })
      .click();
    await this.page.getByRole('button', { name: 'Delete' }).click();
  }
}
