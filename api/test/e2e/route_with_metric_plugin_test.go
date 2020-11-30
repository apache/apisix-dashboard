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

func TestRoute_With_Plugin_Prometheus(t *testing.T) {
	tests := []HttpTestCase{
		{
			caseDesc:     "make sure the route is not created ",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   `{"error_msg":"404 Route Not Found"}`,
		},
		{
			caseDesc: "create route",
			Object:   MangerApiExpect(t),
			Method:   http.MethodPut,
			Path:     "/apisix/admin/routes/r1",
			Body: `{
				"uri": "/hello",
				"plugins": {
					"prometheus": {}
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
			caseDesc:     "fetch the prometheus metric data",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/apisix/prometheus/metrics",
			ExpectStatus: http.StatusOK,
			ExpectBody:   "apisix_etcd_reachable 1",
			Sleep:        sleepTime,
		},
		{
			caseDesc:     "request from client (200)",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusOK,
			ExpectBody:   "hello world",
		},
		{
			caseDesc: "create route that uri not exists in upstream",
			Object:   MangerApiExpect(t),
			Method:   http.MethodPut,
			Path:     "/apisix/admin/routes/r1",
			Body: `{
				"uri": "/hello-not-exists",
				"plugins": {
					"prometheus": {}
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
			caseDesc:     "request from client (404)",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello-not-exists",
			ExpectStatus: http.StatusNotFound,
			Sleep:        sleepTime,
		},
		{
			caseDesc:     "verify the prometheus metric data (apisix_http_status 200)",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/apisix/prometheus/metrics",
			ExpectStatus: http.StatusOK,
			ExpectBody:   `apisix_http_status{code="200",route="r1",matched_uri="/hello",matched_host="",service="",consumer=""`,
			Sleep:        sleepTime,
		},
		{
			caseDesc:     "verify the prometheus metric data (apisix_http_status 404)",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/apisix/prometheus/metrics",
			ExpectStatus: http.StatusOK,
			ExpectBody:   `apisix_http_status{code="404",route="r1",matched_uri="/hello-not-exists",matched_host="",service="",consumer=""`,
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
			caseDesc:     "make sure the route has been deleted",
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
