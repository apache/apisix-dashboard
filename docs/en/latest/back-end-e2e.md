---
title: Backend E2E
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

This document describes how to use E2E test locally.

## Start with source code

1. To run back end E2E test, please start the `manager-api`, `apisix`, `etcd` and `upstream-node` at first.

2. To start the `manager-api` project locally, please refer to [develop](./develop.md) web section.

3. To start the etcd locally, please refer to [etcd start](https://github.com/apache/apisix/blob/master/docs/en/latest/install-dependencies.md) web section.

4. To start the `apisix` project locally, please refer to [apisix start](https://github.com/apache/apisix#get-started) web section.

5. To start the `upstream-node` locally, please install docker in the local environment and execute the command.

   ```sh
    docker run -d --name upstream -v /(Your apisix-dashboard folder path)/api/test/docker/upstream.conf:/etc/nginx/conf.d/default.conf:ro -p 80:80 -p 1980:1980 -p 1981:1981 -p 1982:1982 -p 1983:1983 -p 1984:1984 johz/upstream:v2.0
   ```

6. After all the services are started, you can start the back-end E2E test.

7. The `upstream-node` IP is temporarily changed to the local IP address. After the test, it should be changed to GitHub upstream node IP. If the test case does not involve the upstream node, it does not need to be modified.

   ```sh
    # Local E2E test create route example
    {
        "uris": ["/test-test"],
        "name": "route_all",
        "desc": "test",
        "methods": ["GET"],
        "hosts": ["test.com"],
        "status": 1,
        "upstream": {
            "nodes": {
                # upstream node IP is required for local test
                "(local ip):1981": 1
            },
            "type": "roundrobin"
         }
    }

     # GitHub E2E test create route example
    {
        "uris": ["/test-test"],
        "name": "route_all",
        "desc": "test",
        "methods": ["GET"],
        "hosts": ["test.com"],
        "status": 1,
        "upstream": {
            "nodes": {
                "172.16.238.20:1981": 1
            },
            "type": "roundrobin"
         }
    }
   ```

## Start with docker-compose

1. [install docker-compose](https://docs.docker.com/compose/install/)

**NOTE:** In order to run docker compose locally, please change the values of `listen.host` and `etcd.endpoints` within `./api/conf/conf.yaml` as follows:

```sh
listen:
   host: 0.0.0.0
   port: 9000
etcd:
   endpoints:
     - 172.16.238.10:2379
     - 172.16.238.11:2379
     - 172.16.238.12:2379
```

2. Use `docker-compose` to run services such as `manager-api`, `apisix`, `etcd` and `upstream-node`, run the command.

   ```sh
   cd /(Your apisix-dashboard folder path)/api/test/docker
   docker-compose up -d
   ```

3. When you use `docker-compose` to run the local E2E test and need to update the main code, you need to execute the command to close the cluster.

   ```sh
   cd /(Your apisix-dashboard folder path)/api/test/docker
   # -v: Remove links to mount volumes and volumes
   docker-compose  down -v
   # If you don't want to remove the link between mount volume and volume, you can use
   docker-compose stop [serviceName]
   ```

4. Then you need to delete the image of the `manage-api`, rebuild the image of the `manage-api`, and start the cluster after the image is successfully built.

## Start test

1. After all the services are started, you can start the back-end E2E test.

**NOTE:** Sometimes we need to delete the etcd store info. Otherwise, it will make the test failed.

2. Enter the E2E folder and execute the command to test all E2E test files.

   ```sh
    cd /(Your apisix-dashboard folder path)/api/test/e2e
    go test -v
   ```

3. You can also do E2E test on a single file.

   ```sh
    cd /(Your apisix-dashboard folder path)/api/test/e2e
    go test -v E2E-test-file.go base.go
   ```
