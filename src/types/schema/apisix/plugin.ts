import { z } from 'zod';

const Plugin = z.record(z.unknown());

const Plugins = z.record(Plugin);

const PluginsQuery = z.object({
  subsystem: z.union([z.literal('http'), z.literal('stream')]).optional(),
});

const PluginConsumerSchema = z.object({});
const PluginMetadataSchema = z.object({});

const PluginSchema = z.object({
  _meta: z.object({}).optional(),
  consumer_schema: PluginConsumerSchema.optional(),
  metadata_schema: PluginMetadataSchema.optional(),
});

const PluginSchemaKeys = z.union([
  // `normal` as a placeholder for the general case.
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
  PluginMetadataSchema,
};
