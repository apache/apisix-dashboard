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

2. 启动容器

```sh
$ docker run -d -p 80:8080 --name apisix-dashboard apisix-dashboard:{$tag}
```

## 注意

1. 构建镜像后，如需修改配置文件，可通过使用 `docker -v /local-path-to-conf-file:/conf/conf.json` 参数指定 `manager-api` 所需要的配置文件，以便启动容器时动态加载配置文件。
2. 中国用户可使用 `ENABLE_PROXY` 指令以加速所需依赖的下载。

```sh
$ docker build -t apisix-dashboard:{$tag} . --build-arg ENABLE_PROXY=true
```
