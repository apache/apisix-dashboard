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
  'page.upstream.step.pass-host.tips': 'When selecting node, there can only be ONE node in node list.',
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
  'page.upstream.step.healthy.checks.healthy.check': 'Health Check',
  'page.upstream.step.healthy.check': 'Upstream Healthy Check',
  'page.upstream.step.healthy.checks.healthy': 'Healthy',
  'page.upstream.step.healthy.checks.unhealthy': 'Unhealthy',
  'page.upstream.step.healthy.checks.healthy.status': 'Healthy Status',
  'page.upstream.step.healthy.checks.unhealthy.status': 'Unhealthy Status',
  'page.upstream.step.healthy.checks.active': 'Upstream Healthy Check Active',
  'page.upstream.step.healthy.checks.active.timeout': 'Timeout',
  'page.upstream.step.input.healthy.checks.active.timeout': 'Please input timeout',
  'page.upstream.step.healthy.checks.active.http_path': 'HttpPath',
  'page.upstream.step.input.healthy.checks.active.http_path': 'HttpPath',
  'page.upstream.step.healthy.checks.active.port': "Port",
  'page.upstream.step.input.healthy.checks.active.port': 'Please input port',
  'page.upstream.step.healthy.checks.active.host': 'Host',
  'page.upstream.step.input.healthy.checks.active.host': 'Please input Host',
  'page.upstream.step.healthy.checks.active.interval': 'Interval',
  'page.upstream.step.input.healthy.checks.active.interval': 'Please input Interval',
  'page.upstream.step.healthy.checks.successes': 'Successes',
  'page.upstream.step.input.healthy.checks.successes': 'Please input successes',
  'page.upstream.step.healthy.checks.http_failures': 'HttpFailures',
  'page.upstream.step.healthy.checks.active.create.req_headers': 'Create req_headers',
  'page.upstream.step.input.healthy.checks.http_failures': 'Please input httpFailures',
  'page.upstream.step.healthy.checks.active.req_headers': 'req_headers',
  'page.upstream.step.input.healthy.checks.active.req_headers': 'Please input req_headers',
  'page.upstream.step.healthy.checks.passive': 'Passive',
  'page.upstream.step.healthy.checks.passive.create.http_statuses': 'Create http_statuses',
  'page.upstream.step.healthy.checks.passive.http_statuses': 'http_statuses',
  'page.upstream.step.input.healthy.checks.passive.http_statuses': 'Please input http_statuses',
  'page.upstream.step.healthy.checks.passive.tcp_failures': 'tcp_failures',
  'page.upstream.step.input.healthy.checks.passive.tcp_failures': 'Please input tcp_failures',
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
