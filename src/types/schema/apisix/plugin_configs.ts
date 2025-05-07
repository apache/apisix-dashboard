// filepath: /workspace/src/types/schema/apisix/plugin_configs.ts
import { z } from 'zod';
import { APISIXCommon } from './common';
import { APISIXPlugins } from './plugins';

const PluginConfig = z
  .object({
    plugins: APISIXPlugins.Plugins,
  })
  .merge(APISIXCommon.Basic)
  .merge(APISIXCommon.Info);

export const APISIXPluginConfigs = {
  PluginConfig,
  PluginConfigPost: PluginConfig.omit({
    id: true,
    create_time: true,
    update_time: true,
  }),
  PluginConfigPut: PluginConfig.omit({
    create_time: true,
    update_time: true,
  }),
};
