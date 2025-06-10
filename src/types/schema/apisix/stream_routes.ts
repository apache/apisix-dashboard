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
import { APISIXPlugins } from './plugins';
import { APISIXUpstreams } from './upstreams';

const StreamRouteProtocolLoggerItem = z.object({
  name: z.string(),
  filter: z.array(z.any()),
  conf: z.object({}),
});
const StreamRouteProtocol = z.object({
  name: z.string(),
  superior_id: z.string(),
  conf: z.object({}).optional(),
  logger: z.array(StreamRouteProtocolLoggerItem).optional(),
});

const StreamRoute = z
  .object({
    server_addr: z.string().optional(),
    server_port: z.number().int().gte(1).lte(65535).optional(),
    remote_addr: z.string().optional(),
    sni: z.string().optional(),
    plugins: APISIXPlugins.Plugins.optional(),
    upstream: APISIXUpstreams.Upstream.omit({ id: true }).optional(),
    upstream_id: z.string().optional(),
    service_id: z.string().optional(),
    protocol: StreamRouteProtocol.partial().optional(),
  })
  .partial()
  .merge(APISIXCommon.Basic.omit({ name: true, status: true }))
  .merge(APISIXCommon.Info);

export const APISIXStreamRoutes = {
  StreamRoute,
};
