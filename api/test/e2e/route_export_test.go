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

func TestRoute_Export(t *testing.T) {
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
			Desc:         "export route",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodPost,
			Path:         "/apisix/admin/routes/export/r1",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "\"data\":{\"components\":{},\"info\":{\"title\":\"Routes Export\",\"version\":\"3.0.0\"},\"openapi\":\"3.0.0\",\"paths\":{\"/hello_\":{\"get\":{\"operationId\":\"aaaaGet\",\"requestBody\":{},\"responses\":{\"default\":{\"description\":\"\"}},\"security\":[],\"x-apisix-enableWebsocket\":false,\"x-apisix-hosts\":[\"foo.com\",\"*.bar.com\"],\"x-apisix-labels\":{\"build\":\"16\",\"env\":\"production\",\"version\":\"v2\"},\"x-apisix-plugins\":{\"limit-count\":{\"count\":2,\"key\":\"remote_addr\",\"rejected_code\":503,\"time_window\":60}},\"x-apisix-priority\":0,\"x-apisix-status\":1,\"x-apisix-upstream\":{\"nodes\":{\"172.16.238.20:1980\":1},\"type\":\"roundrobin\"}},\"post\":{\"operationId\":\"aaaaPost\",\"requestBody\":{},\"responses\":{\"default\":{\"description\":\"\"}},\"security\":[],\"x-apisix-enableWebsocket\":false,\"x-apisix-hosts\":[\"foo.com\",\"*.bar.com\"],\"x-apisix-labels\":{\"build\":\"16\",\"env\":\"production\",\"version\":\"v2\"},\"x-apisix-plugins\":{\"limit-count\":{\"count\":2,\"key\":\"remote_addr\",\"rejected_code\":503,\"time_window\":60}},\"x-apisix-priority\":0,\"x-apisix-status\":1,\"x-apisix-upstream\":{\"nodes\":{\"172.16.238.20:1980\":1},\"type\":\"roundrobin\"}}}}}",
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
