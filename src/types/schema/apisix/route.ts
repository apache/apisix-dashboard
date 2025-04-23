import { z } from 'zod';
import { A6Common } from './common';
import { A6Upstream } from './upstream';

const Route = A6Common.Basic.merge(
  z.object({
    uri: z.string().optional(),
    uris: z.array(z.string()).optional(),
    host: z.string().optional(),
    hosts: z.array(z.string()).optional(),
    methods: z.array(z.string()).optional(),
    remote_addr: z.string().optional(),
    remote_addrs: z.array(z.string()).optional(),
    vars: A6Common.Expr.optional(),
    filter_func: z.string().optional(),
    script: z.string().optional(),
    script_id: z.string().optional(),
    plugins: A6Common.Plugins.optional(),
    plugin_config_id: z.string().optional(),
    upstream: A6Upstream.Upstream.optional(),
    upstream_id: z.string().optional(),
    service_id: z.string().optional(),
    timeout: A6Upstream.UpstreamTimeout.partial(),
    enable_websocket: z.boolean().optional(),
    priority: z.number().optional(),
    status: z.number().optional(),
  })
);

export const A6Route = {
  Route,
};
