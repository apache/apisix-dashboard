import { z } from 'zod';
import { APISIXCommon } from './common';
import { APISIXPlugins } from './plugins';

const Consumer = z
  .object({
    username: z
      .string()
      .min(1)
      .regex(/^[a-zA-Z0-9_]+$/),
    plugins: APISIXPlugins.Plugins.optional(),
    group_id: z.string().optional(),
  })
  .merge(APISIXCommon.Basic.omit({ name: true }))
  .merge(APISIXCommon.Info.omit({ id: true }));

export const APISIXConsumers = {
  Consumer,
  ConsumerPut: Consumer.omit({
    create_time: true,
    update_time: true,
  }),
};
