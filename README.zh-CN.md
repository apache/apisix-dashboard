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

# Apache APISIX Dashboard

Apache APISIX Dashboard 旨在通过界面，让用户尽可能更方便地操作 [Apache APISIX](https://github.com/apache/apisix)。

![architecture](./docs/images/architecture.png)

注意：目前 Dashboard 尚未完整覆盖 Apache APISIX 的功能，[访问此处](https://github.com/apache/apisix-dashboard/milestones)以查看里程碑。

## 目录结构

```
.
├── CHANGELOG.md
├── CHANGELOG.zh-CN.md
├── CODE_OF_CONDUCT.md
├── CONTRIBUTING.md
├── Dockerfile
├── LICENSE
├── Makefile
├── NOTICE
├── README.md
├── README.zh-CN.md
├── api
├── docs
├── licenses
└── web
```

1. `api` 目录用于存放 `manager-api` 源码，它用于为前端界面提供接口。
2. `web` 目录用于存放前端源码。

## 构建并启动

支持以下构建部署方式：

- [源码构建并启动](./docs/deploy.zh-CN.md)
- [Docker](./docs/deploy-with-docker.zh-CN.md)

## 开发

Apache APISIX Dashboard 为 [Apache APISIX](https://github.com/apache/apisix) 提供管理界面，需要先[安装 APISIX](https://github.com/apache/apisix#configure-and-installation).

然后请参考这里分别启动 `manager-api` 和 `web`

- [开发 Apache APISIX Dashboard](./docs/develop.zh-CN.md)

## 使用指南

请参考 [用户指南](./docs/USER_GUIDE.zh-CN.md)

## 里程碑

- [2.0](https://github.com/apache/apisix-dashboard/milestone/4)
- [2.1](https://github.com/apache/apisix-dashboard/milestone/5)

## 贡献

请参考[贡献指南](./CONTRIBUTING.md)以获取更详细的流程。

## License

Apache License 2.0, [LICENSE](https://github.com/apache/apisix-dashboard/blob/master/LICENSE)

## FAQ

1. 如您需要 Vue.js 构建的 Apache APISIX Dashboard 1.0，请使用 [master-vue 分支](https://github.com/apache/apisix-dashboard/tree/master-vue)。
2. 2.0 版本的控制台移除了[1.5 版本](https://github.com/apache/apisix-dashboard/tree/backup-1.5-latest)中的 MySQL，将直接操作 etcd。
3. 如果你使用 v2.0 以下版本的 Apache APISIX，需要注意 etcd v2 API 的数据与 v3 API 的数据是[不互通的](https://etcd.io/docs/v3.4.0/op-guide/v2-migration/)。Apache APISIX Dashboard v2.0 及以上版本使用 etcd v3 API，apisix 1.5 及以下版本使用 etcd v2 API。
