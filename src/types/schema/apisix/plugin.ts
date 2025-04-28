import { z } from 'zod';

const Plugin = z.record(z.unknown());

const Plugins = z.record(Plugin);

const PluginsQuery = z.object({
  all: z.boolean().optional(),
  subsystem: z.union([z.literal('http'), z.literal('stream')]).optional(),
});

const PluginSchema = z.object({
  _meta: z.object({}).optional(),
});

export const A6Plugin = {
  Plugin,
  Plugins,
  PluginsQuery,
  PluginSchema,
};
