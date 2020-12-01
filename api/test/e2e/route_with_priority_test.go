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

func TestRoute_with_priority(t *testing.T) {
	tests := []HttpTestCase{
		{
			caseDesc: "add another route with no priority (default 0)",
			Object:   ManagerApiExpect(t),
			Method:   http.MethodPut,
			Path:     "/apisix/admin/routes/r1",
			Body: `{
					"uri": "/server_port",
					"methods": ["GET"],
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
			caseDesc:     "access the route",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/server_port",
			ExpectStatus: http.StatusOK,
			ExpectBody:   "1981",
			Sleep:        sleepTime,
		},
		{
			caseDesc: "add another route with valid priority (1), upstream is different from the others",
			Object:   ManagerApiExpect(t),
			Method:   http.MethodPut,
			Path:     "/apisix/admin/routes/r2",
			Body: `{
					"uri": "/server_port",
					"methods": ["GET"],
					"priority": 1,
					"upstream": {
						"type": "roundrobin",
						"nodes": [{
							"host": "172.16.238.20",
							"port": 1982,
							"weight": 1
						}]
					}
				}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			caseDesc:     "access the route to determine whether it meets the priority (compair 1 and default)",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/server_port",
			ExpectStatus: http.StatusOK,
			ExpectBody:   "1982",
			Sleep:        sleepTime,
		},
		{
			caseDesc:     "delete route (r1)",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/r1",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			Sleep:        sleepTime,
		},
		{
			caseDesc:     "delete route (r2)",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/r2",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			Sleep:        sleepTime,
		},
	}

	for _, tc := range tests {
		testCaseCheck(tc)
	}
}
