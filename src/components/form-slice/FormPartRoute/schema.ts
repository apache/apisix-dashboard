import type { z } from 'zod';

import { APISIX } from '@/types/schema/apisix';

export const RoutePostSchema = APISIX.Route.omit({
  id: true,
  create_time: true,
  update_time: true,
});

export type RoutePostType = z.infer<typeof RoutePostSchema>;
