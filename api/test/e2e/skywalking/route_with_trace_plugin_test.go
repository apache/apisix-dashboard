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
package skywalking

import (
	"net/http"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"

	"e2e"
)

var sleepTime = time.Duration(300) * time.Millisecond

func TestRoute_With_Plugin_Skywalking(t *testing.T) {
	tests := []e2e.HttpTestCase{
		{
			Desc:         "make sure the route is not created ",
			Object:       e2e.APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   `{"error_msg":"404 Route Not Found"}`,
		},
		{
			Desc:   "create route",
			Object: e2e.ManagerApiExpect(t),
			Method: http.MethodPut,
			Path:   "/apisix/admin/routes/r1",
			Body: `{
				"name": "route1",
				"uri": "/hello",
				"plugins": {
					"skywalking": {
						"sample_ratio": 1
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
			Headers:      map[string]string{"Authorization": e2e.Token},
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:         "tiger skywalking",
			Object:       e2e.APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusOK,
			ExpectBody:   "hello world",
			Sleep:        sleepTime,
		},
	}

	for _, tc := range tests {
		e2e.RunTestCases(tc, t)
	}

	// sleep for process log
	time.Sleep(4 * time.Second)

	// verify by checking log
	logContent := e2e.ReadAPISIXErrorLog(t)
	assert.Contains(t, logContent, "segments reported")

	// clean log
	e2e.CleanAPISIXErrorLog(t)

	tests = []e2e.HttpTestCase{
		{
			Desc:   "update route to change sample ratio",
			Object: e2e.ManagerApiExpect(t),
			Method: http.MethodPut,
			Path:   "/apisix/admin/routes/r1",
			Body: `{
				"name": "route1",
				"uri": "/hello",
				"plugins": {
					"skywalking": {
						"sample_ratio": 0.00001
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
			Headers:      map[string]string{"Authorization": e2e.Token},
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:         "access the route",
			Object:       e2e.APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusOK,
			ExpectBody:   "hello world",
			Sleep:        sleepTime,
		},
	}

	for _, tc := range tests {
		e2e.RunTestCases(tc, t)
	}

	// sleep for process log
	time.Sleep(4 * time.Second)

	// verify by checking log
	logContent = e2e.ReadAPISIXErrorLog(t)
	assert.Contains(t, logContent, "miss sampling, ignore")

	// clean log
	e2e.CleanAPISIXErrorLog(t)

	tests = []e2e.HttpTestCase{
		{
			Desc:         "delete route",
			Object:       e2e.ManagerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/r1",
			Headers:      map[string]string{"Authorization": e2e.Token},
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:         "make sure the route has been deleted",
			Object:       e2e.APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello_",
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   `{"error_msg":"404 Route Not Found"}`,
			Sleep:        sleepTime,
		},
	}

	for _, tc := range tests {
		e2e.RunTestCases(tc, t)
	}
}
