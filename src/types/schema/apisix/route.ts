import { z } from 'zod';
import { A6Common } from './common';
import { A6Upstream } from './upstream';

const Route = z
  .object({
    uri: z.string(),
    uris: z.array(z.string()),
    host: z.string(),
    hosts: z.array(z.string()),
    methods: z.array(z.string()),
    remote_addr: z.string(),
    remote_addrs: z.array(z.string()),
    vars: A6Common.Expr,
    filter_func: z.string(),
    script: z.string(),
    script_id: z.string(),
    plugins: A6Common.Plugins,
    plugin_config_id: z.string(),
    upstream: A6Upstream.Upstream,
    upstream_id: z.string(),
    service_id: z.string(),
    timeout: A6Upstream.UpstreamTimeout.partial(),
    enable_websocket: z.boolean(),
    priority: z.number(),
    status: z.number(),
  })
  .partial()
  .merge(A6Common.Basic);

export const A6Route = {
  Route,
};
