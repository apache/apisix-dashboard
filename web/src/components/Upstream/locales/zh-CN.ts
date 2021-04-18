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
  'component.upstream.fields.tls.client_key': '客户端私钥',
  'component.upstream.fields.tls.client_key.required': '请输入客户端私钥',
  'component.upstream.fields.tls.client_cert': '客户端证书',
  'component.upstream.fields.tls.client_cert.required': '请输入客户端证书',

  'component.upstream.fields.discovery_type': '服务发现类型',
  'component.upstream.fields.discovery_type.tooltip': '服务发现类型',
  'component.upstream.fields.discovery_type.placeholder': '请输入服务发现类型',

  'component.upstream.fields.service_name': '服务名称',
  'component.upstream.fields.service_name.tooltip': '服务名称',
  'component.upstream.fields.service_name.placeholder': '请输入服务名称',

  'component.upstream.fields.tls': 'TLS',
  'component.upstream.fields.tls.tooltip': 'TLS 证书',

  'component.upstream.fields.hash_on': '哈希位置',
  'component.upstream.fields.hash_on.tooltip': '哈希的输入的位置（Hash On）',

  'component.upstream.fields.key': 'Key',
  'component.upstream.fields.key.tooltip': '哈希键（Hash Key）',

  'component.upstream.fields.retries': '重试次数',
  'component.upstream.fields.retries.tooltip': '重试机制将请求发到下一个上游节点。值为 0 表示禁用重试机制，留空表是使用可用后端节点的数量。',

  'component.upstream.fields.checks.active.type': '类型',
  'component.upstream.fields.checks.active.type.tooltip': '是使用 HTTP 或 HTTPS 进行主动健康检查，还是只尝试 TCP 连接。',

  'component.upstream.fields.checks.active.concurrency': '并行数量',
  'component.upstream.fields.checks.active.concurrency.tooltip': '在主动健康检查中同时检查的目标数量。',

  'component.upstream.fields.checks.active.host': '主机名',
  'component.upstream.fields.checks.active.host.required': '请输入主机名',
  'component.upstream.fields.checks.active.host.tooltip': '进行主动健康检查时使用的 HTTP 请求主机名',
  'component.upstream.fields.checks.active.host.scope': '仅支持字母、数字和 . ',

  'component.upstream.fields.checks.active.port': '端口',
  'component.upstream.fields.checks.active.port.required': '请输入端口',

  'component.upstream.fields.checks.active.http_path': '请求路径',
  'component.upstream.fields.checks.active.http_path.tooltip': '向目标节点发出 HTTP GET 请求时应使用的路径。',
  'component.upstream.fields.checks.active.http_path.placeholder': '请输入 HTTP 请求路径',

  'component.upstream.fields.checks.active.https_verify_certificate': '验证证书',
  'component.upstream.fields.checks.active.https_verify_certificate.tooltip': '在使用 HTTPS 执行主动健康检查时，是否检查远程主机的 SSL 证书的有效性。',

  'component.upstream.fields.checks.active.req_headers': '请求头',
  'component.upstream.fields.checks.active.req_headers.tooltip': '额外的请求头，示例：User-Agent: curl/7.29.0',

  'component.upstream.fields.checks.active.healthy.interval': '间隔时间',
  'component.upstream.fields.checks.active.healthy.interval.tooltip': '对健康的上游服务目标节点进行主动健康检查的间隔时间（以秒为单位）。数值为0表示对健康节点不进行主动健康检查。',

  'component.upstream.fields.checks.active.healthy.successes': '成功次数',
  'component.upstream.fields.checks.active.healthy.successes.tooltip': '主动健康检查的 HTTP 成功次数，若达到此值，表示上游服务目标节点是健康的。',
  'component.upstream.fields.checks.active.healthy.successes.required': '请输入成功次数',

  'component.upstream.fields.checks.active.healthy.http_statuses': '状态码',
  'component.upstream.fields.checks.active.healthy.http_statuses.tooltip': 'HTTP 状态码列表，当探针在主动健康检查中返回时，视为健康。',

  'component.upstream.fields.checks.active.unhealthy.timeouts': '超时时间',
  'component.upstream.fields.checks.active.unhealthy.timeouts.tooltip': '活动探针中认为目标不健康的超时次数。',

  'component.upstream.fields.checks.active.unhealthy.interval': '间隔时间',
  'component.upstream.fields.checks.active.unhealthy.interval.tooltip': '对不健康目标的主动健康检查之间的间隔（以秒为单位）。数值为0表示不应该对健康目标进行主动探查。',
  'component.upstream.fields.checks.active.unhealthy.required': '请输入间隔时间',

  'component.upstream.fields.checks.active.unhealthy.http_failures': 'HTTP 失败次数',
  'component.upstream.fields.checks.active.unhealthy.http_failures.tooltip': '主动健康检查的 HTTP 失败次数，默认值为0。若达到此值，表示上游服务目标节点是不健康的。',
  'component.upstream.fields.checks.active.unhealthy.http_failures.required': '请输入 HTTP 失败次数',

  'component.upstream.fields.checks.active.unhealthy.tcp_failures': 'TCP 失败次数',
  'component.upstream.fields.checks.active.unhealthy.tcp_failures.tooltip': '主动探测中 TCP 失败次数超过该值时，认为目标不健康。',
  'component.upstream.fields.checks.active.unhealthy.tcp_failures.required': '请输入 TCP 失败次数',

  'component.upstream.fields.checks.passive.healthy.successes': '成功次数',
  'component.upstream.fields.checks.passive.healthy.successes.tooltip': '通过被动健康检查观察到的正常代理流量的成功次数。如果达到该值，上游服务目标节点将被视为健康。',
  'component.upstream.fields.checks.passive.healthy.successes.required': '请输入成功次数',

  'component.upstream.fields.checks.passive.unhealthy.timeouts': '超时时间',
  'component.upstream.fields.checks.passive.unhealthy.timeouts.tooltip': '根据被动健康检查的观察，在代理中认为目标不健康的超时次数。',
}
