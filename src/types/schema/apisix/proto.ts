import { z } from 'zod';
import { A6Common } from './common';

const Proto = z
  .object({
    content: z.string(),
  })
  .merge(A6Common.ID);

export const A6Proto = {
  Proto,
  ProtoPost: Proto.omit({ id: true }),
};
