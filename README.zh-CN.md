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

[English](./README.md) | 简体中文

# [Apache APISIX](https://github.com/apache/apisix) 控制台

访问 [http://139.217.190.60/](http://139.217.190.60/) 查看在线预览，账户与密码：`admin`。

## 用户指南

请参考 [用户指南](./docs/USER_GUIDE.zh-CN.md)

## 部署

当前支持如下方式部署：

- [手动部署](./docs/deploy.zh-CN.md)
- [使用 Docker 部署](./compose/README.md)

## 开发

开发分为 Apache APISIX 开发、Dashboard 开发

- [Apache APISIX](https://github.com/apache/apisix)
- [Dashboard](./docs/develop.zh-CN.md)

## 里程碑

- [2.0](https://github.com/apache/apisix-dashboard/milestone/4)
- [2.1](https://github.com/apache/apisix-dashboard/milestone/5)

## 贡献

请参考[贡献指南](./CONTRIBUTING.md)以获取更详细的流程。

## FAQ

1. 如果你需要 Vue.js 构建的 dashboard-1.0，请使用 [master-vue 分支](https://github.com/apache/apisix-dashboard/tree/master-vue)。
2. 2.0 版本的控制台移除了[1.5 版本](https://github.com/apache/apisix-dashboard/tree/backup-1.5-latest)中的 MySQL，将直接操作 etcd。
