import { APISIX, type APISIXType } from '@/types/schema/apisix';
import { produce } from 'immer';
import { isNotEmpty } from 'rambdax';
import { z } from 'zod';

const SSLForm = z.object({
  __clientEnabled: z.boolean().optional(),
});

export const SSLPostSchema = APISIX.SSL.omit({
  id: true,
  create_time: true,
  update_time: true,
}).merge(SSLForm);

export type SSLPostType = z.infer<typeof SSLPostSchema>;
export const SSLPutSchema = APISIX.SSL.merge(SSLForm);

export type SSLPutType = z.infer<typeof SSLPutSchema>;

export const produceToSSLForm = (data: APISIXType['SSL']) =>
  produce(data as SSLPutType, (draft) => {
    draft.__clientEnabled = isNotEmpty(draft.client);
  });
