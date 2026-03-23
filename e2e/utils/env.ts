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
import { config } from 'dotenv';
import { z } from 'zod';

import { BASE_PATH } from '../../src/config/constant';

config({
  path: ['./.env', './.env.local', './.env.development.local'],
});

const DEFAULT_E2E_TARGET_URL = `http://localhost:9180${BASE_PATH}/`;
const E2E_TARGET_URL_HINT =
  `If you want to access the test server from dev container playwright to host e2e server, try http://host.docker.internal:9180${BASE_PATH}/`;

const rawE2ETargetUrl = process.env.E2E_TARGET_URL;
const e2eTargetUrlResult = z
  .string()
  .url()
  .default(DEFAULT_E2E_TARGET_URL)
  .safeParse(rawE2ETargetUrl);

if (!e2eTargetUrlResult.success) {
  throw new Error(
    'Errors found while parsing environment:\n' +
      `  [E2E_TARGET_URL]: ${E2E_TARGET_URL_HINT}\n` +
      `    ${e2eTargetUrlResult.error.issues[0]?.message ?? 'Invalid value'}\n` +
      `    (received ${String(rawE2ETargetUrl)})`
  );
}

export const env = {
  E2E_TARGET_URL: e2eTargetUrlResult.data,
};
