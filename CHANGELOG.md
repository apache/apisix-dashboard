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

# Table of Contents

- [2.0.0](#200)
- [1.5.0](#150)
- [1.0.0](#100)

# 2.0.0

This is a release candidate.

# Core

- Refactor frontend with Admin-API.
- Manager-API removes dependency on MySQL.
- Support plugin orchestration.
- Setting standards for frontend internationalization.
- New deployment pattern.
- Add more test cases.
- Document Enhancement.
- Add back-end E2E test examples.
- Improve CI testing.
- Support log save to local file.
- Optimize the deployment process.
- Add E2E test examples to the frontend. [#619](https://github.com/apache/apisix-dashboard/pull/619)
- Fix the Promethues plugin updating incorrect values when updating routes. [#666](https://github.com/apache/apisix-dashboard/pull/666)
- Fix page display exceptions when the Redirect option is selected as Enable HTTPS in the Route page. [#692](https://github.com/apache/apisix-dashboard/pull/692)

For more changes, please refer to [Milestone](https://github.com/apache/apisix-dashboard/milestone/4)

# 1.5.0

This release mainly refactors the dashboard.

### Core

- Integrate with Ant Design Pro. [#263](https://github.com/apache/apisix-dashboard/pull/263)
- Added Manager API support to process logics between APISIX and Dashboard.
- Added Metrics/Route/SSL/Upstream/Consumer module.

## 1.0.0

This release is mainly to build some basic panels and resolve License issue.

### Core

- Dashboard initial. [#1](https://github.com/apache/apisix-dashboard/pull/1)
- Resolve licence issues.
- Remove unused files from the Dashboard boilerplate.
- Support panel to list, create and modify Route, Consumer, Service, SSL and Upstream.
- Support custom configuration for Plugin dialog.

[Back to TOC](#table-of-contents)
