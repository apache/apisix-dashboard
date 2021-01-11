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

	// batch test /server_port api
	time.Sleep(sleepTime)
	res := BatchTestServerPort(t, 18)
	assert.True(t, res["1980"] == 3)
	assert.True(t, res["1981"] == 6)
	assert.True(t, res["1982"] == 9)

	tests = []HttpTestCase{
		{
			Desc:    "create service with plugin",
			Object:  ManagerApiExpect(t),
			Method:  http.MethodPut,
			Path:    "/apisix/admin/services/s1",
			Headers: map[string]string{"Authorization": token},
			Body: `{
				"name": "testservice",
				"plugins": { 
					"limit-count": { 
						"count": 100, 
						"time_window": 60, 
						"rejected_code": 503, 
						"key": "remote_addr" 
					} 
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
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:       "get the service s1",
			Object:     ManagerApiExpect(t),
			Method:     http.MethodGet,
			Path:       "/apisix/admin/services/s1",
			Headers:    map[string]string{"Authorization": token},
			ExpectCode: http.StatusOK,
			ExpectBody: "\"upstream\":{\"nodes\":[{\"host\":\"172.16.238.20\",\"port\":1980,\"weight\":1}],\"type\":\"roundrobin\"},\"plugins\":{\"limit-count\":{\"count\":100,\"key\":\"remote_addr\",\"rejected_code\":503,\"time_window\":60}}",
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

	// hit routes and check the response header
	time.Sleep(sleepTime)
	basepath := "http://127.0.0.1:9080"
	request, _ := http.NewRequest("GET", basepath+"/server_port", nil)
	request.Header.Add("Authorization", token)
	resp, err := http.DefaultClient.Do(request)
	assert.Nil(t, err)
	defer resp.Body.Close()
	assert.Equal(t, 200, resp.StatusCode)
	assert.Equal(t, "100", resp.Header["X-Ratelimit-Limit"][0])
	assert.Equal(t, "99", resp.Header["X-Ratelimit-Remaining"][0])

	tests = []HttpTestCase{
		{
			Desc:    "create service with all options",
			Object:  ManagerApiExpect(t),
			Method:  http.MethodPut,
			Path:    "/apisix/admin/services/s1",
			Headers: map[string]string{"Authorization": token},
			Body: `{
				"name": "testservice",
				"desc": "testservice_desc",
				"labels": {
					"build":"16",
					"env":"production",
					"version":"v2"
				},
				"enable_websocket":true,
				"plugins": { 
					"limit-count": { 
						"count": 100, 
						"time_window": 60, 
						"rejected_code": 503, 
						"key": "remote_addr" 
					} 
				},
				"upstream": {
					"type": "roundrobin",
					"create_time":1602883670,
					"update_time":1602893670,
					"nodes": [{
						"host": "172.16.238.20",
						"port": 1980,
						"weight": 1
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
			ExpectBody: "\"name\":\"testservice\",\"desc\":\"testservice_desc\",\"upstream\":{\"nodes\":[{\"host\":\"172.16.238.20\",\"port\":1980,\"weight\":1}],\"type\":\"roundrobin\"},\"plugins\":{\"limit-count\":{\"count\":100,\"key\":\"remote_addr\",\"rejected_code\":503,\"time_window\":60}},\"labels\":{\"build\":\"16\",\"env\":\"production\",\"version\":\"v2\"},\"enable_websocket\":true}",
		},
		{
			Desc:   "create route using the service just created",
			Object: ManagerApiExpect(t),
			Method: http.MethodPut,
			Path:   "/apisix/admin/routes/r1",
			Body: `{
				"uri": "/hello",
				"service_id": "s1"
			}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			Sleep:        sleepTime,
		},
		{
			Desc:         "verify route",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusOK,
			ExpectBody:   "hello world",
		},
	}
	for _, tc := range tests {
		testCaseCheck(tc, t)
	}
}

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
	}
	for _, tc := range tests {
		testCaseCheck(tc, t)
	}
}
