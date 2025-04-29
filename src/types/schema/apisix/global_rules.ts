import { z } from 'zod';
import { A6Common } from './common';
import { A6Plugins } from './plugins';

const GlobalRule = z
  .object({
    plugins: A6Plugins.Plugins,
  })
  .merge(A6Common.Info);

export const A6GlobalRules = {
  GlobalRule,
  GlobalRulePut: GlobalRule.omit({
    create_time: true,
    update_time: true,
  }),
};
