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

Dashboard for [Apache APISIX](https://github.com/apache/apisix)

## User Guide

Please refer to [User Guide](./docs/USER_GUIDE.md)

## Deployment

- [Deploy Manually](./docs/deploy.md)

## Development

- [Apache APISIX](https://github.com/apache/apisix)
- [Dashboard](./docs/develop.md)

## Milestones

- [2.0](https://github.com/apache/apisix-dashboard/milestone/4)
- [2.1](https://github.com/apache/apisix-dashboard/milestone/5)

## Contributing

See [CONTRIBUTING](./CONTRIBUTING.md) for details on submitting patches and the contribution workflow.

## FAQ

1. If you need the dashboard-1.0 which is built with Vue.js, please refer to [master-vue](https://github.com/apache/apisix-dashboard/tree/master-vue).

2. The dashboard 2.0 removes MySQL which [dashboard 1.5](https://github.com/apache/apisix-dashboard/tree/backup-1.5-latest) is relied on.

3. If you are using APISIX 1.5 or below, kindly note that the v2 api store and v3 api store are [separate and isolated](https://etcd.io/docs/v3.4.0/op-guide/v2-migration/). Dashboard v2.0 and above use the etcd v3 api, APISIX 1.5 and below use the etcd v2 api.
