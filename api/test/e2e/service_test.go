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

func TestService(t *testing.T) {
	tests := []HttpTestCase{

		{
			Desc:    "create service without plugin",
			Object:  ManagerApiExpect(t),
			Method:  http.MethodPut,
			Path:    "/apisix/admin/services/s1",
			Headers: map[string]string{"Authorization": token},
			Body: `{
				"name": "testservice",
				"upstream": {
					"type": "roundrobin",
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
					}]
				}
			}`,
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:       "get the service s1",
			Object:     ManagerApiExpect(t),
			Method:     http.MethodGet,
			Path:       "/apisix/admin/services/s1",
			Headers:    map[string]string{"Authorization": token},
			ExpectCode: http.StatusOK,
			ExpectBody: "\"name\":\"testservice\",\"upstream\":{\"nodes\":[{\"host\":\"172.16.238.20\",\"port\":1980,\"weight\":1},{\"host\":\"172.16.238.20\",\"port\":1981,\"weight\":2},{\"host\":\"172.16.238.20\",\"port\":1982,\"weight\":3}],\"type\":\"roundrobin\"}",
		},
		{
			Desc:   "create route using the service just created",
			Object: ManagerApiExpect(t),
			Method: http.MethodPut,
			Path:   "/apisix/admin/routes/r1",
			Body: `{
				"uri": "/server_port",
				"service_id": "s1"
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
	assert.True(t, res["1980"] == 3)
	assert.True(t, res["1981"] == 6)
	assert.True(t, res["1982"] == 9)
}

// func TestRoute_Create_Service(t *testing.T) {
// 	tests := []HttpTestCase{
// 		{
// 			Desc:         "make sure the route has not created",
// 			Object:       APISIXExpect(t),
// 			Method:       http.MethodGet,
// 			Path:         "/server_port",
// 			ExpectStatus: http.StatusNotFound,
// 			Sleep:        sleepTime,
// 		},
// 		{
// 			Desc:   "create service",
// 			Object: ManagerApiExpect(t),
// 			Method: http.MethodPut,
// 			Path:   "/apisix/admin/services/200",
// 			Body: `{
// 					 "upstream": {
// 					 "type": "roundrobin",
// 					 "nodes": [
// 						 {
// 							 "host": "172.16.238.20",
// 							 "port": 1980,
// 							 "weight": 1
// 						 },
// 						 {
// 							 "host": "172.16.238.20",
// 							 "port": 1981,
// 							 "weight": 1
// 						 },
// 						 {
// 							 "host": "172.16.238.20",
// 							 "port": 1982,
// 							 "weight": 1
// 						 }
// 					 ]
// 						 }
// 			 }`,
// 			Headers:      map[string]string{"Authorization": token},
// 			ExpectStatus: http.StatusOK,
// 		},
// 		{
// 			Desc:   "create route using the service just created",
// 			Object: ManagerApiExpect(t),
// 			Method: http.MethodPut,
// 			Path:   "/apisix/admin/routes/r1",
// 			Body: `{
// 				 "uri": "/server_port",
// 				 "service_id": "200"
// 			 }`,
// 			Headers:      map[string]string{"Authorization": token},
// 			ExpectStatus: http.StatusOK,
// 			Sleep:        sleepTime,
// 		},
// 	}
// 	for _, tc := range tests {
// 		testCaseCheck(tc, t)
// 	}

// 	// sleep for etcd sync
// 	time.Sleep(sleepTime)

// 	// batch test /server_port api
// 	res := BatchTestServerPort(t, 18)

// 	assert.Equal(t, 6, res["1980"])
// 	assert.Equal(t, 6, res["1981"])
// 	assert.Equal(t, 6, res["1982"])
// }

// func TestRoute_Delete_Service(t *testing.T) {
// 	tests := []HttpTestCase{
// 		{
// 			Desc:         "delete route",
// 			Object:       ManagerApiExpect(t),
// 			Method:       http.MethodDelete,
// 			Path:         "/apisix/admin/routes/r1",
// 			Headers:      map[string]string{"Authorization": token},
// 			ExpectStatus: http.StatusOK,
// 		},
// 		{
// 			Desc:         "remove service",
// 			Object:       ManagerApiExpect(t),
// 			Method:       http.MethodDelete,
// 			Path:         "/apisix/admin/services/200",
// 			Headers:      map[string]string{"Authorization": token},
// 			ExpectStatus: http.StatusOK,
// 		},
// 		{
// 			Desc:         "hit deleted route",
// 			Object:       APISIXExpect(t),
// 			Method:       http.MethodGet,
// 			Path:         "/server_port",
// 			ExpectStatus: http.StatusNotFound,
// 		},
// 	}
// 	for _, tc := range tests {
// 		testCaseCheck(tc, t)
// 	}
// }

// func TestRoute_Create_Upstream(t *testing.T) {
// 	tests := []HttpTestCase{
// 		{
// 			Desc:   "create upstream",
// 			Object: ManagerApiExpect(t),
// 			Method: http.MethodPut,
// 			Path:   "/apisix/admin/upstreams/1",
// 			Body: `{
// 				 "nodes": [
// 					 {
// 						 "host": "172.16.238.20",
// 						 "port": 1980,
// 						 "weight": 1
// 					 },
// 					 {
// 						 "host": "172.16.238.20",
// 						 "port": 1981,
// 						 "weight": 1
// 					 },
// 					 {
// 						 "host": "172.16.238.20",
// 						 "port": 1982,
// 						 "weight": 1
// 					 }
// 				 ],
// 				 "type": "roundrobin"
// 			 }`,
// 			Headers:      map[string]string{"Authorization": token},
// 			ExpectStatus: http.StatusOK,
// 		},
// 		{
// 			Desc:         "make sure the route has not created",
// 			Object:       APISIXExpect(t),
// 			Method:       http.MethodGet,
// 			Path:         "/server_port",
// 			ExpectStatus: http.StatusNotFound,
// 			Sleep:        sleepTime,
// 		},
// 		{
// 			Desc:   "create route using the upstream just created",
// 			Object: ManagerApiExpect(t),
// 			Method: http.MethodPut,
// 			Path:   "/apisix/admin/routes/r1",
// 			Body: `{
// 				 "uri": "/server_port",
// 				 "upstream_id": "1"
// 			 }`,
// 			Headers:      map[string]string{"Authorization": token},
// 			ExpectStatus: http.StatusOK,
// 			Sleep:        sleepTime,
// 		},
// 	}
// 	for _, tc := range tests {
// 		testCaseCheck(tc, t)
// 	}

// 	// sleep for etcd sync
// 	time.Sleep(sleepTime)

// 	// batch test /server_port api
// 	res := BatchTestServerPort(t, 12)

// 	assert.Equal(t, 4, res["1980"])
// 	assert.Equal(t, 4, res["1981"])
// 	assert.Equal(t, 4, res["1982"])
// }

func TestService_Teardown(t *testing.T) {
	tests := []HttpTestCase{
		{
			Desc:         "delete the service",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/services/s1",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			Sleep:        sleepTime,
		},
		{
			Desc:         "delete route",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/r1",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		// {
		// 	Desc:         "remove upstream",
		// 	Object:       ManagerApiExpect(t),
		// 	Method:       http.MethodDelete,
		// 	Path:         "/apisix/admin/upstreams/1",
		// 	Headers:      map[string]string{"Authorization": token},
		// 	ExpectStatus: http.StatusOK,
		// },
		// {
		// 	Desc:         "hit deleted route",
		// 	Object:       APISIXExpect(t),
		// 	Method:       http.MethodGet,
		// 	Path:         "/server_port",
		// 	ExpectStatus: http.StatusNotFound,
		// },
	}
	for _, tc := range tests {
		testCaseCheck(tc, t)
	}
}
