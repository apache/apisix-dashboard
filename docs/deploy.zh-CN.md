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
$ git clone -b v2.0 https://github.com/apache/apisix-dashboard.git

$ cd apisix-dashboard
```

## 构建 

### manager-api 检查项

`manager-api` 用于为控制台提供接口，就像 Apache APISIX 和控制台之间的桥梁。下面是手动构建步骤：

1. 需要预先安装 `Go` 1.13+

注意：如果使用插件编排，需要同时预先安装 `Lua` 5.1+ ，后续版本会对此进行优化，取消对 `Lua` 的依赖。

2. 检查环境变量

- 对于大多数中国用户，我们可以使用 [Goproxy](https://goproxy.cn/) 加快模块下载速度。

```sh
$ go env -w GOPROXY=https://goproxy.cn,direct
```

### 前端 检查项

该项目使用 [Ant Design Pro](https://pro.ant.design) 初始化。以下是一些使用方法的快速指南。

1. 确保你的设备已经安装了 `Node.js(版本 10.0.0+)`。

2. 安装 [yarn](https://yarnpkg.com/)。


### 开始构建


```sh
$ make build
```

构建完成后的文件在根目录 `/output` 下。

## 启动

1. 根据您的部署环境，检查并修改 `output/conf/conf.yaml` 中的配置。

例如：

```yaml
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

2. 启动

```sh
$ make run
```

3. 在浏览器中访问 `http://127.0.0.1:8080`，`8080` 是 manager-api 的默认监听端口。

3. 关闭

```sh
$ make stop
```

## 配置参数

1. `conf.dag-lib-path` 参数需要使用绝对路径，可通过 `pwd` 指令获取。仅在使用插件编排功能时需要指定。

2. `conf.listen.host` 默认为 `127.0.0.1`，这意味着只能在本地网络中访问，如需允许外部网络访问，请修改为 `0.0.0.0`，无需重新编译代码。

3. `conf.etcd.endpoints` 用于配置 ETCD 实例，支持集群模式。

```yaml
conf:
  etcd:
    endpoints:
      - 127.0.0.1:2379
      - 127.0.0.1:3379
```

## 注意

1. 在编译 Manager API 后，如移动编译后产物到其它位置，启动时将会报错，这是由于配置文件**绝对路径**被固定在了产物中，需要在运行前，通过执行环境变量设置配置文件位置来解决。

```sh
$ export APISIX_CONF_PATH=/home/demo_user/workspace/apisix-dashboard/api/conf
```
