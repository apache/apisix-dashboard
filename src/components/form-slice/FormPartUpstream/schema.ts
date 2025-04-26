import { A6 } from '@/types/schema/apisix';
import { z } from 'zod';

export const FormPartUpstreamSchema = A6.Upstream.extend({
  __checksEnabled: z.boolean(),
});

export type FormPartUpstreamType = z.infer<typeof FormPartUpstreamSchema>;
