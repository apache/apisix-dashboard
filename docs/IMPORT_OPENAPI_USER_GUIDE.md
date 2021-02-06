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

# Import OpenApi User Guide

> The OpenAPI Specification (OAS) defines a standard, language-agnostic interface to RESTful APIs which allows both humans and computers to discover and understand the capabilities of the service without access to source code, documentation, or through network traffic inspection.

Apache APISIX Dashboard supports importing [OpenApi3.0](https://swagger.io/specification/)(we will use OAS3.0 for short) files to create the Route. Currently we support support most of the OpenApi specifications, but there are some differences, which are in terms of compatibility and extended fields.

## OAS3.0 Compatibility

when we import routes from OAS3.0, some fields in OAS will be missed because there are not corresponding fields in APISIX's Route:

1. [API General Info](https://swagger.io/docs/specification/api-general-info/): used to describe the general information about your API, some times, a oas file contains a series of apis which belong to a app, so this info is different from the api's name and extra basic info.

2. [API server and base path](https://swagger.io/docs/specification/api-host-and-base-path/): upsream url + url prefix(options).

3. [Path params](https://swagger.io/docs/specification/describing-parameters/): api params described in path.

4. [Query params](https://swagger.io/docs/specification/describing-parameters/): api params described in query.

5. [Responses description and links](https://swagger.io/docs/specification/describing-responses/): Define the responses for a API operations.

## Extended fields

There are some fields required in APISIX Route but are not included in the properties of OAS3.0, we added some extended fields such as upstream, plugins, hosts and so on. All extensions start with x-apisix. See [reference](https://github.com/apache/apisix/blob/master/doc/admin-api.md#route) For more details of the APISIX Route Properties

| Extended fields           | APISIX Route Properties          |
| --------------------------| -------------------------------- |
| x-apisix-plugins          | plugins                          |
| x-apisix-script           | script                           |
| x-apisix-upstream         | upstream                         |
| x-apisix-service_protocol | service_protocol                 |
| x-apisix-host             | host                             |
| x-apisix-hosts            | hosts                            |
| x-apisix-remote_addr      | remote_addr                      |
| x-apisix-priority         | priority                         |
| x-apisix-vars             | vars                             |
| x-apisix-filter_func      | filter_func                      |
| x-apisix-labels           | labels                           |
| x-apisix-enable_websocket | enable_websocket                 |
| x-apisix-status           | status                           |
| x-apisix-create_time      | create_time                      |
| x-apisix-update_time      | update_time                      |
