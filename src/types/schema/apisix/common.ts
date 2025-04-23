import { z } from 'zod';

const Labels = z.record(z.union([z.string(), z.array(z.string())]));

const Plugin = z.record(z.unknown());

const Plugins = z.record(Plugin);

const Expr = z.array(z.unknown());

const Basic = z.object({
  name: z.string().optional(),
  desc: z.string().optional(),
  labels: Labels.optional(),
});

const RespRequired = z.object({
  id: z.string(),
});

export const A6Common = {
  Basic,
  Labels,
  Plugin,
  Plugins,
  Expr,
  RespRequired,
};
