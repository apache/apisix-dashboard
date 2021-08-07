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
	"testing"
)

func TestRoute_Invalid_Host(t *testing.T) {
	tests := []HttpTestCase{
		{
			Desc:   "invalid host",
			Object: ManagerApiExpect(t),
			Path:   "/apisix/admin/routes/r1",
			Method: http.MethodPut,
			Body: `{
				"name": "route1",
				"uri": "/hello_",
				"host": "$%$foo.com",
				"upstream": {
					"nodes": {
						"` + UpstreamIp + `:1980": 1
					},
					"type": "roundrobin"
				}
			}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusBadRequest,
		},
		{
			Desc:   "invalid hosts",
			Object: ManagerApiExpect(t),
			Method: http.MethodPut,
			Path:   "/apisix/admin/routes/r1",
			Body: `{
				"name": "route1",
				"uri": "/hello_",
				"hosts": ["$%$foo.com", "*.bar.com"],
				"upstream": {
					"nodes": {
						"` + UpstreamIp + `:1980": 1
					},
					"type": "roundrobin"
				}
			}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusBadRequest,
		},
		{
			Desc:   "create route with host and hosts together at the same time",
			Object: ManagerApiExpect(t),
			Method: http.MethodPut,
			Path:   "/apisix/admin/routes/r1",
			Body: `{
				"name": "route1",
				"uri": "/hello_",
				"host": "github.com",
				"hosts": ["foo.com", "*.bar.com"],
				"upstream": {
					"nodes": {
						"` + UpstreamIp + `:1980": 1
					},
					"type": "roundrobin"
				}
			}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusBadRequest,
		},
		{
			Desc:         "hit route not created",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello_",
			Headers:      map[string]string{"Host": "foo.com"},
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   "{\"error_msg\":\"404 Route Not Found\"}\n",
		},
		{
			Desc:         "hit route not created",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello_",
			Headers:      map[string]string{"Host": "$%$foo.com"},
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   "{\"error_msg\":\"404 Route Not Found\"}\n",
		},
	}

	for _, tc := range tests {
		testCaseCheck(tc, t)
	}
}

func TestRoute_Create_With_Hosts(t *testing.T) {
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
				"name": "route1",
				"uri": "/hello_",
				"hosts": ["foo.com", "*.bar.com"],
				"upstream": {
					"nodes": {
						"` + UpstreamIp + `:1980": 1
					},
					"type": "roundrobin"
				}
			}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			ExpectBody:   []string{"\"id\":\"r1\"", "\"uri\":\"/hello_\""},
		},
		{
			Desc:   "create route with int uri",
			Object: ManagerApiExpect(t),
			Method: http.MethodPut,
			Path:   "/apisix/admin/routes/r1",
			Body: `{
				"name": "route1",
				"uri": 123456
			}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusBadRequest,
		},
		{
			Desc:         "hit the route just created - wildcard domain name",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello_",
			Headers:      map[string]string{"Host": "test.bar.com"},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "hello world\n",
			Sleep:        sleepTime,
		},
		{
			Desc:         "hit the route just created",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello_",
			Headers:      map[string]string{"Host": "foo.com"},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "hello world\n",
		},
		{
			Desc:         "hit the route not exists",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello_111",
			Headers:      map[string]string{"Host": "foo.com"},
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   "{\"error_msg\":\"404 Route Not Found\"}\n",
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
	}

	for _, tc := range tests {
		testCaseCheck(tc, t)
	}
}

func TestRoute_Update_Routes_With_Hosts(t *testing.T) {
	tests := []HttpTestCase{
		{
			Desc:         "hit route that not exist",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello",
			Headers:      map[string]string{"Host": "foo.com"},
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   "{\"error_msg\":\"404 Route Not Found\"}\n",
		},
		{
			Desc:   "create route with host foo.com",
			Object: ManagerApiExpect(t),
			Method: http.MethodPut,
			Path:   "/apisix/admin/routes/r1",
			Body: `{
				"name": "route1",
				"uri": "/hello",
				"methods": ["GET"],
				"hosts": ["foo.com"],
				"upstream": {
					"type": "roundrobin",
					"nodes": [{
						"host": "` + UpstreamIp + `",
						"port": 1980,
						"weight": 1
					}]
				}
			}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			ExpectBody:   []string{"\"id\":\"r1\"", "\"hosts\":[\"foo.com\"]"},
		},
		{
			Desc:         "hit the route just create",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello",
			Headers:      map[string]string{"Host": "foo.com"},
			ExpectStatus: http.StatusOK,
			Sleep:        sleepTime,
		},
		{
			Desc:   "update route with host bar.com",
			Object: ManagerApiExpect(t),
			Method: http.MethodPut,
			Path:   "/apisix/admin/routes/r1",
			Body: `{
				"name": "route1",
				"uri": "/hello",
				"hosts": ["bar.com"],
				"upstream": {
					"nodes": {
						"` + UpstreamIp + `:1980": 1
					},
					"type": "roundrobin"
				}
			}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			ExpectBody:   []string{"\"id\":\"r1\"", "\"hosts\":[\"bar.com\"]"},
		},
		{
			Desc:         "hit the route with host foo.com",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello",
			Headers:      map[string]string{"Host": "foo.com"},
			ExpectStatus: http.StatusNotFound,
			Sleep:        sleepTime,
		},
		{
			Desc:         "hit the route just updated",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello",
			Headers:      map[string]string{"Host": "bar.com"},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "hello world\n",
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
			Desc:         "hit the route just deleted",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello",
			Headers:      map[string]string{"Host": "bar.com"},
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   "{\"error_msg\":\"404 Route Not Found\"}\n",
			Sleep:        sleepTime,
		},
	}

	for _, tc := range tests {
		testCaseCheck(tc, t)
	}
}

func TestRoute_Patch(t *testing.T) {
	tests := []HttpTestCase{
		{

			Desc:         "make sure the route not exists",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   "{\"error_msg\":\"404 Route Not Found\"}\n",
		},
		{
			Desc:   "create route",
			Object: ManagerApiExpect(t),
			Method: http.MethodPut,
			Path:   "/apisix/admin/routes/r1",
			Body: `{
				"name": "route1",
				"uri": "/hello",
				"upstream": {
					"nodes": {
						"` + UpstreamIp + `:1980": 1
					},
					"type": "roundrobin"
				}
			}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:         "hit the route just created ",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusOK,
			ExpectBody:   "hello world",
			Sleep:        sleepTime,
		},
		{
			Desc:         "route patch for update status(route offline)",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodPatch,
			Path:         "/apisix/admin/routes/r1",
			Body:         `{"status":0}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:         "make sure the route has been offline",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   "{\"error_msg\":\"404 Route Not Found\"}\n",
			Sleep:        sleepTime,
		},
		{
			Desc:   "route patch for update status (route online)",
			Object: ManagerApiExpect(t),
			Method: http.MethodPatch,
			Path:   "/apisix/admin/routes/r1/status",
			Body:   "1",
			Headers: map[string]string{
				"Authorization": token,
				"Content-Type":  "text/plain",
			},
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:         "make sure the route has been online",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusOK,
			ExpectBody:   "hello world",
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
			Desc:         "hit the route just deleted",
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

//uris methods remote_addrs
func TestRoute_With_Empty_Array(t *testing.T) {
	tests := []HttpTestCase{
		{
			Desc:   "create route with empty hosts and host",
			Object: ManagerApiExpect(t),
			Path:   "/apisix/admin/routes/r1",
			Method: http.MethodPut,
			Body: `{
				"name": "route1",
				"uri": "/hello",
				"hosts": [],
				"host": "test.com",
				"upstream": {
					"nodes": {
						"` + UpstreamIp + `:1980": 1
					},
					"type": "roundrobin"
				}
			}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusBadRequest,
			ExpectBody:   `{"code":10000,"message":"schema validate failed: (root): Must validate one and only one schema (oneOf)\n(root): Must validate all the schemas (allOf)\nhosts: Array must have at least 1 items"}`,
		},
		{
			Desc:         "make sure the route not created",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello",
			Headers:      map[string]string{"Host": "test.com"},
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   `{"error_msg":"404 Route Not Found"}`,
		},
		{
			Desc:   "create route with empty hosts",
			Object: ManagerApiExpect(t),
			Path:   "/apisix/admin/routes/r1",
			Method: http.MethodPut,
			Body: `{
				"name": "route1",
				"uri": "/hello",
				"hosts": [],
				"upstream": {
					"nodes": {
						"` + UpstreamIp + `:1980": 1
					},
					"type": "roundrobin"
				}
			}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusBadRequest,
			ExpectBody:   `{"code":10000,"message":"schema validate failed: hosts: Array must have at least 1 items"}`,
		},
		{
			Desc:         "make sure the route not created",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   `{"error_msg":"404 Route Not Found"}`,
		},
		{
			Desc:   "create route with empty uris and uri",
			Object: ManagerApiExpect(t),
			Path:   "/apisix/admin/routes/r1",
			Method: http.MethodPut,
			Body: `{
				"name": "route1",
				"uri": "/hello",
				"uris": [],
				"upstream": {
					"nodes": {
						"` + UpstreamIp + `:1980": 1
					},
					"type": "roundrobin"
				}
			}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusBadRequest,
			ExpectBody:   `{"code":10000,"message":"schema validate failed: (root): Must validate one and only one schema (oneOf)\n(root): Must validate all the schemas (allOf)\nuris: Array must have at least 1 items"}`,
		},
		{
			Desc:   "create route with empty remote_addrs and remote_addr",
			Object: ManagerApiExpect(t),
			Path:   "/apisix/admin/routes/r1",
			Method: http.MethodPut,
			Body: `{
				"name": "route1",
				"uri": "/hello",
				"remote_addrs": [],
				"remote_addr": "0.0.0.0",
				"upstream": {
					"nodes": {
						"` + UpstreamIp + `:1980": 1
					},
					"type": "roundrobin"
				}
			}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusBadRequest,
			ExpectBody:   `{"code":10000,"message":"schema validate failed: (root): Must validate one and only one schema (oneOf)\n(root): Must validate all the schemas (allOf)\nremote_addrs: Array must have at least 1 items"}`,
		},
		{
			Desc:         "make sure the route not created",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   `{"error_msg":"404 Route Not Found"}`,
		},
	}

	for _, tc := range tests {
		testCaseCheck(tc, t)
	}
}

func TestRoute_Create_via_POST(t *testing.T) {
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
			Desc:   "create route via HTTP POST",
			Object: ManagerApiExpect(t),
			Method: http.MethodPost,
			Path:   "/apisix/admin/routes",
			Body: `{
				"id": "r1",
				"name": "route1",
				"uri": "/hello_",
				"hosts": ["foo.com", "*.bar.com"],
				"upstream": {
					"nodes": {
						"` + UpstreamIp + `:1980": 1
					},
					"type": "roundrobin"
				}
			}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			// Check the returned value
			ExpectBody: "\"id\":\"r1\"",
		},
		{
			Desc:         "hit the route just created",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello_",
			Headers:      map[string]string{"Host": "foo.com"},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "hello world\n",
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
	}

	for _, tc := range tests {
		testCaseCheck(tc, t)
	}
}
