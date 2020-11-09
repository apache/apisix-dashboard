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

Apache APISIX Dashboard 项目的目标是为了让大家快速上手体验和学习 Apache APISIX，并不能直接用于生产环境。所以它的功能点覆盖永远都是 Apache APISIX 的子集，也可能会滞后于 Apache APISIX 的快速迭代。如果你需要把 Dashboard 项目用于生产系统，需要对用户权限、通讯安全、高可用、高级功能等方面做增强。

## 用户指南

请参考 [用户指南](./docs/USER_GUIDE.zh-CN.md)

## 开发者

如果你是开发者，请参考这里分别启动 manager-api 和 web

- [依赖检查](#依赖检查)
- [开发 Dashboard](./docs/develop.zh-CN.md)

## 部署运行

我们有多种部署方式

- [使用 Docker 一键部署](./docs/deploy-with-docker.zh-CN.md)

- [从源文件打包部署](./docs/deploy.zh-CN.md)

## 依赖检查

apisix-dashboard 为 [Apache APISIX](https://github.com/apache/apisix) 提供管理界面，需要先 [安装 APISIX](https://github.com/apache/apisix#configure-and-installation).

## 里程碑

- [2.0](https://github.com/apache/apisix-dashboard/milestone/4)
- [2.1](https://github.com/apache/apisix-dashboard/milestone/5)

## 贡献

请参考[贡献指南](./CONTRIBUTING.md)以获取更详细的流程。

## FAQ

1. 如果你需要 Vue.js 构建的 dashboard-1.0，请使用 [master-vue 分支](https://github.com/apache/apisix-dashboard/tree/master-vue)。
2. 2.0 版本的控制台移除了[1.5 版本](https://github.com/apache/apisix-dashboard/tree/backup-1.5-latest)中的 MySQL，将直接操作 etcd。
3. 如果你使用 v2.0 以下版本的 Apache APISIX，需要注意 etcd v2 API 的数据与 v3 API 的数据是[不互通的](https://etcd.io/docs/v3.4.0/op-guide/v2-migration/)。Dashboard v2.0 及以上版本使用 etcd v3 API，apisix 1.5 及以下版本使用 etcd v2 API。
