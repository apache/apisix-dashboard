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

func TestRoute_with_vars(t *testing.T) {
	tests := []HttpTestCase{
		{
			caseDesc: "add route with vars (args)",
			Object:   MangerApiExpect(t),
			Method:   http.MethodPut,
			Path:     "/apisix/admin/routes/r1",
			Body: `{
					"uri": "/hello",
					"vars": [
						["arg_name","==","aaa"]
					],
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
		},

		{
			caseDesc:     "hit the route with right args",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         `/hello`,
			Query:        "name=aaa",
			ExpectStatus: http.StatusOK,
			Sleep:        sleepTime,
		},

		{
			caseDesc:     "hit the route with wrong args",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         `/hello`,
			Query:        "name=bbb",
			ExpectStatus: http.StatusNotFound,
			Sleep:        sleepTime,
		},

		{
			caseDesc:     "hit the route with no args",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         `/hello`,
			ExpectStatus: http.StatusNotFound,
			Sleep:        sleepTime,
		},

		{
			caseDesc: "update route with vars (header)",
			Object:   MangerApiExpect(t),
			Method:   http.MethodPut,
			Path:     "/apisix/admin/routes/r1",
			Body: `{
					"uri": "/hello",
					"vars": [
						["http_k","==","header"]
					],
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
		},

		{
			caseDesc:     "hit the route with right header",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Headers:      map[string]string{"k": "header"},
			Path:         `/hello`,
			ExpectStatus: http.StatusOK,
			Sleep:        sleepTime,
		},

		{
			caseDesc:     "hit the route with wrong header",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Headers:      map[string]string{"k": "jack"},
			Path:         `/hello`,
			ExpectStatus: http.StatusNotFound,
			Sleep:        sleepTime,
		},

		{
			caseDesc:     "hit the route with no header",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         `/hello`,
			ExpectStatus: http.StatusNotFound,
			Sleep:        sleepTime,
		},

		{
			caseDesc: "update route with vars (cookie)",
			Object:   MangerApiExpect(t),
			Method:   http.MethodPut,
			Path:     "/apisix/admin/routes/r1",
			Body: `{
					"uri": "/hello",
					"vars": [
						["http_cookie","==","_octo=GH1.1.572248189.1598928545; _device_id=2c1a1a52074e66a3a008e4b73c690500; logged_in=yes;"]
					],
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
		},

		{
			caseDesc:     "hit the route with right Cookie",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Headers:      map[string]string{"Cookie": "_octo=GH1.1.572248189.1598928545; _device_id=2c1a1a52074e66a3a008e4b73c690500; logged_in=yes;"},
			Path:         `/hello`,
			ExpectStatus: http.StatusOK,
			Sleep:        sleepTime,
		},

		{
			caseDesc:     "hit the route with wrong Cookie",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Headers:      map[string]string{"Cookie": "jack"},
			Path:         `/hello`,
			ExpectStatus: http.StatusNotFound,
			Sleep:        sleepTime,
		},

		{
			caseDesc:     "hit the route with no Cookie",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         `/hello`,
			ExpectStatus: http.StatusNotFound,
			Sleep:        sleepTime,
		},

		{
			caseDesc:     "delete route",
			Object:       MangerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/r1",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			Sleep:        sleepTime,
		},

		{
			caseDesc: "add route with multiple vars (args, cookie and header)",
			Object:   MangerApiExpect(t),
			Method:   http.MethodPut,
			Path:     "/apisix/admin/routes/r1",
			Body: `{
					"uri": "/hello",
					"vars": [
						["http_cookie","==","_octo=GH1.1.572248189.1598928545; _device_id=2c1a1a52074e66a3a008e4b73c690500; logged_in=yes;"],
						["http_k","==","header"],
						["arg_name","==","aaa"]
					],
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
		},

		{
			caseDesc:     "hit the route with right parameters",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Headers:      map[string]string{"k": "header", "Cookie": "_octo=GH1.1.572248189.1598928545; _device_id=2c1a1a52074e66a3a008e4b73c690500; logged_in=yes;"},
			Path:         `/hello`,
			Query:        "name=aaa",
			ExpectStatus: http.StatusOK,
			Sleep:        sleepTime,
		},

		{
			caseDesc:     "hit the route with wrong arg",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Headers:      map[string]string{"k": "header", "Cookie": "_octo=GH1.1.572248189.1598928545; _device_id=2c1a1a52074e66a3a008e4b73c690500; logged_in=yes;"},
			Path:         `/hello`,
			ExpectStatus: http.StatusNotFound,
			Sleep:        sleepTime,
		},

		{
			caseDesc:     "hit the route with wrong header",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Headers:      map[string]string{"k": "test", "Cookie": "_octo=GH1.1.572248189.1598928545; _device_id=2c1a1a52074e66a3a008e4b73c690500; logged_in=yes;"},
			Path:         `/hello`,
			Query:        "name=aaa",
			ExpectStatus: http.StatusNotFound,
			Sleep:        sleepTime,
		},

		{
			caseDesc:     "hit the route with wrong cookie",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Headers:      map[string]string{"k": "header", "Cookie": "_octo=GH1.1.572248189.1598928545; logged_in=yes;"},
			Path:         `/hello`,
			Query:        "name=aaa",
			ExpectStatus: http.StatusNotFound,
			Sleep:        sleepTime,
		},

		{
			caseDesc:     "delete route",
			Object:       MangerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/r1",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			Sleep:        sleepTime,
		},

		{
			caseDesc: "add route with vars (args is digital)",
			Object:   MangerApiExpect(t),
			Method:   http.MethodPut,
			Path:     "/apisix/admin/routes/r1",
			Body: `{
					"uri": "/hello",
					"vars": [
						["arg_name","==",111]
					],
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
		},

		{
			caseDesc:     "verify route",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         `/hello`,
			Query:        "name=111",
			ExpectStatus: http.StatusOK,
			Sleep:        sleepTime,
		},

		{
			caseDesc:     "delete the route with vars (args is digital)",
			Object:       MangerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/r1",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			Sleep:        sleepTime,
		},
	}

	for _, tc := range tests {
		testCaseCheck(tc)
	}
}
