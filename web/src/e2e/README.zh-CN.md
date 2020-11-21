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

### 本地编写测试案例

1. 安装依赖并运行本地开发环境

```sh
$ yarn install && yarn start
```

2. 在 `src/e2e` 文件夹增加新的测试案例文件
3. 运行测试案例

```sh
$ yarn test
```

如果你想单独运行某一个测试文件，可以执行如下命令

```sh
$ yarn test ${yourFileName}.e2e.js
```

测试结果将会在控制台显示。
