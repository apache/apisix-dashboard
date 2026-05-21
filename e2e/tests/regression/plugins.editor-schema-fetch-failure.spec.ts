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
/* eslint-disable playwright/no-wait-for-timeout -- regression test stabilization */

// Regression: the Plugin editor drawer must not get stuck in infinite
// loading when the schema fetch fails.
//
// Related issue:
//   - apache/apisix-dashboard#3327 plugin editor drawer stuck in infinite
//     loading on schema fetch failure
//
// Fault injection: abort the `/apisix/admin/plugins/{name}` request that the
// drawer issues when the user picks a plugin to configure.

import { routesPom } from '@e2e/pom/routes';
import { e2eReq } from '@e2e/utils/req';
import { test } from '@e2e/utils/test';
import { watchForCrashes } from '@e2e/utils/ui/crash';
import { expect } from '@playwright/test';

import { deleteAllRoutes } from '@/apis/routes';

const pluginName = 'cors';

test.beforeAll(async () => {
  await deleteAllRoutes(e2eReq);
});

test.afterAll(async () => {
  await deleteAllRoutes(e2eReq);
});

test('plugin editor drawer recovers when schema fetch fails', async ({
  page,
}) => {
  const crashes = watchForCrashes(page);

  // Abort schema requests for the chosen plugin.
  await page.route(
    (url) =>
      url.pathname.endsWith(`/apisix/admin/plugins/${pluginName}`) ||
      (url.pathname.includes('/apisix/admin/plugins/') &&
        url.pathname.endsWith(`/${pluginName}`)),
    (route) => route.abort('failed')
  );

  await routesPom.toAdd(page);
  await routesPom.isAddPage(page);

  await test.step('open Select Plugins and add cors', async () => {
    await page.getByRole('button', { name: 'Select Plugins' }).click();
    const selectDialog = page.getByRole('dialog', { name: 'Select Plugins' });
    await selectDialog.getByPlaceholder('Search').fill(pluginName);
    await selectDialog
      .getByTestId(`plugin-${pluginName}`)
      .getByRole('button', { name: 'Add' })
      .click();
  });

  await test.step('Add Plugin drawer must not stay in loading state forever', async () => {
    const addPluginDialog = page.getByRole('dialog', { name: 'Add Plugin' });
    await expect(addPluginDialog).toBeVisible({ timeout: 5000 });

    // After waiting longer than any reasonable loading window, the editor
    // must either render an error state or expose the user's escape hatch
    // (Close / Cancel button). A still-spinning indicator with no error is
    // the symptom of #3327.
    await page.waitForTimeout(3000);

    const editorLoading = addPluginDialog.getByTestId('editor-loading');
    await expect(editorLoading).toBeHidden({ timeout: 10000 });

    crashes.expectNoCrash('plugin schema fetch failure');
  });
});
