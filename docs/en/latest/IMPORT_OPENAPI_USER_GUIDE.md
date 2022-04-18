---
title: Import OpenAPI Guide
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

## Overview

The OpenAPI Specification (OAS) defines a standard, language-agnostic interface to RESTful APIs which allows both humans and computers to discover and understand the capabilities of the service without access to source code, documentation, or through network traffic inspection.

Apache APISIX Dashboard supports importing [OpenApi3.0](https://swagger.io/specification/)(we will use OAS3.0 for short) files, both `json` and `yaml` are supported, to create one or more Routes. Currently we support most of the OpenApi specifications, but there are some differences, which are in terms of compatibility and extended fields.

## Extended fields

There are some fields required in APISIX Route but are not included in the properties of OAS3.0, in order to provide convenience for extending custom route entities based on OAS3.0, we added some extended fields such as upstream, plugins, hosts and so on. All extensions start with x-apisix.

| Extended fields           | APISIX Route Properties |
| ------------------------- | ----------------------- |
| x-apisix-plugins          | plugins                 |
| x-apisix-script           | script                  |
| x-apisix-upstream         | upstream                |
| x-apisix-host             | host                    |
| x-apisix-hosts            | hosts                   |
| x-apisix-remote_addr      | remote_addr             |
| x-apisix-priority         | priority                |
| x-apisix-vars             | vars                    |
| x-apisix-filter_func      | filter_func             |
| x-apisix-labels           | labels                  |
| x-apisix-enable_websocket | enable_websocket        |
| x-apisix-status           | status                  |
| x-apisix-service_id       | service_id              |
| x-apisix-upstream_id      | upstream_id             |

Please pay attention that we only extended the first level of the field, and the sub level fields will still keep the same. Just take `x-apisix-upstream` for an example.

```yaml
...
# we add x-apisix-upstream as an extended field in OAS3.0 to stand for upstream
x-apisix-upstream:
  # the sub fields of x-apisix-upstream still keeps the same as upstream's sub fields
  type: roundrobin
  nodes:
    - host: 172.16.238.20
      port: 1980
      weight: 1
...
```

See [reference](https://apisix.apache.org/docs/apisix/admin-api/#route) for more details of the APISIX Route Properties

## OAS3.0 Compatibility

When we import routes from OAS3.0, some fields in OAS3.0 will be missed because there are not corresponding fields in APISIX's Route:

1. [API General Info](https://swagger.io/docs/specification/api-general-info/): used to describe the general information about your API, some times, a OAS3.0 file contains a series of apis which belong to a app, so this info is different from the api's name and extra basic info.

**Example:**

```yaml
# this part of information will be missed
openapi: 3.0.0
info:
  version: 1.0.0-oas3
  description: test desc
  license:
    name: Apache License 2.0
    url: 'http://www.apache.org/licenses/LICENSE-2.0'
  title: test title
...
```

2. [API server and base path](https://swagger.io/docs/specification/api-host-and-base-path/): upstream url + url prefix(options).

**Example:**

```yaml
# this part of information will be missed
...
servers:
  - url: https://api.example.com/v1
...
```

3. [Path params](https://swagger.io/docs/specification/describing-parameters/): api params described in path.

**Example:**

```yaml
# no matter how many path parameters in the uri
# we will got the route with uri like `/get/*` after import route from OAS3.0 file
...
paths:
  /get/{id}/{name}:
    delete:
      operationId: api1DELETE
...
```

4. [Query params](https://swagger.io/docs/specification/describing-parameters/): api params described in query.

**Example:**

```yaml
...
paths:
  /users:
    get:
      summary: Get a user by ID
      # this part of information will be missed
      parameters:
        - in: path
          name: userId
          schema:
            type: integer
          required: true
          description: Numeric ID of the user to get
...
```

5. [Responses description and links](https://swagger.io/docs/specification/describing-responses/): Define the responses for a API operations.

**Example:**

```yaml
...
paths:
  /hello:
    get:
      description: hello world.
      operationId: hello
      x-apisix-service_id: service1
      # this part of information will be missed
      responses:
        '200':
          description: list response
        default:
          description: unexpected error
...
```

## Examples about how to Configure the OAS3.0 in different user scenarios

### Configure a basic published route

_notice: the default `status` of the imported route will be `unpublished`, which means the route can not be accessed, if you want to import a `published` route, you should add `x-apisix-status: 1` in you OAS3.0 file_

```yaml
openapi: 3.0.0
info:
  version: 1.0.0-oas3
  description: test desc
  license:
    name: Apache License 2.0
    url: 'http://www.apache.org/licenses/LICENSE-2.0'
  title: test title
paths:
  /hello: # route uri
    get: # route method
      description: hello world. # route desc
      operationId: hello # route name
      x-apisix-upstream: # route upstream
        type: roundrobin
        nodes:
          - host: 172.16.238.20
            port: 1980
            weight: 1
      x-apisix-status: 1 # the route will be published after imported
      responses:
        '200':
          description: list response
        default:
          description: unexpected error
```

### configure a route with plugins

_notice: most plugins supported by extended field `x-apisix-plugins`_

```yaml
openapi: 3.0.0
info:
  version: 1.0.0-oas3
  description: test desc
  license:
    name: Apache License 2.0
    url: 'http://www.apache.org/licenses/LICENSE-2.0'
  title: test title
paths:
  /hello:
    get:
      description: hello world.
      operationId: hello
      x-apisix-upstream:
        type: roundrobin
        nodes:
          - host: 172.16.238.20
            port: 1980
            weight: 1
      x-apisix-plugins:
        limit-count:
          count: 2
          time_window: 60
          rejected_code: 503
          key: remote_addr
          policy: local
      responses:
        '200':
          description: list response
        default:
          description: unexpected error
```

### configure a route with parameters validation

_notice: for plugin [request-validation](https://apisix.apache.org/docs/apisix/plugins/request-validation), we will use [Parameter Serialization](https://swagger.io/docs/specification/serialization/) for header parameters validation and [Describing Request Body](https://swagger.io/docs/specification/describing-request-body/) for body parameters validation in OAS3.0_

```yaml
openapi: 3.0.0
info:
  version: "1"
  description: |-
    test desc
  license:
    name: Apache License 2.0
    url: http://www.apache.org/licenses/LICENSE-2.0
  title: |-
    test title
paths:
  /hello:
    post:
      description: |-
        hello world.
      operationId: hello
      x-apisix-upstream:
        type: roundrobin
        nodes:
          - host: "172.16.238.20"
            port: 1980
            weight: 1
      parameters:
        - name: id
          in: header
          description: ID of pet to use
          required: true
          schema:
            type: string
          style: simple

      requestBody:
        content:
          'application/x-www-form-urlencoded':
            schema:
              properties:
                name:
                  description: Update pet's name
                  type: string
                status:
                  description: Updated status of the pet
                  type: string
              required:
                - status
      responses:
        200:
          description: list response
        default:
          description: unexpected error
```

### configure a route with auth plugins

_notice: for plugin [basic-auth](https://apisix.apache.org/docs/apisix/plugins/basic-auth)、[jwt-auth](https://apisix.apache.org/docs/apisix/plugins/jwt-auth) and [key-auth](https://apisix.apache.org/docs/apisix/plugins/key-auth) we will use [Authentication](https://swagger.io/docs/specification/authentication/) in OAS3.0_

```yaml
components:
  securitySchemes:
    basicAuth:
      type: http
      scheme: basic
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
    ApiKeyAuth:
      type: apiKey
      in: header
      name: X-API-Key
openapi: 3.0.0
info:
  version: "1"
  description: |-
    test desc
  license:
    name: Apache License 2.0
    url: http://www.apache.org/licenses/LICENSE-2.0
  title: |-
    test title
paths:
  /hello:
    post:
      description: |-
        hello world.
      operationId: hello
      x-apisix-upstream:
        type: roundrobin
        nodes:
          - host: "172.16.238.20"
            port: 1980
            weight: 1
      security:
        - basicAuth: []
        - ApiKeyAuth: []
        - BearerAuth: []
      responses:
        200:
          description: list response
        default:
          description: unexpected error
```

### configure a route with exist service or upstream

_notice: if the `service_id` or `upstream_id` does not exist in APISIX, import route from the config file will get an error_

```yaml
openapi: 3.0.0
info:
  version: 1.0.0-oas3
  description: test desc
  license:
    name: Apache License 2.0
    url: 'http://www.apache.org/licenses/LICENSE-2.0'
  title: test title
paths:
  /hello:
    get:
      description: hello world.
      operationId: hello
      x-apisix-service_id: service1
      responses:
        '200':
          description: list response
        default:
          description: unexpected error
```

### configure more than one route

```yaml
info:
  title: RoutesExport
  version: 3.0.0
openapi: 3.0.0
paths:
  /get:
    delete:
      operationId: api1Delete
      requestBody: {}
      responses:
        default:
          description: ''
      x-apisix-enableWebsocket: false
      x-apisix-labels:
        API_VERSION: v2
        dev: test
      x-apisix-plugins:
        proxy-rewrite:
          disable: false
          scheme: https
      x-apisix-priority: 0
      x-apisix-status: 1
      x-apisix-upstream:
        nodes:
          - host: httpbin.org
            port: 443
            weight: 1
        type: roundrobin
        pass_host: node
      x-apisix-vars: []
    get:
      operationId: api1Get
      requestBody: {}
      responses:
        default:
          description: ''
      x-apisix-enableWebsocket: false
      x-apisix-labels:
        API_VERSION: v2
        dev: test
      x-apisix-plugins:
        proxy-rewrite:
          disable: false
          scheme: https
      x-apisix-priority: 0
      x-apisix-status: 1
      x-apisix-upstream:
        nodes:
          - host: httpbin.org
            port: 443
            weight: 1
        type: roundrobin
        pass_host: node
      x-apisix-vars: []
  /post:
    post:
      operationId: test_post
      requestBody: {}
      responses:
        default:
          description: ''
      security: []
      x-apisix-enableWebsocket: false
      x-apisix-labels:
        API_VERSION: v1
        version: v1
      x-apisix-plugins:
        proxy-rewrite:
          disable: false
          scheme: https
      x-apisix-priority: 0
      x-apisix-status: 1
      x-apisix-upstream:
        nodes:
          - host: httpbin.org
            port: 443
            weight: 1
        type: roundrobin
        pass_host: node
      x-apisix-vars: []
```
