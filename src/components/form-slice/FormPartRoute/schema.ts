import { APISIX } from '@/types/schema/apisix';
import type { z } from 'zod';

export const RoutePostSchema = APISIX.Route.omit({
  id: true,
  create_time: true,
  update_time: true,
});

export type RoutePostType = z.infer<typeof RoutePostSchema>;
