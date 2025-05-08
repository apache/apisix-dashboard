import { z } from 'zod';

import { APISIXCommon } from './common';
import { APISIXPlugins } from './plugins';
import { APISIXUpstreams } from './upstreams';

const Service = z
  .object({
    plugins: APISIXPlugins.Plugins.optional(),
    upstream: APISIXUpstreams.Upstream.omit({ id: true }).optional(),
    upstream_id: z.string().optional(),
    script: z.string().optional(),
    enable_websocket: z.boolean().optional(),
    hosts: z.array(z.string()).optional(),
  })
  .merge(APISIXCommon.Basic)
  .merge(APISIXCommon.Info);

export const APISIXServices = {
  Service,
  ServicePost: Service.omit({
    id: true,
    create_time: true,
    update_time: true,
  }),
  ServicePut: Service.omit({
    create_time: true,
    update_time: true,
  }),
};
