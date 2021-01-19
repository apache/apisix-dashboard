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
	"net/http"
	"strings"
	"testing"
)

func TestRoute_Export(t *testing.T) {
	exportStrR1 := `
			"/hello_": {
				"get": {
					"operationId": "aaaaGet",
					"requestBody": {},
					"responses": {
						"default": {
							"description": ""
						}
					},
					"security": [],
					"x-apisix-enableWebsocket": false,
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
					"operationId": "aaaaPost",
					"requestBody": {},
					"responses": {
						"default": {
							"description": ""
						}
					},
					"security": [],
					"x-apisix-enableWebsocket": false,
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
			Desc:   "create route",
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
			Method:       http.MethodPost,
			Path:         "/apisix/admin/routes/export/r1",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "{\"components\":{},\"info\":{\"title\":\"RoutesExport\",\"version\":\"3.0.0\"},\"openapi\":\"3.0.0\",\"paths\":{" + exportStrR1 + "}}",
		},
	}
	for _, tc := range tests {
		testCaseCheck(tc, t)
	}

	exportStrR2 := `
			"/hello2": {
				"get": {
					"operationId": "aaaa2Get",
					"requestBody": {},
					"responses": {
						"default": {
							"description": ""
						}
					},
					"security": [],
					"x-apisix-enableWebsocket": false,
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
					"operationId": "aaaa2Post",
					"requestBody": {},
					"responses": {
						"default": {
							"description": ""
						}
					},
					"security": [],
					"x-apisix-enableWebsocket": false,
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
	exportStrR2 = replaceStr(exportStrR2)

	tests2 := []HttpTestCase{
		{
			Desc:         "hit route2 that not exist",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello2",
			Headers:      map[string]string{"Host": "foo.com"},
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   "{\"error_msg\":\"404 Route Not Found\"}\n",
		},
		{
			Desc:   "create route2",
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
			Desc:         "export route2",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodPost,
			Path:         "/apisix/admin/routes/export/r2",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "{\"components\":{},\"info\":{\"title\":\"RoutesExport\",\"version\":\"3.0.0\"},\"openapi\":\"3.0.0\",\"paths\":{" + exportStrR2 + "}}",
		},
	}
	for _, tc := range tests2 {
		testCaseCheck(tc, t)
	}

	tests3 := []HttpTestCase{
		{
			Desc:         "export route route2",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodPost,
			Path:         "/apisix/admin/routes/export/r1,r2",
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
					"operationId": "Get",
					"requestBody": {},
					"responses": {
						"default": {
							"description": ""
						}
					},
					"x-apisix-enableWebsocket": false,
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
					"x-apisix-serviceID": "s1",
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

	// The test case tests the creation of a complete service.
	// And according to the service_ ID to create a route.
	// Test whether the plugin upstream label in the service is integrated with route and exported.
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
			Desc:   "create route3 using the service just created",
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
			Method:       http.MethodPost,
			Path:         "/apisix/admin/routes/export/r3",
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
					"operationId": "Get",
					"requestBody": {},
					"responses": {
						"default": {
							"description": ""
						}
					},
					"security": [],
					"x-apisix-enableWebsocket": false,
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
					"x-apisix-serviceID": "s2",
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
	// This test case tests the creation of a complete service.
	// And create a complete route, export rules as route upstream data for high priority, direct use.
	// However, if the data in the service (label, plugins) does not exist in the route, it will be fused and exported.
	// If it exists, the data in route will be used first
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
			Desc:   "create route4 using the service just created",
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
			Method:       http.MethodPost,
			Path:         "/apisix/admin/routes/export/r4",
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
}

func replaceStr(str string) string {
	str = strings.Replace(str, "\n", "", -1)
	str = strings.Replace(str, "\t", "", -1)
	str = strings.Replace(str, " ", "", -1)
	return str
}
