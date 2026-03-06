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
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { expect, test as baseTest } from '@playwright/test';

import { fileExists, getAPISIXConf } from './common';
import { env } from './env';

export type Test = typeof test;
export const test = baseTest.extend<object, { workerStorageState: string }>({
  storageState: ({ workerStorageState }, use) => {
    return use(workerStorageState);
  },
  workerStorageState: [
    async ({ browser }, use) => {
      // Use parallelIndex as a unique identifier for each worker.
      const id = test.info().parallelIndex;
      const authDir = path.resolve(test.info().project.outputDir, '.auth');
      const fileName = path.resolve(authDir, `${id}.json`);
      const { adminKey } = await getAPISIXConf();

      // Ensure .auth directory exists
      await mkdir(authDir, { recursive: true });

      // file exists and contains admin key, use it
      if (await fileExists(fileName)) {
        try {
          const content = await readFile(fileName);
          if (content.toString().includes(adminKey)) {
            return use(fileName);
          }
        } catch {
          // File exists but is unreadable, recreate it
        }
      }

      let page;
      try {
        page = await browser.newPage({ storageState: undefined });

        // have to use env here, because the baseURL is not available in worker
        await page.goto(env.E2E_TARGET_URL, { waitUntil: 'load' });

        // we need to authenticate
        const settingsModal = page.getByRole('dialog', { name: 'Settings' });
        await expect(settingsModal).toBeVisible({ timeout: 30000 });
        // PasswordInput renders with a label, use getByLabel instead
        const adminKeyInput = page.getByLabel('Admin Key');
        await adminKeyInput.clear();
        await adminKeyInput.fill(adminKey);

        const closeButton = page
          .getByRole('dialog', { name: 'Settings' })
          .getByRole('button');
        await expect(closeButton).toBeVisible({ timeout: 10000 });
        await closeButton.click();

        // Wait for auth to complete
        await expect(settingsModal).toBeHidden({ timeout: 15000 });

        // Wait for any post-auth navigation/loading to complete
        await page.waitForLoadState('load');

        await page.context().storageState({ path: fileName });

        // Verify auth state file was created
        if (!(await fileExists(fileName))) {
          throw new Error(`Auth state file was not created at ${fileName}`);
        }
      } catch (error) {
        console.error(`Failed to authenticate worker ${id}:`, error);
        // Create an empty auth state file so Playwright doesn't fail
        // Tests will retry auth on first page load
        try {
          await writeFile(fileName, JSON.stringify({ cookies: [], origins: [] }));
        } catch (writeErr) {
          console.error(`Failed to create fallback auth state: ${writeErr}`);
        }
        throw error;
      } finally {
        await page?.close();
      }

      await use(fileName);
    },
    { scope: 'worker' },
  ],
  page: async ({ baseURL, page }, use) => {
    await page.goto(baseURL || env.E2E_TARGET_URL);
    await use(page);
  },
});