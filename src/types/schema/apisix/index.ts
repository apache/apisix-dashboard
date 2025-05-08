import { APISIXCommon } from './common';
import { APISIXConsumerGroups } from './consumer_groups';
import { APISIXConsumers } from './consumers';
import { APISIXCredentials } from './credentials';
import { APISIXGlobalRules } from './global_rules';
import { APISIXPluginConfigs } from './plugin_configs';
import { APISIXPluginMetadata } from './plugin_metadata';
import { APISIXPlugins } from './plugins';
import { APISIXProtos } from './protos';
import { APISIXRoutes } from './routes';
import { APISIXSecrets } from './secrets';
import { APISIXServices } from './services';
import { APISIXSSLs } from './ssls';
import { APISIXStreamRoutes } from './stream_routes';
import { APISIXUpstreams } from './upstreams';

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
