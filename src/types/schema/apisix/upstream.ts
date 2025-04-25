import { z } from 'zod';
import { A6Common } from './common';

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
  port: z.number().int().gte(0).lte(65535),
  weight: z.number().int(),
  priority: z.number().int().optional(),
});

const UpstreamNodes = z.array(UpstreamNode);

const UpstreamNodeObj = z.record(z.number());

const UpstreamNodeListOrObj = z.union([UpstreamNodes, UpstreamNodeObj]);

const UpstreamDiscovery = z.object({
  discovery_type: z.string().optional(),
  service_name: z.string().optional(),
  discovery_args: z.record(z.unknown()).optional(),
});

const UpstreamTimeout = z.object({
  connect: z.number(),
  send: z.number(),
  read: z.number(),
});

const UpstreamClientTLS = z.object({
  client_cert: z.string(),
  client_key: z.string(),
  client_cert_id: z.string(),
  verify: z.boolean(),
});

const UpstreamKeepalivePool = z.object({
  size: z.number().min(1).default(320),
  idle_timeout: z.number().min(0).default(60),
  requests: z.number().int().min(1).default(1000),
});

const UpstreamHealthCheckPassiveHealthy = z.object({
  http_statuses: z.array(z.number()),
  successes: z.number(),
});

const UpstreamHealthCheckPassiveUnhealthy = z.object({
  http_statuses: z.array(z.number()),
  http_failures: z.number(),
  tcp_failures: z.number(),
  timeouts: z.number(),
});

const UpstreamHealthCheckActiveHealthy = z
  .object({
    interval: z.number(),
  })
  .merge(UpstreamHealthCheckPassiveHealthy);

const UpstreamHealthCheckActiveUnhealthy = z
  .object({
    interval: z.number(),
  })
  .merge(UpstreamHealthCheckPassiveUnhealthy);

const UpstreamHealthCheckActive = z.object({
  type: z
    .union([z.literal('http'), z.literal('https'), z.literal('tcp')])
    .optional(),
  timeout: z.number().optional(),
  concurrency: z.number().optional(),
  host: z.string(),
  port: z.number(),
  http_path: z.string(),
  https_verify_cert: z.boolean(),
  http_request_headers: z.array(z.string()),
  healthy: UpstreamHealthCheckActiveHealthy,
  unhealthy: UpstreamHealthCheckActiveUnhealthy,
});

const UpstreamHealthCheckPassive = z.object({
  type: z.string(),
  healthy: UpstreamHealthCheckPassiveHealthy,
  unhealthy: UpstreamHealthCheckPassiveUnhealthy,
});

const UpstreamHealthCheck = z.object({
  active: UpstreamHealthCheckActive,
  passive: UpstreamHealthCheckPassive,
});

const UpstreamTls = z.object({
  client_cert_id: z.string().optional(),
  client_cert: z.string().optional(),
  client_key: z.string().optional(),
  verify: z.boolean(),
});

const Upstream = A6Common.Basic.merge(UpstreamDiscovery).merge(
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

export const A6Upstream = {
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
  UpstreamClientTLS,
  UpstreamKeepalivePool,
  UpstreamHealthCheckPassiveHealthy,
  UpstreamHealthCheckPassiveUnhealthy,
  UpstreamHealthCheckActiveHealthy,
  UpstreamHealthCheckActiveUnhealthy,
  UpstreamHealthCheckActive,
  UpstreamHealthCheckPassive,
  UpstreamHealthCheck,
  UpstreamTls,
};
