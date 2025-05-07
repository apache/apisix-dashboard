import { z } from 'zod';

const Plugin = z.record(z.unknown());

const Plugins = z.record(Plugin);

const PluginsQuery = z.object({
  subsystem: z.union([z.literal('http'), z.literal('stream')]).optional(),
});

const PluginConsumerSchema = z.object({});
const PluginMetadataSchema = z.object({});

const PluginSchema = z.object({
  consumer_schema: PluginConsumerSchema.optional(),
  metadata_schema: PluginMetadataSchema.optional(),
  schema: z.object({}).optional(),
});

const PluginSchemaKeys = z.union([
  z.literal('schema'),
  z.literal('consumer_schema'),
  z.literal('metadata_schema'),
]);

export const APISIXPlugins = {
  Plugin,
  Plugins,
  PluginsQuery,
  PluginSchema,
  PluginSchemaKeys,
  PluginMetadataSchema,
};
