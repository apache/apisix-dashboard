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
	"encoding/json"
	"io/ioutil"
	"net/http"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestLabel(t *testing.T) {
	// build test body
	testCert, err := ioutil.ReadFile("../certs/test2.crt")
	assert.Nil(t, err)
	testKey, err := ioutil.ReadFile("../certs/test2.key")
	assert.Nil(t, err)
	body, err := json.Marshal(map[string]interface{}{
		"id":   "s1",
		"cert": string(testCert),
		"key":  string(testKey),
		"labels": map[string]string{
			"build": "16",
			"env":   "production",
			"extra": "ssl",
		},
	})
	assert.Nil(t, err)

	tests := []HttpTestCase{
		{
			caseDesc: "config route",
			Object:   ManagerApiExpect(t),
			Path:     "/apisix/admin/routes/r1",
			Method:   http.MethodPut,
			Body: `{
					"uri": "/hello",
					"labels": {
						"build":"16",
						"env":"production",
						"version":"v2"
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
		},
		{
			caseDesc: "create consumer",
			Object:   ManagerApiExpect(t),
			Path:     "/apisix/admin/consumers/c1",
			Method:   http.MethodPut,
			Body: `{
				"username": "jack",
				"plugins": {
					"key-auth": {
						"key": "auth-one"
					}
				},
				"labels": {
					"build":"16",
					"env":"production",
					"version":"v3"
				},
				"desc": "test description"
			}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			caseDesc: "create upstream",
			Object:   ManagerApiExpect(t),
			Method:   http.MethodPut,
			Path:     "/apisix/admin/upstreams/u1",
			Body: `{
				"nodes": [{
					"host": "172.16.238.20",
					"port": 1980,
					"weight": 1
				}],
				"labels": {
					"build":"17",
					"env":"production",
					"version":"v2"
				},
				"type": "roundrobin"
			}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			caseDesc:     "create ssl",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodPost,
			Path:         "/apisix/admin/ssl",
			Body:         string(body),
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			caseDesc: "create service",
			Object:   ManagerApiExpect(t),
			Method:   http.MethodPost,
			Path:     "/apisix/admin/services",
			Body: `{
				"id": "s1",
				"plugins": {
					"limit-count": {
						"count": 2,
						"time_window": 60,
						"rejected_code": 503,
						"key": "remote_addr"
					}
				},
				"upstream": {
					"type": "roundrobin",
					"nodes": [{
						"host": "39.97.63.215",
						"port": 80,
						"weight": 1
					}]
				},
				"labels": {
					"build":"16",
					"env":"production",
					"version":"v2",
					"extra": "test"
				}
			}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			caseDesc:     "get route label",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodGet,
			Path:         "/api/labels/route",
			ExpectStatus: http.StatusOK,
			ExpectBody:   "{\"build\":\"16\"},{\"env\":\"production\"},{\"version\":\"v2\"}",
		},
		{
			caseDesc:     "get consumer label",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodGet,
			Path:         "/api/labels/consumer",
			ExpectStatus: http.StatusOK,
			ExpectBody:   "{\"build\":\"16\"},{\"env\":\"production\"},{\"version\":\"v3\"}",
		},
		{
			caseDesc:     "get upstream label",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodGet,
			Path:         "/api/labels/upstream",
			ExpectStatus: http.StatusOK,
			ExpectBody:   "{\"build\":\"17\"},{\"env\":\"production\"},{\"version\":\"v2\"}",
		},
		{
			caseDesc:     "get ssl label",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodGet,
			Path:         "/api/labels/ssl",
			ExpectStatus: http.StatusOK,
			ExpectBody:   "{\"build\":\"16\"},{\"env\":\"production\"},{\"version\":\"v2\"}",
		},

		{
			caseDesc:     "get service label",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodGet,
			Path:         "/api/labels/service",
			ExpectStatus: http.StatusOK,
			ExpectBody:   "{\"build\":\"16\"},{\"env\":\"production\"},{\"extra\":\"test\"},{\"version\":\"v2\"}",
		},
		{
			caseDesc:     "get all label",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodGet,
			Path:         "/api/labels/all",
			ExpectStatus: http.StatusOK,
			ExpectBody:   "{\"build\":\"16\"},{\"build\":\"17\"},{\"env\":\"production\"},{\"extra\":\"test\"},{\"version\":\"v2\"},{\"version\":\"v3\"}",
		},
		{
			caseDesc:     "get labels (key = build)",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodGet,
			Query:        "label=build",
			Path:         "/api/labels/all",
			ExpectStatus: http.StatusOK,
			ExpectBody:   "{\"build\":\"16\"},{\"build\":\"17\"}",
		},
		{
			caseDesc:     "get labels (key = build && env = production)",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodGet,
			Query:        "label=build,env:production",
			Path:         "/api/labels/all",
			ExpectStatus: http.StatusOK,
			ExpectBody:   "{\"build\":\"16\"},{\"build\":\"17\"},{\"env\":\"production\"}",
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
			caseDesc:     "delete consumer",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/consumers/c1",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			caseDesc:     "delete service",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/services/s1",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			caseDesc:     "delete upstream",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/upstreams/u1",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		// {
		// 	caseDesc:     "delete SSL",
		// 	Object:       ManagerApiExpect(t),
		// 	Method:       http.MethodDelete,
		// 	Path:         "/apisix/admin/ssl/s1",
		// 	Headers:      map[string]string{"Authorization": token},
		// 	ExpectStatus: http.StatusOK,
		// },
	}

	for _, tc := range tests {
		testCaseCheck(tc)
	}
}
