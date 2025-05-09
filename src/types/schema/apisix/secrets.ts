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
import { z } from 'zod';

import { APISIXCommon } from './common';

const SecretBase = APISIXCommon.ID;

const VaultSecret = SecretBase.extend({
  manager: z.literal('vault'),
  uri: z.string(),
  prefix: z.string(),
  token: z.string(),
  namespace: z.string().optional(),
});

const AWSSecret = SecretBase.extend({
  manager: z.literal('aws'),
  access_key_id: z.string(),
  secret_access_key: z.string(),
  session_token: z.string().optional(),
  region: z.string().optional(),
  endpoint_url: z.string().optional(),
});

const GCPSecret = SecretBase.extend({
  manager: z.literal('gcp'),
  auth_file: z.string().optional(),
  auth_config: z
    .object({
      client_email: z.string(),
      private_key: z.string(),
      project_id: z.string(),
      token_uri: z.string().optional(),
      entries_uri: z.string().optional(),
      scope: z.array(z.string()).optional(),
    })
    .optional(),
  ssl_verify: z.boolean().optional(),
});

/**
 * Secret is not what is originally provided in apisix, and the `manager` will be parsed from the id
 */
const Secret = z.discriminatedUnion('manager', [
  VaultSecret,
  AWSSecret,
  GCPSecret,
]);

export const APISIXSecrets = {
  VaultSecret,
  AWSSecret,
  GCPSecret,
  SecretBase,
  Secret,
};
