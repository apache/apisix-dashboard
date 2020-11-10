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

# Dashboard 开发

## 前端开发

1. 确保你的设备已经安装了 `Node.js(version version 10.0.0+)`。

2. 安装 [yarn](https://yarnpkg.com/)。

3. 安装依赖:

```sh
$ yarn install
```

4. 若需要修改 manager-api 地址，请访问 `config/proxy.ts` 文件。

5. 启动开发模式

```sh
$ yarn start
```

### 编写 E2E 测试案例

请参考 [E2E 文档](../web/src/e2e/README.zh-CN.md)。

## manager-api 开发

### 同步 jsonschema

从 Apache APISIX 同步 jsonschema ，需要预安装 `Lua` 5.1+ 和 `zip` ，并执行命令 

```sh
$ api/build-tools/schema-sync.sh $version
```

注意：`$version` 为 `master` 或者 Apache APISIX 的版本号。 

示例：

```sh
# 使用 "master"
$ api/build-tools/schema-sync.sh master

# 使用 Apache APISIX 的版本号
$ api/build-tools/schema-sync.sh 2.0
```

如果您有自定义插件，请确保您的自定义插件放在 APISIX 目录中，并将执行脚本的参数改为 APISIX 目录路径, 如：

```sh
$ api/build-tools/schema-sync.sh /usr/local/apisix
```
