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
  'upstream.step.backend.server.domain.or.ip': '后端服务域名/IP',
  'upstream.step.domain.name.default.analysis':
    '使用域名时，默认解析本地 /etc/resolv.conf；权重为0则熔断该节点',
  'upstream.step.input.domain.name.or.ip': '请输入域名/IP',
  'upstream.step.domain.name.or.ip.rule': '仅支持字母、数字和 . ',
  'upstream.step.domain.name.or.ip': '域名/IP',
  'upstream.step.input.port': '请输入端口号',
  'upstream.step.port': '端口号',
  'upstream.step.input.weight': '请输入权重',
  'upstream.step.weight': '权重',
  'upstream.step.create': '创建',
  'upstream.step.name': '名称',
  'upstream.step.name.should.unique': '名称需全局唯一',
  'upstream.step.input.upstream.name': '请输入上游名称',
  'upstream.step.description': '描述',
  'upstream.step.input.description': '请输入描述',
  'upstream.step.type': '类型',
  'upstream.step.connect.timeout': '连接超时',
  'upstream.step.input.connect.timeout': '请输入连接超时时间',
  'upstream.step.send.timeout': '发送超时',
  'upstream.step.input.send.timeout': '请输入发送超时时间',
  'upstream.step.read.timeout': '接收超时',
  'upstream.step.input.read.timeout': '请输入接收超时时间',
  'upstream.step.healthy.check': '上游健康检查',
  'upstream.step.healthy.checks.healthy': '健康',
  'upstream.step.healthy.checks.unhealthy': '不健康',
  'upstream.step.healthy.checks.active': '探活健康检查',
  'upstream.step.healthy.checks.active.timeout': '超时时间',
  'upstream.step.input.healthy.checks.active.timeout': '请输入超时时间',
  'upstream.step.healthy.checks.active.http_path': '路径',
  'upstream.step.input.healthy.checks.active.http_path': '请输入路径',
  'upstream.step.healthy.checks.active.port': "端口",
  'upstream.step.input.healthy.checks.active.port': '请输入端口',
  'upstream.step.healthy.checks.active.host': '域名',
  'upstream.step.input.healthy.checks.active.host': '请输入域名',
  'upstream.step.healthy.checks.active.interval': '间隔',
  'upstream.step.input.healthy.checks.active.interval': '请输入间隔',
  'upstream.step.healthy.checks.successes': '成功次数',
  'upstream.step.input.healthy.checks.successes': '请输入成功次数',
  'upstream.step.healthy.checks.http_failures': '失败次数',
  'upstream.step.input.healthy.checks.http_failures': '请输入失败次数',
  'upstream.step.healthy.checks.active.req_headers': '请求头',
  'upstream.step.input.healthy.checks.active.req_headers': '请输入请求头',
  'upstream.step.healthy.checks.passive': '被动健康检查',
  'upstream.step.healthy.checks.passive.http_statuses': '状态码',
  'upstream.step.input.healthy.checks.passive.http_statuses': '请输入状态码',
  'upstream.step.healthy.checks.passive.tcp_failures': 'tcp失败次数',
  'upstream.step.input.healthy.checks.passive.tcp_failures': '请输入tcp失败次数',
  'upstream.notificationMessage.enableHealthCheckFirst': '请先启用探活健康检查。',

  'upstream.create.edit': '编辑',
  'upstream.create.create': '创建',
  'upstream.create.upstream.successfully': '上游成功',
  'upstream.create.basic.info': '基础信息',
  'upstream.create.preview': '预览',

  'upstream.list.name': '名称',
  'upstream.list.type': '类型',
  'upstream.list.description': '描述',
  'upstream.list.edit.time': '编辑时间',
  'upstream.list.operation': '操作',
  'upstream.list.edit': '编辑',
  'upstream.list.confirm.delete': '确定删除该条记录吗？',
  'upstream.list.confirm': '确定',
  'upstream.list.cancel': '取消',
  'upstream.list.delete.successfully': '删除记录成功',
  'upstream.list.delete': '删除',
  'upstream.list': '上游列表',
  'upstream.list.input': '请输入',
  'upstream.list.create': '创建',
};
