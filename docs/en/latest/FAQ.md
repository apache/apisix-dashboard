---
title: FAQ
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

### 1. Vue.js version of the Dashboard

If you need a Vue.js build of the Apache APISIX Dashboard 1.0, use the [master-vue branch](https://github.com/apache/apisix-dashboard/tree/master-vue).

### What are the differences between Dashboard version 2.0 and version 1.5?

The 2.0 version of the dashboard removed MySQL from [version 1.5](https://github.com/apache/apisix-dashboard/tree/backup-1.5-latest) and will operate directly on etcd.

### 3. Etcd compatibility issues

If you are using Apache APISIX below v2.0, be aware that the data from the etcd v2 API is [not compatible](https://etcd.io/docs/v3.4.0/op-guide/v2-migration/) with the data from the v3 API. Apache APISIX Dashboard v2.0 and above uses the etcd v3 API, and apisix 1.5 and below uses the etcd v2 API.

### 4. After modifying the plugin schema or creating a custom plugin in Apache APISIX, why can't I find it on the dashboard?

Since the Dashboard caches the jsonschema data of the plugins in Apache APISIX, you need to synchronize the data in the Dashboard after you create your custom plugins in Apache APISIX, which currently **only supports manual operation**. Please follow the following guide.

1. Confirm that your APISIX is running and has enabled control API (enabled by default and only runs local access)
   Refer to the beginning in:
   https://github.com/apache/apisix/blob/master/doc/control-api.md

2. Execute the following commands to export jsonchema on your APISIX server (if it is configured for non-local access, it does not need to be executed on your APISIX server, and the access IP and port should be modified accordingly)

```sh
curl 127.0.0.1:9090/v1/schema > schema.json
```

Refer to https://github.com/apache/apisix/blob/master/doc/control-api.md#get-v1schema

3. Copy the exported `schema.json` to the `conf` directory in the Dashboard working directory (About working directory, please refer to https://github.com/apache/apisix-dashboard/blob/master/docs/deploy.md#working-directory)

4. Restart the Manager API

### 5. How to write API documentation

We use [go-swagger](https://github.com/go-swagger/go-swagger) to generate Swagger 2.0 documents, and then convert them to markdown format so that they can be viewed directly in the github repository. Specific steps are as follows:

1. Write comments according to [Specification](https://goswagger.io/use/spec.html). For details, please refer to the existing example `api/internal/handler/route/route.go` in this project.

2. Use the `go-swagger` tool to generate Swagger 2.0 documents.

```shell
$ swagger generate spec -o ./docs/en/latest/api/api.yaml --scan-models
```

3. Use the `swagger-markdown` tool to convert Swagger 2.0 documents into markdown documents.

```shell
$ swagger-markdown -i ./docs/en/latest/api/api.yaml
```
