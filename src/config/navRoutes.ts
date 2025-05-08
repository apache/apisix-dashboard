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
import type { Resources } from '@/config/i18n';
import type { FileRouteTypes } from '@/routeTree.gen';

export type NavRoute = {
  to: FileRouteTypes['to'];
  label: keyof Resources['en']['common']['navbar'];
};
export const navRoutes: NavRoute[] = [
  {
    to: '/services',
    label: 'services',
  },
  {
    to: '/routes',
    label: 'routes',
  },
  {
    to: '/stream_routes',
    label: 'streamRoutes',
  },
  {
    to: '/upstreams',
    label: 'upstreams',
  },
  {
    to: '/consumers',
    label: 'consumers',
  },
  {
    to: '/consumer_groups',
    label: 'consumerGroups',
  },
  {
    to: '/ssls',
    label: 'ssls',
  },
  {
    to: '/global_rules',
    label: 'globalRules',
  },
  {
    to: '/plugin_metadata',
    label: 'pluginMetadata',
  },
  {
    to: '/plugin_configs',
    label: 'pluginConfigs',
  },
  {
    to: '/secrets',
    label: 'secrets',
  },
  {
    to: '/protos',
    label: 'protos',
  },
];
