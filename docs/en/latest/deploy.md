---
title: Deploy with Source Codes
---

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

The Dashboard contains both `manager-api` and `web`, but `web` is _optional_.

The `manager-api` and `web` will be included in this build guide product.

## Prerequisites

Before using source codes to build, make sure that the following dependencies are installed in your environment.

### manager-api

1. [Golang](https://golang.org/dl/) 1.13+: For users in mainland China, you can use the following command to speed up the module downloads.

```sh
$ go env -w GOPROXY=https://goproxy.cn,direct
```

### web

1. [Node.js](https://nodejs.org/en/download/) 10.23.0+
2. [Yarn](https://yarnpkg.com/getting-started/install)

## Clone the project

```sh
$ git clone -b v2.4 https://github.com/apache/apisix-dashboard.git
```

## Build

```sh
$ cd apisix-dashboard
$ make build
```

When the build is complete, the results are stored in the root `output` directory.

Note: `make build` will build `manger-api` and `web`, use the `make help` command to see more commands.

## Launch

1. After the build is complete and before you start, make sure the following dependencies are installed and running in your environment.

- [etcd](https://etcd.io/docs/v3.4.0/dl-build/) 3.4.0+

2. Check and modify the configuration information in `output/conf/conf.yaml` according to your deployment environment.

3. Launch the Dashboard

```sh
$ cd ./output

$ ./manager-api

# or running in background
$ nohup ./manager-api &
```

4. Without changing the configuration, visit `http://127.0.0.1:9000` to use the dashboard with GUI, where the default username and password are `admin`.

5. Stop the Dashboard

`manager-api` provides a sub command `stop` to quit the program gracefully, just
run:

```sh
$ ./manager-api stop
```

## Working directory

the `output` directory mention above is the default working directory.

You can move the entire directory to any path you want, and use the `-p` to specify it as the working directory.

For example, you can move it to `/usr/local/apisix-dashboard/`

```sh
$ mv ./output/manager-api /usr/local/bin/

$ mv ./output/ /usr/local/apisix-dashboard/

$ manager-api -p /usr/local/apisix-dashboard/
```
