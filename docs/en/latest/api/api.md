---
title: API doc of Manager API.
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

## Description

Manager API directly operates ETCD and provides data management for Apache APISIX, provides APIs for Front-end or other clients.

We could pass parameters to APIs to control APISIX Nodes. To have a better understanding about how it works, please see [README](https://github.com/apache/apisix-dashboard/blob/master/README.md).

9000 is the default port on which the Manager API listens. You could take another port by modifying the [conf/conf.yaml](https://github.com/apache/apisix-dashboard/blob/master/api/conf/conf.yaml) file.

## Authentication

Before invoking other APIs, you need to log in first.


### /apisix/admin/user/login

#### POST
##### Description:

User login

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |


##### Request Body

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| username | string | the username of your account | Yes |
| password | string | the password of your account | Yes |


##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | success | [Universal Response Data](#universal_response_data) |

##### Responses Data

| Name | Type | Description |
| ---- | ---- | ----------- |
| token | string | The token signed after user login. Other APIs need to carry the token for identity verification.|


#### Example

```shell
# Create a route
$ curl http://127.0.0.1:9000/apisix/admin/user/login -X POST -i -d '
{
    "username": "admin",
    "password": "admin"
}'

HTTP/1.1 200 OK
...

{"code":0,"message":"","data":{"token":"token-returned-by-login-api"},"request_id":"cd53eef7-56e2-4a74-a91d-e48c6e0a0107"}

```

***Note: `token-returned-by-login-api` is a fake token, just to facilitate the following interface examples. In actual use, the content returned by the interface shall prevail.***

### /apisix/admin/server_info

#### GET
##### Description:

Get the list of APISIX server info

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| page | query | The current page number  | No | string |
| page_size | query | The number of data returned per page | No | string |
| hostname | query |  | No | string |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | success | [Universal Response List](#universal_response_data) |


##### Responses Data

| Name | Type | Description |
| ---- | ---- | ----------- |
| id | string | ID of APISIX servers. |
| last_report_time | int64 | The last time the plugin reported data. |
| up_time | int64 | How long the APISIX is running. Unit is second. |
| boot_time | int64 | The time when APISIX booting up. |
| etcd_version | string | The version of ETCD. |
| hostname | string | The hostname of the APISIX server. |
| version | string | The version of APISIX. |

### Example

```shell
curl http://127.0.0.1:9000/apisix/admin/server_info -i -H "Authorization: token-returned-by-login-api"
HTTP/1.1 200 OK
……
{
    "code": 0,
    "message": "",
    "data": {
        "rows": [
            {
                "id": "4dcb6162-76e5-427d-9600-a1fcfbf73ef4",
                "last_report_time": 1619061922,
                "up_time": 69220,
                "boot_time": 1618992702,
                "etcd_version": "3.4.0",
                "hostname": "MacBook-Pro.local",
                "version": "2.5"
            }
        ],
        "total_size": 1
    },
    "request_id": "66af3c70-963a-4cc5-8977-b11f306fe484"
}
```


### /apisix/admin/server_info/{id}

#### GET
##### Description:

Get the APISIX server info by id


##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| id | path | ID of APISIX server | Yes | string |


##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | success | [Universal Response List](#universal_response_data) |


##### Responses Data

| Name | Type | Description |
| ---- | ---- | ----------- |
| id | string | ID of APISIX servers. |
| last_report_time | int64 | The last time the plugin reported data. |
| up_time | int64 | How long the APISIX is running. Unit is second. |
| boot_time | int64 | The time when APISIX booting up. |
| etcd_version | string | The version of ETCD. |
| hostname | string | The hostname of the APISIX server. |
| version | string | The version of APISIX. |


```sh
curl http://127.0.0.1:9000/apisix/admin/server_info/4dcb6162-76e5-427d-9600-a1fcfbf73ef4 -i -H "Authorization: token-returned-by-login-api"
HTTP/1.1 200 OK
……
{
    "code": 0,
    "message": "",
    "data": {
        "id": "4dcb6162-76e5-427d-9600-a1fcfbf73ef4",
        "last_report_time": 1621346343,
        "up_time": 204678,
        "boot_time": 1621141665,
        "etcd_version": "3.4.0",
        "hostname": "MacBook-Pro.local",
        "version": "2.5"
    },
    "request_id": "fa2b9c86-71ef-43fa-bbf9-cf6c4fef6f8f"
}
```



### /apisix/admin/routes

#### POST
##### Description:

Create a route, and ID is generated by server

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| data | body | The request body | Yes | [route](#route) |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | success | [route](#route) |

#### GET
##### Description:

Get the list of route

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| page | query | The current page number | No | int |
| page_size | query | The number of data returned per page | No | int |
| name | query | Keyword to search by name | No | string |
| uri | query | Keyword to search by uri | No | string |
| label | query | Keyword to search by label | No | string |
| status | query | Keyword to search by status | No | int |


##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | success | object |

#### PUT
##### Description:

Update the route by ID

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| id | path | ID of the route | No | string |
| data | body | The request body | Yes | [route](#route) |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | success | object |

### /apisix/admin/routes/{id}

#### DELETE
##### Description:

Delete the route by ID

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| id | path | ID of the route | Yes | string |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | success | [universal_response_data](#universal_response_data) |

#### GET
##### Description:

Get the specified route by ID

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| id | path | The id of route | Yes | string |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | success | [route](#route) |

#### PUT
##### Description:

Update the specified route by ID

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| id | path | ID of the route | Yes | string |
| data | body | The request body | Yes | [route](#route) |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | success | object |

#### PATCH
##### Description:

Partial update the specified route

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| id | path | ID of the route | Yes | string |
| data | body | The request body | Yes | any part of [route](#route) |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | success | object |

### /apisix/admin/notexist/routes

#### GET
##### Description:

Return result of route exists checking by name and exclude id.

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| name | query | Name of route | Yes | string |
| exclude | query | ID of route that exclude checking | No | string |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | success | [universal_response_data](#universal_response_data) |

### /apisix/admin/routes/{id}/{path}

#### PATCH
##### Description:

Partial update the specified route by ID and sub path

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| id | path | ID of the route | Yes | string |
| path | path | json path of [route](#route) | Yes | string |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | success | object |


### /apisix/admin/schema/plugins/{name}

#### GET
##### Description:

Get the plugin schema by name

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| schema_type | query | Scheme type(consumer or route) | No | string |
| name | path | Name of the plugin | Yes | string |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | success | object |

### /apisix/admin/schemas/{resource}

#### GET
##### Description:

Get the schema by resource name

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| resource | path | Resource name(such as route) | Yes | string |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | success | object |

### /apisix/admin/plugins

#### GET
##### Description:

Get the schema of plugin

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| all | query | Whether to get the list of all plugins | No | string |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | success | object |


### /apisix/admin/check_ssl_exists

#### POST
##### Description:

Check if the SSL configuration exists

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| hosts | body | Search whether the sni of the certificate matches | Yes | string array |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | success | [universal_response_data](#universal_response_data) |

### /apisix/admin/check_ssl_cert

#### POST
##### Description:

Check whether the SSL configuration is legal

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| data | body | The request body | Yes | [ssl](#ssl) |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | success | object |


### /apisix/admin/tool/version_match

#### GET
##### Description:

Check if dashboard and apisix match

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | success | [universal_response_data](#universal_response_data) |

### /apisix/admin/tool/version

#### GET
##### Description:

Get the dashboard's version and commit hash

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | success | [universal_response_data](#universal_response_data) |

### /apisix/admin/notexist/upstreams

#### GET
##### Description:

Check if the upstream is existed

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| name | query | Name of upstream | Yes | string |
| exclude | query | ID of upstream that exclude checking | No | string |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | success | [universal_response_data](#universal_response_data) |


### /apisix/admin/names/upstreams

#### GET
##### Description:

List the upstream's name and id

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | success | object |


### /apisix/admin/labels/{type}

#### GET
##### Description:

Return the labels list among `route,ssl,consumer,upstream,service`

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| page | query | page number | No | integer |
| page_size | query | page size | No | integer |
| label | query | Keyword to search by label | No | string |
| type | path | Keyword to search by type | Yes | string |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | success | [ [universal_response_data](#universal_response_data) ] |


### /apisix/admin/export/routes

#### GET
##### Description:

Export all route data

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | success | object |

### /apisix/admin/export/routes/{id}

#### GET
##### Description:

Export route data that specify by id

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| id | path | ID of the route | Yes | string |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | success | object |

### /apisix/admin/import/routes

#### POST
##### Description:

Import route data from swagger data

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| file | formData | swagger file | Yes | file |
| force | formData | whether to force import | No | boolean |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | success | [universal_response_data](#universal_response_data) |


### /ping

#### GET
##### Description:

Check the alive status of the Manager API

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | success | [universal_response_data](#universal_response_data) |


### Models


#### page

Use for page list

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| page_size | integer | The number of data returned per page | Yes |
| page | integer | The current page number | Yes |

#### universal_response_data

universal response data

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| code | string | Business status code | Yes |
| message | string | Prompt information, used for error messages, etc. | Yes |
| request_id | string | The unique id of the request | Yes |
| data | object | Responsive business data | Yes |

#### service

服务

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| id | string |  | No |
| create_time | string |  | No |
| update_time | string |  | No |
| name | string |  | No |
| desc | string |  | No |
| upstream | [upstream_def](#upstream_def) |  | No |
| upstream_id | integer |  | No |
| plugins | string |  | No |
| script | string |  | No |
| labels | string |  | No |
| enable_websocket | boolean |  | No |

#### server_info

server info

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| last_report_time | number | The time when the node last reported data | No |
| up_time | number | Cumulative running time of the node | No |
| boot_time | number | Node startup time | No |
| etcd_version | string | The version number of ETCD | No |
| hostname | string | The hostname of the node | No |
| version | string | The APISIX version of the node | No |

#### base_info

basic info

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| id | string |  | Yes |
| create_time | string |  | Yes |
| update_time | string |  | Yes |

#### node

upstream node info

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| host | string |  | Yes |
| port | integer |  | Yes |
| weight | integer |  | Yes |
| metadata | object |  | Yes |

#### upstream_def

upstream define

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| nodes | [node](#node) |  | Yes |
| retries | integer |  | Yes |
| type | string |  | Yes |
| checks | object |  | Yes |
| hash_on | string |  | Yes |
| key | string |  | Yes |
| scheme | string |  | Yes |
| discovery_type | string |  | Yes |
| pass_host | string |  | Yes |
| upstream_host | string |  | Yes |
| name | string |  | Yes |
| desc | string |  | Yes |
| service_name | string |  | Yes |
| labels | string |  | Yes |

#### ssl

ssl

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| cert | string | https certificate | Yes |
| certs | [ string ] | when you need to configure multiple certificate for the same domain, you can pass extra https certificates (excluding the one given as cert) in this field | No |
| create_time | integer | epoch timestamp in second, will be created automatically if missing | No |
| exptime | integer |  | No |
| id | string |  | No |
| key | string | https private key  | Yes |
| keys | [ string ] | https private keys. The keys should be paired with certs above | No |
| labels | object | key/value pairs to specify attributes | No |
| sni | string |  | No |
| snis | [ string ] | a non-empty arrays of https SNI | Yes |
| status | integer | ssl status, 1 to enable, 0 to disable | No |
| update_time | integer | epoch timestamp in second, will be created automatically if missing | No |
| validity_end | integer |  | No |
| validity_start | integer |  | No |

#### plugin_config

plugin config

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| create_time | integer | epoch timestamp in second, will be created automatically if missing | No |
| desc | string | description, usage scenarios, and more. | No |
| id | string |  | Yes |
| labels | object | key/value pairs to specify attributes | No |
| plugins | object | See Plugin | Yes |
| update_time | integer | epoch timestamp in second, will be created automatically if missing | No |

#### consumer

consumer

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| create_time | integer | epoch timestamp in second, will be created automatically if missing	 | No |
| desc | string | Identifies route names, usage scenarios, and more. | No |
| id | string |  | No |
| labels | object | Key/value pairs to specify attributes | No |
| plugins | object | See Plugin for more | No |
| update_time | integer | epoch timestamp in second, will be created automatically if missing	 | No |
| username | string | Consumer name | Yes |

#### upstream

upstream

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| checks | object |  | Yes |
| create_time | integer | epoch timestamp in second, like 1602883670, will be created automatically if missing | Yes |
| desc | string | upstream usage scenarios, and more. | Yes |
| discovery_type | string | the type of service discovery, see discovery for more details | Yes |
| enable_websocket | boolean | enable websocket for request | Yes |
| hash_on | string | This option is only valid if the type is chash. Supported types vars(Nginx variables), header(custom header), cookie, consumer, the default value is vars. | Yes |
| id | string |  | Yes |
| key | string | This option is only valid if the type is chash. Find the corresponding node id according to hash_on and key. When hash_on is set as vars, key is the required parameter, for now, it support nginx built-in variables like uri, server_name, server_addr, request_uri, remote_port, remote_addr, query_string, host, hostname, arg_***, arg_*** is arguments in the request line, Nginx variables list. When hash_on is set as header, key is the required parameter, and header name is customized. When hash_on is set to cookie, key is the required parameter, and cookie name is customized. When hash_on is set to consumer, key does not need to be set. In this case, the key adopted by the hash algorithm is the consumer_name authenticated. If the specified hash_on and key can not fetch values, it will be fetch remote_addr by default. | Yes |
| labels | object | Key/value pairs to specify attributes | Yes |
| name | string | Identifies upstream names | Yes |
| nodes | [  ] | Hash table or array. If it is a hash table, the key of the internal element is the upstream machine address list, the format is Address + (optional) Port, where the address part can be IP or domain name, such as 192.168.1.100:80, foo.com:80, etc. The value is the weight of node. If it is an array, each item is a hash table with key host/weight and optional port/priority. The nodes can be empty, which means it is a placeholder and will be filled later. Clients use such an upstream will get 502 response. | Yes |
| pass_host | string | host option when the request is sent to the upstream, can be one of [pass, node, rewrite], the default option is pass. pass: Pass the client's host transparently to the upstream; node: Use the host configured in the node of upstream; rewrite: Use the value of the configuration upstream_host. | Yes |
| retries | integer |  | Yes |
| scheme | string | The scheme used when talk with the upstream. The value is one of ['http', 'https', 'grpc', 'grpcs'], default to 'http'. | Yes |
| service_name | string | the name of service used in the service discovery, see discovery for more details | Yes |
| timeout | object | Set the timeout for connection, sending and receiving messages. | Yes |
| type | string | algorithms of load balancing | Yes |
| update_time | integer | epoch timestamp in second, like 1602883670, will be created automatically if missing | Yes |
| upstream_host | string | Specify the host of the upstream request. This option is only valid if the pass_host is rewrite. | Yes |

#### route

route

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| create_time | integer | epoch timestamp in second, will be created automatically if missing	 | No |
| desc | string | route description, usage scenarios, and more. | No |
| enable_websocket | boolean | enable websocket for request | No |
| filter_func | string | User-defined filtering function. You can use it to achieve matching requirements for special scenarios. This function accepts an input parameter named vars by default, which you can use to get Nginx variables.	 | No |
| host | string | Currently requesting a domain name, such as foo.com; PAN domain names such as *.foo.com are also supported.	 | No |
| hosts | [ string ] | The host in the form of a non-empty list means that multiple different hosts are allowed, and match any one of them.	 | No |
| id | string |  | Yes |
| labels | object | Key/value pairs to specify attributes	 | No |
| methods | [ string ] | If empty or without this option, there are no method restrictions, and it can be a combination of one or more: GET,POST,PUT,DELETE,PATCH, HEAD,OPTIONS,CONNECT,TRACE.	 | No |
| name | string | Identifies route names. | No |
| plugin_config_id | string |  | No |
| plugins | object |  | No |
| priority | integer | If different routes contain the same uri, determine which route is matched first based on the attribute priority. Larger value means higher priority. The default value is 0.	 | No |
| remote_addr | string | The client requests an IP address: 192.168.1.101, 192.168.1.102, and CIDR format support 192.168.1.0/24. In particular, APISIX also fully supports IPv6 address matching: ::1, fe80::1, fe80::1/64, etc.	 | No |
| remote_addrs | [ string ] | The remote_addr in the form of a non-empty list indicates that multiple different IP addresses are allowed, and match any one of them.	 | No |
| script | string |  | No |
| script_id | string |  | No |
| service_id | string |  | No |
| service_protocol | string |  | No |
| status | integer | route status, 1 to enable, 0 to disable | No |
| update_time | integer | epoch timestamp in second, will be created automatically if missing	 | No |
| upstream | object |  | No |
| upstream_id | string |  | No |
| uri | string | In addition to full matching such as /foo/bar、/foo/gloo, using different Router allows more advanced matching, see Router for more. | No |
| uris | [ string ] | The uri in the form of a non-empty list means that multiple different uris are allowed, and match any one of them. | No |
| vars | [ string ] | A list of one or more {var, operator, val} elements, like this: {{var, operator, val}, {var, operator, val}, ...}}. For example: {"arg_name", "==", "json"} means that the current request parameter name is json. The var here is consistent with the internal variable name of Nginx, so you can also use request_uri, host, etc. For more details, see lua-resty-expr | No |

#### global_rule

global rule

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| create_time | integer | epoch timestamp in second, will be created automatically if missing	 | No |
| id | string |  | No |
| plugins | object | a set of plugin config | Yes |
| update_time | integer | epoch timestamp in second, will be created automatically if missing	 | No |

#### route_old

路由

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| id | string |  | No |
| create_time | string |  | No |
| update_time | string |  | No |
| uri | string |  | Yes |
| uris | [ string ] |  | Yes |
| name | string |  | Yes |
| desc | string |  | Yes |
| priority | number |  | Yes |
| methods | [ string ] |  | Yes |
| host | string |  | Yes |
| hosts | [ string ] |  | Yes |
| remote_addr | string |  | Yes |
| remote_addrs | [ string ] |  | Yes |
| vars | [ string ] |  | Yes |
| filter_func | string |  | Yes |
| script | string |  | Yes |
| script_id | number |  | Yes |
| plugins | string |  | Yes |
| plugin_config_id | number |  | Yes |
| upstream | [upstream_def](#upstream_def) |  | Yes |
| service_id | number |  | Yes |
| upstream_id | number |  | Yes |
| service_protocol | string |  | Yes |
| labels | string |  | Yes |
| enable_websocket | boolean |  | Yes |
| status | integer |  | Yes |