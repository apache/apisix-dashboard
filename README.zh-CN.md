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

# Apache APISIX Dashboard（实验性的）

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://github.com/apache/apisix-dashboard/blob/master/LICENSE)

<p align="center">
  <a href="https://github.com/apache/apisix-dashboard">English</a> •
  <a href="https://github.com/apache/apisix-dashboard/blob/master/README.zh-CN.md">中文</a>
</p>

<p align="center">
  <a href="https://apisix.apache.org/">官网</a> •
  <a href="https://github.com/apache/apisix/tree/master/doc">文档</a> •
  <a href="https://twitter.com/apacheapisix">Twitter</a>
</p>

## 介绍

Apache APISIX Dashboard 旨在通过前端界面，让用户尽可能更方便地操作 [Apache APISIX](https://github.com/apache/apisix)。

Dashboard 为控制平面，完成所有参数的校验；Apache APISIX 混合了数据平面与控制平面，会逐渐演进为纯粹的数据平面。

本项目包含了 `manager-api` 与前端界面，前者将逐渐替代 Apache APISIX 中的 `admin-api`，我们正在积极地迁移相关逻辑。

注意：目前 Dashboard 尚未完整覆盖 Apache APISIX 的功能，[访问此处](https://github.com/apache/apisix-dashboard/milestones)以查看里程碑。

![architecture](./docs/images/architecture.png)

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

1. `api` 目录用于存放 `manager-api` 源码，它用于管理 `etcd` 并为前端界面提供接口。
2. `web` 目录用于存放前端源码。

## 构建并启动

支持以下方式：

- [源码](./docs/deploy.zh-CN.md)
- [Docker](./docs/deploy-with-docker.zh-CN.md)

## 本地开发

请参考[开发指南](./docs/develop.zh-CN.md)

## 使用指南

请参考[用户指南](./docs/USER_GUIDE.zh-CN.md)

## 参与贡献

请参考[贡献指南](./CONTRIBUTING.md)以获取更详细的流程

## FAQ

请参考 [FAQ 汇总](./docs/FAQ.zh-CN.md)以查看更多已知问题

## License

[Apache License 2.0](./LICENSE)
