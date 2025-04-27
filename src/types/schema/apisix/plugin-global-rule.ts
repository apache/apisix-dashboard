import { z } from 'zod';
import { A6Common } from './common';

const PluginGlobalRule = z
  .object({
    plugins: A6Common.Plugins,
  })
  .merge(A6Common.Info);

export const A6PluginGlobalRule = {
  PluginGlobalRule,
  PluginGlobalRulePost: PluginGlobalRule.omit({
    id: true,
    create_time: true,
    update_time: true,
  }),
};
