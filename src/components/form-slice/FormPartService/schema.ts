import { APISIXServices } from '@/types/schema/apisix/services';
import type { z } from 'zod';

export const ServicePostSchema = APISIXServices.ServicePost;

export type ServicePostType = z.infer<typeof ServicePostSchema>;
