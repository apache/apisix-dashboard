/**
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
