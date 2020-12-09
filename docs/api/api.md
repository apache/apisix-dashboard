# API doc of Manager API.
It's used to manage etcd and provide APIs to the frontend interface.

## Version: 2.2

**License:** [Apache License 2.0](http://www.apache.org/licenses/LICENSE-2.0)

### /apisix/admin/check_ssl_cert

#### POST
##### Summary:

verify SSL cert and key

##### Description:

verify SSL cert and key

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| cert | body | cert of SSL | Yes | string |
| key | body | key of SSL | Yes | string |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 0 | SSL verify passed | [ApiError](#ApiError) |
| default | unexpected error | [ApiError](#ApiError) |

### /apisix/admin/check_ssl_exists

#### POST
##### Summary:

check SSL exists or not

##### Description:

check SSL exists or not by sni

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| cert | body | cert of SSL | Yes | string |
| key | body | key of SSL | Yes | string |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 0 | SSL exists | [ApiError](#ApiError) |
| default | unexpected error | [ApiError](#ApiError) |

### /apisix/admin/consumers

#### GET
##### Summary:

Returns consumer list

##### Description:

Return the consumer list according to the specified page number and page size, and can search by username

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| page | query | page number | No | integer |
| page_size | query | page size | No | integer |
| username | query | username of consumer | No | string |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 0 | list response | [ [consumer](#consumer) ] |
| default | unexpected error | [ApiError](#ApiError) |

### /apisix/admin/notexist/routes

#### GET
##### Summary:

Returns result of route exists checking

##### Description:

Returns result of route exists checking by name and exclude id

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| name | query | name of route | No | string |
| exclude | query | id of route that exclude checking | No | string |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 0 | route not exists | [ApiError](#ApiError) |
| default | unexpected error | [ApiError](#ApiError) |

### /apisix/admin/routes

#### GET
##### Summary:

Returns route list

##### Description:

Return the route list according to the specified page number and page size, and can search by name and uri

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| page | query | page number | No | integer |
| page_size | query | page size | No | integer |
| name | query | name of route | No | string |
| uri | query | uri of route | No | string |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 0 | list response | [ [route](#route) ] |
| default | unexpected error | [ApiError](#ApiError) |

### /apisix/admin/services

#### GET
##### Summary:

Returns service list

##### Description:

Return the service list according to the specified page number and page size, and can search by name

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| page | query | page number | No | integer |
| page_size | query | page size | No | integer |
| name | query | name of service | No | string |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 0 | list response | [ [service](#service) ] |
| default | unexpected error | [ApiError](#ApiError) |

### /apisix/admin/ssl

#### GET
##### Summary:

Returns SSL list

##### Description:

Return the SSL list according to the specified page number and page size, and can search by sni

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| page | query | page number | No | integer |
| page_size | query | page size | No | integer |
| sni | query | sni of SSL | No | string |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 0 | list response | [ [ssl](#ssl) ] |
| default | unexpected error | [ApiError](#ApiError) |

### /apisix/admin/upstreams

#### GET
##### Summary:

Returns upstream list

##### Description:

Return the upstream list according to the specified page number and page size, and can search by name

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| page | query | page number | No | integer |
| page_size | query | page size | No | integer |
| name | query | name of upstream | No | string |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 0 | list response | [ [upstream](#upstream) ] |
| default | unexpected error | [ApiError](#ApiError) |

### /apisix/admin/user/login

#### POST
##### Summary:

user login

##### Description:

user login

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| username | body | user name | Yes | string |
| password | body | password | Yes | string |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 0 | login success | [ApiError](#ApiError) |
| default | unexpected error | [ApiError](#ApiError) |

### Models


#### ApiError

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| code | long | response code | No |
| message | string | response message | No |

#### BaseInfo

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| create_time | long |  | No |
| id | object |  | No |
| update_time | long |  | No |

#### Consumer

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| create_time | long |  | No |
| desc | string |  | No |
| id | object |  | No |
| labels | object |  | No |
| plugins | object |  | No |
| update_time | long |  | No |
| username | string |  | No |

#### LoginInput

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| password | string | password | No |
| username | string | user name | No |

#### Route

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| create_time | long |  | No |
| desc | string |  | No |
| enable_websocket | boolean |  | No |
| filter_func | string |  | No |
| host | string |  | No |
| hosts | [ string ] |  | No |
| id | object |  | No |
| labels | object |  | No |
| methods | [ string ] |  | No |
| name | string |  | No |
| plugins | object |  | No |
| priority | long |  | No |
| remote_addr | string |  | No |
| remote_addrs | [ string ] |  | No |
| script | object |  | No |
| service_id | object |  | No |
| service_protocol | string |  | No |
| update_time | long |  | No |
| upstream | [UpstreamDef](#UpstreamDef) |  | No |
| upstream_id | object |  | No |
| uri | string |  | No |
| uris | [ string ] |  | No |
| vars | object |  | No |

#### SSL

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| cert | string |  | No |
| certs | [ string ] |  | No |
| create_time | long |  | No |
| exptime | long |  | No |
| id | object |  | No |
| key | string |  | No |
| keys | [ string ] |  | No |
| labels | object |  | No |
| sni | string |  | No |
| snis | [ string ] |  | No |
| status | long |  | No |
| update_time | long |  | No |
| validity_end | long |  | No |
| validity_start | long |  | No |

#### Service

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| create_time | long |  | No |
| desc | string |  | No |
| enable_websocket | boolean |  | No |
| id | object |  | No |
| labels | object |  | No |
| name | string |  | No |
| plugins | object |  | No |
| script | string |  | No |
| update_time | long |  | No |
| upstream | [UpstreamDef](#UpstreamDef) |  | No |
| upstream_id | object |  | No |

#### Upstream

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| checks | object |  | No |
| create_time | long |  | No |
| desc | string |  | No |
| hash_on | string |  | No |
| id | object |  | No |
| k8s_deployment_info | object |  | No |
| key | string |  | No |
| labels | object |  | No |
| name | string |  | No |
| nodes | object |  | No |
| pass_host | string |  | No |
| retries | long |  | No |
| service_name | string |  | No |
| timeout | object |  | No |
| type | string |  | No |
| update_time | long |  | No |
| upstream_host | string |  | No |

#### UpstreamDef

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| checks | object |  | No |
| desc | string |  | No |
| hash_on | string |  | No |
| k8s_deployment_info | object |  | No |
| key | string |  | No |
| labels | object |  | No |
| name | string |  | No |
| nodes | object |  | No |
| pass_host | string |  | No |
| retries | long |  | No |
| service_name | string |  | No |
| timeout | object |  | No |
| type | string |  | No |
| upstream_host | string |  | No |