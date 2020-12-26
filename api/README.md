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

# manager-api

This is a backend project which the dashboard depends on, implemented by Golang.

## Installation

[Please refer to the doc](../README.md)

## Project structure

```text
├── README.md
├── VERSION
├── build-tools
├── build.sh
├── cmd
├── conf
├── entry.sh
├── go.mod
├── go.sum
├── internal
├── run.sh
└── test
```

1. The `cmd` directory is the project entrance.
2. The `internal` directory contains the main logic of manager-api.
3. The `conf` directory contains the default configuration file.
4. The `test` directory contains E2E test cases.

