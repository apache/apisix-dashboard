import { z } from 'zod';
import { A6Common } from './common';
import { A6Upstreams } from './upstreams';
import { A6Plugins } from './plugins';

const RouteStatus = z.union([z.literal(0), z.literal(1)]);

const Route = z
  .object({
    uri: z.string(),
    uris: z.array(z.string()),
    host: z.string(),
    hosts: z.array(z.string()),
    methods: z.array(A6Common.HttpMethod),
    remote_addr: z.string(),
    remote_addrs: z.array(z.string()),
    vars: A6Common.Expr,
    filter_func: z.string(),
    script: z.string(),
    script_id: z.string(),
    plugins: A6Plugins.Plugins,
    plugin_config_id: z.string(),
    upstream: A6Upstreams.Upstream,
    upstream_id: z.string(),
    service_id: z.string(),
    timeout: A6Upstreams.UpstreamTimeout.partial(),
    enable_websocket: z.boolean(),
    priority: z.number(),
    status: RouteStatus,
  })
  .partial()
  .merge(A6Common.Basic)
  .merge(A6Common.Info);

export const A6Routes = {
  Route,
  RouteStatus,
};
