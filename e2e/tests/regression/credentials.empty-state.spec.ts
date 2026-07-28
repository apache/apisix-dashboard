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

import { e2eReq } from '@e2e/utils/req';
import { test } from '@e2e/utils/test';
import { uiGoto } from '@e2e/utils/ui';
import { expect } from '@playwright/test';

import { deleteAllConsumers, putConsumerReq } from '@/apis/consumers';
import type { APISIXType } from '@/types/schema/apisix';

// Routes and stream routes also render nested (under
// /services/detail/$id/...), but this spec is the only coverage of the
// credentials list specifically, so it stays separate from the all-resources
// loop above.

const USERNAME = 'reg_empty_state_consumer';

// A fresh consumer has no credentials, which is exactly the state under test.
test.beforeAll(async () => {
  await putConsumerReq(e2eReq, {
    username: USERNAME,
  } as APISIXType['ConsumerPut']);
});

test.afterAll(async () => {
  await deleteAllConsumers(e2eReq);
});

test('the credentials empty state names the resource on a nested list', async ({
  page,
}) => {
  await uiGoto(page, `/consumers/detail/${USERNAME}/credentials`);

  await expect(page.getByText('No Credentials yet')).toBeVisible();
});
