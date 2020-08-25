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

[English](./README.md) | 简体中文

# Apache APISIX 仪表盘

[Apache APISIX](https://github.com/apache/apisix-dashboard) 的仪表盘

[在线演示](http://139.217.190.60/)

## 用户指南

请参考 [用户指南](./USER_GUIDE.md)

## 使用 Docker 部署

请参考 [使用 Docker 部署](./compose/README.md)

## 手动部署

### 克隆项目

```sh
$ git clone https://github.com/apache/apisix-dashboard.git

$ cd apisix-dashboard
```

### 生成 manager-api

`manager-api` 用于为仪表盘提供接口，就像 Apache APISIX 和仪表盘之间的桥梁。下面是手动构建步骤：

1. 需要预先安装 `MySQL/Golang`。

```sh
# 例如：初始化时，推荐使用更加安全的密码，而不是 123456
$ mysql –uroot –p123456
> source ./api/script/db/schema.sql
```

2. 启动 Apache APISIX

[请参考这份指南](https://github.com/apache/apisix#configure-and-installation)

3. 检查环境变量

根据您的本地部署环境，检查 `./api/run/run.sh` 中的环境变量，如果需要请修改环境变量。

对于大多数中国用户，我们可以使用 [Goproxy](https://goproxy.cn/) 加快模块下载速度。

4. 构建

```sh
$ cd api && go build -o ../manager-api . && cd ..
```

5. 启动

```sh
$ sh ./api/run/run.sh &
```

### 构建仪表盘

该项目使用 [Ant Design Pro](https://pro.ant.design) 初始化。以下是一些使用方法的快速指南。

1. 确保你的设备已经安装了 `Node.js(version 8.10.0+)/Nginx`。

2. 安装 [yarn](https://yarnpkg.com/)。

3. 安装依赖:

```sh
$ yarn install
```

4. 构建

```sh
$ yarn build
```

5. 如果第 4 步成功的话，那么构建后的文件在 `/dist` 目录下，接着我们推荐使用 `nginx` 处理这些文件，请手动安装 `nginx` 并参考 `compose/dashboard_conf/nginx.conf` 配置。

6. 移动 `dist` 目录下的文件到 nginx 的默认 html 目录，然后在浏览器中访问 `http://127.0.0.1`。

## 开发

1. 确保你的设备已经安装了 `Node.js(version 8.10.0+)/Nginx`。

2. 安装 [yarn](https://yarnpkg.com/)。

3. 安装依赖:

```sh
$ yarn install
```

4. 如果我们想要修改 API，请参考 `config/proxy.ts` 文件。

```sh
$ yarn install

$ yarn start
```

## 其他

1. 如果你需要 Vue.js 构建的 dashboard-1.0，请参考 [master-vue](https://github.com/apache/apisix-dashboard/tree/master-vue)。

2. 关于新版仪表盘和 manager-api 的更多信息请参阅 [这里](./manager-api.md)
