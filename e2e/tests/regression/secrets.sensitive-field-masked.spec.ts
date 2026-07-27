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

// Regression for the #3417 test-suite gap: masking was only ever asserted
// inside the Settings modal (the admin key). Sensitive fields OUTSIDE that
// modal — the secret manager's token / access keys / private key, which use
// the same PasswordInput — had no test proving they render masked. This pins
// the Vault-secret Token field on the Add Secret page as masked (rendered
// through PasswordInput, i.e. type=password) rather than a plain text input —
// the regression that would surface if the field were swapped to TextInput.

import { secretsPom } from '@e2e/pom/secrets';
import { test } from '@e2e/utils/test';
import { expect } from '@playwright/test';

test('the Vault secret Token field is masked', async ({ page }) => {
  await secretsPom.toAdd(page);
  await secretsPom.isAddPage(page);

  // Vault is the default manager, so its Token field is rendered.
  const token = page.getByLabel('Token', { exact: true });
  await expect(token).toBeVisible();

  // A typed value must be masked (type=password), never shown in clear.
  await token.fill('super-secret-token');
  await expect(token).toHaveAttribute('type', 'password');
});
