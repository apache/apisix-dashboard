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

### Add E2E test cases

1. Install dependencies then run in development mode

```sh
$ yarn install && yarn start
```

2. Add a new test case file under the `src/e2e` folder
3. Run test cases

```sh
$ yarn test
```

If you want to run a particular test file separately, you can execute the following command

```sh
$ yarn test ${yourFileName}.e2e.js
```

The test results will be displayed on the console.
