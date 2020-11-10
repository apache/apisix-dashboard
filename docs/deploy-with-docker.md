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

# Deploy with Docker

1. Build image

```sh
# NOTE: $tag should be set manually
$ docker build -t apisix-dashboard:{$tag} .
```

2. Prepare the configuration file

Before starting the container, the configuration file `conf.yaml` needs to be prepared inside the **host** to override the default configuration file inside the container. Please refer to [example configuration file](./examples/docker-conf-example.yaml).

Example configuration notes:

- `conf.listen.host` To listen for IP within the container, it must be `0.0.0.0`, so the host can access the container's network.
- `conf.listen.port` The default is `8080` for the container listening port. If you need to change it, please change the [Dockerfile](../Dockerfile) too.
- `conf.etcd.endpoints` For the list of ETCD hosts, multiple nodes are connected with **English commas**. Make sure the container has access to these hosts. e.g. Example configuration `conf.etcd.endpoints` for `host.docker.internal` is intended to allow the container to access the network on the host.

3. Run container

```sh
$ docker run -d -p 80:8080 -v /path/to/conf.yaml:/usr/local/apisix-dashboard/conf/conf.yaml --name apisix-dashboard apisix-dashboard:{$tag}
```

## Note

1. After building the image, if you want to modify the configuration file, you can use the `docker -v /local-path-to-conf-file:/conf/conf.yaml` parameter to specify the configuration file required for `manager-api` to be loaded dynamically when the container is started.
2. For users in China, we could use the `ENABLE_PROXY` flag to speed up dependencies downloading.

```sh
$ docker build -t apisix-dashboard:{$tag} . --build-arg ENABLE_PROXY=true
```

3. If it's not the first time to build, it is recommended not to use cache.

```sh
$ docker build -t apisix-dashboard:{$tag} . --build-arg ENABLE_PROXY=true --no-cache=true
```
