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

English | [简体中文](./README.zh-CN.md)

# Apache APISIX Dashboard

Apache APISIX Dashboard for [Apache APISIX](https://github.com/apache/apisix)

The goal of Apache APISIX Dashboard project is to let users to quickly experience and learn Apache APISIX, but it still cannot be used directly in a production environment. 

Its function is always a subset of Apache APISIX, and may lag behind the rapid iteration of Apache APISIX.

If you need to use the Apache APISIX Dashboard project in a production system, you need to enhance user permissions, communication security, high availability and other advanced features.

## Installation

Support multiple ways to install Apache APISIX Dashboard

### Docker

Start a runnable version by the following method

- [Deploy With Docker](./docs/deploy-with-docker.md)

### Build from Source Code

To build Apache APISIX Dashboard from source code, first make sure that your `golang` version is 1.13 or greater.

Also you need to make sure that `Node.js` and `yarn` are installed.

```sh
$ git clone -b v2.0 https://github.com/apache/apisix-dashboard.git
$ cd apisix-dashboard
$ make build
```

Then you can find all files (configuration files, executable files, web static resources) needed to run Apache APISIX Dashboard in the `./output` directory.

Start by the following commands.

```sh
$ cd ./output
$ exec ./manager-api
```

`makefile` provides the following commands.

```text
Makefile rules:

    help:		    Show Makefile rules
    build:		    Build Apache APISIX Dashboard, it contains web and manager-api
    api-test:		Run the tests of manager-api
    api-run:		Run the manager-api
    api-stop:		stop manager-api
    go-lint:    	Lint Go source code
    license-check:	Check Apache APISIX Dashboard Source Codes for Apache License
```

For more detailed construction steps, see -  [Build from Source Codes](./docs/deploy.md)

### For developer

Apache APISIX Dashboard provides a management interface for [Apache APISIX](https://github.com/apache/apisix), you need to [install APISIX first](https://github.com/apache/apisix#configure-and-installation).

Please refer to here to start `manager-api` and `web`respectively.

- [Develop Apache APISIX Dashboard](./docs/develop.md)

## User guide

Please refer to [User Guide](./docs/USER_GUIDE.md)

## Milestones

- [2.0](https://github.com/apache/apisix-dashboard/milestone/4)
- [2.1](https://github.com/apache/apisix-dashboard/milestone/5)

## Contributing

See [CONTRIBUTING](./CONTRIBUTING.md) for details on submitting patches and the contribution workflow.

## License

Apache License 2.0, [LICENSE](https://github.com/apache/apisix-dashboard/blob/master/LICENSE)

## FAQ

1. If you need the Apache APISIX Dashboard 1.0 which is built with Vue.js, please refer to [master-vue](https://github.com/apache/apisix-dashboard/tree/master-vue).

2. The Apache APISIX Dashboard 2.0 removes MySQL which [Apache APISIX Dashboard 1.5](https://github.com/apache/apisix-dashboard/tree/backup-1.5-latest) is relied on.

3. If you are using APISIX 1.5 or below, kindly note that the v2 api store and v3 api store are [separate and isolated](https://etcd.io/docs/v3.4.0/op-guide/v2-migration/). Apache APISIX Dashboard v2.0 and above use the etcd v3 api, APISIX 1.5 and below use the etcd v2 api.
