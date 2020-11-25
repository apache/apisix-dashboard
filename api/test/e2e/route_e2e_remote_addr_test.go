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

//case 1: config route with invalid remote_addr
func TestRoute_add_with_invalid_remote_addr(t *testing.T) {
	tests := []HttpTestCase{
		{
			caseDesc: "config route with invalid remote_addr",
			Object:   MangerApiExpect(t),
			Method:   http.MethodPut,
			Path:     "/apisix/admin/routes/r1",
			Body: `{
					"uri": "/test_uri",
					"remote_addr": "127.0.0.",
					"upstream": {
						"type": "roundrobin",
						"nodes": {
							"172.16.238.20:1980": 1
						}
					}
				}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusBadRequest,
		},
		{
			caseDesc: "config route with invalid remote_addr",
			Object:   MangerApiExpect(t),
			Method:   http.MethodPut,
			Path:     "/apisix/admin/routes/r1",
			Body: `{
					   "uri": "/test_uri",
					   "remote_addr": "127.0.0.aa",
					   "upstream": {
						   "type": "roundrobin",
						   "nodes": {
							   "172.16.238.20:1980": 1
						   }
					   }
				   }`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusBadRequest,
		},
		{
			caseDesc: "config route with invalid remote_addrs",
			Object:   MangerApiExpect(t),
			Method:   http.MethodPut,
			Path:     "/apisix/admin/routes/r1",
			Body: `{
					   "uri": "/test_uri",
					   "remote_addrs": ["127.0.0.1","192.168.0."],
					   "upstream": {
						   "type": "roundrobin",
						   "nodes": {
							   "172.16.238.20:1980": 1
						   }
					   }
				   }`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusBadRequest,
		},
	}

	for _, tc := range tests {
		testCaseCheck(tc)
	}
}
