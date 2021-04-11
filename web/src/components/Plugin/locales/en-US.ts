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

  // limit-count
  'component.pluginForm.limit-count.count.tooltip': 'The specified number of requests threshold.',
  'component.pluginForm.limit-count.time_window.tooltip': 'The time window in seconds before the request count is reset.',
  'component.pluginForm.limit-count.key.tooltip': 'The user specified key to limit the count.Now accept those as key: "remote_addr"(client\'s IP), "server_addr"(server\'s IP), "X-Forwarded-For/X-Real-IP" in request header, "consumer_name"(consumer\'s username) and "service_id".',
  'component.pluginForm.limit-count.rejected_code.tooltip': 'The HTTP status code returned when the request exceeds the threshold is rejected, default 503.',
  'component.pluginForm.limit-count.policy.tooltip': 'The rate-limiting policies to use for retrieving and incrementing the limits. Available values are local(the counters will be stored locally in-memory on the node) and redis(counters are stored on a Redis server and will be shared across the nodes, usually use it to do the global speed limit).',
  'component.pluginForm.limit-count.redis_host.tooltip': 'When using the redis policy, this property specifies the address of the Redis server.',
  'component.pluginForm.limit-count.redis_port.tooltip': 'When using the redis policy, this property specifies the port of the Redis server.',
  'component.pluginForm.limit-count.redis_password.tooltip': 'When using the redis policy, this property specifies the password of the Redis server.',
  'component.pluginForm.limit-count.redis_database.tooltip': 'When using the redis policy, this property specifies the database you selected of the Redis server, and only for non Redis cluster mode (single instance mode or Redis public cloud service that provides single entry).',
  'component.pluginForm.limit-count.redis_timeout.tooltip': 'When using the redis policy, this property specifies the timeout in milliseconds of any command submitted to the Redis server.',
  'component.pluginForm.limit-count.redis_cluster_nodes.tooltip': 'When using redis-cluster policy，This property is a list of addresses of Redis cluster service nodes.',
  'component.pluginForm.limit-count.redis_cluster_name.tooltip': 'When using redis-cluster policy, this property is the name of Redis cluster service nodes.',
};
