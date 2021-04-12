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
  
  'component.plugin.form': '表单',
  'component.plugin.format-codes.disable': '用于格式化 JSON 或 YAML 内容',
  'component.plugin.editor': '插件配置',
  'component.plugin.noConfigurationRequired': '本插件无需配置',

  // limit-count
  'component.pluginForm.limit-count.count.tooltip': '指定时间窗口内的请求数量阈值。',
  'component.pluginForm.limit-count.time_window.tooltip': '时间窗口的大小（以秒为单位），超过这个时间就会重置。',
  'component.pluginForm.limit-count.key.tooltip': '用来做请求计数的有效值。例如，可以使用主机名（或服务器区域）作为关键字，以便限制每个主机名规定时间内的请求次数。我们也可以使用客户端地址作为关键字，这样我们就可以避免单个客户端规定时间内多次的连接我们的服务。当前接受的 key 有："remote_addr"（客户端 IP 地址）, "server_addr"（服务端 IP 地址）, 请求头中的"X-Forwarded-For" 或 "X-Real-IP", "consumer_name"（consumer 的 username）, "service_id" 。',
  'component.pluginForm.limit-count.rejected_code.tooltip': '当请求超过阈值被拒绝时，返回的 HTTP 状态码。',
  'component.pluginForm.limit-count.policy.tooltip': '用于检索和增加限制的速率限制策略。可选的值有：local(计数器被以内存方式保存在节点本地，默认选项) 和 redis(计数器保存在 Redis 服务节点上，从而可以跨节点共享结果，通常用它来完成全局限速)；以及redis-cluster，跟 redis 功能一样，只是使用 redis 集群方式。',
  'component.pluginForm.limit-count.redis_host.tooltip': '当使用 redis 限速策略时，该属性是 Redis 服务节点的地址。',
  'component.pluginForm.limit-count.redis_port.tooltip': '当使用 redis 限速策略时，该属性是 Redis 服务节点的端口。',
  'component.pluginForm.limit-count.redis_password.tooltip': '当使用 redis 限速策略时，该属性是 Redis 服务节点的密码。',
  'component.pluginForm.limit-count.redis_database.tooltip': '当使用 redis 限速策略时，该属性是 Redis 服务节点中使用的 database，并且只针对非 Redis 集群模式（单实例模式或者提供单入口的 Redis 公有云服务）生效。',
  'component.pluginForm.limit-count.redis_timeout.tooltip': '当使用 redis 限速策略时，该属性是 Redis 服务节点以毫秒为单位的超时时间。',
  'component.pluginForm.limit-count.redis_cluster_nodes.tooltip': '当使用 redis-cluster 限速策略时，该属性是 Redis 集群服务节点的地址列表。',
  'component.pluginForm.limit-count.redis_cluster_name.tooltip': '当使用 redis-cluster 限速策略时，该属性是 Redis 集群服务节点的名称。',
};
