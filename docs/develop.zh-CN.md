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

# 开发指南

Dashboard 包含了 `manager-api` 与 `web` 两部分，因此需要分别启动开发环境。

## 环境准备

在开发前，请参考该[指南](./deploy.zh-CN.md#环境准备)以安装依赖。

## 克隆项目

```sh
$ git clone -b v2.0 https://github.com/apache/apisix-dashboard.git
```

## 开始开发

```sh
$ cd apisix-dashboard
```

### manager-api

1. 请在 `api/conf/conf.yaml` 中修改配置信息。

2. 在根目录下，启动开发模式

```sh
$ make api-run
```

3. 在根目录下，关闭开发模式

```sh
$ make api-stop
```

4. 关于增加自定义插件或修改插件 schema 后在控制台显示异常的问题，请查阅 [FAQ 汇总](./FAQ.zh-CN.md)关于该问题的描述。

### web

1. 进入 `web` 目录。

```sh
$ cd ./web
```

2. 请在 `config/proxy.ts` 文件中修改 `manager-api` 地址。

3. 启动开发模式

```sh
$ yarn install

$ yarn start
```

4. 如编写 E2E 测试，请参考 [E2E 编写指南](../web/src/e2e/README.zh-CN.md)
