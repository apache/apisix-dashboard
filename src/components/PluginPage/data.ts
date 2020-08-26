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
export const PLUGIN_MAPPER_SOURCE: { [name: string]: PluginPage.PluginMapperItem } = {
  'limit-req': {
    category: 'Limit',
  },
  'limit-count': {
    category: 'Limit',
  },
  'limit-conn': {
    category: 'Limit',
  },
  'key-auth': {
    category: 'Security',
  },
  'basic-auth': {
    category: 'Security',
  },
  prometheus: {
    category: 'Metric',
  },
  'node-status': {
    category: 'Other',
  },
  'jwt-auth': {
    category: 'Security',
  },
  zipkin: {
    category: 'Metric',
  },
  'ip-restriction': {
    category: 'Security',
  },
  'grpc-transcode': {
    category: 'Other',
    hidden: true,
  },
  'serverless-pre-function': {
    category: 'Other',
  },
  'serverless-post-function': {
    category: 'Other',
  },
  'openid-connect': {
    category: 'Security',
  },
  'proxy-rewrite': {
    category: 'Other',
    hidden: true,
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
  },
  'udp-logger': {
    category: 'Log',
  },
  'wolf-rbac': {
    category: 'Other',
    hidden: true,
  },
  'proxy-cache': {
    category: 'Other',
  },
  'tcp-logger': {
    category: 'Log',
  },
  'proxy-mirror': {
    category: 'Other',
  },
  'kafka-logger': {
    category: 'Log',
  },
  cors: {
    category: 'Security',
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
  },
  'mqtt-proxy': {
    category: 'Other',
  },
  oauth: {
    category: 'Security',
  },
};
