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
import { sslsPom } from '@e2e/pom/ssls';
import { test } from '@e2e/utils/test';
import { uiCheckLabels, uiFillLabels } from '@e2e/utils/ui/labels';
import { expect } from '@playwright/test';

const testLabels = {
  env: 'test',
  version: 'v1',
  team: 'e2e',
};

const additionalLabels = {
  stage: 'production',
  region: 'us-west',
};

test('should support labels functionality in SSL forms', async ({ page }) => {
  await sslsPom.toIndex(page);
  await sslsPom.isIndexPage(page);

  await sslsPom.getAddSSLBtn(page).click();
  await sslsPom.isAddPage(page);

  await test.step('verify labels field is present and functional', async () => {
    // Verify Labels field is present
    const labelsField = page.getByRole('textbox', { name: 'Labels' });
    await expect(labelsField).toBeVisible();
    await expect(labelsField).toBeEnabled();
  });

  await test.step('test adding labels functionality', async () => {
    // Add multiple labels
    await uiFillLabels(page, testLabels);

    // Verify labels are displayed after addition
    await uiCheckLabels(page, testLabels);
  });

  await test.step('test adding additional labels', async () => {
    // Add more labels to test multiple labels functionality
    await uiFillLabels(page, additionalLabels);

    // Verify all labels (original + additional) are displayed
    const allLabels = { ...testLabels, ...additionalLabels };
    await uiCheckLabels(page, allLabels);
  });

  await test.step('verify labels persist in form', async () => {
    // Fill some other fields to verify labels persist
    await page.getByLabel('SNI', { exact: true }).fill('test.example.com');

    // Verify labels are still there
    const allLabels = { ...testLabels, ...additionalLabels };
    await uiCheckLabels(page, allLabels);
  });

  await test.step('verify labels field behavior', async () => {
    // Test that labels field clears after adding a label
    const labelsField = page.getByRole('textbox', { name: 'Labels' });

    // Add another label
    await labelsField.click();
    await labelsField.fill('new:label');
    await labelsField.press('Enter');

    // Verify the input field is cleared after adding
    await expect(labelsField).toHaveValue('');

    // Verify the new label is displayed
    await expect(page.getByText('new:label')).toBeVisible();
  });
});
