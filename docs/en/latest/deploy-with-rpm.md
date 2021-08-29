---
title: Deploy with RPM
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

**NOTE:** Only support CentOS 7 currently, for more information, please refer to [here](./deploy.md).

## Install from RPM

```sh
$ sudo yum install -y https://github.com/apache/apisix-dashboard/releases/download/v2.7.1/apisix-dashboard-2.7.1-0.x86_64.rpm
```

## Run

Before you start, make sure the following dependencies are installed and running in your environment.

- [etcd](https://etcd.io/docs/v3.4.0/dl-build/) 3.4.0+

```sh
$ sudo nohup manager-api -p /usr/local/apisix/dashboard/ &

# or manager-api as a service
$ sudo manager-api start -p /usr/local/apisix/dashboard/
```

Without changing the configuration, visit `http://127.0.0.1:9000` to use the dashboard with GUI, where the default username and password are `admin`.
