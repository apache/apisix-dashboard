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

  // fault-injection
  'component.pluginForm.fault-injection.abort.http_status.rules': 'Please input abort.http_status!',
  'component.pluginForm.fault-injection.abort.http_status.tooltip': 'User-specified http code returned to the client.',
  'component.pluginForm.fault-injection.abort.body.tooltip': 'Response data returned to the client. Nginx variable can be used inside, like client addr: $remote_addr.',
  'component.pluginForm.fault-injection.abort.percentage.tooltip': 'Percentage of requests to be aborted.',
  'component.pluginForm.fault-injection.abort.vars.tooltip': 'The rules for executing fault injection will only be executed when the rules are matched. vars is a list of expressions, which is from the lua-resty-expr.',
  'component.pluginForm.fault-injection.delay.duration.rules': 'Please input delay.duration!',
  'component.pluginForm.fault-injection.delay.duration.tooltip': 'Delay time (can be decimal).',
  'component.pluginForm.fault-injection.delay.percentage.tooltip': 'Percentage of requests to be delayed.',
  'component.pluginForm.fault-injection.delay.vars.tooltip': 'Execute the request delay rule, and the request will be delayed only after the rule matches. vars is a list of expressions, which is from the lua-resty-expr.',
  // limit-conn
  'component.pluginForm.limit-conn.conn.tooltip': 'the maximum number of concurrent requests allowed. Requests exceeding this ratio (and below conn + burst) will get delayed(the latency seconds is configured by default_conn_delay) to conform to this threshold.',
  'component.pluginForm.limit-conn.burst.tooltip': 'the number of excessive concurrent requests (or connections) allowed to be delayed.',
  'component.pluginForm.limit-conn.default_conn_delay.tooltip': 'the latency seconds of request when concurrent requests exceeding conn but below (conn + burst).',
  'component.pluginForm.limit-conn.key.tooltip': 'to limit the concurrency level.For example, one can use the host name (or server zone) as the key so that we limit concurrency per host name. Otherwise, we can also use the client address as the key so that we can avoid a single client from flooding our service with too many parallel connections or requests.Now accept those as key: "remote_addr"(client\'s IP), "server_addr"(server\'s IP), "X-Forwarded-For/X-Real-IP" in request header, "consumer_name"(consumer\'s username).',
  'component.pluginForm.limit-conn.rejected_code.tooltip': 'returned when the request exceeds conn + burst will be rejected.',

  'component.plugin.form': 'Form',
  'component.plugin.format-codes.disable': 'Format JSON or YAML data',
  'component.plugin.editor': 'Plugin Editor',
  'component.plugin.noConfigurationRequired': 'Doesn\'t need configuration',
};
