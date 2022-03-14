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

- [2.11.0](#2110)
- [2.10.1](#2101)
- [2.10.0](#2100)
- [2.9.0](#290)
- [2.8.0](#280)
- [2.7.1](#271)
- [2.7.0](#270)
- [2.6.1](#261)
- [2.6.0](#260)
- [2.5.0](#250)
- [2.4.0](#240)
- [2.3.0](#230)
- [2.2.0](#220)
- [2.1.1](#211)
- [2.1.0](#210)
- [2.0.0](#200)
- [1.5.0](#150)
- [1.0.0](#100)

# 2.11.0

This release contains some features and bugfixes, and all the existing functionalities are compatible with Apache APISIX 2.12.1.

### Core

- feat: add data loader framework [#2371](https://github.com/apache/apisix-dashboard/pull/2371)
- feat: support protobuf on Web [#2320](https://github.com/apache/apisix-dashboard/pull/2320)
- feat: basic support Apache APISIX 2.12.1 [#2315](https://github.com/apache/apisix-dashboard/pull/2315)
- feat: Add more fields to limit-count plugin [#2322](https://github.com/apache/apisix-dashboard/pull/2322)
- feat: support APISIX_PROFILE for env-specific configuration [#2293](https://github.com/apache/apisix-dashboard/pull/2293)
- feat(upstream): add upstream priority field [#2271](https://github.com/apache/apisix-dashboard/pull/2271)
- feat(route): show route id in list and edit views [#2269](https://github.com/apache/apisix-dashboard/pull/2269)
- feat(route): remove key-auth plugin tip [#2261](https://github.com/apache/apisix-dashboard/pull/2261)
- feat: add rejected_msg field to limit-count plugin form [#2328](https://github.com/apache/apisix-dashboard/pull/2328)
- feat: add rejected_msg field to limit-req plugin form [#2312](https://github.com/apache/apisix-dashboard/pull/2312)
- chore: Create route form optimization [#2336](https://github.com/apache/apisix-dashboard/pull/2336)
- chore: add loading in route page [#2287](https://github.com/apache/apisix-dashboard/pull/2287)
- chore(upstream): remove default port for upstream health check [#2278](https://github.com/apache/apisix-dashboard/pull/2278)
- style: add ellipsis for route table [#2317](https://github.com/apache/apisix-dashboard/pull/2317)

### Bugfix

- fix: ! (reverse) operator not handled correctly [#2364](https://github.com/apache/apisix-dashboard/pull/2364)
- fix: idle_timeout filed to support set zero value [#2296](https://github.com/apache/apisix-dashboard/pull/2296)
- fix: retries field to support zero value [#2298](https://github.com/apache/apisix-dashboard/pull/2298)
- fix: get current dir error [#2283](https://github.com/apache/apisix-dashboard/pull/2283)
- style: remove extra margin value [#2300](https://github.com/apache/apisix-dashboard/pull/2300)

# 2.10.1

This release contains bugfix, and all the existing functionalities are compatible with Apache APISIX 2.11.0.

### Bugfix

- fix: authentication middleware is implemented by changing from framework droplet to framework gin [#2254](https://github.com/apache/apisix-dashboard/pull/2254)

# 2.10.0

This release contains some features and bugfixes, and all the existing functionalities are compatible with Apache APISIX 2.11.0.

### Core

- feat: basic support Apache APISIX 2.11 [#2233](https://github.com/apache/apisix-dashboard/pull/2233)
- feat: support post args advanced match [#2231](https://github.com/apache/apisix-dashboard/pull/2231)
- feat: Setting default language to english in APISIX Dashboard [#2212](https://github.com/apache/apisix-dashboard/pull/2212)
- feat: add gzip middleware [#2178](https://github.com/apache/apisix-dashboard/pull/2178)
- feat: add Type function to store interface [#2160](https://github.com/apache/apisix-dashboard/pull/2160)

### Bugfix

- fix: cp consumer name regx different with dp [#2232](https://github.com/apache/apisix-dashboard/pull/2232)
- fix: plugin_configs should store with etcd prefix [#2226](https://github.com/apache/apisix-dashboard/pull/2226)
- fix: correct the property name for tcp_failures [#2221](https://github.com/apache/apisix-dashboard/pull/2221)
- fix: login repeat 2 times [#2179](https://github.com/apache/apisix-dashboard/pull/2179)
- fix: select Use the domain or IP from Node List [#2168](https://github.com/apache/apisix-dashboard/pull/2168)

### CI

- ci: clean up the E2E test environment [#2225](https://github.com/apache/apisix-dashboard/pull/2225)
- ci: add issue stale processor [#2169](https://github.com/apache/apisix-dashboard/pull/2169)

# 2.9.0

This release contains some features and bugfixes, and all the existing functionalities are compatible with Apache APISIX 2.10.0.

### Core

- feat(plugin): allowing basic-auth to dynamically adapt to the BE rules [#2086](https://github.com/apache/apisix-dashboard/pull/2149)
- feat(plugin): allowing referer-restriction to dynamically adapt to the BE rules [#2001](https://github.com/apache/apisix-dashboard/pull/2001)
- refactor: migrate to viper configure manage [#1946](https://github.com/apache/apisix-dashboard/pull/1946)
- feat: basic support Apache APISIX 2.10 [#2149](https://github.com/apache/apisix-dashboard/pull/2149)
- feat: support Manager API run on windows [#2125](https://github.com/apache/apisix-dashboard/pull/2125)

### Bugfix

- fix: supports search by name for service options when add router [#2066](https://github.com/apache/apisix-dashboard/pull/2066)
- fix: gzip plugin schema typo [#2142](https://github.com/apache/apisix-dashboard/pull/2142)
- fix: adjust buildx to fix Docker build failed [#2120](https://github.com/apache/apisix-dashboard/pull/2120)

### Docs

- docs: Update FAQ about Grafana can't login when APISIX dashboard configured domain name [#2126](https://github.com/apache/apisix-dashboard/pull/2126)

### CI

- ci: Only upload artifact at the release/** branch [#2137](https://github.com/apache/apisix-dashboard/pull/2137)
- ci: optimize build rpm workflow with apisix-build-tools v2.2.0 [#2133](https://github.com/apache/apisix-dashboard/pull/2133)

# 2.8.0

This release contains some features and bugfixes, and all the existing functionalities are compatible with Apache APISIX 2.9.

### Core

- feat: add new route matching param position [#1984](https://github.com/apache/apisix-dashboard/pull/1984)
- feat: add redis-cluster policy tips for limit-count [#2058](https://github.com/apache/apisix-dashboard/pull/2058)
- feat: add service discovery config [#2081](https://github.com/apache/apisix-dashboard/pull/2081)
- feat: Use build-tools v2.0.0 instead of master [#2083](https://github.com/apache/apisix-dashboard/pull/2083)
- feat: basic support Apache APISIX 2.9 [#2117](https://github.com/apache/apisix-dashboard/pull/2117)
- feat: upstream support FQDN [#2118](https://github.com/apache/apisix-dashboard/commit/1a0b12bf70489104cd996848ded19ad3bdc6902f)
- feat: allowing api-breaker to dynamically adapt to the BE rules [#1974](https://github.com/apache/apisix-dashboard/pull/1974)
- feat: allowing cors to dynamically adapt to the BE rules [#1994](https://github.com/apache/apisix-dashboard/pull/1994)
- feat: allowing limit-count to dynamically adapt to the BE rules [#1998](https://github.com/apache/apisix-dashboard/pull/1998)
- feat: allowing proxy-mirror to dynamically adapt to the BE rules [#2000](https://github.com/apache/apisix-dashboard/pull/2000)
- feat: add cors method option [#2103](https://github.com/apache/apisix-dashboard/pull/2103)
- feat: add el7 in package name [#2074](https://github.com/apache/apisix-dashboard/pull/2074)
- feat: Bump apisix-build-tools to v2.1.0 [#2101](https://github.com/apache/apisix-dashboard/pull/2101)

### Bugfix

- fix: avoid nil pointer dereference in route export [#2061](https://github.com/apache/apisix-dashboard/pull/2061)
- fix: after enable redirect HTTPS, websocket form field disappeared [#2115](https://github.com/apache/apisix-dashboard/pull/2115)
- fix: make route name validate rules in Apisix Dashboard the same as Admin API [#2085](https://github.com/apache/apisix-dashboard/pull/2085)

### Docs

- docs: add how to integrate with grafana preview link [#1697](https://github.com/apache/apisix-dashboard/pull/1697)

# 2.7.1

This release contains some features and bugfixes, and all the existing functionalities are compatible with Apache APISIX 2.7.

### Core

- chore: refactor ManagerAPI to reduce redundant code and improve readability [#1956](https://github.com/apache/apisix-dashboard/pull/1956)
- chore: add required flag for Route name field [#2025](https://github.com/apache/apisix-dashboard/pull/2025)
- feat: remove the Version Match logics [2023](https://github.com/apache/apisix-dashboard/pull/2023) [#2038](https://github.com/apache/apisix-dashboard/pull/2038)
- feat(i18n): improve Web to have a better i18n description [#1973](https://github.com/apache/apisix-dashboard/pull/1973) [#1963](https://github.com/apache/apisix-dashboard/pull/1963)
- feat(Upstream): set a initial weight value for the upstream node [#1979](https://github.com/apache/apisix-dashboard/pull/1979)
- feat(Plugin): allowing limit-req to dynamically adapt to the BE rules [#1995](https://github.com/apache/apisix-dashboard/pull/1995)
- feat(Plugin): allowing limit-conn to dynamically adapt to the BE rules [#1990](https://github.com/apache/apisix-dashboard/pull/1990)
- feat(Route): support uri/uris/remote_addr/remote_addrs/host/hosts [#2046](https://github.com/apache/apisix-dashboard/pull/2046)

### Bugfix

- fix(Plugin): only auth type plugin need to configure [1983](https://github.com/apache/apisix-dashboard/pull/1983)
- fix(Plugin): add nodelay for limit-req plugin [#2021](https://github.com/apache/apisix-dashboard/pull/2021)
- fix(Route): add the missing operators [#2022](https://github.com/apache/apisix-dashboard/pull/2022)
- fix(Route): support websocket enable in route [#2042](https://github.com/apache/apisix-dashboard/pull/2052)
- fix(Consumer): remove the extra `undefined` user [#1987](https://github.com/apache/apisix-dashboard/pull/1987)
- fix(Upstream): make service chash key Input inputable and selectable [#1982](https://github.com/apache/apisix-dashboard/pull/1982)
- fix(Upstream): update hash_on field and limitation [#2034](https://github.com/apache/apisix-dashboard/pull/2034)
- fix(Web): omit all `null` value from request body [#2042](https://github.com/apache/apisix-dashboard/pull/2042)
- fix(Web): redirect uri when session expired [#2044](https://github.com/apache/apisix-dashboard/pull/2044)
- fix(Web): update the sidebar menu position [#2051](https://github.com/apache/apisix-dashboard/pull/2051)
- fix(ManagerAPI): avoid nil pointer dereference and remove redundant code [#2031](https://github.com/apache/apisix-dashboard/pull/2031)
- fix(ManagerAPI): support running ManagerAPI on Windows [#1947](https://github.com/apache/apisix-dashboard/pull/1947)

# 2.7.0

This release mainly improves basic features, bugfix and adds test cases.

Note: `Manager API` 2.7 should be used with [Apache APISIX 2.6](https://apisix.apache.org/downloads/). It is not recommended to use it with other Apache APISIX versions.

### Core

- Feat: support HTTPS for Manager API [#1824](https://github.com/apache/apisix-dashboard/pull/1824)
- Feat: run manager-api as an OS agnostic service [#1667](https://github.com/apache/apisix-dashboard/pull/1667)
- Feat: refactor Plugin Orchestration [#1813](https://github.com/apache/apisix-dashboard/pull/1813)
- Feat: add the service page upstream select option [#1633](https://github.com/apache/apisix-dashboard/pull/1633)
- Feat: improve the Duplicate Route feature [#1833](https://github.com/apache/apisix-dashboard/pull/1833)
- Feat: add api of config migrate, export and import [#1893](https://github.com/apache/apisix-dashboard/pull/1893)

### Bugfix

- Fix: can not configure upstream with no nodes [#1812](https://github.com/apache/apisix-dashboard/pull/1812)
- Fix: add missing label in nodes component [#1823](https://github.com/apache/apisix-dashboard/pull/1823)
- Fix: when create the upstream, some properties can still be edited on the preview page bug [#1828](https://github.com/apache/apisix-dashboard/pull/1828)
- Fix: default cors plugin formdata validation error [#1855](https://github.com/apache/apisix-dashboard/pull/1855)
- Fix: generate a uid when post a route without id [#1883](https://github.com/apache/apisix-dashboard/pull/1883)
- Fix: route page Portable [#1887](https://github.com/apache/apisix-dashboard/pull/1887)
- Fix: invalid import issues [#1899](https://github.com/apache/apisix-dashboard/pull/1899)
- Fix: efficient error handling in manager-api including graceful shutdown, self contained methods. [#1814](https://github.com/apache/apisix-dashboard/pull/1814)
- Fix: regex & omit vars when no value [#1921](https://github.com/apache/apisix-dashboard/pull/1921)

### Test Case

- Test: fix unstable FE E2E test case [#1826](https://github.com/apache/apisix-dashboard/pull/1826)
- CI: fix gitleaks not allowed running [#1897](https://github.com/apache/apisix-dashboard/pull/1897)
- Test: refactor FE E2E test case ([#1844](https://github.com/apache/apisix-dashboard/pull/1844) to [#1878](https://github.com/apache/apisix-dashboard/pull/1878) and a series of PRs)

# 2.6.1

This release mainly contains bugfixes.

`Manager API` 2.6.1 should be used with [Apache APISIX 2.5](https://apisix.apache.org/downloads/). It is not recommended to use with other Apache APISIX versions.

### Bugfix

- Fix: use remote address instead of client ip [#1831](https://github.com/apache/apisix-dashboard/pull/1831)
- Fix: turn off online debug [#1903](https://github.com/apache/apisix-dashboard/pull/1903)

# 2.6.0

This release mainly improves UI and UE, bugfix and adds test cases.

`Manager API` 2.6 should be used with [Apache APISIX 2.5](https://apisix.apache.org/downloads/). It is not recommended to use with other Apache APISIX versions.

### Core

- Change: remove listen.host from api/conf/conf.yaml [#1767](https://github.com/apache/apisix-dashboard/pull/1767)
- Change: remove ID of consumer [#1745](https://github.com/apache/apisix-dashboard/pull/1745)
- Feat: Support duplicate one existing Route [#1558](https://github.com/apache/apisix-dashboard/pull/1558)
- Feat: add response header in debug view [#1691](https://github.com/apache/apisix-dashboard/pull/1691)
- Feat: add basic-auth UI Form [#1718](https://github.com/apache/apisix-dashboard/pull/1718)
- Feat: add limit-count plugin form [#1739](https://github.com/apache/apisix-dashboard/pull/1739)
- Feat: add referer-restriction plugin form [#1727](https://github.com/apache/apisix-dashboard/pull/1727)
- Feat: added cors plugin form [#1733](https://github.com/apache/apisix-dashboard/pull/1733)
- Feat: added limit-req plugin form [#1732](https://github.com/apache/apisix-dashboard/pull/1732)
- Feat: add api-breaker plugin form [#1730](https://github.com/apache/apisix-dashboard/pull/1730)
- Feat: add proxy-mirror plugin form [#1725](https://github.com/apache/apisix-dashboard/pull/1725)
- Feat: add limit-conn plugin form [#1728](https://github.com/apache/apisix-dashboard/pull/1728)
- Feat: refactor upstream form module [#1726](https://github.com/apache/apisix-dashboard/pull/1726)
- Feat: added types for Plugins [#1736](https://github.com/apache/apisix-dashboard/pull/1736)
- Feat: support auto build rpm package for dashboard [#1766](https://github.com/apache/apisix-dashboard/pull/1766)
- Feat: improve UI and UE ([#1674](https://github.com/apache/apisix-dashboard/pull/1674), [#1702](https://github.com/apache/apisix-dashboard/pull/1702), [#1707](https://github.com/apache/apisix-dashboard/pull/1707),[#1715](https://github.com/apache/apisix-dashboard/pull/1715), [#1723](https://github.com/apache/apisix-dashboard/pull/1723), [#1782](https://github.com/apache/apisix-dashboard/pull/1782), [#1610](https://github.com/apache/apisix-dashboard/pull/1610), [#1764](https://github.com/apache/apisix-dashboard/pull/1764), [#1735](https://github.com/apache/apisix-dashboard/pull/1735), [#1771](https://github.com/apache/apisix-dashboard/pull/1771), [#1748](https://github.com/apache/apisix-dashboard/pull/1748), [#1749](https://github.com/apache/apisix-dashboard/pull/1749), [#1751](https://github.com/apache/apisix-dashboard/pull/1751), [#1679](https://github.com/apache/apisix-dashboard/pull/1679), [#1750](https://github.com/apache/apisix-dashboard/pull/1750), [#1731](https://github.com/apache/apisix-dashboard/pull/1731), [#1747](https://github.com/apache/apisix-dashboard/pull/1747))

### Bugfix

- Fix: unable to export route with nil methods field [#1673](https://github.com/apache/apisix-dashboard/pull/1673)
- Fix: incorrect conversion between integer types [#1753](https://github.com/apache/apisix-dashboard/pull/1753)
- Fix: user login request should remove its own prefix option [#1701](https://github.com/apache/apisix-dashboard/pull/1701)
- Fix: show correct health checker [#1784](https://github.com/apache/apisix-dashboard/pull/1784)

### Test Case

- Test: use gomega match assertion [#1678](https://github.com/apache/apisix-dashboard/pull/1678)
- Test: updated cli_test.sh according reg ex [#1696](https://github.com/apache/apisix-dashboard/pull/1696)
- Test: reduce FE e2e ci time [#1698](https://github.com/apache/apisix-dashboard/pull/1698) [#1762](https://github.com/apache/apisix-dashboard/pull/1762)
- Test: adding a retry mechanism to FE testing [#1752](https://github.com/apache/apisix-dashboard/pull/1752)
- Test: fix online debug test case [#1761](https://github.com/apache/apisix-dashboard/pull/1761)
- Test: write backend e2e with ginkgo ([#1663](https://github.com/apache/apisix-dashboard/pull/1663), [#1677](https://github.com/apache/apisix-dashboard/pull/1677), [#1675](https://github.com/apache/apisix-dashboard/pull/1675), [#1676](https://github.com/apache/apisix-dashboard/pull/1676), [#1704](https://github.com/apache/apisix-dashboard/pull/1704), [#1755](https://github.com/apache/apisix-dashboard/pull/1755))

### Doc

- Docs: add more details and examples to import openapi guide [#1672](https://github.com/apache/apisix-dashboard/pull/1672)

# 2.5.0

This release mainly improves basic features, bugfix and adds test cases.

`Manager API` 2.5 should be used with [Apache APISIX 2.4](https://github.com/apache/apisix/releases/tag/2.4). It is not recommended to use with other Apache APISIX versions.

### Core

- Feat: add rawDataEditor for route, consumer, upstream and service [#1505](https://github.com/apache/apisix-dashboard/pull/1505)
- Feat: online debugging supports file transfer [#1465](https://github.com/apache/apisix-dashboard/pull/1465)
- Feat: support etcd prefix as apisix does [#1477](https://github.com/apache/apisix-dashboard/pull/1477)
- Feat: support changing number of executing cpu cores for manager api [#1569](https://github.com/apache/apisix-dashboard/pull/1569)
- Feat: support plugin template config feature [#1540](https://github.com/apache/apisix-dashboard/pull/1540)
- Feat: improve UI and UE ([#1491](https://github.com/apache/apisix-dashboard/pull/1491), [#1481](https://github.com/apache/apisix-dashboard/pull/1481), [#1479](https://github.com/apache/apisix-dashboard/pull/1479), [#1472](https://github.com/apache/apisix-dashboard/pull/1472), [#1604](https://github.com/apache/apisix-dashboard/pull/1604), [#1603](https://github.com/apache/apisix-dashboard/pull/1603), [#1589](https://github.com/apache/apisix-dashboard/pull/1589), [#1538](https://github.com/apache/apisix-dashboard/pull/1538), [#1580](https://github.com/apache/apisix-dashboard/pull/1580), [#1651](https://github.com/apache/apisix-dashboard/pull/1651), [#1634](https://github.com/apache/apisix-dashboard/pull/1634), [#1641](https://github.com/apache/apisix-dashboard/pull/1641))
- Feat: support yaml to config plugin in plugin config page [#1490](https://github.com/apache/apisix-dashboard/pull/1490)

### Bugfix

- Fix: check name exists when creating or updating a resource [#1606](https://github.com/apache/apisix-dashboard/pull/1606)
- Fix: cannot unmarshal array into go value of type [#1527](https://github.com/apache/apisix-dashboard/pull/1527)
- Fix: change the appended Content-type data to overlay to ensure that the Content-type is unique [#1619](https://github.com/apache/apisix-dashboard/pull/1619)

### Test Case

- Test: add the create and delete plugin in drawer [#1597](https://github.com/apache/apisix-dashboard/pull/1597)
- Test: write backend e2e with ginkgo ([#1501](https://github.com/apache/apisix-dashboard/pull/1501), [#1502](https://github.com/apache/apisix-dashboard/pull/1502), [#1504](https://github.com/apache/apisix-dashboard/pull/1504), [#1518](https://github.com/apache/apisix-dashboard/pull/1518), [#1526](https://github.com/apache/apisix-dashboard/pull/1526), [#1545](https://github.com/apache/apisix-dashboard/pull/1545), [#1550](https://github.com/apache/apisix-dashboard/pull/1550), [#1556](https://github.com/apache/apisix-dashboard/pull/1556), [#1560](https://github.com/apache/apisix-dashboard/pull/1560), [#1561](https://github.com/apache/apisix-dashboard/pull/1561), [#1570](https://github.com/apache/apisix-dashboard/pull/1570), [#1582](https://github.com/apache/apisix-dashboard/pull/1582), [#1593](https://github.com/apache/apisix-dashboard/pull/1593), [#1613](https://github.com/apache/apisix-dashboard/pull/1613))

### Doc

- Docs: Updating docs for backend tests [#1625](https://github.com/apache/apisix-dashboard/pull/1625)

# 2.4.0

This release mainly improves basic features, bugfix and adds test cases.

`Manager API` 2.4 should be used with [Apache APISIX 2.3](https://github.com/apache/apisix/releases/tag/2.3). It is not recommended to use with other Apache APISIX versions.

### Core

- Support to show warning notification when dashboard version not matching apisix. [#1435](https://github.com/apache/apisix-dashboard/pull/1435)
- Support mTLS connection to ETCD. [#1437](https://github.com/apache/apisix-dashboard/pull/1437)
- Support IP allow list. [#1424](https://github.com/apache/apisix-dashboard/pull/1424)
- Support to get manager-api version through API. [#1429](https://github.com/apache/apisix-dashboard/pull/1429)
- Support import route from OpenAPI specification3.0. [#1102](https://github.com/apache/apisix-dashboard/pull/1102)
- Support export route from OpenAPI specification3.0. [#1245](https://github.com/apache/apisix-dashboard/pull/1245)
- Support string type for the script field in Route. [#1289](https://github.com/apache/apisix-dashboard/pull/1289)
- Feat: add script_id field in Route.entity. [#1386](https://github.com/apache/apisix-dashboard/pull/1386)
- Feat: add stop subcommand. [#741](https://github.com/apache/apisix-dashboard/pull/741)
- Feat: add e2e test coverage. [#1270](https://github.com/apache/apisix-dashboard/pull/1270)
- Feat: add returning value for HTTP PUT and PATCH methods. [#1322](https://github.com/apache/apisix-dashboard/pull/1322)
- Feat: user can skip upstream when select service_id [#1302](https://github.com/apache/apisix-dashboard/pull/1302)

### Bugfix

- Fix: add defer recover for goroutines to prevent abnormal crash. [#1419](https://github.com/apache/apisix-dashboard/pull/1419)
- Fix: add version ldflags when building manager-api in Dockerfile. [#1393](https://github.com/apache/apisix-dashboard/pull/1393)
- Fix: Upgrade gjson and protobuf to avoid security problem. [#1366](https://github.com/apache/apisix-dashboard/pull/1366)
- Fix: Incomplete label display. [#1252](https://github.com/apache/apisix-dashboard/pull/1252)
- Fix: Redirect plugin should not show in route step3 [#1276](https://github.com/apache/apisix-dashboard/pull/1276)
- Fix: Editing a Service, the upstream info will be lost. [#1347](https://github.com/apache/apisix-dashboard/pull/1347)

### Test Case

- Use ginkgo framework to do backend E2E testing. [#1319](https://github.com/apache/apisix-dashboard/pull/1319)
- Add action to check the version for release. [#1418](https://github.com/apache/apisix-dashboard/pull/1418)
- Add test for make build. [#1421](https://github.com/apache/apisix-dashboard/pull/1421)
- Remove the etcd dependency in part of unit test. [#1169](https://github.com/apache/apisix-dashboard/pull/1469)
- Skip Cypress binary install when build. [#1248](https://github.com/apache/apisix-dashboard/pull/1248)
- Enhance plugin schema smoke test [#1261](https://github.com/apache/apisix-dashboard/pull/1261)
- Delete unnecessary wait in front-end test. [#1370](https://github.com/apache/apisix-dashboard/pull/1370)
- Add edit the plugin testcase [#1372](https://github.com/apache/apisix-dashboard/pull/1372)

### Doc

- Doc: add document for introducing backend e2e test. [#1381](https://github.com/apache/apisix-dashboard/pull/1381)

# 2.3.0

### Core

* Support to use absolute path in conf.WebDir. [#1055](https://github.com/apache/apisix-dashboard/pull/1055)
* Support to search route by label. [#1061](https://github.com/apache/apisix-dashboard/pull/1061)
* Support server info preview. [#958](https://github.com/apache/apisix-dashboard/pull/958) [#949](https://github.com/apache/apisix-dashboard/pull/949)
* Support custom port for Upstream module. [#1078](https://github.com/apache/apisix-dashboard/pull/1078)
* Support to show plugin type and other properties [#1111](https://github.com/apache/apisix-dashboard/pull/1111)
* Support websocket for Route module. [#1079](https://github.com/apache/apisix-dashboard/pull/1079)
* Support Service module on the frontend. [#1089](https://github.com/apache/apisix-dashboard/pull/1089)
* Support group for Route module. [#999](https://github.com/apache/apisix-dashboard/pull/999)
* Support Global Plugin. [#1057](https://github.com/apache/apisix-dashboard/pull/1057) [#1106](https://github.com/apache/apisix-dashboard/pull/1106)
* Support Version Manager. [#1157](https://github.com/apache/apisix-dashboard/pull/1157)
* Use Cobra as the cli scaffold. [#773](https://github.com/apache/apisix-dashboard/pull/773)
* Remove Lua dependency. [#1083](https://github.com/apache/apisix-dashboard/pull/1083)
* Improve E2E testcases for the backend. [#1012](https://github.com/apache/apisix-dashboard/pull/1012), [#1123](https://github.com/apache/apisix-dashboard/pull/1123)
* Improve E2E testcases for the frontend. [#1074](https://github.com/apache/apisix-dashboard/pull/1074)
* Improve online debug. [#979](https://github.com/apache/apisix-dashboard/pull/979)
* Improve Route publish/offline. [#1081](https://github.com/apache/apisix-dashboard/pull/1081) [#991](https://github.com/apache/apisix-dashboard/pull/991)
* Improve plugin module for the frontend. [#1047](https://github.com/apache/apisix-dashboard/pull/1047) [#978](https://github.com/apache/apisix-dashboard/pull/978)
* Fix error occurred when enable or disable existing SSL [#1064](https://github.com/apache/apisix-dashboard/pull/1064)
* Fix the problem that route created by Admin API (without ID) cannot be shown in Manager API. [#1063](https://github.com/apache/apisix-dashboard/pull/1063)

# 2.2.0

This release mainly improve basic features, bugfix and adds test cases.

`Manager API` 2.2 should be used with [Apache APISIX 2.1](https://github.com/apache/apisix/releases/tag/2.1). It is not recommended to use with other Apache APISIX versions.

### Core

- Support access log for Manager API. [#994](https://github.com/apache/apisix-dashboard/pull/994)
- Enhance error log for Manager API. [#977](https://github.com/apache/apisix-dashboard/pull/977)
- Integrate with code-mirror to have a fallback to plugins render issue. [#898](https://github.com/apache/apisix-dashboard/pull/898)
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

# 1.0.0

This release is mainly to build some basic panels and resolve License issue.

### Core

- Dashboard initial. [#1](https://github.com/apache/apisix-dashboard/pull/1)
- Resolve licence issues.
- Remove unused files from the Dashboard boilerplate.
- Support panel to list, create and modify Route, Consumer, Service, SSL and Upstream.
- Support custom configuration for Plugin dialog.

[Back to TOC](#table-of-contents)
