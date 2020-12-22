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

func TestRoute_add_with_invalid_remote_addr(t *testing.T) {
	tests := []HttpTestCase{
		{
			caseDesc: "config route with invalid remote_addr",
			Object:   ManagerApiExpect(t),
			Method:   http.MethodPut,
			Path:     "/apisix/admin/routes/r1",
			Body: `{
					"uri": "/hello",
					"remote_addr": "127.0.0.",
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
			ExpectStatus: http.StatusBadRequest,
			ExpectBody:   "\"code\":10000,\"message\":\"schema validate failed: remote_addr: Must validate at least one schema (anyOf)\\nremote_addr: Does not match format 'ipv4'\"",
		},
		{
			caseDesc:     "verify route",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusNotFound,
			Sleep:        sleepTime,
		},
		{
			caseDesc: "config route with invalid remote_addr",
			Object:   ManagerApiExpect(t),
			Method:   http.MethodPut,
			Path:     "/apisix/admin/routes/r1",
			Body: `{
					"uri": "/hello",
					"remote_addr": "127.0.0.aa",
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
			ExpectStatus: http.StatusBadRequest,
			ExpectBody:   "\"code\":10000,\"message\":\"schema validate failed: remote_addr: Must validate at least one schema (anyOf)\\nremote_addr: Does not match format 'ipv4'\"",
		},
		{
			caseDesc:     "verify route",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusNotFound,
			Sleep:        sleepTime,
		},
		{
			caseDesc: "config route with invalid remote_addrs",
			Object:   ManagerApiExpect(t),
			Method:   http.MethodPut,
			Path:     "/apisix/admin/routes/r1",
			Body: `{
					"uri": "/hello",
					"remote_addrs": ["127.0.0.1","192.168.0."],
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
			ExpectStatus: http.StatusBadRequest,
			ExpectBody:   "\"code\":10000,\"message\":\"schema validate failed: remote_addrs.1: Must validate at least one schema (anyOf)\\nremote_addrs.1: Does not match format 'ipv4'\"",
		},
		{
			caseDesc:     "verify route",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusNotFound,
			Sleep:        sleepTime,
		},
	}

	for _, tc := range tests {
		testCaseCheck(tc)
	}
}
