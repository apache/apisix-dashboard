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
import type { ForwardRefExoticComponent, SVGProps } from 'react';

import type { Resources } from '@/config/i18n';
import type { FileRouteTypes } from '@/routeTree.gen';
import IconStreamRoutes from '~icons/tabler/arrows-right-left';
import IconSSLs from '~icons/tabler/certificate';
import IconProtos from '~icons/tabler/file-code';
import IconSecrets from '~icons/tabler/key';
import IconPluginConfigs from '~icons/tabler/puzzle';
import IconRoutes from '~icons/tabler/route';
import IconUpstreams from '~icons/tabler/server-2';
import IconServices from '~icons/tabler/stack-2';
import IconPluginMetadata from '~icons/tabler/tags';
import IconConsumers from '~icons/tabler/user';
import IconConsumerGroups from '~icons/tabler/users';
import IconGlobalRules from '~icons/tabler/world';

/** An `~icons/*` component, as typed by `unplugin-icons/types/react`. */
export type NavIcon = ForwardRefExoticComponent<
  SVGProps<SVGSVGElement> & { title?: string }
>;

export type NavRoute = {
  to: FileRouteTypes['to'];
  label: keyof Resources['en']['common']['sources'];
  icon: NavIcon;
};
export const navRoutes: NavRoute[] = [
  {
    to: '/services',
    label: 'services',
    icon: IconServices,
  },
  {
    to: '/routes',
    label: 'routes',
    icon: IconRoutes,
  },
  {
    to: '/stream_routes',
    label: 'streamRoutes',
    icon: IconStreamRoutes,
  },
  {
    to: '/upstreams',
    label: 'upstreams',
    icon: IconUpstreams,
  },
  {
    to: '/consumers',
    label: 'consumers',
    icon: IconConsumers,
  },
  {
    to: '/consumer_groups',
    label: 'consumerGroups',
    icon: IconConsumerGroups,
  },
  {
    to: '/ssls',
    label: 'ssls',
    icon: IconSSLs,
  },
  {
    to: '/global_rules',
    label: 'globalRules',
    icon: IconGlobalRules,
  },
  {
    to: '/plugin_metadata',
    label: 'pluginMetadata',
    icon: IconPluginMetadata,
  },
  {
    to: '/plugin_configs',
    label: 'pluginConfigs',
    icon: IconPluginConfigs,
  },
  {
    to: '/secrets',
    label: 'secrets',
    icon: IconSecrets,
  },
  {
    to: '/protos',
    label: 'protos',
    icon: IconProtos,
  },
];
