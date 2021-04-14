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
export default {
  'component.plugin.tip1': 'NOTE: After customizing the plugin, you need to update schema.json.',
  'component.plugin.tip2': 'How to update?',
  'component.select.pluginTemplate': 'Select a  plugin template',
  'component.step.select.pluginTemplate.select.option': 'Custom',
  'component.plugin.pluginTemplate.tip1': '1. When a route already have plugins field configured, the plugins in the plugin template will be merged into it.',
  'component.plugin.pluginTemplate.tip2': '2. The same plugin in the plugin template will override one in the plugins',

  // api-breaker
  'component.pluginForm.api-breaker.break_response_code.tooltip': 'Return error code when unhealthy.',
  'component.pluginForm.api-breaker.max_breaker_sec.tooltip': 'Maximum breaker time(seconds).',
  'component.pluginForm.api-breaker.unhealthy.http_statuses.tooltip': 'Status codes when unhealthy.',
  'component.pluginForm.api-breaker.unhealthy.failures.tooltip': 'Number of consecutive error requests that triggered an unhealthy state.',
  'component.pluginForm.api-breaker.healthy.http_statuses.tooltip': 'Status codes when healthy.',
  'component.pluginForm.api-breaker.healthy.successes.tooltip': 'Number of consecutive normal requests that trigger health status.',

  // proxy-mirror
  'component.pluginForm.proxy-mirror.host.tooltip': 'Specify a mirror service address, e.g. http://127.0.0.1:9797 (address needs to contain schema: http or https, not URI part)',
  'component.pluginForm.proxy-mirror.host.extra': 'e.g. http://127.0.0.1:9797 (address needs to contain schema: http or https, not URI part)',
  'component.pluginForm.proxy-mirror.host.ruletip': 'address needs to contain schema: http or https, not URI part',

  // limit-conn
  'component.pluginForm.limit-conn.conn.tooltip': 'the maximum number of concurrent requests allowed. Requests exceeding this ratio (and below conn + burst) will get delayed(the latency seconds is configured by default_conn_delay) to conform to this threshold.',
  'component.pluginForm.limit-conn.burst.tooltip': 'the number of excessive concurrent requests (or connections) allowed to be delayed.',
  'component.pluginForm.limit-conn.default_conn_delay.tooltip': 'the latency seconds of request when concurrent requests exceeding conn but below (conn + burst).',
  'component.pluginForm.limit-conn.key.tooltip': 'to limit the concurrency level.For example, one can use the host name (or server zone) as the key so that we limit concurrency per host name. Otherwise, we can also use the client address as the key so that we can avoid a single client from flooding our service with too many parallel connections or requests.Now accept those as key: "remote_addr"(client\'s IP), "server_addr"(server\'s IP), "X-Forwarded-For/X-Real-IP" in request header, "consumer_name"(consumer\'s username).',
  'component.pluginForm.limit-conn.rejected_code.tooltip': 'returned when the request exceeds conn + burst will be rejected.',
  // limit-req
  'component.pluginForm.limit-req.rate.tooltip': 'The specified request rate (number per second) threshold. Requests exceeding this rate (and below burst) will get delayed to conform to the rate.',
  'component.pluginForm.limit-req.burst.tooltip': 'The number of excessive requests per second allowed to be delayed. Requests exceeding this hard limit will get rejected immediately.',
  'component.pluginForm.limit-req.key.tooltip': 'The user specified key to limit the rate, now accept those as key: "remote_addr"(client\'s IP), "server_addr"(server\'s IP), "X-Forwarded-For/X-Real-IP" in request header, "consumer_name"(consumer\'s username).',
  'component.pluginForm.limit-req.rejected_code.tooltip': 'The HTTP status code returned when the request exceeds the threshold is rejected.',

  'component.plugin.form': 'Form',
  'component.plugin.format-codes.disable': 'Format JSON or YAML data',
  'component.plugin.editor': 'Plugin Editor',
  'component.plugin.noConfigurationRequired': 'Doesn\'t need configuration',
};
