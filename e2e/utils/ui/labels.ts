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
import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

export async function uiFillLabels(
  ctx: Page | Locator,
  labels: Record<string, string>
) {
  const labelsField = ctx.getByRole('textbox', { name: 'Labels' });
  await expect(labelsField).toBeEnabled();

  for (const [key, value] of Object.entries(labels)) {
    const labelText = `${key}:${value}`;
    await labelsField.click();
    await labelsField.fill(labelText);
    await labelsField.press('Enter');

    // Verify the label was added by checking if the input is cleared
    // This indicates the tag was successfully created
    await expect(labelsField).toHaveValue('');
  }
}

export async function uiCheckLabels(
  ctx: Page | Locator,
  labels: Record<string, string>
) {
  for (const [key, value] of Object.entries(labels)) {
    const labelText = `${key}:${value}`;
    await expect(ctx.getByText(labelText)).toBeVisible();
  }
}

export async function uiAddSingleLabel(
  ctx: Page | Locator,
  key: string,
  value: string
) {
  await uiFillLabels(ctx, { [key]: value });
}

export async function uiCheckSingleLabel(
  ctx: Page | Locator,
  key: string,
  value: string
) {
  await uiCheckLabels(ctx, { [key]: value });
}
