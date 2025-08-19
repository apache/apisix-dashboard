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

import type { APISIXType } from '@/types/schema/apisix';

import { genTLS } from '../common';
import { uiCheckLabels, uiFillLabels } from './labels';

export async function uiFillSSLRequiredFields(
  ctx: Page | Locator,
  ssl: Partial<APISIXType['SSL']>
) {
  // Generate TLS certificate if not provided
  const tls = ssl.cert && ssl.key ? ssl : genTLS();

  await ctx.getByRole('textbox', { name: 'Certificate 1' }).fill(tls.cert);
  await ctx.getByRole('textbox', { name: 'Private Key 1' }).fill(tls.key);
  if (ssl.sni) {
    await ctx.getByLabel('SNI', { exact: true }).fill(ssl.sni);
  }
  if (ssl.snis && ssl.snis.length > 0) {
    const snisField = ctx.getByRole('textbox', { name: 'SNIs' });
    for (const sni of ssl.snis) {
      await snisField.click();
      await snisField.fill(sni);
      await snisField.press('Enter');
      await expect(snisField).toHaveValue('');
    }
  }
  if (ssl.labels) {
    await uiFillLabels(ctx, ssl.labels);
  }
}

export async function uiCheckSSLRequiredFields(
  ctx: Page | Locator,
  ssl: Partial<APISIXType['SSL']>
) {
  const ID = ctx.getByRole('textbox', { name: 'ID', exact: true });
  if (await ID.isVisible()) {
    await expect(ID).toBeVisible();
    await expect(ID).toBeDisabled();
  }

  const certField = ctx.getByRole('textbox', { name: 'Certificate 1' });
  await expect(certField).toBeVisible();
  if (ssl.cert) {
    await expect(certField).toHaveValue(ssl.cert);
  }

  const keyField = ctx.getByRole('textbox', { name: 'Private Key 1' });
  await expect(keyField).toBeVisible();
  if (ssl.key) {
    await expect(keyField).toHaveValue(ssl.key);
  }

  if (ssl.sni) {
    const sniField = ctx.getByLabel('SNI', { exact: true });
    await expect(sniField).toHaveValue(ssl.sni);
    await expect(sniField).toBeDisabled();
  }

  if (ssl.snis && ssl.snis.length > 0) {
    for (const sni of ssl.snis) {
      await expect(ctx.getByText(sni)).toBeVisible();
    }
  }

  if (ssl.labels) {
    await uiCheckLabels(ctx, ssl.labels);
  }
}
