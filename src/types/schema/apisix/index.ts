import { APISIXCommon } from './common';
import { APISIXPlugins } from './plugins';
import { APISIXGlobalRules } from './global_rules';
import { APISIXProtos } from './protos';
import { APISIXRoutes } from './routes';
import { APISIXServices } from './services';
import { APISIXStreamRoutes } from './stream_routes';
import { APISIXUpstreams } from './upstreams';
import { APISIXPluginMetadata } from './plugin_metadata';
import { APISIXConsumers } from './consumers';
import { APISIXCredentials } from './credentials';
import { APISIXSSLs } from './ssls';
import { APISIXPluginConfigs } from './plugin_configs';
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
  ...APISIXCredentials,
  ...APISIXPluginConfigs,
};
