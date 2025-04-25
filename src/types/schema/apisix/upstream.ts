import { z } from 'zod';
import { A6Common } from './common';

const UpstreamBalancer = z.union([
  z.literal('roundrobin'),
  z.literal('chash'),
  z.literal('least_conn'),
  z.literal('ewma'),
]);

const UpstreamScheme = z.union([
  z.literal('grpc'),
  z.literal('grpcs'),
  z.literal('http'),
  z.literal('https'),
  z.literal('tcp'),
  z.literal('tls'),
  z.literal('udp'),
  z.literal('kafka'),
]);

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
  size: z.number(),
  idle_timeout: z.number(),
  requests: z.number(),
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

const Upstream = A6Common.Basic.merge(
  z.object({
    nodes: UpstreamNodeListOrObj.optional(),
    scheme: UpstreamScheme.optional(),
    type: UpstreamBalancer.optional(),
    hash_on: z.string().optional(),
    key: z.string().optional(),
    checks: UpstreamHealthCheck.optional(),
    discovery_type: z.string().optional(),
    service_name: z.string().optional(),
    discovery_args: z.record(z.unknown()).optional(),
    pass_host: UpstreamPassHost.optional(),
    upstream_host: z.string().optional(),
    retries: z.number().optional(),
    retry_timeout: z.number().optional(),
    timeout: UpstreamTimeout.optional(),
    tls: UpstreamTls.optional(),
    keepalive_pool: UpstreamKeepalivePool.optional(),
  })
);

export const A6Upstream = {
  Upstream,
  UpstreamBalancer,
  UpstreamScheme,
  UpstreamPassHost,
  UpstreamNode,
  UpstreamNodes,
  UpstreamNodeObj,
  UpstreamNodeListOrObj,
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
