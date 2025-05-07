import { APISIXCommon } from './common';
import { APISIXPlugins } from './plugins';
import { APISIXGlobalRules } from './global_rules';
import { APISIXProtos } from './protos';
import { APISIXRoutes } from './routes';
import { APISIXServices } from './services';
import { APISIXStreamRoutes } from './stream_routes';
import { APISIXUpstreams } from './upstreams';
import { APISIXPluginMetadata } from './plugin_metadata';
import { APISIXSecrets } from './secrets';
import { APISIXConsumers } from './consumers';
import { APISIXSSLs } from './ssls';
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
  ...APISIXSSLs,
  ...APISIXServices,
  ...APISIXSecrets,
};
