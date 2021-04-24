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
  'proxy-rewrite': { list: ['route'] },
};

export enum PluginType {
  authentication = "authentication",
  security = "security",
  traffic = "traffic",
  serverless = "serverless",
  observability = "observability",
  other = "other"
}

/**
 * Plugin List that contains type field
*/
export const PLUGIN_LIST = {
  "hmac-auth": {
    type: PluginType.authentication
  },
  "serverless-post-function": {
    type: PluginType.serverless
  },
  "mqtt-proxy": {
    type: PluginType.other,
    hidden: true
  },
  "response-rewrite": {
    type: PluginType.other
  },
  "basic-auth": {
    type: PluginType.authentication
  },
  "error-log-logger": {
    type: PluginType.observability
  },
  "fault-injection": {
    type: PluginType.security
  },
  "limit-count": {
    type: PluginType.traffic
  },
  "prometheus": {
    type: PluginType.observability
  },
  "proxy-rewrite": {
    type: PluginType.other
  },
  "syslog": {
    type: PluginType.observability
  },
  "traffic-split": {
    type: PluginType.traffic
  },
  "jwt-auth": {
    type: PluginType.authentication
  },
  "kafka-logger": {
    type: PluginType.observability
  },
  "limit-conn": {
    type: PluginType.traffic
  },
  "udp-logger": {
    type: PluginType.observability
  },
  "zipkin": {
    type: PluginType.observability
  },
  "echo": {
    type: PluginType.other,
    hidden: true
  },
  "log-rotate": {
    type: PluginType.observability,
    hidden: true
  },
  "serverless-pre-function": {
    type: PluginType.serverless
  },
  "dubbo-proxy": {
    type: PluginType.other,
    hidden: true
  },
  "node-status": {
    type: PluginType.other,
    hidden: true
  },
  "referer-restriction": {
    type: PluginType.security
  },
  "api-breaker": {
    type: PluginType.security,
  },
  "consumer-restriction": {
    type: PluginType.security
  },
  "cors": {
    type: PluginType.security
  },
  "limit-req": {
    type: PluginType.traffic
  },
  "proxy-mirror": {
    type: PluginType.other
  },
  "request-validation": {
    type: PluginType.security
  },
  "example-plugin": {
    type: PluginType.other,
    hidden: true
  },
  "ip-restriction": {
    type: PluginType.security
  },
  "key-auth": {
    type: PluginType.authentication
  },
  "proxy-cache": {
    type: PluginType.other
  },
  "redirect": {
    type: PluginType.other,
    hidden: true
  },
  "request-id": {
    type: PluginType.observability
  },
  "skywalking": {
    type: PluginType.observability
  },
  "batch-requests": {
    type: PluginType.other
  },
  "http-logger": {
    type: PluginType.observability
  },
  "openid-connect": {
    type: PluginType.authentication
  },
  "sls-logger": {
    type: PluginType.observability
  },
  "tcp-logger": {
    type: PluginType.observability
  },
  "uri-blocker": {
    type: PluginType.security
  },
  "wolf-rbac": {
    type: PluginType.other
  },
  "authz-keycloak": {
    type: PluginType.authentication
  },
  "grpc-transcode": {
    type: PluginType.other
  },
  "server-info": {
    type: PluginType.other,
    hidden: true
  }
}
