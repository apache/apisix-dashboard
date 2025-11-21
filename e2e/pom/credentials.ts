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
import { expect, type Page } from '@playwright/test';

const locator = {
  getCredentialsTab: (page: Page) =>
    page.getByRole('tab', { name: 'Credentials' }),
  getAddCredentialBtn: (page: Page) =>
    page.getByRole('button', { name: 'Add Credential', exact: true }),
  getAddBtn: (page: Page) =>
    page.getByRole('button', { name: 'Add', exact: true }),
};

const assert = {
  isCredentialsIndexPage: async (page: Page, username: string) => {
    await expect(page).toHaveURL((url) =>
      url.pathname.includes(`/consumers/detail/${username}/credentials`)
    );
    const title = page.getByRole('heading', { name: 'Credentials' });
    await expect(title).toBeVisible();
  },
  isCredentialAddPage: async (page: Page, username: string) => {
    await expect(page).toHaveURL((url) =>
      url.pathname.endsWith(`/consumers/detail/${username}/credentials/add`)
    );
    const title = page.getByRole('heading', { name: 'Add Credential' });
    await expect(title).toBeVisible();
  },
  isCredentialDetailPage: async (page: Page) => {
    await expect(page).toHaveURL((url) =>
      url.pathname.includes('/consumers/detail/') &&
      url.pathname.includes('/credentials/detail/')
    );
    const title = page.getByRole('heading', { name: 'Credential Detail' });
    await expect(title).toBeVisible();
  },
};

const goto = {
  toCredentialsIndex: (page: Page, username: string) =>
    uiGoto(page, '/consumers/detail/$username/credentials', { username }),
  toCredentialAdd: (page: Page, username: string) =>
    uiGoto(page, '/consumers/detail/$username/credentials/add', { username }),
  toCredentialDetail: (page: Page, username: string, id: string) =>
    uiGoto(page, '/consumers/detail/$username/credentials/detail/$id', {
      username,
      id,
    }),
};

export const credentialsPom = {
  ...locator,
  ...assert,
  ...goto,
};
