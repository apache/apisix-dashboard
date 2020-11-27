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

//  add test case for config route with wrong data type priority
//  add test case for config route with correct priority
//  add test case for config route with another correct priority
//  add test case for config route without priority (default priority)
//  verify the route just configured for priority

func TestRoute_with_priority(t *testing.T) {
	tests := []HttpTestCase{
		{
			caseDesc: "add route with priority (-1)",
			Object:   MangerApiExpect(t),
			Method:   http.MethodPut,
			Path:     "/apisix/admin/routes/r1",
			Body: `{
					  "uri": "/server_port",
					  "methods": ["GET"],
					  "priority": -1,
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
			Path:         "/server_port",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "1980",
			Sleep:        sleepTime,
		},
		{
			caseDesc: "add route with no priority (default 0), upstream is different from the others",
			Object:   MangerApiExpect(t),
			Method:   http.MethodPut,
			Path:     "/apisix/admin/routes/r2",
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
			caseDesc:     "verify route",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/server_port",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "1981",
			Sleep:        sleepTime,
		},
		{
			caseDesc: "add another route with valid priority (1), upstream is different from the others",
			Object:   MangerApiExpect(t),
			Method:   http.MethodPut,
			Path:     "/apisix/admin/routes/r3",
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
			caseDesc:     "verify route",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/server_port",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "1982",
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
			caseDesc:     "delete route",
			Object:       MangerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/r2",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			Sleep:        sleepTime,
		},
		{
			caseDesc:     "delete route",
			Object:       MangerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/r3",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			Sleep:        sleepTime,
		},
	}

	for _, tc := range tests {
		testCaseCheck(tc)
	}
}
