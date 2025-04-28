import { z } from 'zod';
import { A6Common } from './common';
import { A6Plugin } from './plugin';

const PluginGlobalRule = z
  .object({
    plugins: A6Plugin.Plugins,
  })
  .merge(A6Common.Info);

export const A6PluginGlobalRule = {
  PluginGlobalRule,
  PluginGlobalRulePut: PluginGlobalRule.omit({
    create_time: true,
    update_time: true,
  }),
};
