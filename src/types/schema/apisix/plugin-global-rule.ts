import { z } from 'zod';
import { A6Common } from './common';

const PluginGlobalRule = z.object({
  plugns: A6Common.Plugins,
});

export const A6PluginGlobalRule = {
  PluginGlobalRule,
};
