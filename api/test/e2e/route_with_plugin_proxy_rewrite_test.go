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

func TestRoute_With_Plugin_Proxy_Rewrite(t *testing.T) {
	tests := []HttpTestCase{
		{
			caseDesc:     "make sure the route is not created",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   `{"error_msg":"404 Route Not Found"}`,
		},
		{
			caseDesc: "create route that will rewrite host and uri",
			Object:   MangerApiExpect(t),
			Method:   http.MethodPut,
			Path:     "/apisix/admin/routes/r1",
			Body: `{
				"uri": "/hello",
				"plugins": {
					"proxy-rewrite": {
						"uri": "/plugin_proxy_rewrite",
						"host": "test.com"
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
		},
		{
			caseDesc:     "verify route that rewrite host and uri",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusOK,
			ExpectBody:   "uri: /plugin_proxy_rewrite\nhost: test.com",
			Sleep:        sleepTime,
		},
		{
			caseDesc: "update route that will rewrite headers",
			Object:   MangerApiExpect(t),
			Method:   http.MethodPut,
			Path:     "/apisix/admin/routes/r1",
			Body: `{
				"uri": "/hello",
				"plugins": {
					"proxy-rewrite": {
						"uri": "/uri/plugin_proxy_rewrite",
						"headers": {
							"X-Api-Version": "v2"
						}
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
		},
		{
			caseDesc:     "verify route that rewrite headers",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello",
			Headers:      map[string]string{"X-Api-Version": "v1"},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "x-api-version: v2",
			Sleep:        sleepTime,
		},
		{
			caseDesc: "update route using regex_uri",
			Object:   MangerApiExpect(t),
			Method:   http.MethodPut,
			Path:     "/apisix/admin/routes/r1",
			Body: `{
				"uri": "/test/*",
				"plugins": {
					"proxy-rewrite": {
						"regex_uri": ["^/test/(.*)/(.*)/(.*)", "/$1_$2_$3"]
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
		},
		{
			caseDesc:     "verify route that using regex_uri",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         `/test/plugin/proxy/rewrite`,
			ExpectStatus: http.StatusOK,
			ExpectBody:   "uri: /plugin_proxy_rewrite",
			Sleep:        sleepTime,
		},
		{
			caseDesc: "update route that will rewrite args",
			Object:   MangerApiExpect(t),
			Method:   http.MethodPut,
			Path:     "/apisix/admin/routes/r1",
			Body: `{
				"uri": "/hello",
				"plugins": {
					"proxy-rewrite": {
						"uri": "/plugin_proxy_rewrite_args?name=api6"
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
		},
		{
			caseDesc:     "verify route that rewrite args",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         `/hello`,
			Query:        "name=api7",
			ExpectStatus: http.StatusOK,
			ExpectBody:   "uri: /plugin_proxy_rewrite_args\nname: api6",
			Sleep:        sleepTime,
		},
		{
			caseDesc:     "delete route",
			Object:       MangerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/r1",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			caseDesc:     "make sure the route deleted",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   `{"error_msg":"404 Route Not Found"}`,
			Sleep:        sleepTime,
		},
	}

	for _, tc := range tests {
		testCaseCheck(tc)
	}

}
