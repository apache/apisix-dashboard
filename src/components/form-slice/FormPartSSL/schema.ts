import { APISIX } from '@/types/schema/apisix';
import { z } from 'zod';

export const SSLPostSchema = APISIX.SSL.omit({
  id: true,
  create_time: true,
  update_time: true,
}).extend({
  __clientEnabled: z.boolean().optional(),
});

export type SSLPostType = z.infer<typeof SSLPostSchema>;
