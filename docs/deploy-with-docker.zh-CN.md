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

# 使用 Docker 部署

1. 构建镜像

```sh
# 注意：需手动指定 $tag
$ docker build -t apisix-dashboard:{$tag} .
```

2. 准备配置文件

在启动容器前，需要在**宿主主机**内准备配置文件 `conf.yaml`，以便覆盖容器内部默认的配置文件。请参考[示例配置文件](./examples/docker-conf-example.yaml)。

示例配置说明：

- `conf.listen.host` 为容器内监听 IP，必须为 `0.0.0.0`，这样宿主才能访问容器内网络。
- `conf.listen.port` 为容器内监听端口，默认为 `8080`。如需修改，请同步修改 [Dockerfile](../Dockerfile)。
- `conf.etcd.endpoints` 为 ETCD 主机列表，支持多个节点，请确保容器可以访问到这些主机，例如：示例配置中 `conf.etcd.endpoints` 为 `host.docker.internal` 旨在允许容器访问宿主主机上的网络。

3. 启动容器

```sh
$ docker run -d -p 80:8080 -v /path/to/conf.yaml:/usr/local/apisix-dashboard/conf/conf.yaml --name apisix-dashboard apisix-dashboard:{$tag}
```

## 注意

1. 构建镜像后，如需修改配置文件，可通过使用 `docker -v /local-path-to-conf-file:/conf/conf.yaml` 参数指定 `manager-api` 所需要的配置文件，以便启动容器时动态加载配置文件。
2. 中国用户可使用 `ENABLE_PROXY` 指令以加速所需依赖的下载。

```sh
$ docker build -t apisix-dashboard:{$tag} . --build-arg ENABLE_PROXY=true
```

3. 如果不是第一次构建，建议不要使用缓存。

```sh
$ docker build -t apisix-dashboard:{$tag} . --build-arg ENABLE_PROXY=true --no-cache=true
```
