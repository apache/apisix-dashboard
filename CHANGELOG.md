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

- [2.2.0](#220)
- [2.1.1](#211)
- [2.1.0](#210)
- [2.0.0](#200)
- [1.5.0](#150)
- [1.0.0](#100)


# 2.2.0

This release mainly improve basic features, bugfix and adds test cases.

`Manager API` 2.2 should be used with [Apache APISIX 2.1](https://github.com/apache/apisix/releases/tag/2.1). It is not recommended to use with other Apache APISIX versions.

### Core

- Support access log for Manager API. [#994](https://github.com/apache/apisix-dashboard/pull/994)
- Enhance error log for Manager API. [#977](https://github.com/apache/apisix-dashboard/pull/977)
- Integrate with code-mirror to have a fallback to plugins's render issue. [#898](https://github.com/apache/apisix-dashboard/pull/898)
- Support priority field in Route module. [#1006](https://github.com/apache/apisix-dashboard/pull/1006)
- Add etcd basic auth support [#951](https://github.com/apache/apisix-dashboard/pull/951)

### Test case

- Enhance e2e test cases for upstream. [#971](https://github.com/apache/apisix-dashboard/pull/971) [#972](https://github.com/apache/apisix-dashboard/pull/972)
- Refactor unit test for consumer handler. [#840](https://github.com/apache/apisix-dashboard/pull/840)

## Bugfix

- JSON schema verification should be performed on the original data submitted by the user. [#986](https://github.com/apache/apisix-dashboard/pull/986)
- fix PATCH method bug. [#1005](https://github.com/apache/apisix-dashboard/pull/1005)
- remove husky to resolve Docker Deploy failed. [#1018](https://github.com/apache/apisix-dashboard/pull/1018)

For more changes, please refer to [Milestone](https://github.com/apache/apisix-dashboard/milestone/5).

# 2.1.1

This release mainly adds test cases and bugfix for `Manager API`.

`Manager API` 2.1.1 should be used with Apache APISIX 2.1. It is not recommended to use with other Apache APISIX versions.

### Core

**The default port of `Manager API` is changed from 8080 to 9000.** [#931](https://github.com/apache/apisix-dashboard/pull/931)

### Test case

Add e2e test cases for route, upstream, consumer, SSL, and plugins.

## Bugfix

- Fix: when created route by `Admin API`, upstream can not be modified by dashboard. [#847](https://github.com/apache/apisix-dashboard/pull/847)
- Fix: create route with jwt-auth will display an error. [#878](https://github.com/apache/apisix-dashboard/pull/878)
- Fix: create route with error format remote_addrs `Manager API` will return 200, but should return 400. [#899](https://github.com/apache/apisix-dashboard/pull/899)
- Fix: make field ID compatible with both string and int. [#902](https://github.com/apache/apisix-dashboard/pull/902)
- Fix: can't run `Manager API` in intranet env. [#947](https://github.com/apache/apisix-dashboard/pull/947)
- Fix: create a route through the dashboard, without filling in the client address, APISIX reports errors. [#948](https://github.com/apache/apisix-dashboard/pull/948)
- Fix: creates a route and enables redirect HTTPS on dashboard, and the browser reports an error when submitting. [#957](https://github.com/apache/apisix-dashboard/pull/957)

For more changes, please refer to [Milestone](https://github.com/apache/apisix-dashboard/milestone/8).

# 2.1.0

This release mainly adds test cases for `Manager API`.

### Core

- Install signal handler for graceful shutdown.[#796](https://github.com/apache/apisix-dashboard/pull/796)
- Add e2e test for config route with service_id or upstream_id.[#810](https://github.com/apache/apisix-dashboard/pull/810)

For more changes, please refer to [Milestone](https://github.com/apache/apisix-dashboard/milestone/7).

# 2.0.0

This release mainly refactors the dashboard, omitting MySQL, improve test cases.

### Core

- Refactor frontend with `Admin API`.
- `Manager API` removes dependency on MySQL.
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
- Fix the Prometheus plugin updating incorrect values when updating routes. [#666](https://github.com/apache/apisix-dashboard/pull/666)
- Fix page display exceptions when the Redirect option is selected as Enable HTTPS in the Route page. [#692](https://github.com/apache/apisix-dashboard/pull/692)

For more changes, please refer to [Milestone](https://github.com/apache/apisix-dashboard/milestone/4)

# 1.5.0

This release mainly refactors the dashboard.

### Core

- Integrate with Ant Design Pro. [#263](https://github.com/apache/apisix-dashboard/pull/263)
- Added `Manager API` support to process logics between APISIX and Dashboard.
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
