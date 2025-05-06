import { z } from 'zod';
import { APISIXCommon } from './common';
import { APISIXUpstreams } from './upstreams';
import { APISIXPlugins } from './plugins';

const StreamRouteProtocolLoggerItem = z.object({
  name: z.string(),
  filter: z.array(z.any()),
  conf: z.object({}),
});
const StreamRouteProtocol = z.object({
  name: z.string(),
  superior_id: z.string(),
  conf: z.object({}),
  logger: z.array(StreamRouteProtocolLoggerItem),
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
    status: APISIXCommon.Status.optional(),
  })
  .partial()
  .merge(APISIXCommon.Basic.omit({ name: true }))
  .merge(APISIXCommon.Info);

export const APISIXStreamRoutes = {
  StreamRoute,
};
