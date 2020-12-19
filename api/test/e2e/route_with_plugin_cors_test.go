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

func TestRoute_With_Plugin_Cors(t *testing.T) {
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
			caseDesc: "create route with cors default setting",
			Object:   ManagerApiExpect(t),
			Method:   http.MethodPut,
			Path:     "/apisix/admin/routes/r1",
			Body: `{
				"uri": "/hello",
				"plugins": {
					"cors": {}
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
			caseDesc:     "verify route with cors default setting",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusOK,
			ExpectHeaders: map[string]string{
				"Access-Control-Allow-Origin":  "*",
				"Access-Control-Allow-Methods": "*",
			},
			ExpectBody: "hello world",
			Sleep:      sleepTime,
		},
		{
			caseDesc: "update route with specified setting",
			Object:   ManagerApiExpect(t),
			Method:   http.MethodPut,
			Path:     "/apisix/admin/routes/r1",
			Body: `{
			"uri": "/hello",
				"plugins": {
					"cors": {
						"allow_origins": "http://sub.domain.com,http://sub2.domain.com",
						"allow_methods": "GET,POST",
						"allow_headers": "headr1,headr2",
						"expose_headers": "ex-headr1,ex-headr2",
						"max_age": 50,
						"allow_credential": true
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
			caseDesc: "verify route with cors specified setting",
			Object:   APISIXExpect(t),
			Method:   http.MethodGet,
			Path:     "/hello",
			Headers: map[string]string{
				"Origin":    "http://sub2.domain.com",
				"resp-vary": "Via",
			},
			ExpectStatus: http.StatusOK,
			ExpectHeaders: map[string]string{
				"Access-Control-Allow-Origin":   "http://sub2.domain.com",
				"Access-Control-Allow-Methods":  "GET,POST",
				"Access-Control-Allow-Headers":  "headr1,headr2",
				"Access-Control-Expose-Headers": "ex-headr1,ex-headr2",
				"Access-Control-Max-Age":        "50",
			},
			ExpectBody: "hello world",
			Sleep:      sleepTime,
		},
		{
			caseDesc: "verify route with cors specified no match origin",
			Object:   APISIXExpect(t),
			Method:   http.MethodGet,
			Path:     "/hello",
			Headers: map[string]string{
				"Origin": "http://sub3.domain.com",
			},
			ExpectStatus: http.StatusOK,
			ExpectHeaders: map[string]string{
				"Access-Control-Allow-Origin":   "",
				"Access-Control-Allow-Methods":  "",
				"Access-Control-Allow-Headers":  "",
				"Access-Control-Expose-Headers": "",
				"Access-Control-Max-Age":        "",
			},
			ExpectBody: "hello world",
			Sleep:      sleepTime,
		},
		{
			caseDesc:     "verify route with options method",
			Object:       APISIXExpect(t),
			Method:       http.MethodOptions,
			Headers: map[string]string{
				"Origin":    "http://sub2.domain.com",
			},
			Path:         "/hello",
			ExpectStatus: http.StatusOK,
			ExpectHeaders: map[string]string{
				"Access-Control-Allow-Origin":   "http://sub2.domain.com",
				"Access-Control-Allow-Methods":  "GET,POST",
				"Access-Control-Allow-Headers":  "headr1,headr2",
				"Access-Control-Expose-Headers": "ex-headr1,ex-headr2",
				"Access-Control-Max-Age":        "50",
			},
			ExpectBody: "",
		},
		{
			caseDesc: "update route with cors setting force wildcard",
			Object:   ManagerApiExpect(t),
			Method:   http.MethodPut,
			Path:     "/apisix/admin/routes/r1",
			Body: `{
				"uri": "/hello",
				"plugins": {
					"cors": {
						"allow_origins": "**",
						"allow_methods": "**",
						"allow_headers": "**",
						"expose_headers": "*"
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
			caseDesc: "verify route with cors setting force wildcard",
			Object:   APISIXExpect(t),
			Method:   http.MethodGet,
			Path:     "/hello",
			Headers: map[string]string{
				"Origin":                         "https://sub.domain.com",
				"ExternalHeader1":                "val",
				"ExternalHeader2":                "val",
				"ExternalHeader3":                "val",
				"Access-Control-Request-Headers": "req-header1,req-header2",
			},
			ExpectStatus: http.StatusOK,
			ExpectHeaders: map[string]string{
				"Access-Control-Allow-Origin":      "https://sub.domain.com",
				"Vary":                             "Origin",
				"Access-Control-Allow-Methods":     "GET,POST,PUT,DELETE,PATCH,HEAD,OPTIONS,CONNECT,TRACE",
				"Access-Control-Allow-Headers":     "req-header1,req-header2",
				"Access-Control-Expose-Headers":    "*",
				"Access-Control-Allow-Credentials": "",
			},
			ExpectBody: "hello world",
			Sleep:      sleepTime,
		},
		{
			caseDesc:     "delete route",
			Object:       ManagerApiExpect(t),
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
