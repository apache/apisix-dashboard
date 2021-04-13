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
  'component.pluginForm.limit-conn.conn.tooltip': '允许的最大并发请求数。超过 conn 的限制、但是低于 conn + burst 的请求，将被延迟处理。',
  'component.pluginForm.limit-conn.burst.tooltip': '允许被延迟处理的并发请求数。',
  'component.pluginForm.limit-conn.default_conn_delay.tooltip': '默认的典型连接（或请求）的处理延迟时间。',
  'component.pluginForm.limit-conn.key.tooltip': '用户指定的限制并发级别的关键字，可以是客户端 IP 或服务端 IP。例如，可以使用主机名（或服务器区域）作为关键字，以便限制每个主机名的并发性。 否则，我们也可以使用客户端地址作为关键字，这样我们就可以避免单个客户端用太多的并行连接或请求淹没我们的服务。当前接受的 key 有："remote_addr"（客户端 IP 地址）, "server_addr"（服务端 IP 地址）, 请求头中的"X-Forwarded-For" 或 "X-Real-IP", "consumer_name"（consumer 的 username）。',
  'component.pluginForm.limit-conn.rejected_code.tooltip': '当请求超过 conn + burst 这个阈值时，返回的 HTTP 状态码。',

  'component.plugin.form': '表单',
  'component.plugin.format-codes.disable': '用于格式化 JSON 或 YAML 内容',
  'component.plugin.editor': '插件配置',
  'component.plugin.noConfigurationRequired': '本插件无需配置',
};
