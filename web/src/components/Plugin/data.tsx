/*
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
import React from 'react';

import IconFont from '../IconFont';

export const PLUGIN_ICON_LIST: Record<string, any> = {
  prometheus: <IconFont name="iconPrometheus_software_logo" />,
  skywalking: <IconFont name="iconskywalking" />,
  'jwt-auth': <IconFont name="iconjwt-3" />,
  'authz-keycloak': <IconFont name="iconkeycloak_icon_32px" />,
  'openid-connect': <IconFont name="iconicons8-openid" />,
  'kafka-logger': <IconFont name="iconApache_kafka" />,
};

// This list is used to filter out plugins that cannot be displayed in the plugins list.
export const PLUGIN_FILTER_LIST: Record<string, { list: PluginComponent.ReferPage[] }> = {
  redirect: { list: ['route'] }, // Filter out the redirect plugin on the route page.
};
