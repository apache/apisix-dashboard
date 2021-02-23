/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package e2e

import (
	"io/ioutil"
	"net/http"
	"strings"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestExport_Route_Data_Empty(t *testing.T) {
	tests := []HttpTestCase{
		{
			Desc:         "Export route when data is empty",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/export/routes",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "{\"code\":10000,\"message\":\"Route data is empty, cannot be exported\",\"data\":null",
		},
	}
	for _, tc := range tests {
		testCaseCheck(tc, t)
	}

}

func TestRoute_Export(t *testing.T) {

	// 1.Export data as the route of URIs Hosts
	exportStrR1 := `
			"/hello_": {
				"get": {
					"operationId": "aaaaGET",
					"requestBody": {},
					"responses": {
						"default": {
							"description": ""
						}
					},
					"security": [],
					"x-apisix-enable_websocket": false,
					"x-apisix-hosts": ["foo.com", "*.bar.com"],
					"x-apisix-labels": {
						"build": "16",
						"env": "production",
						"version": "v2"
					},
					"x-apisix-plugins": {
						"limit-count": {
							"count": 2,
							"key": "remote_addr",
							"rejected_code": 503,
							"time_window": 60
						}
					},
					"x-apisix-priority": 0,
					"x-apisix-status": 1,
					"x-apisix-upstream": {
						"nodes": {
							"172.16.238.20:1980": 1
						},
						"type": "roundrobin"
					}
				},
				"post": {
					"operationId": "aaaaPOST",
					"requestBody": {},
					"responses": {
						"default": {
							"description": ""
						}
					},
					"security": [],
					"x-apisix-enable_websocket": false,
					"x-apisix-hosts": ["foo.com", "*.bar.com"],
					"x-apisix-labels": {
						"build": "16",
						"env": "production",
						"version": "v2"
					},
					"x-apisix-plugins": {
						"limit-count": {
							"count": 2,
							"key": "remote_addr",
							"rejected_code": 503,
							"time_window": 60
						}
					},
					"x-apisix-priority": 0,
					"x-apisix-status": 1,
					"x-apisix-upstream": {
						"nodes": {
							"172.16.238.20:1980": 1
						},
						"type": "roundrobin"
					}
				}
			}`
	exportStrR1 = replaceStr(exportStrR1)

	tests := []HttpTestCase{
		{
			Desc:         "hit route that not exist",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello_",
			Headers:      map[string]string{"Host": "foo.com"},
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   "{\"error_msg\":\"404 Route Not Found\"}\n",
		},
		{
			Desc:   "create route with uris and hosts to test whether the uris parsing is correct",
			Object: ManagerApiExpect(t),
			Method: http.MethodPut,
			Path:   "/apisix/admin/routes/r1",
			Body: `{
				"name": "aaaa",
				"labels": {
					"build":"16",
					"env":"production",
					"version":"v2"
				},
				"plugins": {
					"limit-count": {
						"count": 2,
						"time_window": 60,
						"rejected_code": 503,
						"key": "remote_addr"
					}
				},
				"status": 1,
				"uris": ["/hello_"],
				"hosts": ["foo.com", "*.bar.com"],
				"methods": ["GET", "POST"],
				"upstream": {
					"nodes": {
						"172.16.238.20:1980": 1
					},
					"type": "roundrobin"
				}
			}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:         "export route",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/export/routes/r1",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "{\"components\":{},\"info\":{\"title\":\"RoutesExport\",\"version\":\"3.0.0\"},\"openapi\":\"3.0.0\",\"paths\":{" + exportStrR1 + "}}",
		},
	}
	for _, tc := range tests {
		testCaseCheck(tc, t)
	}

	// 2.Export data as the route of URI host
	exportStrR2 := `
			"/hello2": {
				"get": {
					"operationId": "aaaa2GET",
					"requestBody": {},
					"responses": {
						"default": {
							"description": ""
						}
					},
					"security": [],
					"x-apisix-enable_websocket": false,
					"x-apisix-host": "*.bar.com",
					"x-apisix-labels": {
						"build": "16",
						"env": "production",
						"version": "v2"
					},
					"x-apisix-plugins": {
						"limit-count": {
							"count": 2,
							"key": "remote_addr",
							"rejected_code": 503,
							"time_window": 60
						}
					},
					"x-apisix-priority": 0,
					"x-apisix-status": 1,
					"x-apisix-upstream": {
						"nodes": {
							"172.16.238.20:1980": 1
						},
						"type": "roundrobin"
					}
				},
				"post": {
					"operationId": "aaaa2POST",
					"requestBody": {},
					"responses": {
						"default": {
							"description": ""
						}
					},
					"security": [],
					"x-apisix-enable_websocket": false,
					"x-apisix-host": "*.bar.com",
					"x-apisix-labels": {
						"build": "16",
						"env": "production",
						"version": "v2"
					},
					"x-apisix-plugins": {
						"limit-count": {
							"count": 2,
							"key": "remote_addr",
							"rejected_code": 503,
							"time_window": 60
						}
					},
					"x-apisix-priority": 0,
					"x-apisix-status": 1,
					"x-apisix-upstream": {
						"nodes": {
							"172.16.238.20:1980": 1
						},
						"type": "roundrobin"
					}
				}
			}`
	exportStrR2 = replaceStr(exportStrR2)

	tests2 := []HttpTestCase{
		{
			Desc:         "hit route2 that not exist",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello2",
			Headers:      map[string]string{"Host": "bar.com"},
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   "{\"error_msg\":\"404 Route Not Found\"}\n",
		},
		{
			Desc:   "create route2 with uri and host to test whether the uri parsing is correct",
			Object: ManagerApiExpect(t),
			Method: http.MethodPut,
			Path:   "/apisix/admin/routes/r2",
			Body: `{
				"name": "aaaa2",
				"labels": {
					"build":"16",
					"env":"production",
					"version":"v2"
				},
				"plugins": {
					"limit-count": {
						"count": 2,
						"time_window": 60,
						"rejected_code": 503,
						"key": "remote_addr"
					}
				},
				"status": 1,
				"uri": "/hello2",
				"host": "*.bar.com",
				"methods": ["GET", "POST"],
				"upstream": {
					"nodes": {
						"172.16.238.20:1980": 1
					},
					"type": "roundrobin"
				}
			}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:         "export route2",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/export/routes/r2",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "{\"components\":{},\"info\":{\"title\":\"RoutesExport\",\"version\":\"3.0.0\"},\"openapi\":\"3.0.0\",\"paths\":{" + exportStrR2 + "}}",
		},
	}
	for _, tc := range tests2 {
		testCaseCheck(tc, t)
	}

	// 3. Use two interfaces to export all routes separately(r1,r2 and exportall routes)
	tests3 := []HttpTestCase{
		{
			Desc:         "export route and route2",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/export/routes/r1,r2",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "{\"components\":{},\"info\":{\"title\":\"RoutesExport\",\"version\":\"3.0.0\"},\"openapi\":\"3.0.0\",\"paths\":{" + exportStrR2 + "," + exportStrR1 + "}}",
		},
		{
			Desc:         "use the exportall inerface to export all routes",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/export/routes",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "{\"components\":{},\"info\":{\"title\":\"RoutesExport\",\"version\":\"3.0.0\"},\"openapi\":\"3.0.0\",\"paths\":{" + exportStrR2 + "," + exportStrR1 + "}}",
		},
		{
			Desc:         "delete the route just created",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/r1",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:         "hit the route just deleted",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello_",
			Headers:      map[string]string{"Host": "bar.com"},
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   "{\"error_msg\":\"404 Route Not Found\"}\n",
			Sleep:        sleepTime,
		},
		{
			Desc:         "delete the route2 just created",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/r2",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:         "hit the route2 just deleted",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello2",
			Headers:      map[string]string{"Host": "bar.com"},
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   "{\"error_msg\":\"404 Route Not Found\"}\n",
			Sleep:        sleepTime,
		},
	}
	for _, tc := range tests3 {
		testCaseCheck(tc, t)
	}

	// 4.Create a service that contains complete data and use the service_ id create route
	serviceStrS1 := `
	"name": "testservice",
	"desc": "testservice_desc",
	"upstream": {
		"nodes": [{
			"host": "172.16.238.20",
			"port": 1980,
			"weight": 1
		}],
		"type": "roundrobin"
	},
	"plugins": {
		"limit-count": {
			"count": 100,
			"key": "remote_addr",
			"rejected_code": 503,
			"time_window": 60
		}
	},
	"labels": {
		"build": "16",
		"env": "production",
		"version": "v2"
	},
	"enable_websocket": true
	`
	serviceStrS1 = replaceStr(serviceStrS1)

	exportStrR3 := `{
		"components": {},
		"info": {
			"title": "RoutesExport",
			"version": "3.0.0"
		},
		"openapi": "3.0.0",
		"paths": {
			"/hello": {
				"get": {
					"operationId": "GET",
					"requestBody": {},
					"responses": {
						"default": {
							"description": ""
						}
					},
					"x-apisix-enable_websocket": false,
					"x-apisix-labels": {
						"build": "16",
						"env": "production",
						"version": "v2"
					},
					"x-apisix-plugins": {
						"limit-count": {
							"count": 100,
							"key": "remote_addr",
							"rejected_code": 503,
							"time_window": 60
						}
					},
					"x-apisix-priority": 0,
					"x-apisix-status": 1,
					"x-apisix-upstream": {
						"nodes": [{
							"host": "172.16.238.20",
							"port": 1980,
							"weight": 1
						}],
						"type": "roundrobin"
					}
				}
			}
		}
	}`
	exportStrR3 = replaceStr(exportStrR3)

	tests4 := []HttpTestCase{
		{
			Desc:    "create service with all options",
			Object:  ManagerApiExpect(t),
			Method:  http.MethodPut,
			Path:    "/apisix/admin/services/s1",
			Headers: map[string]string{"Authorization": token},
			Body: `{
				"name": "testservice",
				"desc": "testservice_desc",
				"labels": {
					"build":"16",
					"env":"production",
					"version":"v2"
				},
				"enable_websocket":true,
				"plugins": {
					"limit-count": {
						"count": 100,
						"time_window": 60,
						"rejected_code": 503,
						"key": "remote_addr"
					}
				},
				"upstream": {
					"type": "roundrobin",
					"create_time":1602883670,
					"update_time":1602893670,
					"nodes": [{
						"host": "172.16.238.20",
						"port": 1980,
						"weight": 1
					}]
				}
			}`,
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:       "get the service s1",
			Object:     ManagerApiExpect(t),
			Method:     http.MethodGet,
			Path:       "/apisix/admin/services/s1",
			Headers:    map[string]string{"Authorization": token},
			ExpectCode: http.StatusOK,
			ExpectBody: serviceStrS1,
		},
		{
			Desc:   "create route3 using the service id just created",
			Object: ManagerApiExpect(t),
			Method: http.MethodPut,
			Path:   "/apisix/admin/routes/r3",
			Body: `{
				"methods": ["GET"],
				"uri": "/hello",
				"service_id": "s1"
			}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			Sleep:        sleepTime,
		},
		{
			Desc:         "export route3",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/export/routes/r3",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "{\"code\":0,\"message\":\"\",\"data\":" + exportStrR3,
		},
		{
			Desc:         "delete the route3 just created",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/r3",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:         "hit the route3 just deleted",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   "{\"error_msg\":\"404 Route Not Found\"}\n",
			Sleep:        sleepTime,
		},
		{
			Desc:         "delete the service1",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/services/s1",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			Sleep:        sleepTime,
		},
	}
	for _, tc := range tests4 {
		testCaseCheck(tc, t)
	}

	// 5.Create a service containing plugin and a route containing plugin to test the fusion of exported data
	// This test case tests the creation of a complete service.
	// And create a complete route, export rules as route upstream data for high priority, direct use.
	// However, if the data in the service plugins does not exist in the route, it will be fused and exported.
	// If it exists, the data in route will be used first
	serviceStrS2 := `
	"name": "testservice",
	"desc": "testservice_desc",
	"upstream": {
		"nodes": [{
			"host": "172.16.238.20",
			"port": 1980,
			"weight": 1
		}],
		"type": "roundrobin"
	},
	"plugins": {
		"limit-count": {
			"count": 100,
			"key": "remote_addr",
			"rejected_code": 503,
			"time_window": 60
		}
	},
	"labels": {
		"build": "16",
		"env": "production",
		"version": "v2"
	},
	"enable_websocket": true`
	serviceStrS2 = replaceStr(serviceStrS2)

	exportStrR4 := `{
		"components": {},
		"info": {
			"title": "RoutesExport",
			"version": "3.0.0"
		},
		"openapi": "3.0.0",
		"paths": {
			"/hello": {
				"get": {
					"operationId": "GET",
					"requestBody": {},
					"responses": {
						"default": {
							"description": ""
						}
					},
					"security": [],
					"x-apisix-enable_websocket": false,
					"x-apisix-labels": {
						"build": "16",
						"env": "production",
						"version": "v2"
					},
					"x-apisix-plugins": {
						"limit-count": {
							"count": 100,
							"key": "remote_addr",
							"rejected_code": 503,
							"time_window": 60
						},
						"prometheus": {
							"disable": false
						}
					},
					"x-apisix-priority": 0,
					"x-apisix-status": 1,
					"x-apisix-upstream": {
						"nodes": [{
							"host": "172.16.238.20",
							"port": 1980,
							"weight": 1
						}],
						"type": "roundrobin"
					}
				}
			}
		}
	}`
	exportStrR4 = replaceStr(exportStrR4)

	tests5 := []HttpTestCase{
		{
			Desc:    "create service with all options",
			Object:  ManagerApiExpect(t),
			Method:  http.MethodPut,
			Path:    "/apisix/admin/services/s2",
			Headers: map[string]string{"Authorization": token},
			Body: `{
				"name": "testservice",
				"desc": "testservice_desc",
				"labels": {
					"build":"16",
					"env":"production",
					"version":"v2"
				},
				"enable_websocket":true,
				"plugins": {
					"limit-count": {
						"count": 100,
						"time_window": 60,
						"rejected_code": 503,
						"key": "remote_addr"
					}
				},
				"upstream": {
					"type": "roundrobin",
					"create_time":1602883670,
					"update_time":1602893670,
					"nodes": [{
						"host": "172.16.238.20",
						"port": 1980,
						"weight": 1
					}]
				}
			}`,
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:       "get the service s2",
			Object:     ManagerApiExpect(t),
			Method:     http.MethodGet,
			Path:       "/apisix/admin/services/s2",
			Headers:    map[string]string{"Authorization": token},
			ExpectCode: http.StatusOK,
			ExpectBody: serviceStrS2,
		},
		{
			Desc:   "Create Route4 and test the priority merging function of upstream, label and plugin when both service and route are included",
			Object: ManagerApiExpect(t),
			Method: http.MethodPut,
			Path:   "/apisix/admin/routes/r4",
			Body: `{
				"methods": ["GET"],
				"uri": "/hello",
				"service_id": "s2",
				"enable_websocket":false,
				"plugins": {
					"prometheus": {
						"disable": false
					}
				},
				"upstream": {
					"type": "roundrobin",
					"nodes": [{
						"host": "172.16.238.20",
						"port": 1980,
						"weight": 1
					}]
				}
			}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			Sleep:        sleepTime,
		},
		{
			Desc:         "export route4",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/export/routes/r4",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			ExpectBody:   exportStrR4,
		},
		{
			Desc:         "delete the route4 just created",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/r4",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:         "hit the route4 just deleted",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   "{\"error_msg\":\"404 Route Not Found\"}\n",
			Sleep:        sleepTime,
		},
		{
			Desc:         "delete the service2",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/services/s2",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			Sleep:        sleepTime,
		},
	}
	for _, tc := range tests5 {
		testCaseCheck(tc, t)
	}

	// 6.Create a service according to the upstream ID and a route according to the service ID.
	// The test export also contains the upstream.
	// Use the upstream of route.
	serviceStrS3 := `
	"name": "testservice",
	"desc": "testservice_desc",
	"upstream_id": "1",
	"plugins": {
		"limit-count": {
			"count": 100,
			"key": "remote_addr",
			"rejected_code": 503,
			"time_window": 60
		}
	},
	"labels": {
		"build": "16",
		"env": "production",
		"version": "v2"
	},
	"enable_websocket": true`
	serviceStrS3 = replaceStr(serviceStrS3)

	exportStrR5 := `{
		"components": {},
		"info": {
			"title": "RoutesExport",
			"version": "3.0.0"
		},
		"openapi": "3.0.0",
		"paths": {
			"/hello": {
				"get": {
					"operationId": "GET",
					"requestBody": {},
					"responses": {
						"default": {
							"description": ""
						}
					},
					"security": [],
					"x-apisix-enable_websocket": false,
					"x-apisix-labels": {
						"build": "16",
						"env": "production",
						"version": "v2"
					},
					"x-apisix-plugins": {
						"limit-count": {
							"count": 100,
							"key": "remote_addr",
							"rejected_code": 503,
							"time_window": 60
						},
						"prometheus": {
							"disable": false
						}
					},
					"x-apisix-priority": 0,
					"x-apisix-status": 1,
					"x-apisix-upstream": {
						"nodes": [{
							"host": "172.16.238.20",
							"port": 1981,
							"weight": 1
						}],
						"type": "roundrobin"
					}
				}
			}
		}
	}`
	exportStrR5 = replaceStr(exportStrR5)

	tests6 := []HttpTestCase{
		{
			Desc:   "create upstream",
			Object: ManagerApiExpect(t),
			Method: http.MethodPut,
			Path:   "/apisix/admin/upstreams/1",
			Body: `{
				"nodes": [
					{
						"host": "172.16.238.20",
						"port": 1980,
						"weight": 1
					}
				],
				"type": "roundrobin"
			}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:    "create service with upstream id",
			Object:  ManagerApiExpect(t),
			Method:  http.MethodPut,
			Path:    "/apisix/admin/services/s3",
			Headers: map[string]string{"Authorization": token},
			Body: `{
				"name": "testservice",
				"desc": "testservice_desc",
				"labels": {
					"build":"16",
					"env":"production",
					"version":"v2"
				},
				"enable_websocket":true,
				"plugins": {
					"limit-count": {
						"count": 100,
						"time_window": 60,
						"rejected_code": 503,
						"key": "remote_addr"
					}
				},
				"upstream_id": "1"
			}`,
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:       "get the service s3",
			Object:     ManagerApiExpect(t),
			Method:     http.MethodGet,
			Path:       "/apisix/admin/services/s3",
			Headers:    map[string]string{"Authorization": token},
			ExpectCode: http.StatusOK,
			ExpectBody: serviceStrS3,
		},
		{
			Desc:   "Create a route5 with the id of the service3 created with upstream id",
			Object: ManagerApiExpect(t),
			Method: http.MethodPut,
			Path:   "/apisix/admin/routes/r5",
			Body: `{
				"methods": ["GET"],
				"uri": "/hello",
				"service_id": "s3",
				"enable_websocket":false,
				"plugins": {
					"prometheus": {
						"disable": false
					}
				},
				"upstream": {
					"type": "roundrobin",
					"nodes": [{
						"host": "172.16.238.20",
						"port": 1981,
						"weight": 1
					}]
				}
			}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			Sleep:        sleepTime,
		},
		{
			Desc:         "export route5",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/export/routes/r5",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			ExpectBody:   exportStrR5,
		},
		{
			Desc:         "delete the route5 just created",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/r5",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:         "hit the route5 just deleted",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   "{\"error_msg\":\"404 Route Not Found\"}\n",
			Sleep:        sleepTime,
		},
		{
			Desc:         "delete the service3",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/services/s3",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			Sleep:        sleepTime,
		},
		{
			Desc:         "remove upstream",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/upstreams/1",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
	}
	for _, tc := range tests6 {
		testCaseCheck(tc, t)
	}

	// 8.Create and export route according to upstream ID
	exportStrR8 := `{
		"components": {},
		"info": {
			"title": "RoutesExport",
			"version": "3.0.0"
		},
		"openapi": "3.0.0",
		"paths": {
			"/hello": {
				"get": {
					"operationId": "GET",
					"requestBody": {},
					"responses": {
						"default": {
							"description": ""
						}
					},
					"security": [],
					"x-apisix-enable_websocket": false,
					"x-apisix-plugins": {
						"prometheus": {
							"disable": false
						}
					},
					"x-apisix-priority": 0,
					"x-apisix-status": 1,
					"x-apisix-upstream": {
						"id": "3"`
	exportStrR8 = replaceStr(exportStrR8)

	tests8 := []HttpTestCase{
		{
			Desc:   "create upstream3",
			Object: ManagerApiExpect(t),
			Method: http.MethodPut,
			Path:   "/apisix/admin/upstreams/3",
			Body: `{
				"nodes": [
					{
						"host": "172.16.238.20",
						"port": 1980,
						"weight": 1
					}
				],
				"type": "roundrobin"
			}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:   "Create a route8 using upstream id",
			Object: ManagerApiExpect(t),
			Method: http.MethodPut,
			Path:   "/apisix/admin/routes/r8",
			Body: `{
				"methods": ["GET"],
				"uri": "/hello",
				"enable_websocket":false,
				"plugins": {
					"prometheus": {
						"disable": false
					}
				},
				"upstream_id": "3"
			}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			Sleep:        sleepTime,
		},
		{
			Desc:         "export route8",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/export/routes/r8",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			ExpectBody:   exportStrR8,
		},
		{
			Desc:         "delete the route8 just created",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/r8",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:         "hit the route8 just deleted",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   "{\"error_msg\":\"404 Route Not Found\"}\n",
			Sleep:        sleepTime,
		},
		{
			Desc:         "remove upstream3",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/upstreams/3",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
	}
	for _, tc := range tests8 {
		testCaseCheck(tc, t)
	}

	// 9.Create service according to upstream1 ID
	// Create route according to upstream2 ID and service ID
	// Export route
	serviceStrS4 := `
	"name": "testservice",
	"desc": "testservice_desc",
	"upstream_id": "4",
	"enable_websocket": true`
	serviceStrS4 = replaceStr(serviceStrS4)

	exportStrR9 := `{
		"components": {},
		"info": {
			"title": "RoutesExport",
			"version": "3.0.0"
		},
		"openapi": "3.0.0",
		"paths": {
			"/hello": {
				"get": {
					"operationId": "route_allGET",
					"requestBody": {},
					"responses": {
						"default": {
							"description": ""
						}
					},
					"security": [],
					"summary": "所有",
					"x-apisix-enable_websocket": false,
					"x-apisix-labels": {
						"API_VERSION": "v1",
						"test": "1"
					},
					"x-apisix-plugins": {
						"prometheus": {
							"disable": false
						}
					},
					"x-apisix-priority": 0,
					"x-apisix-status": 1,
					"x-apisix-upstream": {
						"id": "5"`
	exportStrR9 = replaceStr(exportStrR9)

	tests9 := []HttpTestCase{
		{
			Desc:   "create upstream4",
			Object: ManagerApiExpect(t),
			Method: http.MethodPut,
			Path:   "/apisix/admin/upstreams/4",
			Body: `{
				"nodes": [
					{
						"host": "172.16.238.20",
						"port": 1980,
						"weight": 1
					}
				],
				"type": "roundrobin"
			}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:   "create upstream5",
			Object: ManagerApiExpect(t),
			Method: http.MethodPut,
			Path:   "/apisix/admin/upstreams/5",
			Body: `{
				"nodes": [
					{
						"host": "172.16.238.20",
						"port": 1981,
						"weight": 1
					}
				],
				"type": "roundrobin"
			}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:    "create service",
			Object:  ManagerApiExpect(t),
			Method:  http.MethodPut,
			Path:    "/apisix/admin/services/s4",
			Headers: map[string]string{"Authorization": token},
			Body: `{
				"name": "testservice",
				"desc": "testservice_desc",
				"enable_websocket":true,
				"upstream_id": "4"
			}`,
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:       "get the service s4",
			Object:     ManagerApiExpect(t),
			Method:     http.MethodGet,
			Path:       "/apisix/admin/services/s4",
			Headers:    map[string]string{"Authorization": token},
			ExpectCode: http.StatusOK,
			ExpectBody: serviceStrS4,
		},
		{
			Desc:   "Create a route9 using upstream id and service id",
			Object: ManagerApiExpect(t),
			Method: http.MethodPut,
			Path:   "/apisix/admin/routes/r9",
			Body: `{
				"name": "route_all",
				"desc": "所有",
				"status": 1,
				"methods": ["GET"],
				"priority": 0,
				"service_id": "s4",
				"labels": {
					"test": "1",
					"API_VERSION": "v1"
				},
				"vars": [
					["arg_name", "==", "test"]
				],
				"uri": "/hello",
				"enable_websocket":false,
				"plugins": {
					"prometheus": {
						"disable": false
					}
				},
				"upstream_id": "5"
			}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			Sleep:        sleepTime,
		},
		{
			Desc:         "export route9",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/export/routes/r9",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			ExpectBody:   exportStrR9,
		},
		{
			Desc:         "delete the route9 just created",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/r9",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:         "hit the route9 just deleted",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   "{\"error_msg\":\"404 Route Not Found\"}\n",
			Sleep:        sleepTime,
		},
		{
			Desc:         "remove upstream4",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/upstreams/4",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:         "remove upstream5",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/upstreams/5",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:         "delete the service4",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/services/s4",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			Sleep:        sleepTime,
		},
	}
	for _, tc := range tests9 {
		testCaseCheck(tc, t)
	}

	// 10.Creating route10 using service ID does not contain upstream data
	serviceStrS5 := `
	"name": "testservice",
	"desc": "testservice_desc",
	"upstream_id": "6",
	"enable_websocket": true`
	serviceStrS5 = replaceStr(serviceStrS5)

	exportStrR10 := `{
		"components": {},
		"info": {
			"title": "RoutesExport",
			"version": "3.0.0"
		},
		"openapi": "3.0.0",
		"paths": {
			"/hello": {
				"get": {
					"operationId": "route_allGET",
					"requestBody": {},
					"responses": {
						"default": {
							"description": ""
						}
					},
					"security": [],
					"summary": "所有",
					"x-apisix-enable_websocket": false,
					"x-apisix-labels": {
						"API_VERSION": "v1",
						"test": "1"
					},
					"x-apisix-plugins": {
						"prometheus": {
							"disable": false
						}
					},
					"x-apisix-priority": 0,
					"x-apisix-status": 1,
					"x-apisix-upstream": {
						"id": "6"`
	exportStrR10 = replaceStr(exportStrR10)

	tests10 := []HttpTestCase{
		{
			Desc:   "create upstream6",
			Object: ManagerApiExpect(t),
			Method: http.MethodPut,
			Path:   "/apisix/admin/upstreams/6",
			Body: `{
				"nodes": [
					{
						"host": "172.16.238.20",
						"port": 1980,
						"weight": 1
					}
				],
				"type": "roundrobin"
			}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:    "create service",
			Object:  ManagerApiExpect(t),
			Method:  http.MethodPut,
			Path:    "/apisix/admin/services/s5",
			Headers: map[string]string{"Authorization": token},
			Body: `{
				"name": "testservice",
				"desc": "testservice_desc",
				"enable_websocket":true,
				"upstream_id": "6"
			}`,
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:       "get the service s5",
			Object:     ManagerApiExpect(t),
			Method:     http.MethodGet,
			Path:       "/apisix/admin/services/s5",
			Headers:    map[string]string{"Authorization": token},
			ExpectCode: http.StatusOK,
			ExpectBody: serviceStrS5,
		},
		{
			Desc:   "Creating route10 using service ID does not contain upstream data",
			Object: ManagerApiExpect(t),
			Method: http.MethodPut,
			Path:   "/apisix/admin/routes/r10",
			Body: `{
				"name": "route_all",
				"desc": "所有",
				"status": 1,
				"methods": ["GET"],
				"priority": 0,
				"service_id": "s5",
				"labels": {
					"test": "1",
					"API_VERSION": "v1"
				},
				"vars": [
					["arg_name", "==", "test"]
				],
				"uri": "/hello",
				"enable_websocket":false,
				"plugins": {
					"prometheus": {
						"disable": false
					}
				}
			}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			Sleep:        sleepTime,
		},
		{
			Desc:         "export route10",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/export/routes/r10",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			ExpectBody:   exportStrR10,
		},
		{
			Desc:         "delete the route10 just created",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/r10",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:         "hit the route10 just deleted",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   "{\"error_msg\":\"404 Route Not Found\"}\n",
			Sleep:        sleepTime,
		},
		{
			Desc:         "remove upstream6",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/upstreams/6",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:         "delete the service5",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/services/s5",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			Sleep:        sleepTime,
		},
	}
	for _, tc := range tests10 {
		testCaseCheck(tc, t)
	}
}

func TestExportRoute_With_Jwt_Plugin(t *testing.T) {
	tests := []HttpTestCase{
		{
			Desc:         "make sure the route is not created ",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   `{"error_msg":"404 Route Not Found"}`,
		},
		{
			Desc:   "create route",
			Object: ManagerApiExpect(t),
			Method: http.MethodPut,
			Path:   "/apisix/admin/routes/r1",
			Body: `{
				 "uri": "/hello",
				 "plugins": {
					 "jwt-auth": {}
				 },
				 "upstream": {
					 "type": "roundrobin",
					"nodes": [{
						"host": "172.16.238.20",
						"port": 1980,
						"weight": 1
					}]
				 }
			 }`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			ExpectBody:   `"code":0`,
		},
		{
			Desc:         "make sure the consumer is not created",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/consumers/jack",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusNotFound,
		},
		{
			Desc:   "create consumer",
			Object: ManagerApiExpect(t),
			Path:   "/apisix/admin/consumers",
			Method: http.MethodPut,
			Body: `{
				"username": "jack",
				"plugins": {
					"jwt-auth": {
						"key": "user-key",
						"secret": "my-secret-key",
						"algorithm": "HS256"
					}
				},
				"desc": "test description"
			}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
	}

	for _, tc := range tests {
		testCaseCheck(tc, t)
	}

	time.Sleep(sleepTime)

	// sign jwt token
	body, status, err := httpGet("http://127.0.0.10:9080/apisix/plugin/jwt/sign?key=user-key", nil)
	assert.Nil(t, err)
	assert.Equal(t, http.StatusOK, status)
	jwtToken := string(body)

	// sign jwt token with not exists key
	body, status, err = httpGet("http://127.0.0.1:9080/apisix/plugin/jwt/sign?key=not-exist-key", nil)
	assert.Nil(t, err)
	assert.Equal(t, http.StatusNotFound, status)

	exportStrJWT := `{
		"components": {
			"securitySchemes": {
				"bearerAuth": {
					"bearerFormat": "JWT",
					"scheme": "bearer",
					"type": "http"
				}
			}
		},
		"info": {
			"title": "RoutesExport",
			"version": "3.0.0"
		},
		"openapi": "3.0.0",
		"paths": {
			"/hello": {}
		}`
	exportStrJWT = replaceStr(exportStrJWT)
	// verify token and clean test data
	tests = []HttpTestCase{
		{
			Desc:         "verify route with correct jwt token",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello",
			Headers:      map[string]string{"Authorization": jwtToken},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "hello world",
			Sleep:        sleepTime,
		},
		{
			Desc:         "export route",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/export/routes/r1",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			ExpectBody:   exportStrJWT,
		},
		{
			Desc:         "delete consumer",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/consumers/jack",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:         "verify route with the jwt token from just deleted consumer",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello",
			Headers:      map[string]string{"Authorization": jwtToken},
			ExpectStatus: http.StatusUnauthorized,
			ExpectBody:   `{"message":"Missing related consumer"}`,
			Sleep:        sleepTime,
		},
		{
			Desc:         "delete route",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/r1",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:         "verify the deleted route ",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   `{"error_msg":"404 Route Not Found"}`,
			Sleep:        sleepTime,
		},
	}

	for _, tc := range tests {
		testCaseCheck(tc, t)
	}

	exportStrJWTNoAlgorithm := `{
		"components": {
			"securitySchemes": {
				"bearerAuth": {
					"bearerFormat": "JWT",
					"scheme": "bearer",
					"type": "http"
				}
			}
		},
		"info": {
			"title": "RoutesExport",
			"version": "3.0.0"
		},
		"openapi": "3.0.0",
		"paths": {
			"/hello": {}
		}`
	exportStrJWTNoAlgorithm = replaceStr(exportStrJWTNoAlgorithm)

	tests = []HttpTestCase{
		{
			Desc:   "create consumer with jwt (no algorithm)",
			Object: ManagerApiExpect(t),
			Path:   "/apisix/admin/consumers",
			Method: http.MethodPut,
			Body: `{
				"username":"consumer_1",
				"desc": "test description",
				"plugins":{
					"jwt-auth":{
						"exp":86400,
						"key":"user-key",
						"secret":"my-secret-key"
					}
				}
			}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "\"code\":0",
			Sleep:        sleepTime,
		},
		{
			Desc:         "get the consumer",
			Object:       ManagerApiExpect(t),
			Path:         "/apisix/admin/consumers/consumer_1",
			Method:       http.MethodGet,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "\"username\":\"consumer_1\"",
			Sleep:        sleepTime,
		},
		{
			Desc:   "create the route",
			Object: ManagerApiExpect(t),
			Method: http.MethodPut,
			Path:   "/apisix/admin/routes/r1",
			Body: `{
				"uri": "/hello",
				"plugins": {
					"jwt-auth": {}
				},
				"upstream": {
					"type": "roundrobin",
					"nodes": [{
						"host": "172.16.238.20",
						"port": 1980,
						"weight": 1
					}]
				}
			}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			Sleep:        sleepTime,
		},
	}

	for _, tc := range tests {
		testCaseCheck(tc, t)
	}

	time.Sleep(sleepTime)

	// get the token of jwt
	basepath := "http://127.0.0.1:9080"
	request, _ := http.NewRequest("GET", basepath+"/apisix/plugin/jwt/sign?key=user-key", nil)
	request.Header.Add("Authorization", token)
	resp, err := http.DefaultClient.Do(request)
	assert.Nil(t, err)
	defer resp.Body.Close()
	assert.Equal(t, 200, resp.StatusCode)
	jwttoken, _ := ioutil.ReadAll(resp.Body)

	tests = []HttpTestCase{
		{
			Desc:         "hit route with jwt token",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello",
			Headers:      map[string]string{"Authorization": string(jwttoken)},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "hello world",
			Sleep:        sleepTime,
		},
		{
			Desc:         "export route",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/export/routes/r1",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			ExpectBody:   exportStrJWTNoAlgorithm,
		},
		{
			Desc:         "delete consumer",
			Object:       ManagerApiExpect(t),
			Path:         "/apisix/admin/consumers/consumer_1",
			Method:       http.MethodDelete,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "\"code\":0",
		},
		{
			Desc:         "after delete consumer verify it again",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/consumers/jack",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusNotFound,
			Sleep:        sleepTime,
		},
		{
			Desc:         "delete the route",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/r1",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
	}

	for _, tc := range tests {
		testCaseCheck(tc, t)
	}
}

func TestExportRoute_With_Auth_Plugin(t *testing.T) {
	// apikey-auth plugin
	// basic-auth plugin
	tests := []HttpTestCase{
		{
			Desc:         "make sure the route is not created ",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   `{"error_msg":"404 Route Not Found"}`,
		},
		{
			Desc:   "create route",
			Object: ManagerApiExpect(t),
			Method: http.MethodPut,
			Path:   "/apisix/admin/routes/r1",
			Body: `{
				 "uri": "/hello",
				 "plugins": {
					 "key-auth": {},
					 "basic-auth": {}
				 },
				 "upstream": {
					 "type": "roundrobin",
					"nodes": [{
						"host": "172.16.238.20",
						"port": 1980,
						"weight": 1
					}]
				 }
			 }`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			ExpectBody:   `"code":0`,
		},
		{
			Desc:         "make sure the consumer is not created",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/consumers/jack",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusNotFound,
		},
		{
			Desc:   "create consumer",
			Object: ManagerApiExpect(t),
			Path:   "/apisix/admin/consumers",
			Method: http.MethodPut,
			Body: `{
				"username": "jack",
				"plugins": {
					"key-auth": {
						"key": "auth-one"
					},
					"basic-auth": {
						"username": "jack",
						"password": "123456"
					}
				},
				"desc": "test description"
			}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
	}

	for _, tc := range tests {
		testCaseCheck(tc, t)
	}

	time.Sleep(sleepTime)

	exportStrAuth := `"data": {
		"components": {
			"securitySchemes": {
				"api_key": {
					"in": "header",
					"name": "X-XSRF-TOKEN",
					"type": "apiKey"
				},
				"basicAuth": {
					"in": "header",
					"name": "basicAuth",
					"type": "basicAuth"
				}
			}
		},
		"info": {
			"title": "RoutesExport",
			"version": "3.0.0"
		},
		"openapi": "3.0.0",
		"paths": {
			"/hello": {}
		}
	}`

	time.Sleep(sleepTime)

	exportStrAuth = replaceStr(exportStrAuth)

	tests = []HttpTestCase{
		{
			Desc:         "verify route with correct basic-auth and key-auth token",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello",
			Headers:      map[string]string{"Authorization": "Basic amFjazoxMjM0NTYKIA==", "apikey": "auth-one"},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "hello world",
			Sleep:        sleepTime,
		},
		{
			Desc:         "export route",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/export/routes/r1",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			ExpectBody:   exportStrAuth,
		},
		{
			Desc:         "delete consumer",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/consumers/jack",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:         "verify route with the basic-auth and key-auth token from just deleted consumer",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello",
			Headers:      map[string]string{"Authorization": "Basic amFjazoxMjM0NTYKIA==", "apikey": "auth-one"},
			ExpectStatus: http.StatusUnauthorized,
			ExpectBody:   `{"message":"Missing related consumer"}`,
			Sleep:        sleepTime,
		},
		{
			Desc:         "delete route",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/r1",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:         "verify the deleted route ",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   `{"error_msg":"404 Route Not Found"}`,
			Sleep:        sleepTime,
		},
	}

	for _, tc := range tests {
		testCaseCheck(tc, t)
	}
}

func TestRoute_Export_Label(t *testing.T) {
	// 10.Create a service with label data and a route with label data, and export the route.
	// Label is the original data of the route
	serviceStrS1 := `
	"name": "testservice",
	"desc": "testservice_desc",
	"labels": {
		"build": "10"
	},
	"enable_websocket": true`
	serviceStrS1 = replaceStr(serviceStrS1)

	exportStrR1 := `{
		"components": {},
		"info": {
			"title": "RoutesExport",
			"version": "3.0.0"
		},
		"openapi": "3.0.0",
		"paths": {
			"/hello": {
				"get": {
					"operationId": "route_allGET",
					"requestBody": {},
					"responses": {
						"default": {
							"description": ""
						}
					},
					"summary": "所有",
					"x-apisix-enable_websocket": false,
					"x-apisix-labels": {
						"build": "16",
						"env": "production",
						"version": "v2"
					},
					"x-apisix-priority": 0,
					"x-apisix-status": 1,
					"x-apisix-vars":[
						[
							"arg_name",
							"==",
							"test"
							]
						]
					}`
	exportStrR1 = replaceStr(exportStrR1)

	tests := []HttpTestCase{

		{
			Desc:    "create service",
			Object:  ManagerApiExpect(t),
			Method:  http.MethodPut,
			Path:    "/apisix/admin/services/s1",
			Headers: map[string]string{"Authorization": token},
			Body: `{
				"name": "testservice",
				"desc": "testservice_desc",
				"enable_websocket":true,
				"labels": {
					"build": "10"
				}
			}`,
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:       "get the service s1",
			Object:     ManagerApiExpect(t),
			Method:     http.MethodGet,
			Path:       "/apisix/admin/services/s1",
			Headers:    map[string]string{"Authorization": token},
			ExpectCode: http.StatusOK,
			ExpectBody: serviceStrS1,
		},
		{
			Desc:   "Create a service with label data and a route with label data",
			Object: ManagerApiExpect(t),
			Method: http.MethodPut,
			Path:   "/apisix/admin/routes/r1",
			Body: `{
				"name": "route_all",
				"desc": "所有",
				"status": 1,
				"methods": ["GET"],
				"service_id": "s1",
				"labels": {
					"build": "16",
					"env": "production",
					"version": "v2"
				},
				"vars": [
					["arg_name", "==", "test"]
				],
				"uri": "/hello"
			}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			Sleep:        sleepTime,
		},
		{
			Desc:         "export route1",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/export/routes/r1",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			ExpectBody:   exportStrR1,
		},
		{
			Desc:         "delete the route1 just created",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/r1",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:         "hit the route1 just deleted",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   "{\"error_msg\":\"404 Route Not Found\"}\n",
			Sleep:        sleepTime,
		},
		{
			Desc:         "delete the service1",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/services/s1",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			Sleep:        sleepTime,
		},
	}
	for _, tc := range tests {
		testCaseCheck(tc, t)
	}

	// 11.Create a service with label data and a route without label data, and export the route.
	//  Label is the data of the service
	serviceStrS2 := `
	"name": "testservice",
	"desc": "testservice_desc",
	"labels": {
		"build": "16",
		"env": "production",
		"version": "v2"
	},
	"enable_websocket": true`
	serviceStrS2 = replaceStr(serviceStrS2)

	exportStrR2 := `{
		"components": {},
		"info": {
			"title": "RoutesExport",
			"version": "3.0.0"
		},
		"openapi": "3.0.0",
		"paths": {
			"/hello": {
				"get": {
					"operationId": "route_allGET",
					"requestBody": {},
					"responses": {
						"default": {
							"description": ""
						}
					},
					"summary": "所有",
					"x-apisix-enable_websocket": false,
					"x-apisix-labels": {
						"build": "16",
						"env": "production",
						"version": "v2"
					},
					"x-apisix-priority": 0,
					"x-apisix-status": 1,
					"x-apisix-vars":[
						[
							"arg_name",
							"==",
							"test"
							]
						]
					}`
	exportStrR2 = replaceStr(exportStrR2)

	tests2 := []HttpTestCase{

		{
			Desc:    "create service",
			Object:  ManagerApiExpect(t),
			Method:  http.MethodPut,
			Path:    "/apisix/admin/services/s2",
			Headers: map[string]string{"Authorization": token},
			Body: `{
				"name": "testservice",
				"desc": "testservice_desc",
				"enable_websocket":true,
				"labels": {
					"build": "16",
					"env": "production",
					"version": "v2"
				}
			}`,
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:       "get the service s2",
			Object:     ManagerApiExpect(t),
			Method:     http.MethodGet,
			Path:       "/apisix/admin/services/s2",
			Headers:    map[string]string{"Authorization": token},
			ExpectCode: http.StatusOK,
			ExpectBody: serviceStrS2,
		},
		{
			Desc:   "Create a service with label data and a route without label data",
			Object: ManagerApiExpect(t),
			Method: http.MethodPut,
			Path:   "/apisix/admin/routes/r2",
			Body: `{
				"name": "route_all",
				"desc": "所有",
				"status": 1,
				"methods": ["GET"],
				"service_id": "s2",
				"vars": [
					["arg_name", "==", "test"]
				],
				"uri": "/hello"
			}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			Sleep:        sleepTime,
		},
		{
			Desc:         "export route2",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/export/routes/r2",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			ExpectBody:   exportStrR2,
		},
		{
			Desc:         "delete the route2 just created",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/r2",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:         "hit the route2 just deleted",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   "{\"error_msg\":\"404 Route Not Found\"}\n",
			Sleep:        sleepTime,
		},
		{
			Desc:         "delete the service2",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/services/s2",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			Sleep:        sleepTime,
		},
	}
	for _, tc := range tests2 {
		testCaseCheck(tc, t)
	}
}

func TestRoute_Export_Request_Validation(t *testing.T) {
	// 12.Test export route request_ validation data correctness
	exportStrR1 := `{
		"components": {},
		"info": {
			"title": "RoutesExport",
			"version": "3.0.0"
		},
		"openapi": "3.0.0",
		"paths": {
			"/test-test": {
				"get": {
					"operationId": "route_allGET",
					"parameters": [{
						"in": "header",
						"name": "test",
						"schema": {
							"type": "string"
						}
					}],
					"requestBody": {
						"content": {
							"*/*": {
								"schema": {
									"properties": {
										"boolean_payload": {
											"type": "boolean"
										},
										"required_payload": {
											"type": "string"
										}
									},
									"required": ["required_payload"],
									"type": "object"
								}
							}
						}
					},
					"responses": {
						"default": {
							"description": ""
						}
					},
					"security": [],
					"summary": "所有",
					"x-apisix-enable_websocket": false,
					"x-apisix-hosts": ["test.com"],
					"x-apisix-plugins": {},
					"x-apisix-priority": 0,
					"x-apisix-status": 1
				}
			}
		}
	}`
	exportStrR1 = replaceStr(exportStrR1)

	tests := []HttpTestCase{
		{
			Desc:   "Create a route containing request_ validation data",
			Object: ManagerApiExpect(t),
			Method: http.MethodPut,
			Path:   "/apisix/admin/routes/r1",
			Body: `{
					"uris": ["/test-test"],
					"name": "route_all",
					"desc": "所有",
					"methods": ["GET"],
					"hosts": ["test.com"],
					"plugins": {
						"request-validation": {
							"body_schema": {
								"properties": {
									"boolean_payload": {
										"type": "boolean"
									},
									"required_payload": {
										"type": "string"
									}
								},
								"required": ["required_payload"],
								"type": "object"
							},
							"disable": false,
							"header_schema": {
								"properties": {
									"test": {
										"enum": "test-enum",
										"type": "string"
									}
								},
								"type": "string"
							}
						}
					},
					"status": 1
			}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			Sleep:        sleepTime,
		},
		{
			Desc:         "export route1",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/export/routes/r1",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			ExpectBody:   exportStrR1,
		},
		{
			Desc:         "delete the route1 just created",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/r1",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:         "hit the route1 just deleted",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   "{\"error_msg\":\"404 Route Not Found\"}\n",
			Sleep:        sleepTime,
		},
	}
	for _, tc := range tests {
		testCaseCheck(tc, t)
	}

}

func TestRoute_Export_Equal_URI(t *testing.T) {
	// 13.Add suffix when testing the same URI export
	exportStrAll := `{
		"components": {},
		"info": {
			"title": "RoutesExport",
			"version": "3.0.0"
		},
		"openapi": "3.0.0",
		"paths": {
			"/test-test": {
				"get": {
					"operationId": "route_allGET",
					"requestBody": {},
					"responses": {
						"default": {
							"description": ""
						}
					},
					"summary": "所有",
					"x-apisix-enable_websocket": false,
					"x-apisix-hosts": ["test.com"],
					"x-apisix-plugins": {},
					"x-apisix-priority": 0,
					"x-apisix-status": 1,
					"x-apisix-upstream": {
						"nodes": {
							"172.16.238.20:1980": 1
						},
						"type": "roundrobin"
					}
				}
			},
			"/test-test-APISIX-REPEAT-URI-2": {
				"get": {
					"operationId": "route_allGET",
					"requestBody": {},
					"responses": {
						"default": {
							"description": ""
						}
					},
					"summary": "所有1",
					"x-apisix-enable_websocket": false,
					"x-apisix-hosts": ["test.com"],
					"x-apisix-plugins": {},
					"x-apisix-priority": 0,
					"x-apisix-status": 1,
					"x-apisix-upstream": {
						"nodes": {
							"172.16.238.20:1980": 1
						},
						"type": "roundrobin"
					}
				}
			},
			"/test-test-APISIX-REPEAT-URI-3": {
				"get": {
					"operationId": "route_allGET",
					"requestBody": {},
					"responses": {
						"default": {
							"description": ""
						}
					},
					"summary": "所有2",
					"x-apisix-enable_websocket": false,
					"x-apisix-hosts": ["test.com"],
					"x-apisix-plugins": {},
					"x-apisix-priority": 0,
					"x-apisix-status": 1,
					"x-apisix-upstream": {
						"nodes": {
							"172.16.238.20:1981": 1
						},
						"type": "roundrobin"
					}
				}
			}
		}
	}`
	exportStrAll = replaceStr(exportStrAll)

	tests := []HttpTestCase{
		{
			Desc:   "Create a route",
			Object: ManagerApiExpect(t),
			Method: http.MethodPut,
			Path:   "/apisix/admin/routes/r1",
			Body: `{
					"uris": ["/test-test"],
					"name": "route_all",
					"desc": "所有",
					"methods": ["GET"],
					"hosts": ["test.com"],
					"status": 1,
					"upstream": {
						"nodes": {
							"172.16.238.20:1980": 1
						},
						"type": "roundrobin"
					}
			}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			Sleep:        sleepTime,
		},
		{
			Desc:   "Create a route2",
			Object: ManagerApiExpect(t),
			Method: http.MethodPut,
			Path:   "/apisix/admin/routes/r2",
			Body: `{
					"uris": ["/test-test"],
					"name": "route_all",
					"desc": "所有1",
					"methods": ["GET"],
					"hosts": ["test.com"],
					"status": 1,
					"upstream": {
						"nodes": {
							"172.16.238.20:1980": 1
						},
						"type": "roundrobin"
					}
			}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			Sleep:        sleepTime,
		},
		{
			Desc:   "Create a route3",
			Object: ManagerApiExpect(t),
			Method: http.MethodPut,
			Path:   "/apisix/admin/routes/r3",
			Body: `{
					"uris": ["/test-test"],
					"name": "route_all",
					"desc": "所有2",
					"methods": ["GET"],
					"hosts": ["test.com"],
					"status": 1,
					"upstream": {
						"nodes": {
							"172.16.238.20:1981": 1
						},
						"type": "roundrobin"
					}
			}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			Sleep:        sleepTime,
		},
		{
			Desc:         "use the exportall inerface to export all routes",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/export/routes/r1,r2,r3",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			ExpectBody:   exportStrAll,
		},
		{
			Desc:         "delete the route1 just created",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/r1",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:         "hit the route1 just deleted",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   "{\"error_msg\":\"404 Route Not Found\"}\n",
			Sleep:        sleepTime,
		},
		{
			Desc:         "delete the route2 just created",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/r2",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:         "hit the route2 just deleted",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   "{\"error_msg\":\"404 Route Not Found\"}\n",
			Sleep:        sleepTime,
		},
	}
	for _, tc := range tests {
		testCaseCheck(tc, t)
	}

}

func replaceStr(str string) string {
	str = strings.Replace(str, "\n", "", -1)
	str = strings.Replace(str, "\t", "", -1)
	str = strings.Replace(str, " ", "", -1)
	return str
}
