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
import { APISIXCredentials } from './credentials';
import { APISIXSSLs } from './ssls';
import { APISIXPluginConfigs } from './plugin_configs';
import { APISIXConsumerGroups } from './consumer_groups';
export type { APISIXType } from './type';
export const APISIX = {
  ...APISIXCommon,
  ...APISIXConsumers,
  ...APISIXConsumerGroups,
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
  ...APISIXCredentials,
  ...APISIXPluginConfigs,
};
