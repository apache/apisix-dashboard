import { z } from 'zod';
import { APISIXCommon } from './common';
import { APISIXPlugins } from './plugins';

const GlobalRule = z
  .object({
    plugins: APISIXPlugins.Plugins,
  })
  .merge(APISIXCommon.Info);

export const APISIXGlobalRules = {
  GlobalRule,
  GlobalRulePut: GlobalRule.omit({
    create_time: true,
    update_time: true,
  }),
};
