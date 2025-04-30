import { APISIXCommon } from './common';
import { APISIXPlugins } from './plugins';
import { APISIXGlobalRules } from './global_rules';
import { APISIXProtos } from './protos';
import { APISIXRoutes } from './routes';
import { APISIXUpstreams } from './upstreams';
import { APISIXPluginMetadata } from './plugin_metadata';
export type { APISIXType } from './type';
export const APISIX = {
  ...APISIXCommon,
  ...APISIXUpstreams,
  ...APISIXRoutes,
  ...APISIXProtos,
  ...APISIXGlobalRules,
  ...APISIXPlugins,
  ...APISIXPluginMetadata,
};
