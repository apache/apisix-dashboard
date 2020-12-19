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
  'page.route.button.send': 'Send',
  'page.route.onlineDebug': 'Online Debug',

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
  'page.route.input.placeholder.requestUrl': 'please input the request URL',
  'page.route.input.placeholder.paramKey': 'Param Key',
  'page.route.input.placeholder.paramValue': 'Param Value',

  'page.route.form.itemRulesRequiredMessage.parameterName':
    'Only letters and Numbers are supported, and can only begin with letters',
  'page.route.value': 'Value',
  'page.route.panelSection.title.advancedMatchRule': 'Advanced Routing Matching Conditions',

  'page.route.panelSection.title.nameDescription': 'Name And Description',
  'page.route.form.itemLabel.apiName': 'API Name',
  'page.route.form.itemRulesPatternMessage.apiNameRule':
    'Maximum length 100, only letters, Numbers, _, and - are supported, and can only begin with letters',

  'page.route.panelSection.title.requestConfigBasicDefine': 'Request Basic Define',
  'page.route.protocol': 'Protocol',
  'page.route.form.itemLabel.httpMethod': 'HTTP Method',
  'page.route.form.itemLabel.priority': 'Priority',
  'page.route.form.itemLabel.redirect': 'Redirect',
  'page.route.select.option.enableHttps': 'Enable HTTPS',
  'page.route.select.option.configCustom': 'Custom',
  'page.route.select.option.forbidden': 'Forbidden',
  'page.route.form.itemLabel.redirectCustom': 'Custom Redirect',
  'page.route.input.placeholder.redirectCustom': 'For example: /foo/index.html',
  'page.route.select.option.redirect301': '301(Permanent Redirect)',
  'page.route.select.option.redirect302': '302(Temporary Redirect)',
  'page.route.form.itemLabel.username': 'Username',
  'page.route.form.itemLabel.password': 'Password',
  'page.route.form.itemLabel.token': 'Token',
  'page.route.form.itemLabel.apikey': 'Apikey',

  'page.route.form.itemExtraMessage.domain':
    'Domain Name or IP, support for generic Domain Name, for example: *.test.com',
  'page.route.form.itemRulesPatternMessage.domain':
    'Only letters, numbers and * are supported. * can only be at the beginning, and only single * is supported',
  'page.route.form.itemExtraMessage1.path':
    '1. Request path, for example: /foo/index.html, supports request path prefix /foo/* ;',
  'page.route.form.itemExtraMessage2.path': '2. /* represents all paths',
  'page.route.form.itemRulesPatternMessage.path': 'Begin with / , and * can only at the end',
  'page.route.form.itemRulesPatternMessage.remoteAddrs':
    'Please enter a valid IP address, for example: 192.168.1.101, 192.168.1.0/24, ::1, fe80::1, fe80::1/64',
  'page.route.form.itemExtraMessage1.remoteAddrs':
    'Client IP, for example: 192.168.1.101, 192.168.1.0/24, ::1, fe80::1, fe80::1/64',

  'page.route.httpAction': 'Action',
  'page.route.httpOverrideOrCreate': 'Override/Create',
  'page.route.panelSection.title.httpOverrideRequestHeader': 'Override HTTP request header',
  'page.route.status': 'Status',
  'page.route.groupName': 'GroupName',
  'page.route.offline': 'Offline',
  'page.route.publish': 'Publish',
  'page.route.published': 'Published',
  'page.route.unpublished': 'UnPublished',

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
  'page.route.form.itemLabel.rewriteType': 'Request Path',
  'page.route.form.itemLabel.redirectURI': 'Redirect URI',
  'page.route.input.placeholder.newPath': 'For example: /foo/bar/index.html',

  'page.route.steps.stepTitle.defineApiRequest': 'Define API Request',
  'page.route.steps.stepTitle.defineApiBackendServe': 'Define API Backend Server',

  'page.route.popconfirm.title.offline': 'Are you sure to offline this route?',
  'page.route.radio.static': 'Static',
  'page.route.radio.regx': 'Regx',
  'page.route.form.itemLabel.from': 'From',
  'page.route.form.itemHelp.status':
    'Whether a route can be used after it is created, the default value is false.',

  'page.route.domainName': 'Domain Name',
  'page.route.path': 'Path',
  'page.route.remoteAddrs': 'Remote Addrs',
  'page.route.PanelSection.title.defineRequestParams': 'Define Request Parameters',
  'page.route.PanelSection.title.responseResult': 'Response Result',
  'page.route.debug.showResultAfterSendRequest': 'Show Result After Send Request',
  'page.route.TabPane.queryParams': 'Query Params',
  'page.route.TabPane.bodyParams': 'Body Params',
  'page.route.TabPane.headerParams': 'Header Params',
  'page.route.TabPane.authentication': 'Authentication',
  'page.route.TabPane.response': 'Response',
  'page.route.debugWithoutAuth': 'This request does not use any authorization.',
};
