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

# 使用源码构建并启动

Dashboard 包含了 `manager-api` 与 `web` 两部分，其中 `web` 是*可选*的。

本构建指南产物中，将包含 `manager-api` 与 `web`。

## 环境准备

在使用源码构建前，请确认您的环境中，已安装如下依赖：

### manager-api

1. [Golang](https://golang.org/dl/) 1.13+：对于中国大陆的用户，可使用如下命令加快模块下载速度。

```sh
$ go env -w GOPROXY=https://goproxy.cn,direct
```

2. [Lua](https://www.lua.org/download.html) 5.1+：仅在使用**插件编排**功能时，需要安装本依赖。在后续版本中，会对该部分进行优化以取消对其依赖。

### web

1. [Node.js](https://nodejs.org/en/download/) 10.23.0+
2. [Yarn](https://yarnpkg.com/getting-started/install)

## 克隆项目

```sh
$ git clone -b v2.0 https://github.com/apache/apisix-dashboard.git
```

## 构建

```sh
$ cd apisix-dashboard
$ make build
```

构建完成后，构建结果将存放在根目录下 `output` 目录中。

注意：`make build` 将会构建 `manger-api` 与 `web`，使用 `make help` 命令以查看更多指令。

## 启动

1. 在构建完成后、启动前，请确认您的环境中，已安装并运行如下依赖：

- [etcd](https://etcd.io/docs/v3.4.0/dl-build/) 3.4.0+

2. 根据您的部署环境，检查并修改 `output/conf/conf.yaml` 中的配置信息。

3. 启动 Dashboard

```sh
$ cd ./output

$ ./manager-api
# 或后台常驻
$ ./manager-api &
```

4. 在未修改配置的情况下，访问 `http://127.0.0.1:8080` 以使用有前端界面的控制台，默认用户密码均为 `admin`。

5. 停止 Dashboard

```sh
$ kill $(ps aux | grep 'manager-api' | awk '{print $2}')
```
