import { z } from 'zod';

const Plugin = z.record(z.unknown());

const Plugins = z.record(Plugin);

const PluginsQuery = z.object({
  subsystem: z.union([z.literal('http'), z.literal('stream')]).optional(),
});

const PluginSchema = z.object({
  _meta: z.object({}).optional(),
  consumer_schema: z.object({}).optional(),
  metadata_schema: z.object({}).optional(),
});

const PluginSchemaKeys = z.union([
  z.literal('normal'),
  z.literal('consumer_schema'),
  z.literal('metadata_schema'),
]);

export const A6Plugin = {
  Plugin,
  Plugins,
  PluginsQuery,
  PluginSchema,
  PluginSchemaKeys,
};
