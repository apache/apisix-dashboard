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

## 安装

我们有多种方式来安装 APISIX dashboard

### Docker

我们可以通过下面的方法来启动一个可运行的版本

- [使用 Docker 一键部署](./docs/deploy-with-docker.zh-CN.md)

### 从源代码构建

从源代码构建，首先先确认你的 `golang` 版本在 1.13 或者 更高的版本。
同样你也需要提前按照好 `node` 和 `yarn`

```
$ git clone -b v2.0 https://github.com/apache/apisix-dashboard.git && cd apisix-dashboard
$ make build
```

然后你可以在 `./output` 目录下找到运行 dashboard 需要的所有文件(配置文件、可执行文件、web静态资源)

通过下面的命令启动

```sh
$ cd ./output
$ export ENV=local && exec ./manager-api
```

`makefile` 提供以下几种命令

```
Makefile rules:

    help:		    Show Makefile rules
    build:		    build dashboard, it contains web and manager-api
    api-test:		Run the tests of manager-api
    api-run:		Run the manager-api
    api-stop:		stop manager-api
    go-lint:	    Lint Go source code
    license-check:	Check apisix-dashboard source codes for Apache License
```

更详细的构建步骤参见这里 - [从源代码构建](./docs/deploy.zh-CN.md)

### 开发者

apisix-dashboard 为 [Apache APISIX](https://github.com/apache/apisix) 提供管理界面，需要先 [安装 APISIX](https://github.com/apache/apisix#configure-and-installation).

然后请参考这里分别启动 `manager-api` 和 `web`

- [依赖检查](#依赖检查)
- [开发 Dashboard](./docs/develop.zh-CN.md)

## Dashboard 使用指南

请参考 [用户指南](./docs/USER_GUIDE.zh-CN.md)

## 里程碑

- [2.0](https://github.com/apache/apisix-dashboard/milestone/4)
- [2.1](https://github.com/apache/apisix-dashboard/milestone/5)

## 贡献

请参考[贡献指南](./CONTRIBUTING.md)以获取更详细的流程。

## License

Apache License 2.0, [LICENSE](https://github.com/apache/apisix-dashboard/blob/master/LICENSE)

## FAQ

1. 如果你需要 Vue.js 构建的 dashboard-1.0，请使用 [master-vue 分支](https://github.com/apache/apisix-dashboard/tree/master-vue)。
2. 2.0 版本的控制台移除了[1.5 版本](https://github.com/apache/apisix-dashboard/tree/backup-1.5-latest)中的 MySQL，将直接操作 etcd。
3. 如果你使用 v2.0 以下版本的 Apache APISIX，需要注意 etcd v2 API 的数据与 v3 API 的数据是[不互通的](https://etcd.io/docs/v3.4.0/op-guide/v2-migration/)。Dashboard v2.0 及以上版本使用 etcd v3 API，apisix 1.5 及以下版本使用 etcd v2 API。
