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

# FAQ

### 1. Vue.js 版本的 Dashboard

若您需要 Vue.js 构建的 Apache APISIX Dashboard 1.0，请使用 [master-vue 分支](https://github.com/apache/apisix-dashboard/tree/master-vue)。

### 2. Dashboard 2.0 版本与 1.5 版本有什么差异？

2.0 版本的控制台移除了[1.5 版本](https://github.com/apache/apisix-dashboard/tree/backup-1.5-latest)中的 MySQL，将直接操作 etcd。

### 3. etcd 兼容性问题

若您使用 v2.0 以下版本的 Apache APISIX，需要注意 etcd v2 API 的数据与 v3 API 的数据是[不互通的](https://etcd.io/docs/v3.4.0/op-guide/v2-migration/)。Apache APISIX Dashboard v2.0 及以上版本使用 etcd v3 API，apisix 1.5 及以下版本使用 etcd v2 API。

### 4. 在 Apache APISIX 中修改插件 schema 或创建自定义插件后，为什么在控制台找不到？

由于 Dashboard 缓存了 Apache APISIX 中插件的 jsonschema 数据，因此您在 Apache APISIX 中创建自定义插件后，需要同步 Dashboard 中的数据，当前**仅支持手动操作**，该问题会在后续版本得到优化。如下为操作步骤：

1. 安装 [Lua](https://www.lua.org/download.html) 与 `zip`。

2. 执行如下命令：

```sh
# `$version` 为 `master` 或者 Apache APISIX 的版本号，如 2.0。
$ api/build-tools/schema-sync.sh $version
```

若您有自定义插件，请确保该插件在 `apisix` 目录中，并使用如下命令：

```sh
$ api/build-tools/schema-sync.sh /path/to/apisix

# 示例：
$ api/build-tools/schema-sync.sh /usr/local/apisix
```

命令执行完成后，若您使用的是已经完成构建的二进制 `manager-api`，那么需要手动将 `api/conf/schema.json` 拷贝到 Dashboard **工作目录**下的 `conf` 目录中。其中，**工作目录**是指根据该[文档](./deploy.zh-CN.md)构建完成后，在根目录下生成的 `output` 目录或修改名称后的目录。

### 5. 如何编写 API 接口文档

我们使用 [go-swagger](https://github.com/go-swagger/go-swagger) 生成 Swagger 2.0 文档，然后转为 markdown 格式，以便可以直接在 github 仓库中查看。具体步骤如下：

1. 按[规范](https://goswagger.io/use/spec.html)编写注释，具体可以参考本项目中已有例子 `api/internal/handler/route/route.go`。

2. 使用 `go-swagger` 工具生成 Swagger 2.0 文档。

```shell
$ swagger generate spec -o ./docs/api/api.yaml --scan-models
```

3. 使用 `swagger-markdown` 工具把 Swagger 2.0 文档转为 markdown 文档。

```shell
$ swagger-markdown -i ./docs/api/api.yaml
```
