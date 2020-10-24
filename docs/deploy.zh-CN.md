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

# 手动部署

## 克隆项目

```sh
$ git clone https://github.com/apache/apisix-dashboard.git

$ cd apisix-dashboard
```

## 构建 manager-api

`manager-api` 用于为控制台提供接口，就像 Apache APISIX 和控制台之间的桥梁。下面是手动构建步骤：

1. 需要预先安装 `Go` 1.13+

注意：如果使用插件编排，需要同时预先安装 `Lua` 5.1+ ，后续版本会对此进行优化，取消对 `Lua` 的依赖。

2. 检查环境变量

- 开启 Go MODULE

```sh
$ go env -w GO111MODULE=on
```

- 根据您的本地部署环境，检查 `./api/run.sh` 中的环境变量，如果需要请修改环境变量。例如, 把 ETCD 地址改为你的与 APISIX 一起工作的 ETCD 实例:

```sh
$ export APIX_ETCD_ENDPOINTS="127.0.0.1:2379"
```

如果有多个实例，请使用英文逗号分隔，如：

```sh
$ export APIX_ETCD_ENDPOINTS="127.0.0.1:2379,127.0.0.1:3379"
```

- 对于大多数中国用户，我们可以使用 [Goproxy](https://goproxy.cn/) 加快模块下载速度。

```sh
$ go env -w GOPROXY=https://goproxy.cn,direct
```

3. 构建并启动

```sh
$ ./api/run.sh &
```

## 构建前端

该项目使用 [Ant Design Pro](https://pro.ant.design) 初始化。以下是一些使用方法的快速指南。

1. 确保你的设备已经安装了 `Node.js(version 10.0.0+)/Nginx`。

2. 安装 [yarn](https://yarnpkg.com/)。

3. 安装依赖:

```sh
$ yarn install
```

4. 构建

```sh
$ yarn build
```

5. 如果第 4 步成功的话，那么构建后的文件在 `/dist` 目录下。
6. 移动 `dist` 目录下的文件到 manager-api 的 `dist` 目录下，然后在浏览器中访问 `http://127.0.0.1:8080`，`8080` 是 manager-api 的默认监听端口。
