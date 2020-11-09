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

# Deploy Manually

## Clone The Project

```sh
$ git clone -b v2.0 https://github.com/apache/apisix-dashboard.git

$ cd apisix-dashboard
```

## Build

### Manager-api Dependencies

The `manager-api` is used to provide APIs for Dashboard, just like a bridge between the Apache APISIX and the Dashboard. Here are the steps to build it manually:

1. We need `Go` 1.13+ to be preinstalled.

NOTE: You also need to install `Lua` 5.1+ if you want to use the Plugin Orchestration, we will improve this part and omit Lua's dependency in the future.

2. Check environment variables

- For most users in China, we could use [Goproxy](https://goproxy.cn/) to speed up downloading modules.

```sh
$ go env -w GOPROXY=https://goproxy.cn,direct
```

The bundled files are located in the root directory `/output`.

### Web Dependencies

This project is initialized with [Ant Design Pro](https://pro.ant.design). The following are some quick guides for how to use.

1. Make sure you have `Node.js(version 10.0.0+)` installed on your machine.
2. Install [yarn](https://yarnpkg.com/).

### Build

```sh
$ make build
```

The bundled files are located in the root directory `output`.

## Run

1. According to your deploy environment, check the related configurations in `output/conf/conf.yaml`, modify those variables if needed.

Example:

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

2. Run

```sh
$ cd ./output
$ ./manager-api
```

3. Visit `http://127.0.0.1:8080` in your browser, `8080` is the default listen port of manager-api.

3. stop

```sh
$ kill $(ps aux | grep 'manager-api' | awk '{print $2}')
```

## Pack

Package the output directory, The output directory contains all the files needed to run the dashboard (configuration files, executable files, web static resources)

```sh
$ make release-src
```

## Configuration

1. `conf.dag-lib-path` MUST use absolute path, we could use `pwd` command. Only used when enable Plugin Orchestration.

2. `conf.listen.host` is set to `127.0.0.1` so we could only visit it in private, we could change it to `0.0.0.0` to allow any visitors.

3. `conf.etcd.endpoints` is used to set ETCD's instances address, it supports multiple instances mode.

```yaml
conf:
  etcd:
    endpoints:
      - 127.0.0.1:2379
      - 127.0.0.1:3379
```

## NOTE

1. After compiling the Manager API, if you move the compiled product to another location, an error will be reported at startup, this is because the configuration file's **absolute path** is fixed in the product and needs to be resolved by running an environment variable to set the location of the configuration file before running.

```sh
$ export APISIX_CONF_PATH=/home/demo_user/workspace/apisix-dashboard/api/conf
```
