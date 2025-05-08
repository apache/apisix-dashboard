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

const SSLType = z.union([z.literal('server'), z.literal('client')]);

const SSLProtocols = z.union([
  z.literal('TLSv1.1'),
  z.literal('TLSv1.2'),
  z.literal('TLSv1.3'),
]);

const SSLClient = z.object({
  ca: z.string().optional(),
  depth: z.number().min(0).default(1).optional(),
  skip_mtls_uri_regex: z.array(z.string()).optional(),
});

const SSL = z
  .object({
    cert: z.string(),
    key: z.string(),
    sni: z.string().optional(),
    snis: z.array(z.string()),
    certs: z.array(z.string()),
    keys: z.array(z.string()),
    client: SSLClient.optional(),
    type: SSLType.optional(),
    status: APISIXCommon.Status.optional(),
    ssl_protocols: z.array(SSLProtocols).optional(),
  })
  .partial()
  .merge(APISIXCommon.Basic)
  .merge(APISIXCommon.Info);

export const APISIXSSLs = {
  SSL,
  SSLStatus: APISIXCommon.Status,
  SSLType,
  SSLProtocols,
  SSLClient,
};
