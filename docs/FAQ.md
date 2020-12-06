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

# FAQ

### 1. Vue.js version of the Dashboard

If you need a Vue.js build of the Apache APISIX Dashboard 1.0, use the [master-vue branch](https://github.com/apache/apisix-dashboard/tree/master-vue).

### What are the differences between Dashboard version 2.0 and version 1.5?

The 2.0 version of the dashboard removed MySQL from [version 1.5](https://github.com/apache/apisix-dashboard/tree/backup-1.5-latest) and will operate directly on etcd.

### 3. Etcd compatibility issues

If you are using Apache APISIX below v2.0, be aware that the data from the etcd v2 API is [not compatible](https://etcd.io/docs/v3.4.0/op-guide/v2-migration/) with the data from the v3 API. Apache APISIX Dashboard v2.0 and above uses the etcd v3 API, and apisix 1.5 and below uses the etcd v2 API.

### 4. After modifying the plugin schema or creating a custom plugin in Apache APISIX, why can't I find it on the dashboard?

Since the Dashboard caches the jsonschema data of the plugins in Apache APISIX, you need to synchronize the data in the Dashboard after you create your custom plugins in Apache APISIX, which currently **only supports manual operation**, this issue will be optimized in the following versions. Please follow the following guide.

1. Install [Lua](https://www.lua.org/download.html) and `zip`.

2. Execute the following commands.

```sh
# `$version` is the version number of Apache APISIX, e.g. master or 2.1.
$ api/build-tools/schema-sync.sh $version
```

If you have a custom plugin, make sure it is in the `apisix` directory and use the following command.

```sh
$ api/build-tools/schema-sync.sh /path/to/apisix

# e.g
$ api/build-tools/schema-sync.sh /usr/local/apisix
```

After the command finishes executing, if you are using a binary `manager-api` that has already been built, you will need to manually copy `api/conf/schema.json` to the `conf` directory under the Dashboard **working directory**. where **working directory** refers to the `conf` directory under this [document](./deploy.md) is the `output` directory, or the directory with the modified name, that is generated in the root directory after the build is complete.
