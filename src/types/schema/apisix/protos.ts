import { z } from 'zod';

import { APISIXCommon } from './common';

const Proto = z
  .object({
    content: z.string(),
  })
  .merge(APISIXCommon.Info);

export const APISIXProtos = {
  Proto,
  ProtoPost: Proto.omit({ id: true, create_time: true, update_time: true }),
};
