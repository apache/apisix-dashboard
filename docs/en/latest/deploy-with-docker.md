---
title: Rebuild Docker image
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

**NOTE:** We support Docker Image, please visit [DockerHub](https://hub.docker.com/r/apache/apisix-dashboard) for more information. The following steps are for building Docker Image manually.

To build the Dashboard with Docker, you simply download the `Dockerfile` file from the **root directory** to your device (no need to download all source codes) then follow this guide.

The `manager-api` and `web` will be included in this build guide product.

## Prerequisites

Before using Docker to build images and start containers, make sure that the following dependencies are installed and running in your environment.

1. [Docker](https://docs.docker.com/engine/install/)
2. [etcd](https://etcd.io/docs/v3.4.0/dl-build/) 3.4.0+

## Build

```sh
# Execute the build command in the directory where the Dockerfile is located (by default, the project root), specifying the tag manually.
$ docker build -t apisix-dashboard:$tag .

# For users in mainland China, the `ENABLE_PROXY` parameter can be provided to speed up module downloads.
$ docker build -t apisix-dashboard:$tag . --build-arg ENABLE_PROXY=true

## Launch

1. Preparing configuration files

Before starting the container, the configuration file `conf.yaml` needs to be prepared inside the **host** to override the default [configuration file](https://github.com/apache/apisix-dashboard/blob/master/api/conf/conf.yaml) inside the container.

Kindly note:

- Only when `conf.listen.host` is `0.0.0.0` can the external network access the services within the container.
- `conf.etcd.endpoints` must be able to access the `etcd` service within the container. For example: use `host.docker.internal:2379` so that the container can access `etcd` on the host network.

2. Launch the Dashboard

```sh
# /path/to/conf.yaml Requires an absolute path pointing to the configuration file mentioned above.
$ docker run -d -p 9000:9000 -v /path/to/conf.yaml:/usr/local/apisix-dashboard/conf/conf.yaml --name apisix-dashboard apisix-dashboard:$tag
```

3. Check if the container started successfully

```sh
$ docker ps -a
```

If the container `apisix-dashboard` is ok, visit `http://127.0.0.1:9000` to use the dashboard with GUI, where the default username and password are `admin`.

4. Stop

```sh
$ docker stop apisix-dashboard
```

## Other

1. Caching is not recommended when building a image multiple times.

```sh
$ docker build -t apisix-dashboard:$tag . --no-cache=true
```

2. It is not recommended to use multiple instances at the same time. When using multiple instances, each instance generates and holds a JWT token, which will lead to verification conflicts.
