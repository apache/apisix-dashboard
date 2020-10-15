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
declare namespace UpstreamModule {
  type Node = Record<string, number>;
  type Type = 'roundrobin' | 'chash' | 'ewma';

  type Timeout = Record<'connect' | 'send' | 'read', number>;

  type HealthCheck = {
    active?: {
      timeout?: number;
      http_path: string;
      host: string;
      healthy: {
        interval: number;
        successes: number;
      };
      unhealthy: {
        interval: number;
        http_failures: number;
      };
      req_headers?: string[];
    };
    passive?: {
      healthy: {
        http_statuses: number[];
        successes: number;
      };
      unhealthy: {
        http_statuses: number[];
        http_failures: number;
        tcp_failures: number;
      };
    };
  };

  type UpstreamHost = {
    host: string;
    port: number;
    weight: number;
  };

  type K8SDeploymentInfo = {
    namespace: string;
    deploy_name: string;
    service_name: string;
    backend_type: string;
    port: number;
  };

  type RequestBody = {
    id: string;
    upstream_id: string;
    type: Type;
    nodes?: Node;
    k8s_deployment_info?: K8SDeploymentInfo;
    hash_on?: 'vars' | 'header' | 'cookie' | 'consumer';
    key?: string;
    checks?: HealthCheck;
    retries?: number;
    enable_websocket?: boolean;
    timeout?: Timeout;
    name?: string;
    desc?: string;
    pass_host?: 'pass' | 'node' | 'rewrite';
    upstream_host: UpstreamHost[];
  };

  // TODO: typing
  type ResponseBody = {} & RequestBody;
}
