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

# 使用 Docker 构建并启动

使用 Docker 构建 Dashboard，您只需下载**根目录**中的 `Dockerfile` 文件到您的设备（无需下载源码），并根据本指南操作即可。

本构建指南产物中，将包含 `manager-api` 与 `web`。

## 环境准备

在使用 Docker 构建镜像、启动容器前，请确认您的环境中，已安装并运行如下依赖：

1. [Docker](https://docs.docker.com/engine/install/)
2. [etcd](https://etcd.io/docs/v3.4.0/dl-build/) 3.4.0+

## 构建

```sh
# 在 Dockerfile 所在目录下（默认为项目根目录）执行构建命令，请手动指定 tag。
$ docker build -t apisix-dashboard:$tag .

# 对于中国大陆的用户，可启用 `ENABLE_PROXY` 参数加快模块下载速度。
$ docker build -t apisix-dashboard:$tag . --build-arg ENABLE_PROXY=true

# 如果需要使用最新代码构建，可启用 `APISIX_DASHBOARD_VERSION` 参数指定为 `master` ，此参数也可以指定为其他版本的分支名，如 `v2.0` 。
$ docker build -t apisix-dashboard:$tag . --build-arg APISIX_DASHBOARD_VERSION=master
```

## 启动

1. 准备配置文件

在启动容器前，需要在**宿主主机**内准备配置文件 `conf.yaml`，以便覆盖容器内部默认的[配置文件](../api/conf/conf.yaml)。

配置文件有如下注意事项：

- `conf.listen.host` 为 `0.0.0.0` 时，才能使外部网络访问到容器内的服务。
- `conf.etcd.endpoints` 必须能够在容器内访问 `etcd` 服务。例如：使用 `host.docker.internal:2379` 以便容器能够访问宿主机网络中的 `etcd`。

2. 启动 Dashboard

```sh
# /path/to/conf.yaml 需使用 绝对路径 指向上述提到的配置文件
$ docker run -d -p 9000:9000 -v /path/to/conf.yaml:/usr/local/apisix-dashboard/conf/conf.yaml --name apisix-dashboard apisix-dashboard:$tag
```

3. 检查容器是否启动成功

```sh
$ docker ps -a
```

若容器 `apisix-dashboard` 状态正常，访问 `http://127.0.0.1:9000` 以使用有前端界面的控制台，默认用户密码均为 `admin`。

4. 停止 Dashboard

```sh
$ docker stop apisix-dashboard
```

## 其它

1. 多次构建镜像时，不建议使用缓存。

```sh
$ docker build -t apisix-dashboard:$tag . --no-cache=true
```
