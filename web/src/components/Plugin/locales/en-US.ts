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

  'component.plugin.form': 'Form',
  'component.plugin.format-codes.disable': 'Format JSON or YAML data',
  'component.plugin.editor': 'Plugin Editor',
  'component.plugin.noConfigurationRequired': 'Doesn\'t need configuration',
};
