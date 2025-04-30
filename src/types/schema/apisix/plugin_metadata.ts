import { APISIXCommon } from './common';
import { APISIXPlugins } from './plugins';

const PluginMetadata = APISIXPlugins.PluginMetadataSchema.merge(
  APISIXCommon.Info
).omit({
  id: true,
});

export const APISIXPluginMetadata = {
  PluginMetadata: PluginMetadata,
  PluginMetadataPut: PluginMetadata.omit({
    create_time: true,
    update_time: true,
  }),
};
