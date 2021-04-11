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
  'component.plugin.tip1': '注意：自定义插件后（修改、新增、删除等），需更新 schema.json。',
  'component.plugin.tip2': '如何更新？',
  "component.select.pluginTemplate": '选择插件模板',
  'component.step.select.pluginTemplate.select.option': '手动配置',
  'component.plugin.pluginTemplate.tip1': '1. 若路由已配置插件，则插件模板数据将与已配置的插件数据合并。',
  'component.plugin.pluginTemplate.tip2': '2. 插件模板相同的插件会覆盖掉原有的插件。',

  // api-breaker
  'component.pluginForm.api-breaker.break_response_code.tooltip': '不健康返回错误码。',
  'component.pluginForm.api-breaker.max_breaker_sec.tooltip': '最大熔断持续时间。',
  'component.pluginForm.api-breaker.unhealthy.http_statuses.tooltip': '不健康时候的状态码。',
  'component.pluginForm.api-breaker.unhealthy.failures.tooltip': '触发不健康状态的连续错误请求次数。',
  'component.pluginForm.api-breaker.healthy.http_statuses.tooltip': '健康时候的状态码。',
  'component.pluginForm.api-breaker.healthy.successes.tooltip': '触发健康状态的连续正常请求次数。',
};
