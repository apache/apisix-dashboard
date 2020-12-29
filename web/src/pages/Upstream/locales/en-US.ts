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
  'page.upstream.step.select.upstream': 'Select Upstream',
  'page.upstream.step.select.upstream.select.option': 'Manual fill',
  'page.upstream.form.item-label.node.domain.or.ip': 'Node Domain/IP',
  'page.upstream.step.backend.server.domain.or.ip': 'Backend Server Domain Name/IP',
  'page.upstream.form.item.extra-message.node.domain.or.ip':
    'When using domain name, it will analysis local: /etc/resolv.conf by default, if weight is 0, then fusing this node',
  'page.upstream.step.input.domain.name.or.ip': 'Please input domain name/IP',
  'page.upstream.step.domain.name.or.ip.rule': 'Only letters, numbers and . are supported',
  'page.upstream.step.domain.name.or.ip': 'Domain Name/IP',
  'page.upstream.step.input.port': 'Please input port number',
  'page.upstream.step.port': 'Port Number',
  'page.upstream.step.input.weight': 'Please input weight',
  'page.upstream.step.weight': 'Weight',
  'page.upstream.step.create': 'Create',
  'page.upstream.step.name': 'Name',
  'page.upstream.step.name.should.unique': 'Name should be unique',
  'page.upstream.step.input.upstream.name': 'Please input upstream name',
  'page.upstream.step.description': 'Description',
  'page.upstream.step.input.description': 'Please input description',
  'page.upstream.step.type': 'Type',
  'page.upstream.step.create.node': 'Create Node',
  'page.upstream.step.pass-host': 'Pass Host',
  'page.upstream.step.pass-host.tips':
    'When selecting node, there can only be ONE node in node list.',
  'page.upstream.step.pass-host.pass': 'pass',
  'page.upstream.step.pass-host.node': 'node',
  'page.upstream.step.pass-host.rewrite': 'rewrite',
  'page.upstream.step.pass-host.upstream_host': 'Upstream Host',
  'page.upstream.step.connect.timeout': 'Connect Timeout',
  'page.upstream.step.input.connect.timeout': 'Please input connect timeout',
  'page.upstream.step.send.timeout': 'Send Timeout',
  'page.upstream.step.input.send.timeout': 'Please input send timeout',
  'page.upstream.step.read.timeout': 'Read Timeout',
  'page.upstream.step.input.read.timeout': 'Please input read timeout',
  'page.upstream.step.healthyCheck.healthy.check': 'Health Check',
  'page.upstream.step.healthyCheck.healthy': 'Healthy',
  'page.upstream.step.healthyCheck.unhealthy': 'Unhealthy',
  'page.upstream.step.healthyCheck.healthy.status': 'Healthy Status',
  'page.upstream.step.healthyCheck.unhealthyStatus': 'Unhealthy Status',
  'page.upstream.step.healthyCheck.active': 'Active',
  'page.upstream.step.healthyCheck.active.timeout': 'Timeout',
  'page.upstream.step.input.healthyCheck.active.timeout': 'Please input timeout',
  'page.upstream.step.healthyCheck.active.http_path': 'HTTP Path',
  'page.upstream.step.input.healthyCheck.active.http_path': 'Please input HTTP path',
  'page.upstream.step.healthyCheck.activePort': 'Port',
  'page.upstream.step.input.healthyCheck.activePort': 'Port',
  'page.upstream.step.healthyCheck.activeHost': 'Host',
  'page.upstream.step.input.healthyCheck.activeHost': 'Please input active host',
  'page.upstream.step.healthyCheck.activeInterval': 'Interval',
  'page.upstream.step.input.healthyCheck.activeInterval': 'Please input interval',
  'page.upstream.step.healthyCheck.successes': 'Successes',
  'page.upstream.step.input.healthyCheck.successes': 'Please input successes',
  'page.upstream.step.healthyCheck.http_failures': 'HTTP Failures',
  'page.upstream.step.healthyCheck.active.create.req_headers': 'Create Request Headers',
  'page.upstream.step.input.healthyCheck.http_failures': 'Please input http failures',
  'page.upstream.step.healthyCheck.active.req_headers': 'Request Headers',
  'page.upstream.step.input.healthyCheck.active.req_headers': 'Please input request headers',
  'page.upstream.step.healthyCheck.passive': 'Passive',
  'page.upstream.step.healthyCheck.passive.create.http_statuses': 'Create HTTP Status',
  'page.upstream.step.healthyCheck.passive.http_statuses': 'HTTP Status',
  'page.upstream.step.input.healthyCheck.passive.http_statuses': 'Please input http status',
  'page.upstream.step.healthyCheck.passive.tcp_failures': 'TCP Failures',
  'page.upstream.step.input.healthyCheck.passive.tcp_failures': 'Please input TCP failures',
  'page.upstream.notificationMessage.enableHealthCheckFirst': 'Please enable health check first.',

  'page.upstream.create.edit': 'Edit',
  'page.upstream.create.create': 'Create',
  'page.upstream.create.upstream.successfully': 'upstream successfully',
  'page.upstream.create.basic.info': 'Basic Information',
  'page.upstream.create.preview': 'Preview',

  'page.upstream.list.name': 'Name',
  'page.upstream.list.type': 'Type',
  'page.upstream.list.description': 'Description',
  'page.upstream.list.edit.time': 'Edit Time',
  'page.upstream.list.operation': 'Operation',
  'page.upstream.list.edit': 'Edit',
  'page.upstream.list.confirm.delete': 'Are you sure to delete ?',
  'page.upstream.list.confirm': 'Confirm',
  'page.upstream.list.cancel': 'Cancel',
  'page.upstream.list.delete.successfully': 'Delete successfully',
  'page.upstream.list.delete': 'Delete',
  'page.upstream.list': 'Upstream List',
  'page.upstream.list.input': 'Please input',
  'page.upstream.list.create': 'Create',
};
