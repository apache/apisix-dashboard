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
import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { expect, test as baseTest } from '@playwright/test';

import { fileExists, getAPISIXConf } from './common';
import { env } from './env';

export type Test = typeof test;
export const test = baseTest.extend<object, { workerStorageState: string }>({
  storageState: ({ workerStorageState }, use) => use(workerStorageState),
  workerStorageState: [
    async ({ browser }, use) => {
      // Use parallelIndex as a unique identifier for each worker.
      const id = test.info().parallelIndex;
      const fileName = path.resolve(
        test.info().project.outputDir,
        `.auth/${id}.json`
      );
      const { adminKey } = await getAPISIXConf();

      // file exists and contains admin key, use it
      if (
        (await fileExists(fileName)) &&
        (await readFile(fileName)).toString().includes(adminKey)
      ) {
        return use(fileName);
      }

      const page = await browser.newPage({ storageState: undefined });

      // have to use env here, because the baseURL is not available in worker
      await page.goto(env.E2E_TARGET_URL);

      // we need to authenticate
      const settingsModal = page.getByRole('dialog', { name: 'Settings' });
      await expect(settingsModal).toBeVisible();
      // PasswordInput renders with a label, use getByLabel instead
      const adminKeyInput = page.getByLabel('Admin Key');
      await adminKeyInput.clear();
      await adminKeyInput.fill(adminKey);
      await page
        .getByRole('dialog', { name: 'Settings' })
        .getByRole('button')
        .click();

      await page.context().storageState({ path: fileName });
      await page.close();
      await use(fileName);
    },
    { scope: 'worker' },
  ],
  page: async ({ baseURL, page }, use) => {
    await page.goto(baseURL);
    await use(page);
  },
});
