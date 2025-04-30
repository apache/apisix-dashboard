import { z } from 'zod';
import { APISIXCommon } from './common';
import { APISIXUpstreams } from './upstreams';
import { APISIXPlugins } from './plugins';

const Route = z
  .object({
    uri: z.string(),
    uris: z.array(z.string()),
    host: z.string(),
    hosts: z.array(z.string()),
    methods: z.array(z.string()),
    remote_addr: z.string(),
    remote_addrs: z.array(z.string()),
    vars: APISIXCommon.Expr,
    filter_func: z.string(),
    script: z.string(),
    script_id: z.string(),
    plugins: APISIXPlugins.Plugins,
    plugin_config_id: z.string(),
    upstream: APISIXUpstreams.Upstream,
    upstream_id: z.string(),
    service_id: z.string(),
    timeout: APISIXUpstreams.UpstreamTimeout.partial(),
    enable_websocket: z.boolean(),
    priority: z.number(),
    status: z.number(),
  })
  .partial()
  .merge(APISIXCommon.Basic);

export const APISIXRoutes = {
  Route,
};
