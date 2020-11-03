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

# Deploy manually

## Clone the project

```sh
$ git clone -b v2.0 https://github.com/apache/apisix-dashboard.git

$ cd apisix-dashboard
```

## Build the manager-api

The `manager-api` is used to provide APIs for Dashboard, just like a bridge between the Apache APISIX and the Dashboard. Here are the steps to build it manually:

1. We need `Go` 1.13+ to be preinstalled.

NOTE: You also need to install `Lua` 5.1+ if you want to use the Plugin Orchestration, we will improve this part and omit Lua's dependency in the future.

2. Check environment variables

- enable Go MODULE

```sh
$ go env -w GO111MODULE=on
```

- For most users in China, we could use [Goproxy](https://goproxy.cn/) to speed up downloading modules.

```sh
$ go env -w GOPROXY=https://goproxy.cn,direct
```

3. Build

```sh
$ api/build.sh
```

The bundled files are located in the root directory `/output`.

## Build the web

This project is initialized with [Ant Design Pro](https://pro.ant.design). The following are some quick guides for how to use.

1. Make sure you have `Node.js(version 10.0.0+)` installed on your machine.
2. Install [yarn](https://yarnpkg.com/).
3. Install dependencies:

```sh
$ cd /web

$ yarn install
```

4. Build

```sh
$ yarn build
```

The bundled files are located in the root directory `/output/html`.

## Run

1. According to your deploy environment, check the related configurations in `api/conf/conf.json`, modify those variables if needed.

Example:

```json
{
  "conf": {
    "syslog": {
      "host": "127.0.0.1"
    },
    "listen": {
      "host": "127.0.0.1",
      "port": 8080
    },
    "dag-lib-path": "/home/demo_user/workspace/apisix-dashboard/dag-to-lua-1.1/",
    "etcd": {
      "endpoints": "127.0.0.1:2379"
    }
  },
  "authentication": {
    "session": {
      "secret": "secret",
      "expireTime": 3600
    },
    "user": [
      {
        "username": "admin",
        "password": "admin"
      },
      {
        "username": "user",
        "password": "user"
      }
    ]
  }
}
```

2. Run manager-api

```sh
$ api/run.sh &
```

3. Visit `http://127.0.0.1:8080` in your browser, `8080` is the default listen port of manager-api.

## Configuration

1. `conf.dag-lib-path` MUST use absolute path, we could use `pwd` command. Only used when enable Plugin Orchestration.

2. `conf.listen.host` is set to `127.0.0.1` so we could only visit it in private, we could change it to `0.0.0.0` to allow any visitors.

3. `conf.etcd.endpoints` is used to set ETCD's instances address, it supports multiple instances mode.

```json
{
  "etcd": {
    "endpoints": "127.0.0.1:2379,127.0.0.1:3379"
  }
}
```

## NOTE

1. When the manager-api is running in background, before we want to rebuild & re-deploy it, we should find the process id then kill it.

```sh
$ ps aux | grep manager-api

$ kill $process_id
```

2. After compiling the Manager API, if you move the compiled product to another location, an error will be reported at startup, this is because the configuration file's **absolute path** is fixed in the product and needs to be resolved by running an environment variable to set the location of the configuration file before running.

```sh
$ export APISIX_CONF_PATH=/home/demo_user/workspace/apisix-dashboard/api/conf
```
