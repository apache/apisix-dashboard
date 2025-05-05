import { APISIX } from '@/types/schema/apisix';
import { z } from 'zod';

const SSLForm = z.object({
  __clientEnabled: z.boolean().optional(),
});

export const SSLPostSchema = APISIX.SSL.omit({
  id: true,
  create_time: true,
  update_time: true,
}).merge(SSLForm);

export const SSLPutSchema = APISIX.SSL.merge(SSLForm);

export type SSLPostType = z.infer<typeof SSLPostSchema>;
  