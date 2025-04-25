import { z } from 'zod';

const Labels = z.record(z.string());

const Plugin = z.record(z.unknown());

const Plugins = z.record(Plugin);

const Expr = z.array(z.unknown());

const Basic = z
  .object({
    name: z.string(),
    desc: z.string(),
    labels: Labels,
  })
  .partial();

const ID = z.object({
  id: z.string(),
});

export const A6Common = {
  Basic,
  Labels,
  Plugin,
  Plugins,
  Expr,
  ID,
};
