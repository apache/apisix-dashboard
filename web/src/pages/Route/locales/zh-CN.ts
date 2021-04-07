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
  // global
  'page.route.parameterPosition': '参数位置',
  'page.route.httpRequestHeader': 'HTTP 请求头',
  'page.route.requestParameter': '请求参数',
  'page.route.parameterName': '参数名称',
  'page.route.operationalCharacter': '运算符',
  'page.route.equal': '等于',
  'page.route.unequal': '不等于',
  'page.route.greaterThan': '大于',
  'page.route.lessThan': '小于',
  'page.route.regexMatch': '正则匹配',
  'page.route.in': 'IN',
  'page.route.rule': '规则',
  'page.route.domainName': '域名',
  'page.route.path': '路径',
  'page.route.remoteAddrs': '客户端地址',
  'page.route.value': '参数值',
  'page.route.httpHeaderName': 'HTTP 请求头名称',
  'page.route.status': '状态',
  'page.route.groupName': '分组名称',
  'page.route.offline': '下线',
  'page.route.publish': '发布',
  'page.route.published': '已发布',
  'page.route.unpublished': '未发布',
  'page.route.onlineDebug': '在线调试',
  'page.route.pluginTemplateConfig': '插件模版配置',
  'page.route.service': '服务',
  'page.route.instructions': '说明',
  'page.route.import': '导入',
  'page.route.createRoute': '创建路由',
  'page.route.editRoute': '编辑路由',

  // button
  'page.route.button.returnList': '返回路由列表',
  'page.route.button.send': '发送请求',

  // input
  'page.route.input.placeholder.parameterNameHttpHeader': '请求头键名，例如：HOST',
  'page.route.input.placeholder.parameterNameRequestParameter': '参数名称，例如：id',
  'page.route.input.placeholder.redirectCustom': '例如：/foo/index.html',
  'page.route.input.placeholder.requestUrl': '请输入合法的请求地址',
  'page.route.input.placeholder.paramKey': '参数名称',
  'page.route.input.placeholder.paramType': '参数类型',
  'page.route.input.placeholder.paramValue': '参数值',
  // form
  'page.route.form.itemRulesRequiredMessage.parameterName': '仅支持字母和数字，且只能以字母开头',
  'page.route.form.itemLabel.apiName': 'API 名称',
  'page.route.form.itemRulesPatternMessage.apiNameRule':
    '最大长度100，仅支持字母、数字、- 和 _，且只能以字母开头',
  'page.route.form.itemLabel.httpMethod': 'HTTP 方法',
  'page.route.form.itemLabel.scheme': '协议',
  'page.route.form.itemLabel.priority': '优先级',
  'page.route.form.itemLabel.redirect': '重定向',
  'page.route.form.itemLabel.redirectCustom': '自定义重定向',
  'page.route.form.itemLabel.URIRewriteType': '路径改写',
  'page.route.form.itemLabel.hostRewriteType': '域名改写',
  'page.route.form.itemLabel.headerRewrite': '请求头改写',
  'page.route.form.itemLabel.redirectURI': '重定向路径',
  'page.route.form.itemExtraMessage.domain': '域名或IP，支持泛域名，如：*.test.com',
  'page.route.form.itemRulesPatternMessage.domain':
    '仅支持字母、数字和 * ，且 * 只能是在开头，支持单个 * ',
  'page.route.form.itemExtraMessage1.path':
    '1. 请求路径，如 /foo/index.html，支持请求路径前缀 /foo/* ；',
  'page.route.form.itemExtraMessage2.path': '2. /* 代表所有路径',
  'page.route.form.itemRulesPatternMessage.path': '以 / 开头，且 * 只能在最后',
  'page.route.form.itemExtraMessage1.remoteAddrs':
    '客户端 IP，例如：192.168.1.101，192.168.1.0/24，::1，fe80::1，fe80::1/64',
  'page.route.form.itemRulesPatternMessage.remoteAddrs':
    '请输入合法的 IP 地址，例如：192.168.1.101，192.168.1.0/24，::1，fe80::1，fe80::1/64',
  'page.route.form.itemLabel.username': '用户名',
  'page.route.form.itemLabel.password': '密 码',
  'page.route.form.itemLabel.token': 'Token',
  'page.route.form.itemLabel.apikey': 'Apikey',

  // select
  'page.route.select.option.enableHttps': '启用 HTTPS',
  'page.route.select.option.configCustom': '自定义',
  'page.route.select.option.forbidden': '禁用',
  'page.route.select.option.redirect301': '301（永久重定向）',
  'page.route.select.option.redirect302': '302（临时重定向）',
  'page.route.select.option.inputManually': '手动填写',

  // steps
  'page.route.steps.stepTitle.defineApiRequest': '定义 API 请求',
  'page.route.steps.stepTitle.defineApiBackendServe': '定义 API 后端服务',

  // panelSection
  'page.route.panelSection.title.nameDescription': '名称及其描述',
  'page.route.panelSection.title.httpOverrideRequestHeader': 'HTTP 请求头改写',
  'page.route.panelSection.title.requestOverride': '请求改写',
  'page.route.panelSection.title.requestConfigBasicDefine': '请求基础定义',
  'page.route.panelSection.title.advancedMatchRule': '高级路由匹配条件',
  'page.route.PanelSection.title.defineRequestParams': '请求参数定义',
  'page.route.PanelSection.title.responseResult': '请求响应结果',

  'page.route.httpAction': '行为',
  'page.route.httpOverrideOrCreate': '重写/创建',

  'page.route.form.itemLabel.domainNameOrIp': '域名/IP',
  'page.route.form.itemExtraMessage.domainNameOrIp': '使用域名时，默认解析本地：/etc/resolv.conf',
  'page.route.form.itemRulesPatternMessage.domainNameOrIp': '仅支持字母、数字和 . ',
  'page.route.portNumber': '端口',
  'page.route.weight': '权重',

  'page.route.radio.static': '静态改写',
  'page.route.radio.regex': '正则改写',
  // Need a better translation
  'page.route.form.itemLabel.regex': '匹配正则表达式',
  'page.route.form.itemLabel.template': '转发路径模版',
  'page.route.form.itemHelp.status': '路由创建后是否可以使用， 默认值为 false',
  'page.route.radio.staySame': '保持原样',
  'page.route.input.placeholder.newPath': '例如：/foo/bar/index.html',
  'page.route.form.itemLabel.newPath': '新路径',
  'page.route.form.itemLabel.newHost': '新域名',
  'page.route.popconfirm.title.offline': '确定下线该路由吗？',
  'page.route.debug.showResultAfterSendRequest': '发送请求后在此查看响应结果',
  'page.route.TabPane.queryParams': '查询参数',
  'page.route.TabPane.bodyParams': '请求体参数',
  'page.route.TabPane.headerParams': '请求头参数',
  'page.route.TabPane.authentication': '认证',
  'page.route.TabPane.response': '响应结果',
  'page.route.debugWithoutAuth': '当前请求不启用任何认证方式。',
  'page.route.button.exportOpenApi': '导出 OpenAPI',
  'page.route.exportRoutesTips': '请选择导出文件的类型',
  'page.route.button.importOpenApi': '导入 OpenAPI',
  'page.route.button.selectFile': '请选择上传文件',
  'page.route.list': '路由列表',
  'page.route.tooltip.pluginOrchOnlySuportChrome': '插件编排仅支持 Chrome 浏览器。',
  'page.route.tooltip.pluginOrchWithoutProxyRewrite': '当步骤一中 配置了 请求改写时，不可使用插件编排模式。',
  'page.route.tooltip.pluginOrchWithoutRedirect': '当步骤一中 重定向 选择为 启用 HTTPS 时，不可使用插件编排模式。',

  'page.route.tabs.normalMode': '普通模式',
  'page.route.tabs.orchestration': '插件编排'
};
