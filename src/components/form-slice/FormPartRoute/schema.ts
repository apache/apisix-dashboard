import { A6 } from '@/types/schema/apisix';
import type { z } from 'zod';

export const RoutePostSchema = A6.Route;

export type RoutePostType = z.infer<typeof RoutePostSchema>;
