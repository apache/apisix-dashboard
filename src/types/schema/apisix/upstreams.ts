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

const UpstreamBalancer = z.union([
  z.literal('roundrobin'),
  z.literal('chash'),
  z.literal('least_conn'),
  z.literal('ewma'),
]);
const UpstreamHashOn = z.union([
  z.literal('vars'),
  z.literal('header'),
  z.literal('cookie'),
  z.literal('consumer'),
  z.literal('vars_combinations'),
]);

const UpstreamSchemeL4 = z.union([
  z.literal('tcp'),
  z.literal('tls'),
  z.literal('udp'),
]);
// keep the order, unless apisix change the order
const UpstreamSchemeL7 = z.union([
  z.literal('http'),
  z.literal('https'),
  z.literal('grpc'),
  z.literal('grpcs'),
]);
const UpstreamScheme = z.union([
  ...UpstreamSchemeL4.options,
  ...UpstreamSchemeL7.options,
]);

// keep the order, unless apisix change the order
const UpstreamPassHost = z.union([
  z.literal('pass'),
  z.literal('node'),
  z.literal('rewrite'),
]);

const UpstreamNode = z.object({
  host: z.string().min(1),
  port: z.number().int().gte(1).lte(65535),
  weight: z.number().int(),
  priority: z.number().int().optional(),
});

const UpstreamNodes = z.array(UpstreamNode);

const UpstreamNodeObj = z.record(z.number());

const UpstreamNodeListOrObj = z.union([UpstreamNodes, UpstreamNodeObj]);

const UpstreamDiscovery = z.object({
  discovery_type: z.string().optional(),
  service_name: z.string().optional(),
  discovery_args: z.object({}).optional(),
});

const UpstreamTimeout = z.object({
  connect: z.number(),
  send: z.number(),
  read: z.number(),
});

const UpstreamKeepalivePool = z.object({
  size: z.number().min(1).optional(),
  idle_timeout: z.number().min(0).optional(),
  requests: z.number().int().min(1).optional(),
});

const httpStatuses = z.array(z.number().int().min(200).max(599));

const UpstreamHealthCheckPassiveHealthy = z.object({
  http_statuses: httpStatuses,
  successes: z.number().int().min(1).max(254),
});

const UpstreamHealthCheckPassiveUnhealthy = z.object({
  http_statuses: httpStatuses,
  http_failures: z.number().int().max(254),
  tcp_failures: z.number().int().max(254),
  timeouts: z.number().int().max(254),
});

const UpstreamHealthCheckActiveHealthy = z
  .object({
    interval: z.number().int().min(1),
  })
  .merge(UpstreamHealthCheckPassiveHealthy);

const UpstreamHealthCheckActiveUnhealthy = z
  .object({
    interval: z.number().int().min(1),
  })
  .merge(UpstreamHealthCheckPassiveUnhealthy);

const UpstreamHealthCheckActiveType = z.union([
  z.literal('http'),
  z.literal('https'),
  z.literal('tcp'),
]);

const UpstreamHealthCheckActive = z.object({
  type: UpstreamHealthCheckActiveType.optional(),
  timeout: z.number().optional(),
  concurrency: z.number().optional(),
  host: z.string().optional(),
  port: z.number().optional(),
  http_path: z.string().optional(),
  https_verify_certificate: z.boolean().optional(),
  http_request_headers: z.array(z.string()).optional(),
  healthy: UpstreamHealthCheckActiveHealthy.partial(),
  unhealthy: UpstreamHealthCheckActiveUnhealthy.partial(),
});

const UpstreamHealthCheckPassiveType = UpstreamHealthCheckActiveType;
const UpstreamHealthCheckPassive = z.object({
  type: UpstreamHealthCheckActiveType.optional(),
  healthy: UpstreamHealthCheckPassiveHealthy.partial().optional(),
  unhealthy: UpstreamHealthCheckPassiveUnhealthy.partial().optional(),
});

const UpstreamHealthCheck = z.object({
  active: UpstreamHealthCheckActive.optional(),
  passive: UpstreamHealthCheckPassive.optional(),
});

const UpstreamTls = z.object({
  client_cert_id: z.string().optional(),
  client_cert: z.string().optional(),
  client_key: z.string().optional(),
  verify: z.boolean().optional(),
});

const Upstream = APISIXCommon.Basic.merge(APISIXCommon.ID)
  .merge(UpstreamDiscovery)
  .merge(
    z.object({
      nodes: UpstreamNodeListOrObj.optional(),
      scheme: UpstreamScheme.optional(),
      type: UpstreamBalancer.optional(),
      hash_on: UpstreamHashOn.optional(),
      key: z.string().optional(),
      checks: UpstreamHealthCheck.optional(),
      pass_host: UpstreamPassHost.optional(),
      upstream_host: z.string().optional(),
      retries: z.number().optional(),
      retry_timeout: z.number().optional(),
      timeout: UpstreamTimeout.partial().optional(),
      tls: UpstreamTls.optional(),
      keepalive_pool: UpstreamKeepalivePool.optional(),
    })
  );

export const APISIXUpstreams = {
  Upstream,
  UpstreamBalancer,
  UpstreamHashOn,
  UpstreamSchemeL4,
  UpstreamSchemeL7,
  UpstreamScheme,
  UpstreamPassHost,
  UpstreamNode,
  UpstreamNodes,
  UpstreamNodeObj,
  UpstreamNodeListOrObj,
  UpstreamDiscovery,
  UpstreamTimeout,
  UpstreamKeepalivePool,
  UpstreamHealthCheckPassiveType,
  UpstreamHealthCheckPassiveHealthy,
  UpstreamHealthCheckPassiveUnhealthy,
  UpstreamHealthCheckActiveType,
  UpstreamHealthCheckActiveHealthy,
  UpstreamHealthCheckActiveUnhealthy,
  UpstreamHealthCheckActive,
  UpstreamHealthCheckPassive,
  UpstreamHealthCheck,
  UpstreamTls,
};
