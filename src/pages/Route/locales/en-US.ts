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
  'page.route.button.returnList': 'Return Route List',

  'page.route.parameterPosition': 'Parameter Position',
  'page.route.httpRequestHeader': 'HTTP Request Header',
  'page.route.requestParameter': 'Request Parameter',
  'page.route.parameterName': 'Parameter Name',
  'page.route.operationalCharacter': 'Operational Character',
  'page.route.equal': 'Equal',
  'page.route.unequal': 'Unequal',
  'page.route.greaterThan': 'Greater Than',
  'page.route.lessThan': 'Less Than',
  'page.route.regexMatch': 'Regex Match',
  'page.route.rule': 'Rule',
  'page.route.httpHeaderName': 'HTTP Request Header Name',

  'page.route.input.placeholder.parameterNameHttpHeader': 'Request header name, for example: HOST',
  'page.route.input.placeholder.parameterNameRequestParameter': 'Parameter name, for example: id',

  'page.route.form.itemRulesRequiredMessage.parameterName':
    'Only letters and Numbers are supported, and can only begin with letters',
  'page.route.value': 'Value',
  'page.route.panelSection.title.advancedMatchRule': 'Advanced Routing Matching Conditions',

  'page.route.panelSection.title.nameDescription': 'Name And Description',
  'page.route.form.itemLabel.apiName': 'API Name',
  'page.route.form.itemRulesPatternMessage.apiNameRule':
    'Maximum length 100, only letters, Numbers, _, and - are supported, and can only begin with letters',
  'rotue.meta.api.rule':
    'Only letters, numbers, _ and - are supported, and can only begin with letters',
  'route.meta.api.group.name': 'RouteGroup',
  'route.meta.group.name': 'GroupName',
  'route.meta.input.api.group.name': 'Please enter the group name',
  'route.meta.api.create.group.name': 'Create route group',
  'route.meta.description': 'APIDescription',
  'route.meta.description.rule': 'Can not more than 200 characters',
  'route.meta.group.description': 'GroupDescription',

  'page.route.input.placeholder.description': 'Can not more than 200 characters',

  'page.route.panelSection.title.requestConfigBasicDefine': 'Request Basic Define',
  'page.route.protocol': 'Protocol',
  'page.route.form.itemLabel.httpMethod': 'HTTP Method',
  'page.route.form.itemLabel.redirect': 'Redirect',
  'page.route.select.option.enableHttps': 'Enable HTTPS',
  'page.route.select.option.configCustom': 'Custom',
  'page.route.select.option.forbidden': 'Forbidden',
  'page.route.form.itemLabel.redirectCustom': 'Custom Redirect',
  'page.route.input.placeholder.redirectCustom': 'For examle: /foo/index.html',
  'page.route.select.option.redirect301': '301(Permanent Redirect)',
  'page.route.select.option.redirect302': '302(Temporary Redirect)',

  'page.route.form.itemExtraMessage.domain':
    'Domain Name or IP, support for generic Domain Name, for example: *.test.com',
  'page.route.form.itemRulesPatternMessage.domain':
    'Only letters, numbers and * are supported. * can only be at the beginning, and only single * is supported',
  'page.route.form.itemExtraMessage1.path':
    '1. Request path, for example: /foo/index.html, supports request path prefix /foo/* ;',
  'page.route.form.itemExtraMessage2.path': '2. /* represents all paths',
  'page.route.form.itemRulesPatternMessage.path': 'Begin with / , and * can only at the end',

  'page.route.httpAction': 'Action',
  'page.route.httpOverrideOrCreate': 'Override/Create',
  'page.route.panelSection.title.httpOverrideRequestHeader': 'Override HTTP request header',

  'page.route.select.option.inputManually': 'Input Manually',
  'page.route.form.itemLabel.domainNameOrIp': 'Domain Name/IP',
  'page.route.form.itemExtraMessage.domainNameOrIp':
    'When using Domain Name, it will analysis the local: /etc/resolv.conf by default',
  'page.route.form.itemRulesPatternMessage.domainNameOrIp':
    'Only letters, numbers and . are supported',
  'page.route.portNumber': 'Port Number',
  'page.route.weight': 'Weight',
  'page.route.radio.staySame': 'Stay The Same',
  'page.route.form.itemLabel.newPath': 'New Path',
  'page.route.input.placeholder.newPath': 'For example: /foo/bar/index.html',

  'page.route.steps.stepTitle.defineApiRequest': 'Define API Request',
  'page.route.steps.stepTitle.defineApiBackendServe': 'Define API Backend Server',

  'route.list.name': 'Name',
  'route.list.domain.name': 'Domain Name',
  'route.list.path': 'Path',
  'route.list.description': 'Description',
  'route.list.group.name': 'RouteGroup',
  'route.list.status': 'Status',
  'route.list.status.publish': 'Published',
  'route.list.status.offline': 'Offline',
  'route.list.edit.time': 'Edit Time',
  'route.list.operation': 'Operation',
  'route.list.edit': 'Edit',
  'route.list.publish': 'Publish',
  'route.list.debug': 'Online Debug',
  'route.list.publish.success': 'Route publish success',
  'route.list.offline': 'Offline',
  'route.list.offline.success': 'Offline success',
  'route.list.offline.confirm': 'Are you sure to offline this route?',
  'route.list.delete.confrim': 'Are you sure to delete this route?',
  'route.list.delete.success': 'Delete Success!',
  'route.list.confirm': 'Confirm',
  'route.list.cancel': 'Cancel',
  'route.list.delete': 'Delete',
  'route.list': 'Route List',
  'route.list.input': 'Please input',
  'route.list.create': 'Create',
  'page.route.radio.static': 'Static',
  'page.route.radio.regx': 'Regx',
  'page.route.form.itemLabel.from': 'From',
  'page.route.form.itemHelp.status':
    'Whether a route can be used after it is created, the default value is false.',


  'page.route.name': 'Name',
  'page.route.domainName': 'Domain Name',
  'page.route.path': 'Path',
  'page.route.editTime': 'Edit Time',
};
