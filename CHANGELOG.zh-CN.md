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

- [2.0.0](#200)
- [1.5.0](#150)
- [1.0.0](#100)


# 2.0.0

这是一个候选版本。

### 核心

- 前端根据新的 admin-api 进行重构。
- 后端移除对 mysql 的依赖。
- 支持插件编排模式。
- 制定前端国际化标准。
- Dashboard 新的部署方式。
- 增加更多测试用例。
- 文档增强。

更多的变动可以参考[里程碑](https://github.com/apache/apisix-dashboard/milestone/4)

# 1.5.0

该版本主要完成 Dashboard 的重构工作。

### 核心

- 使用 Ant Design Pro 作为项目脚手架 [#263](https://github.com/apache/apisix-dashboard/pull/263)。
- 增加了 manager-api 用于处理 APISIX 与 Dashboard 之间的逻辑。
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
