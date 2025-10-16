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
import { parseEnv } from 'znv';
import { z } from 'zod';

import { BASE_PATH } from '../../src/config/constant';

config({
  path: ['./.env', './.env.local', './.env.development.local'],
});

export const env = parseEnv(process.env, {
  E2E_TARGET_URL: z
    .string()
    .url()
    .default(`http://localhost:9180${BASE_PATH}/`)
    .describe(
      `If you want to access the test server from dev container playwright to host e2e server, try http://host.docker.internal:9180${BASE_PATH}/`
    ),
});
