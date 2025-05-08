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

const Route = z
  .object({
    uri: z.string(),
    uris: z.array(z.string()),
    host: z.string(),
    hosts: z.array(z.string()),
    methods: z.array(APISIXCommon.HttpMethod),
    remote_addr: z.string(),
    remote_addrs: z.array(z.string()),
    vars: APISIXCommon.Expr,
    filter_func: z.string(),
    script: z.string(),
    script_id: z.string(),
    plugins: APISIXPlugins.Plugins,
    plugin_config_id: z.string(),
    upstream: APISIXUpstreams.Upstream.omit({ id: true }),
    upstream_id: z.string(),
    service_id: z.string(),
    timeout: APISIXUpstreams.UpstreamTimeout.partial(),
    enable_websocket: z.boolean(),
    priority: z.number().default(0),
    status: APISIXCommon.Status,
  })
  .partial()
  .merge(APISIXCommon.Basic)
  .merge(APISIXCommon.Info);

export const APISIXRoutes = {
  Route,
  RouteStatus: APISIXCommon.Status,
};
