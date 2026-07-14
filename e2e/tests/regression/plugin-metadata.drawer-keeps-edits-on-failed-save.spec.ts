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

// Regression: PluginEditorDrawer called its void-typed onSave and then
// synchronously closed the drawer and reset the form. On the Plugin
// Metadata page onSave is putMetadata.mutateAsync, so a failed PUT closed
// the drawer as if it had succeeded and destroyed the user's edited JSON.
// The drawer now awaits onSave and keeps the drawer (and edits) on failure.
//
// Part of apache/apisix-dashboard#3417 (error handling item 5).

import { pluginMetadataPom } from '@e2e/pom/plugin_metadata';
import { e2eReq } from '@e2e/utils/req';
import { test } from '@e2e/utils/test';
import {
  uiFillMonacoEditor,
  uiGetMonacoEditor,
  uiHasToastMsg,
} from '@e2e/utils/ui';
import { expect } from '@playwright/test';

import { API_PLUGIN_METADATA } from '@/config/constant';

const PLUGIN = 'syslog';
const EDITED_HOST = '10.0.0.99';

const deletePluginMetadata = async () => {
  await e2eReq.delete(`${API_PLUGIN_METADATA}/${PLUGIN}`).catch(() => {
    // ignore when it does not exist
  });
};

test.beforeAll(async () => {
  await deletePluginMetadata();
  await e2eReq.put(`${API_PLUGIN_METADATA}/${PLUGIN}`, { host: '127.0.0.1' });
});

test.afterAll(async () => {
  await deletePluginMetadata();
});

test('failed metadata save keeps the drawer open with the edits intact', async ({
  page,
}) => {
  await pluginMetadataPom.toIndex(page);
  await pluginMetadataPom.isIndexPage(page);

  // Force the PUT to fail with a server-style error; reads stay live.
  // Keep the matcher in a const: page.unroute matches function matchers
  // by reference, so the same instance must be used to lift the fault.
  const metadataUrl = (url: URL) =>
    url.pathname.endsWith(`/apisix/admin/plugin_metadata/${PLUGIN}`);
  await page.route(metadataUrl, async (route) => {
    if (route.request().method() === 'PUT') {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error_msg: 'forced 500 for regression' }),
      });
    } else {
      await route.fallback();
    }
  });

  const card = page.getByTestId(`plugin-${PLUGIN}`);
  await card.getByRole('button', { name: 'Edit' }).click();

  const dialog = page.getByRole('dialog', { name: 'Edit Plugin' });
  await expect(dialog).toBeVisible();

  const editor = await uiGetMonacoEditor(page, dialog);
  await uiFillMonacoEditor(
    page,
    editor,
    `{"host": "${EDITED_HOST}", "port": 5140}`
  );

  await dialog.getByRole('button', { name: 'Save' }).click();

  // The failure toast comes from the axios interceptor.
  await uiHasToastMsg(page, { hasText: 'forced 500 for regression' });

  // Core contract: the drawer did NOT close and the edits are intact.
  await expect(dialog).toBeVisible();
  const editorValue = await page.evaluate(() =>
    window.__monacoEditor__?.getValue()
  );
  expect(editorValue).toContain(EDITED_HOST);

  // Recovery: lift the fault and the same Save must go through.
  await page.unroute(metadataUrl);
  await dialog.getByRole('button', { name: 'Save' }).click();
  await uiHasToastMsg(page, { hasText: 'success' });
  await expect(dialog).toBeHidden();

  const saved = await e2eReq.get<
    unknown,
    { data: { value: { host: string; port: number } } }
  >(`${API_PLUGIN_METADATA}/${PLUGIN}`);
  expect(saved.data.value.host).toBe(EDITED_HOST);
});
