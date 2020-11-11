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
# 在根目录下执行构建命令，请手动指定 tag。
$ docker build -t apisix-dashboard:$tag .
```

2. 准备配置文件

在启动容器前，需要在**宿主主机**内准备配置文件 `conf.yaml`，以便覆盖容器内部默认的配置文件。

请参考[配置文件](../api/conf/conf.yaml)。

3. 启动容器

```sh
$ docker run -d -p 80:8080 -v /path/to/conf.yaml:/usr/local/apisix-dashboard/conf/conf.yaml --name apisix-dashboard apisix-dashboard:$tag
```

4. 检查容器是否启动成功

```sh
$ docker ps -a
```

若容器 `apisix-dashboard` 状态正常，访问 `http://127.0.0.1:8080` 以使用有前端界面的控制台，默认用户密码均为 `admin`。

## 其它

1. 对于中国大陆的用户，可启用 `ENABLE_PROXY` 参数加快模块下载速度。

```sh
$ docker build -t apisix-dashboard:$tag . --build-arg ENABLE_PROXY=true
```

2. 多次构建镜像时，不建议使用缓存。

```sh
$ docker build -t apisix-dashboard:$tag . --build-arg ENABLE_PROXY=true --no-cache=true
```
