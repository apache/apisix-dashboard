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

  // limit-conn
  'component.pluginForm.fault-injection.abort.http_status.tooltip': '返回给客户端的 http 状态码。',
  'component.pluginForm.fault-injection.abort.body.tooltip': '返回给客户端的响应数据。支持使用 Nginx 变量，如 client addr: $remote_addr。',
  'component.pluginForm.fault-injection.abort.percentage.tooltip': '将被中断的请求占比。',
  'component.pluginForm.fault-injection.abort.vars.tooltip': '执行故障注入的规则，当规则匹配通过后才会执行故障注。vars 是一个表达式的列表，来自 lua-resty-expr。',
  'component.pluginForm.fault-injection.delay.duration.tooltip': '延迟时间，可以指定小数。',
  'component.pluginForm.fault-injection.delay.percentage.tooltip': '将被延迟的请求占比。',
  'component.pluginForm.fault-injection.delay.vars.tooltip': '执行请求延迟的规则，当规则匹配通过后才会延迟请求。vars 是一个表达式列表，来自 lua-resty-expr。',
};
