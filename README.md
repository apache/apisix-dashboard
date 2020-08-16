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

Dashboard for [Apache APISIX](https://github.com/apache/apisix-dashboard)

## Deploy with Docker

Please refer to [Deploy with Docker README](./compose/README.md)

## Deploy Manually

### Clone the project

```sh
$ git clone https://github.com/apache/apisix-dashboard.git

$ cd apisix-dashboard
```

### Build the manager-api

The `manager-api` is used to provide APIs for Dashboard, just like a bridge between the Apache APISIX and the Dashboard. Here are the steps to build it manually:

1. We need `MySQL/Golang` to be preinstalled.

```sh
# e.g Initialization for MySQL
$ mysql –uroot –p123456
> source ./api/script/db/schema.sql
```

2. Start the Apache APISIX.

[Please follow this guide](https://github.com/apache/apisix#configure-and-installation)

3. Check environment variables

According to your local deployment environment, check the environment variables in `./api/run/run.sh`, modify the environment variables if needed.

For Chinese users please refer to [Goproxy](https://goproxy.cn/)

4. Build

```sh
$ cd api && go build -o ../manager-api . && cd ..
```

5. Run

```sh
$ sh ./api/run/run.sh &
```

### Build the Dashboard

This project is initialized with [Ant Design Pro](https://pro.ant.design). The following are some quick guides for how to use.

1. Make sure you have `Node.js(version 8.10.0+)/Nginx` installed on your machine.
2. Install [yarn](https://yarnpkg.com/).
3. Install dependencies:

```sh
$ yarn install
```

4. Build

```sh
$ yarn build
```

5. The bundled files are under `/dist` folder if the step 4 is successful, then we recommend using `nginx` to handle those files, please refer to the nginx conf `docker/nginx.conf`.
6. Move files under `dist` folder to nginx's default html folder, then visit `http://127.0.0.1` in your browser.

## Development

1. Make sure you have `Node.js(version 8.10.0+)/Nginx` installed on your machine.
2. Install [yarn](https://yarnpkg.com/).
3. Install dependencies:
4. If we want to modify the API, please refer to the `config/proxy.ts` file.

```sh
$ yarn install

$ yarn start
```

## Other

1. If you need the dashboard-1.0 which is built with Vue.js, please refer to [master-vue](https://github.com/apache/apisix-dashboard/tree/master-vue).
