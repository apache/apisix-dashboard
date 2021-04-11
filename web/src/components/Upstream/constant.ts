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
export const DEFAULT_UPSTREAM = {
  upstream_id: '',
  // NOTE: the following fields are the default configurations
  // https://github.com/apache/apisix/blob/master/apisix/schema_def.lua#L325
  nodes: [
    {
      host: '',
      port: 80,
      weight: 1
    }
  ],
  retries: 0,
  timeout: {
    connect: 6,
    send: 6,
    read: 6,
  },
  type: 'roundrobin',
  checks: {},
  scheme: "http",
  pass_host: "pass",
  name: "",
  desc: ""
};

// NOTE: checks.active
// https://github.com/apache/apisix/blob/master/apisix/schema_def.lua#L40
export const DEFAULT_HEALTH_CHECK_ACTIVE = {
  type: "http",
  timeout: 1,
  concurrency: 10,
  host: "",
  port: 80,
  http_path: "",
  https_verify_certificate: true,
  healthy: {
    interval: 1,
    http_statuses: [200, 302],
    successes: 2
  },
  unhealthy: {
    interval: 1,
    http_statuses: [429, 404, 500, 501, 502, 503, 504, 505],
    http_failures: 5,
    tcp_failures: 2,
    timeouts: 3
  },
  req_headers: []
}

// NOTE: checks.passive
export const DEFAULT_HEALTH_CHECK_PASSIVE = {
  type: "http",
  healthy: {
    http_statuses: [
      200, 201, 202, 203, 204, 205, 206, 207,
      208, 226, 300, 301, 302, 303, 304, 305,
      306, 307, 308
    ],
    successes: 5
  },
  unhealthy: {
    http_statuses: [429, 500, 503],
    tcp_failures: 2,
    timeouts: 7,
    http_failures: 5
  }
}

export const removeBtnStyle = {
  marginLeft: 20,
  display: 'flex',
  alignItems: 'center',
};
