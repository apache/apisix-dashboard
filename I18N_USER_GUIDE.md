<!--
#
# Licensed to the Apache Software Foundation (ASF) under one or more
# contributor license agreements.  See the NOTICE file distributed with
# this work for additional information regarding copyright ownership.
# The ASF licenses this file to You under the Apache License, Version 2.0
# (the "License"); you may not use this file except in compliance with
# the License.  You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
-->

# Apache APISIX Dashboard I18N User Guide

The Apache APISIX Dashboard uses [@umijs/plugin-locale](https://umijs.org/plugins/plugin-locale) to solve the i18n issues, in order to make the i18n more clear and reasonable, we would recommend to obey the following rules

## Location of locale configuration：

- Please put **the global locales** under `src/locales`.
- Please put **each page's locale file** under `src/pages/$PAGE/locales` folder.
- Please put **the Component's locale file** under `src/components/$COMPONENT/locales` folder, and we **MUST** import them manually

## How to name the key for each locale filed：

the key can be like this : [basicModule].[moduleName].[elementName].[...desc]

- what's the first tow levels? e.g: `app.pwa`, `page.consumer`, `component.actionBar`

- The subkeys are divided into $element + $description style e.g: `app.pwa.message.offline`, `component.actionBar.button.nextStep`

  - If the the text is the part of a element, we can use [elementNameProps] e.g: `page.consumer.proTableColumns.username`.
  - If there are two or more same level part locales of a element, we can add number suffix e.g: `page.route.form.itemRulesExtraMessage1.path`, `page.route.form.itemRulesExtraMessage2.path`.

- common texts, we should not repeat in other part, and the common locale key omit [elementName] would be better.

  - If the text is used in two or more places inside the module, we would recommend sharing the text in the module, e.g:`page.route.parameterPosition`.
  - If the text is used in two or more places between modules, we would recommend sharing the text globally, and add`global`as the moduleName,git e.g:`component.global.confirm`.

## Global locale keys

we have already defined many global keys, before you do i18n, you can refer to [those](https://github.com/apache/apisix-dashboard/blob/master/src/locales/zh-CN/component.ts).

## Recommended subkey naming

- **Form**

| element   | props          | locale subKey                 |
| --------- | -------------- | ----------------------------- |
| Form.Item | label          | form.itemLabel                |
| Form.Item | rules.required | form.itemRulesRequiredMessage |
| Form.Item | rules.pattern  | form.itemRulesPatternMessage  |
| Form.Item | extra          | form.itemExtraMessage         |

**Example:**

```js
'page.route.form.itemRulesExtraMessage.parameterName': '仅支持字母和数字，且只能以字母开头',
'page.route.form.itemLabel.apiName': 'API 名称',
'page.route.form.itemRulesPatternMessage.apiNameRule': '最大长度100，仅支持字母、数字、- 和 _，且只能以字母开头',
```

- **Input**

| element | props       | locale subKey     |
| ------- | ----------- | ----------------- |
| Input   | placeholder | input.placeholder |

**Example:**

```js
'page.route.input.placeholder.parameterNameHttpHeader': '请求头键名，例如：HOST',
```

- **Button**

| element | props | locale subKey |
| ------- | ----- | ------------- |
| Button  | null  | button        |

**Example:**

```js
'page.route.button.returnList': '返回路由列表',
```

- **Steps**

| element    | props | locale subKey   |
| ---------- | ----- | --------------- |
| Steps.step | title | steps.stepTitle |

**Example:**

```js
'page.route.steps.stepTitle.defineApiRequest': '定义 API 请求',
```

- **Select**

| element       | props | locale subKey |
| ------------- | ----- | ------------- |
| Select.Option | null  | select.option |

**Example:**

```js
'page.route.select.option.enableHttps': '启用 HTTPS',
```

- **Radio**

| element | props | locale subKey |
| ------- | ----- | ------------- |
| Radio   | null  | radio         |

**Example:**

```js
'page.route.radio.staySame': '保持原样',
```

- **ProTable**

| element  | props         | locale subKey         |
| -------- | ------------- | --------------------- |
| ProTable | columns.title | proTable.columnsTitle |

_ProTable usually appears in conjunction with forms, and columns title are same with form item label, so we recommend these title keys to be the common key in modules._
