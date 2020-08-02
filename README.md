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

# Apache APISIX Dashboard

Dashboard for [Apache APISIX](https://github.com/apache/incubator-apisix-dashboard)

## Deploy with Docker

Please refer to [Deploy with Docker README](./compose/README.md)

## Deploy Manually

### Build the manager-api

The `manager-api` is used to provide APIs for Dashboard, just like a bridge between the Apache APISIX and the Dashboard. Here are the steps to build it manually:

1. We need `MySQL/Golang` to be preinstalled.

```sh
# e.g Initialization for MySQL
$ mysql –uroot –p123456 < $PROJECT_ROOT_FOLDER/api/script/db/schema.sql
```

2. Start the Apache APISIX.

[Please follow this guide](https://github.com/apache/apisix#configure-and-installation)

3. Set environment variables

According to your local deployment environment, modify the environment variables in `$PROJECT_ROOT_FOLDER/api/run/run.sh`

4. Build

```sh
$ go build -o manager-api $PROJECT_ROOT_FOLDER/api
```

5. Run

```sh
$ sh $PROJECT_ROOT_FOLDER/api/run/run.sh
```

### Build the Dashboard

This project is initialized with [Ant Design Pro](https://pro.ant.design). The following are some quick guide for how to use.

1. Make sure you have `Node.js(version 8.10.0+)` installed on your machine.
2. Install [yarn](https://yarnpkg.com/).
3. Install dependencies:

```sh
$ yarn install
```

4. Build

```sh
$ yarn build
```

5. The bundle files are under `/dist` folder if the step 4 is successful.
6. We recommend using `nginx` to handle those bundled files, just put them under nginx's html folder, then visit `http://$IP` in your browser.
7. NOTE: You may need to update the API address in the dashboard's setting page.

## Other

1. If you need the dashboard built with Vue.js, please refer to [master-vue](https://github.com/apache/incubator-apisix-dashboard/tree/master-vue).
