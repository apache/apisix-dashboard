import { APISIX } from '@/types/schema/apisix';
import { z } from 'zod';

// We don't omit id now, as we need it for detail view
export const FormPartUpstreamSchema = APISIX.Upstream.extend({
  __checksEnabled: z.boolean().optional().default(false),
  __checksPassiveEnabled: z.boolean().optional().default(false),
});

export type FormPartUpstreamType = z.infer<typeof FormPartUpstreamSchema>;
