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

// Regression: SSL labels must remain visible after save.
// Related issue:
//   - apache/apisix-dashboard#3172 SSL labels missing after creation
// User expectation: labels entered when creating an SSL stay visible on the
// detail page and are reflected by the Admin API.
//
// Note: `ssls.check-labels.spec.ts` only verifies labels render IN the form
// (pre-save). This test covers the post-save round trip.

import { sslsPom } from '@e2e/pom/ssls';
import { genTLS } from '@e2e/utils/common';
import { e2eReq } from '@e2e/utils/req';
import { test } from '@e2e/utils/test';
import { uiHasToastMsg } from '@e2e/utils/ui';
import { uiCheckLabels } from '@e2e/utils/ui/labels';
import { uiFillSSLRequiredFields } from '@e2e/utils/ui/ssls';
import { expect } from '@playwright/test';

import { deleteAllSSLs, getSSLReq } from '@/apis/ssls';
import type { APISIXType } from '@/types/schema/apisix';

const snis = ['reg-labels.example.com'];
const labels = {
  env: 'prod',
  owner: 'sre',
};

test.beforeAll(async () => {
  await deleteAllSSLs(e2eReq);
});

test.afterAll(async () => {
  await deleteAllSSLs(e2eReq);
});

test('SSL labels are preserved and displayed after save', async ({ page }) => {
  await sslsPom.toAdd(page);
  await sslsPom.isAddPage(page);

  const tls = await genTLS();
  const sslData: Partial<APISIXType['SSL']> = {
    snis,
    cert: tls.cert,
    key: tls.key,
    labels,
  };

  await test.step('fill cert / SNI / labels and submit', async () => {
    await uiFillSSLRequiredFields(page, sslData);

    await sslsPom.getAddBtn(page).click();
    await uiHasToastMsg(page, { hasText: 'Add SSL Successfully' });
    // SSL form redirects back to the list after submit, not to detail.
    await sslsPom.isIndexPage(page);
  });

  let sslId = '';

  await test.step('open SSL detail from list', async () => {
    await page
      .getByRole('row', { name: snis[0] })
      .getByRole('button', { name: 'View' })
      .click();
    await sslsPom.isDetailPage(page);
    sslId = page.url().split('/').pop()!;
    expect(sslId).toBeTruthy();
  });

  await test.step('detail page displays labels after save', async () => {
    await uiCheckLabels(page, labels);
  });

  await test.step('Admin API has the labels', async () => {
    const resp = await getSSLReq(e2eReq, sslId);
    expect(resp.value.labels).toBeDefined();
    for (const [k, v] of Object.entries(labels)) {
      expect((resp.value.labels as Record<string, string>)[k]).toBe(v);
    }
  });
});
