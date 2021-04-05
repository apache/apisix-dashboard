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
  nodes: [
    {
      host: '',
      port: 80,
      weight: 1
    }
  ],
  type: 'roundrobin',
  timeout: {
    connect: 6,
    send: 6,
    read: 6,
  },
  retries: 1
};

// NOTE: checks.active
export const DEFAULT_HEALTH_CHECK_ACTIVE = {
  timeout: 0,
  http_path: '/',
  host: '',
  port: 80,
  healthy: {
    interval: 1,
    successes: 1
  },
  unhealthy: {
    interval: 1,
    http_failures: 1,
    req_headers: []
  }
}

// NOTE: checks.passive
export const DEFAULT_HEALTH_CHECK_PASSIVE = {
  healthy: {
    http_statuses: [],
    successes: 1
  },
  unhealthy: {
    http_statuses: [],
    tcp_failures: 1,
    timeouts: 1,
    http_failures: 1
  }
}
