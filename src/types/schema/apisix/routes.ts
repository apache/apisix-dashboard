import { z } from 'zod';
import { APISIXCommon } from './common';
import { APISIXUpstreams } from './upstreams';
import { APISIXPlugins } from './plugins';

const RouteStatus = z.union([z.literal(0), z.literal(1)]);

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
    priority: z.number(),
    status: RouteStatus,
  })
  .partial()
  .merge(APISIXCommon.Basic)
  .merge(APISIXCommon.Info);

export const APISIXRoutes = {
  Route,
  RouteStatus,
};
