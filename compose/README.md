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

# docker-compose

This folder stores the `docker-compose` file for `manager-api`.

## Deploy

1. Run docker-compose

```sh
$ cd apisix-dashboard/compose

$ sh gen-config-yaml.sh

# For most users in China, please use some proxy services like https://www.daocloud.io/mirror to speed up your Docker images pulling.
$ docker-compose -p dashboard up -d
```

2. Visit `http://127.0.0.1/` in the browser.
