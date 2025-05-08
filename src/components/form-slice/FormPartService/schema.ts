import type { z } from 'zod';

import { APISIXServices } from '@/types/schema/apisix/services';

export const ServicePostSchema = APISIXServices.ServicePost;

export type ServicePostType = z.infer<typeof ServicePostSchema>;
