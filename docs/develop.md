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

# Apache APISIX Dashboard Devlopment

## Dependencies

```sh
$ git clone -b v2.0 https://github.com/apache/apisix-dashboard.git
$ cd apisix-dashboard
```

## Web

1. Make sure you have `Node.js(version version 10.0.0+)` installed on your machine.
2. Install [yarn](https://yarnpkg.com/).
3. Install dependencies:

```sh
$ yarn install
```

4. If we want to modify the API, please refer to the `config/proxy.ts` file.

5. Start (the development mode)

```sh
$ yarn start
```

### Add E2E test cases

Please refer to [E2E Documentation](../web/src/e2e/README.md).

## Manager-api

### Start

1. Modify `config.yaml` in `api/conf/conf.yaml`

```yaml
conf:
  listen:
    host: 127.0.0.1
    port: 8080
  etcd:
    endpoints:
      - 127.0.0.1:2379
authentication:
  secret: secret
  expire_time: 3600
  users:
    - username: admin
      password: admin
    - username: user
      password: user
```

2. Start (the development mode)

```sh
$ make api-run
```

3. Stop (the development mode)

```sh
$ make api-stop
```

### Sync jsonschema

To sync jsonschema from Apache APISIX, `Lua` 5.1+ and `zip` need to be preinstalled, then execute this command: 

```sh
$ api/build-tools/schema-sync.sh $version
```

NOTE: `$version` should be `master` or Apache APISIX's version.

Example:

```sh
# Using "master"
$ api/build-tools/schema-sync.sh master

# Using Apache APISIX's version
$ api/build-tools/schema-sync.sh 2.0
```

If you have custom plugin, please make sure your custom plugin is placed in the APISIX directory, and change the parameters of the execution script to the APISIX directory path, example:

```sh
$ api/build-tools/schema-sync.sh /usr/local/apisix
```
