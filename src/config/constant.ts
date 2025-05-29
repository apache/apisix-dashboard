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
export const BASE_PATH = '/ui';
export const PAGE_SIZE_MIN = 10;
export const PAGE_SIZE_MAX = 500;
export const API_HEADER_KEY = 'X-API-KEY';
export const API_PREFIX = '/apisix/admin';
export const API_ROUTES = '/routes';
export const API_STREAM_ROUTES = '/stream_routes';
export const API_UPSTREAMS = '/upstreams';
export const API_PROTOS = '/protos';
export const API_SERVICES = '/services';
export const API_GLOBAL_RULES = '/global_rules';
export const API_PLUGINS = '/plugins';
export const API_PLUGINS_LIST = '/plugins/list';
export const API_PLUGIN_METADATA = '/plugin_metadata';
export const API_SECRETS = '/secrets';
export const API_CONSUMERS = '/consumers';
export const API_CONSUMER_GROUPS = '/consumer_groups';
export const API_CREDENTIALS = (username: string) =>
  `${API_CONSUMERS}/${username}/credentials` as const;
export const API_SSLS = '/ssls';
export const API_PLUGIN_CONFIGS = '/plugin_configs';

export const SKIP_INTERCEPTOR_HEADER = '__dashboard__skipInterceptor';
export const APPSHELL_HEADER_HEIGHT = 60;
export const APPSHELL_NAVBAR_WIDTH = 250;
