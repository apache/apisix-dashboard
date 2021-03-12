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
  'page.upstream.step.select.upstream': '选择上游',
  'page.upstream.step.select.upstream.select.option': '手动填写',
  'page.upstream.form.item-label.node.domain.or.ip': '节点域名/IP',
  'page.upstream.step.backend.server.domain.or.ip': '后端服务域名/IP',
  'page.upstream.form.item.extra-message.node.domain.or.ip':
    '使用域名时，默认解析本地 /etc/resolv.conf；权重为0则熔断该节点',
  'page.upstream.step.input.domain.name.or.ip': '请输入域名/IP',
  'page.upstream.step.domain.name.or.ip.rule': '仅支持字母、数字和 . ',
  'page.upstream.step.domain.name.or.ip': '域名/IP',
  'page.upstream.step.input.port': '请输入端口号',
  'page.upstream.step.port': '端口号',
  'page.upstream.step.input.weight': '请输入权重',
  'page.upstream.step.weight': '权重',
  'page.upstream.step.create': '创建',
  'page.upstream.step.name': '名称',
  'page.upstream.step.name.should.unique': '名称需全局唯一',
  'page.upstream.step.input.upstream.name': '请输入上游名称',
  'page.upstream.step.description': '描述',
  'page.upstream.step.input.description': '请输入描述',
  'page.upstream.step.type': '类型',
  'page.upstream.step.create.node': '创建节点',
  'page.upstream.step.pass-host': '传递域名',
  'page.upstream.step.pass-host.tips': '透传（pass）：将客户端的 host 透传给上游；节点（node）：使用 upstream node 中配置的 host；重写（rewrite）：使用配置项 upstream_host 的值',
  'page.upstream.step.pass-host.pass': '透传',
  'page.upstream.step.pass-host.node': '节点',
  'page.upstream.step.pass-host.rewrite': '重写',
  'page.upstream.step.pass-host.upstream_host': '上游域名',
  'page.upstream.step.connect.timeout': '连接超时',
  'page.upstream.step.input.connect.timeout': '请输入连接超时时间',
  'page.upstream.step.send.timeout': '发送超时',
  'page.upstream.step.input.send.timeout': '请输入发送超时时间',
  'page.upstream.step.read.timeout': '接收超时',
  'page.upstream.step.input.read.timeout': '请输入接收超时时间',
  'page.upstream.step.healthyCheck.healthy.check': '健康检查',
  'page.upstream.step.healthyCheck.healthy': '健康',
  'page.upstream.step.healthyCheck.unhealthy': '不健康',
  'page.upstream.step.healthyCheck.healthy.status': '健康状态',
  'page.upstream.step.healthyCheck.unhealthyStatus': '不健康状态',
  'page.upstream.step.healthyCheck.active': '主动',
  'page.upstream.step.healthyCheck.active.timeout': '超时时间',
  'page.upstream.step.input.healthyCheck.active.timeout': '请输入超时时间',
  'page.upstream.step.healthyCheck.active.http_path': '路径',
  'page.upstream.step.input.healthyCheck.active.http_path': '请输入路径',
  'page.upstream.step.healthyCheck.activePort': '端口',
  'page.upstream.step.input.healthyCheck.activePort': '请输入端口',
  'page.upstream.step.healthyCheck.activeHost': '域名',
  'page.upstream.step.input.healthyCheck.activeHost': '请输入域名',
  'page.upstream.step.healthyCheck.activeInterval': '间隔',
  'page.upstream.step.input.healthyCheck.activeInterval': '请输入间隔',
  'page.upstream.step.healthyCheck.successes': '成功次数',
  'page.upstream.step.input.healthyCheck.successes': '请输入成功次数',
  'page.upstream.step.healthyCheck.http_failures': '失败次数',
  'page.upstream.step.healthyCheck.active.create.req_headers': '创建请求头',
  'page.upstream.step.input.healthyCheck.http_failures': '请输入失败次数',
  'page.upstream.step.healthyCheck.active.req_headers': '请求头',
  'page.upstream.step.input.healthyCheck.active.req_headers': '请输入请求头',
  'page.upstream.step.healthyCheck.passive': '被动',
  'page.upstream.step.healthyCheck.passive.create.http_statuses': '创建状态码',
  'page.upstream.step.healthyCheck.passive.http_statuses': '状态码',
  'page.upstream.step.input.healthyCheck.passive.http_statuses': '请输入状态码',
  'page.upstream.step.healthyCheck.passive.tcp_failures': 'tcp失败次数',
  'page.upstream.step.input.healthyCheck.passive.tcp_failures': '请输入tcp失败次数',
  'page.upstream.notificationMessage.enableHealthCheckFirst': '请先启用探活健康检查。',

  'page.upstream.create.edit': '编辑',
  'page.upstream.create.create': '创建',
  'page.upstream.create.upstream.successfully': '上游成功',
  'page.upstream.create.basic.info': '基础信息',
  'page.upstream.create.preview': '预览',

  'page.upstream.list.name': '名称',
  'page.upstream.list.type': '类型',
  'page.upstream.list.description': '描述',
  'page.upstream.list.edit.time': '编辑时间',
  'page.upstream.list.operation': '操作',
  'page.upstream.list.edit': '编辑',
  'page.upstream.list.confirm.delete': '确定删除该条记录吗？',
  'page.upstream.list.confirm': '确定',
  'page.upstream.list.cancel': '取消',
  'page.upstream.list.delete.successfully': '删除记录成功',
  'page.upstream.list.delete': '删除',
  'page.upstream.list': '上游列表',
  'page.upstream.list.input': '请输入',
  'page.upstream.list.create': '创建',
};
