import { APISIXCommon } from './common';
import { APISIXPlugins } from './plugins';
import { APISIXGlobalRules } from './global_rules';
import { APISIXProtos } from './protos';
import { APISIXRoutes } from './routes';
import { APISIXStreamRoutes } from './stream_routes';
import { APISIXUpstreams } from './upstreams';
import { APISIXPluginMetadata } from './plugin_metadata';
import { APISIXConsumers } from './consumers';
export type { APISIXType } from './type';
export const APISIX = {
  ...APISIXCommon,
  ...APISIXConsumers,
  ...APISIXUpstreams,
  ...APISIXRoutes,
  ...APISIXStreamRoutes,
  ...APISIXProtos,
  ...APISIXGlobalRules,
  ...APISIXPlugins,
  ...APISIXPluginMetadata,
};
