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

# Apache APISIX Dashboard 开发

## 前置条件

```
$ git clone -b v2.0 https://github.com/apache/apisix-dashboard.git
$ cd apisix-dashboard
```

## 前端开发

1. 确保你的设备已经安装了 `Node.js(version version 10.0.0+)`。

2. 安装 [yarn](https://yarnpkg.com/)。

3. 安装依赖:

```sh
$ yarn install
```

4. 若需要修改 manager-api 地址，请访问 `config/proxy.ts` 文件。

5. 启动 (开发模式)

```sh
$ yarn start
```

### 编写 E2E 测试案例

请参考 [E2E 文档](../web/src/e2e/README.zh-CN.md)。

## 开发 manager-api

### 启动

1. 修改配置文件 目录: `api/conf/conf.yaml`

```
conf:
  listen:
    host: 127.0.0.1
    port: 8080
  dag_lib_path: ''
  etcd:
    endpoints:
      - 127.0.0.1:2379
authentication:
  secret: secret
  expireTime: 3600
  users:
    - username: admin
      password: admin
    - username: user
      password: user
```

2. 启动 (开发模式)

```
$ make api-run
```

3. 关闭 (开发模式)

```
$ make api-stop
```

### 同步 jsonschema

从 Apache APISIX 同步 jsonschema ，需要预安装 `Lua` 5.1+ 和 `zip` ，并执行命令 `api/build-tools/schema-sync.sh $version`。

注意：`$version` 为 `master` 或者 Apache APISIX 的版本号。 

示例：

```sh
# 使用 "master"
$ api/build-tools/schema-sync.sh master

# 使用 Apache APISIX 的版本号
$ api/build-tools/schema-sync.sh 2.0
```

