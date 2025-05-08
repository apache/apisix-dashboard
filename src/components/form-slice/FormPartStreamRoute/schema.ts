import type { TypeOf } from 'zod';

import { APISIXCommon } from '@/types/schema/apisix/common';
import { APISIXStreamRoutes } from '@/types/schema/apisix/stream_routes';

export const StreamRoutePostSchema = APISIXStreamRoutes.StreamRoute.omit({
  create_time: true,
  update_time: true,
  id: true,
}).merge(APISIXCommon.Basic);

export type StreamRoutePostType = TypeOf<typeof StreamRoutePostSchema>;
