import { z } from 'zod';
import { A6Common } from './common';
import { A6Plugin } from './plugin';

const GlobalRule = z
  .object({
    plugins: A6Plugin.Plugins,
  })
  .merge(A6Common.Info);

export const A6GlobalRule = {
  GlobalRule,
  GlobalRulePut: GlobalRule.omit({
    create_time: true,
    update_time: true,
  }),
};
