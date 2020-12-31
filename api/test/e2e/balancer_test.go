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
	"time"

	"github.com/stretchr/testify/assert"
)

func TestBalancer_roundrobin_with_weight(t *testing.T) {
	tests := []HttpTestCase{
		{
			Desc:   "create upstream (roundrobin with same weight)",
			Object: ManagerApiExpect(t),
			Method: http.MethodPut,
			Path:   "/apisix/admin/upstreams/1",
			Body: `{
				"nodes": [{
					"host": "172.16.238.20",
					"port": 1980,
					"weight": 1
				},
				{
					"host": "172.16.238.20",
					"port": 1981,
					"weight": 1
				},
				{
					"host": "172.16.238.20",
					"port": 1982,
					"weight": 1
				}],
				"type": "roundrobin"
			}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:   "create route using the upstream just created",
			Object: ManagerApiExpect(t),
			Method: http.MethodPut,
			Path:   "/apisix/admin/routes/1",
			Body: `{
				"uri": "/server_port",
				"upstream_id": "1"
			}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			Sleep:        sleepTime,
		},
	}

	for _, tc := range tests {
		testCaseCheck(tc, t)
	}

	// hit routes
	time.Sleep(sleepTime)
	// batch test /server_port api
	res := BatchTestServerPort(t, 18)
	// BatchTestServerPort
	assert.True(t, res["1982"] == 6)
	assert.True(t, res["1981"] == 6)
	assert.True(t, res["1980"] == 6)

	tests = []HttpTestCase{
		{
			Desc:   "create upstream (roundrobin with different weight)",
			Object: ManagerApiExpect(t),
			Method: http.MethodPut,
			Path:   "/apisix/admin/upstreams/1",
			Body: `{
				"nodes": [{
					"host": "172.16.238.20",
					"port": 1980,
					"weight": 1
				},
				{
					"host": "172.16.238.20",
					"port": 1981,
					"weight": 2
				},
				{
					"host": "172.16.238.20",
					"port": 1982,
					"weight": 3
				}],
				"type": "roundrobin"
			}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
	}
	for _, tc := range tests {
		testCaseCheck(tc, t)
	}

	// hit routes
	time.Sleep(sleepTime)
	// batch test /server_port api
	res = BatchTestServerPort(t, 18)

	assert.True(t, res["1980"] == 3)
	assert.True(t, res["1981"] == 6)
	assert.True(t, res["1982"] == 9)

	tests = []HttpTestCase{
		{
			Desc:   "create upstream (roundrobin with weight 1 and 0) ",
			Object: ManagerApiExpect(t),
			Method: http.MethodPut,
			Path:   "/apisix/admin/upstreams/1",
			Body: `{
				"nodes": [{
					"host": "172.16.238.20",
					"port": 1980,
					"weight": 1
				},
				{
					"host": "172.16.238.20",
					"port": 1981,
					"weight": 0
				}],
				"type": "roundrobin"
			}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
	}
	for _, tc := range tests {
		testCaseCheck(tc, t)
	}

	// hit routes
	time.Sleep(200 * time.Millisecond)
	// batch test /server_port api
	res = BatchTestServerPort(t, 18)

	assert.True(t, res["1980"] == 18)

	tests = []HttpTestCase{
		{
			Desc:   "create upstream (roundrobin with weight only 1 ) ",
			Object: ManagerApiExpect(t),
			Method: http.MethodPut,
			Path:   "/apisix/admin/upstreams/1",
			Body: `{
				"nodes": [{
					"host": "172.16.238.20",
					"port": 1980,
					"weight": 1
				}],
				"type": "roundrobin"
			}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
	}
	for _, tc := range tests {
		testCaseCheck(tc, t)
	}

	// hit routes
	time.Sleep(sleepTime)
	// batch test /server_port api
	res = BatchTestServerPort(t, 18)

	assert.True(t, res["1980"] == 18)
}

func TestBalancer_Delete(t *testing.T) {
	tests := []HttpTestCase{
		{
			Desc:         "delete route",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/1",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:         "delete upstream",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/upstreams/1",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:         "hit the route just deleted",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/server_port",
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   "{\"error_msg\":\"404 Route Not Found\"}\n",
			Sleep:        sleepTime,
		},
	}

	for _, tc := range tests {
		testCaseCheck(tc, t)
	}
}
