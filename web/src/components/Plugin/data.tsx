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

export const PLUGIN_MAPPER_SOURCE: Record<string, Omit<PluginComponent.Meta, 'name'>> = {
  'limit-req': {
    category: 'Limit traffic',
    priority: 1,
  },
  'limit-count': {
    category: 'Limit traffic',
    priority: 2,
  },
  'limit-conn': {
    category: 'Limit traffic',
    priority: 3,
  },
  prometheus: {
    category: 'Observability',
    priority: 1,
    avatar: <IconFont name="iconPrometheus_software_logo" />,
  },
  skywalking: {
    category: 'Observability',
    priority: 2,
    avatar: <IconFont name="iconskywalking" />,
  },
  zipkin: {
    category: 'Observability',
    priority: 3,
  },
  'request-id': {
    category: 'Observability',
    priority: 4,
  },
  'key-auth': {
    category: 'Authentication',
    priority: 1,
  },
  'basic-auth': {
    category: 'Authentication',
    priority: 3,
  },
  'node-status': {
    category: 'Other',
  },
  'jwt-auth': {
    category: 'Authentication',
    priority: 2,
    avatar: <IconFont name="iconjwt-3" />,
  },
  'authz-keycloak': {
    category: 'Authentication',
    priority: 5,
    avatar: <IconFont name="iconkeycloak_icon_32px" />,
  },
  'ip-restriction': {
    category: 'Security',
    priority: 1,
  },
  'grpc-transcode': {
    category: 'Other',
  },
  'serverless-pre-function': {
    category: 'Other',
  },
  'serverless-post-function': {
    category: 'Other',
  },
  'openid-connect': {
    category: 'Authentication',
    priority: 4,
    avatar: <IconFont name="iconicons8-openid" />,
  },
  'proxy-rewrite': {
    category: 'Other',
  },
  redirect: {
    category: 'Other',
    hidden: true,
  },
  'response-rewrite': {
    category: 'Other',
  },
  'fault-injection': {
    category: 'Security',
    priority: 4,
  },
  'udp-logger': {
    category: 'Log',
    priority: 4,
  },
  'wolf-rbac': {
    category: 'Other',
  },
  'proxy-cache': {
    category: 'Other',
    priority: 1,
  },
  'tcp-logger': {
    category: 'Log',
    priority: 3,
  },
  'proxy-mirror': {
    category: 'Other',
    priority: 2,
  },
  'kafka-logger': {
    category: 'Log',
    priority: 1,
    avatar: <IconFont name="iconApache_kafka" />,
  },
  cors: {
    category: 'Security',
    priority: 2,
  },
  'uri-blocker': {
    category: 'Security',
    priority: 3,
  },
  'request-validator': {
    category: 'Security',
    priority: 5,
  },
  heartbeat: {
    category: 'Other',
    hidden: true,
  },
  'batch-requests': {
    category: 'Other',
  },
  'http-logger': {
    category: 'Log',
    priority: 2,
  },
  'mqtt-proxy': {
    category: 'Other',
  },
  oauth: {
    category: 'Security',
  },
  syslog: {
    category: 'Log',
    priority: 5,
  },
  echo: {
    category: 'Other',
    priority: 3,
  },
};
