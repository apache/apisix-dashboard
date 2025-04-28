import { A6Common } from './common';
import { A6Plugin } from './plugin';

const PluginMetadata = A6Plugin.PluginMetadataSchema.merge(A6Common.Info).omit({
  id: true,
});

export const A6PluginMetadata = {
  PluginMetadata: PluginMetadata,
  PluginMetadataPut: PluginMetadata.omit({
    create_time: true,
    update_time: true,
  }),
};
