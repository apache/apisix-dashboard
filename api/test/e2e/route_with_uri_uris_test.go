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

func TestRoute_with_invalid_uri_uris(t *testing.T) {
	tests := []HttpTestCase{
		{
			caseDesc: "add route with invalid uri",
			Object:   MangerApiExpect(t),
			Method:   http.MethodPut,
			Path:     "/apisix/admin/routes/r1",
			Body: `{
					"uri": "/hello_notexist",
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
			Path:         "/hello_notexist",
			Headers:      map[string]string{"Authorization": token},
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
		},
		{
			caseDesc: "add route with uris (partly invalid)",
			Object:   MangerApiExpect(t),
			Method:   http.MethodPut,
			Path:     "/apisix/admin/routes/r1",
			Body: `{
					"uris": ["/hello_notexist","/hello"],
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
			caseDesc:     "verify route (not exist uri)",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello_notexist",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusNotFound,
			Sleep:        sleepTime,
		},
		{
			caseDesc:     "verify route (exist uri)",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "hello world",
			Sleep:        sleepTime,
		},
		{
			caseDesc: "add route with uris (all invalid)",
			Object:   MangerApiExpect(t),
			Method:   http.MethodPut,
			Path:     "/apisix/admin/routes/r1",
			Body: `{
					"uris": ["/hello_notexist","/hello_notexist2"],
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
			caseDesc:     "verify route (not exist uri)",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello_notexist",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusNotFound,
			Sleep:        sleepTime,
		},
		{
			caseDesc:     "verify route (exist uri)",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello_notexist2",
			Headers:      map[string]string{"Authorization": token},
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
		},
	}

	for _, tc := range tests {
		testCaseCheck(tc)
	}
}

func TestRoute_with_valid_uri_uris(t *testing.T) {
	tests := []HttpTestCase{
		{
			caseDesc: "add route with valid uri",
			Object:   MangerApiExpect(t),
			Method:   http.MethodPut,
			Path:     "/apisix/admin/routes/r1",
			Body: `{
					"uri": "/hello",
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
			Path:         "/hello",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "hello world",
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
			caseDesc: "add route with valid uris",
			Object:   MangerApiExpect(t),
			Method:   http.MethodPut,
			Path:     "/apisix/admin/routes/r1",
			Body: `{
					"uris": ["/hello","/status"],
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
			Path:         "/hello",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "hello world",
			Sleep:        sleepTime,
		},
		{
			caseDesc:     "verify route",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/status",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "ok",
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
	}

	for _, tc := range tests {
		testCaseCheck(tc)
	}
}
