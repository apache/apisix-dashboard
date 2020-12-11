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
				"uri": "/hello_",
				"host": "$%$foo.com",
				"upstream": {
					"nodes": {
						"172.16.238.20:1980": 1
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
				"uri": "/hello_",
				"hosts": ["$%$foo.com", "*.bar.com"],
				"upstream": {
					"nodes": {
						"172.16.238.20:1980": 1
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
				"uri": "/hello_",
				"host": "github.com",
				"hosts": ["foo.com", "*.bar.com"],
				"upstream": {
					"nodes": {
						"172.16.238.20:1980": 1
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
				"uri": "/hello_",
				"hosts": ["foo.com", "*.bar.com"],
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
			Desc:   "create route with int uri",
			Object: ManagerApiExpect(t),
			Method: http.MethodPut,
			Path:   "/apisix/admin/routes/r1",
			Body: `{
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
	}

	for _, tc := range tests {
		testCaseCheck(tc, t)
	}
}

func TestRoute_Update_Routes_With_Hosts(t *testing.T) {
	tests := []HttpTestCase{
		{
			Desc:   "update route",
			Object: ManagerApiExpect(t),
			Method: http.MethodPut,
			Path:   "/apisix/admin/routes/r1",
			Body: `{
				"uri": "/hello1",
				"hosts": ["bar.com"],
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
			Desc:         "hit the route just updated",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello_",
			Headers:      map[string]string{"Host": "foo.com"},
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   "{\"error_msg\":\"404 Route Not Found\"}\n",
			Sleep:        sleepTime,
		},
		{
			Desc:         "hit the route just updated",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello1",
			Headers:      map[string]string{"Host": "bar.com"},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "hello1 world\n",
		},
	}

	for _, tc := range tests {
		testCaseCheck(tc, t)
	}
}

func TestRoute_Delete_Routes_With_Hosts(t *testing.T) {
	tests := []HttpTestCase{
		{
			Desc:         "delete route",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/r1",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:         "delete not exist route",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/not-exist",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusNotFound,
		},
		{
			Desc:         "hit the route just deleted",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello1",
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
