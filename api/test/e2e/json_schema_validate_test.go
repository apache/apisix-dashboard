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

func TestSchema_not_exist_field(t *testing.T) {
	tests := []HttpTestCase{
		{
			Desc:   "config route with non-existent fields",
			Object: ManagerApiExpect(t),
			Path:   "/apisix/admin/routes/r1",
			Method: http.MethodPut,
			Body: `{
				"name": "route1",
                                "uri": "/hello",
                                "nonexistent": "test non-existent",
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
			ExpectBody:   `{"code":10000,"message":"schema validate failed: (root): Additional property nonexistent is not allowed"}`,
		},
		{
			Desc:         "make sure the route create failed",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusNotFound,
			Sleep:        sleepTime,
		},
	}

	for _, tc := range tests {
		testCaseCheck(tc, t)
	}
}
