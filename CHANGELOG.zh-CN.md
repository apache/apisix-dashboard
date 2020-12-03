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

# 目录
- [2.1.1](#211)
- [2.1.0](#210)
- [2.0.0](#200)
- [1.5.0](#150)
- [1.0.0](#100)


# 2.1.1

该版本主要增加了对 `Manager API` 和 APISIX 间的 E2E 测试， 以及 bug 修复。

`Manager API` 2.1.1 应该与 APISIX 2.1 配合使用，不推荐与其他 APISIX 版本使用。

### 核心

**`Manager API` 默认端口由 8080 变更为 9000** [#931](https://github.com/apache/apisix-dashboard/pull/931)

### 测试

为 route, upstream, consumer, SSL, 以及 plugins 增加 E2E 测试。

## Bugfix
 
- 修复通过 `Admin API` 创建路由后，在 dashboard 上无法修改上游信息。[#847](https://github.com/apache/apisix-dashboard/pull/847)
- 修复创建路由并开启 jwt-auth 插件，提交时会报错。[#878](https://github.com/apache/apisix-dashboard/pull/878)
- 修复创建路由时，`remote_addrs` 字段使用错误的数据格式，应该返回 400 而不是 200 。[#899](https://github.com/apache/apisix-dashboard/pull/899)
- 修复 ID 字段不能同时兼容 int 类型和 string 类型的问题。[#902](https://github.com/apache/apisix-dashboard/pull/902)
- 修复在内网环境下不能启动 `Manager API` 的问题。[#947](https://github.com/apache/apisix-dashboard/pull/947)
- 修复通过 dashboard 创建路由， 不填写客户端地址，APISIX 报错的问题。[#948](https://github.com/apache/apisix-dashboard/pull/948)
- 修复 dashboard 创建路由并开启强制跳转 HTTPS 功能，提交时浏览器报错。 [#957](https://github.com/apache/apisix-dashboard/pull/957)


# 2.1.0

该版本主要提升了 `Manager API` 的 E2E 测试。

### 核心

- 支持优雅退出。[#796](https://github.com/apache/apisix-dashboard/pull/796)
- 增加了后端 e2e 测试用例。[#810](https://github.com/apache/apisix-dashboard/pull/810)

更多的变动可以参考[里程碑](https://github.com/apache/apisix-dashboard/milestone/7)。

# 2.0.0

该版本主要移除了 MySQL 并增加了 E2E 测试。

### 核心

- 前端根据新的 admin-api 进行重构。
- 后端移除对 mysql 的依赖。
- 支持插件编排模式。
- 制定前端国际化标准。
- Dashboard 新的部署方式。
- 增加更多测试用例。
- 文档增强。
- 添加后端 E2E 测试例子。
- 完善 CI 测试。
- 支持日志保存到本地文件。
- 优化部署流程。
- 前端增加 E2E 测试例子。[#619](https://github.com/apache/apisix-dashboard/pull/619)
- 修复 Promethues 插件在更新路由时更新错误值的问题。[#666](https://github.com/apache/apisix-dashboard/pull/666)
- 修复在路由页面中重定向选项选择为 启用HTTPS 时页面显示异常的问题。[#692](https://github.com/apache/apisix-dashboard/pull/692)


更多的变动可以参考[里程碑](https://github.com/apache/apisix-dashboard/milestone/4)

# 1.5.0

该版本主要完成 Dashboard 的重构工作。

### 核心

- 使用 Ant Design Pro 作为项目脚手架 [#263](https://github.com/apache/apisix-dashboard/pull/263)。
- 增加了 `Manager API` 用于处理 APISIX 与 Dashboard 之间的逻辑。
- 增加了监控、路由、证书、上游、Consumer 模块。

## 1.0.0

该版本主要增加了基本控制台并解决协议问题。

### Core

- 初始化 Dashboard。 [#1](https://github.com/apache/apisix-dashboard/pull/1)
- 解决 License 问题。
- 从脚手架内移除无用文件。
- 为各个模块增加查询列表、创建、编辑、删除功能。
- 增加了自定义配置插件表单。

[返回](#table-of-contents)
