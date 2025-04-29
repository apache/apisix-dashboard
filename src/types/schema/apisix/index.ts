import { A6Common } from './common';
import { A6Plugins } from './plugins';
import { A6GlobalRules } from './global_rules';
import { A6Protos } from './protos';
import { A6Routes } from './routes';
import { A6Upstreams } from './upstreams';
import { A6PluginMetadata } from './plugin_metadata';
export type { A6Type } from './type';
export const A6 = {
  ...A6Common,
  ...A6Upstreams,
  ...A6Routes,
  ...A6Protos,
  ...A6GlobalRules,
  ...A6Plugins,
  ...A6PluginMetadata,
};
