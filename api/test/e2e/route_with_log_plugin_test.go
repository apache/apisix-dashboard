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
	"github.com/stretchr/testify/assert"
	"io/ioutil"
	"net/http"
	"testing"
	"time"
)

func TestRoute_With_Log_Plugin(t *testing.T) {
	tests := []HttpTestCase{
		{
			caseDesc:     "make sure the route is not created ",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   `{"error_msg":"404 Route Not Found"}`,
		},
		{
			caseDesc: "create route",
			Object:   MangerApiExpect(t),
			Method:   http.MethodPut,
			Path:     "/apisix/admin/routes/r1",
			Body: `{
				"uri": "/opentracing",
				"plugins": {
					"http-logger": {
						"uri": "http://172.16.238.20:1982/hello",
						"batch_max_size": 1,
						"max_retry_count": 1,
						"retry_delay": 2,
						"buffer_duration": 2,
						"inactive_timeout": 2,
						"name": "http logger",
						"timeout": 3,
						"concat_method": "json"
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
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			caseDesc:     "access route to trigger log",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/opentracing",
			ExpectStatus: http.StatusOK,
			ExpectBody:   "opentracing",
			Sleep:        sleepTime,
		},
	}

	for _, tc := range tests {
		testCaseCheck(tc)
	}

	// sleep for process log
	time.Sleep(1500 * time.Millisecond)

	// verify http logger by checking log
	bytes, err := ioutil.ReadFile("../docker/apisix_logs/error.log")
	assert.Nil(t, err)
	logContent := string(bytes)
	assert.Contains(t, logContent, "Batch Processor[http logger] successfully processed the entries")

	tests = []HttpTestCase{
		{
			caseDesc: "update route with wrong https endpoint",
			Object:   MangerApiExpect(t),
			Method:   http.MethodPut,
			Path:     "/apisix/admin/routes/r1",
			Body: `{
				"uri": "/opentracing",
					"plugins": {
					"http-logger": {
						"uri": "https://127.0.0.1:8888/hello-world-http",
						"batch_max_size": 1,
						"max_retry_count": 1,
						"retry_delay": 2,
						"buffer_duration": 2,
						"inactive_timeout": 2,
						"name": "http logger",
						"timeout": 3,
						"concat_method": "json"
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
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			caseDesc:     "access route to trigger log",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/opentracing",
			ExpectStatus: http.StatusOK,
			ExpectBody:   "opentracing",
			Sleep:        sleepTime,
		},
	}

	for _, tc := range tests {
		testCaseCheck(tc)
	}

	// sleep for process log
	time.Sleep(1500 * time.Millisecond)

	// verify http logger by checking log
	bytes, err = ioutil.ReadFile("../docker/apisix_logs/error.log")
	assert.Nil(t, err)
	//logContent = string(bytes)
	//assert.Contains(t, logContent, "failed to perform SSL with host[127.0.0.1] port[8888] handshake failed")

	tests = []HttpTestCase{
		{
			caseDesc:     "delete route",
			Object:       MangerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/r1",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			caseDesc:     "hit the route just deleted",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello1",
			Headers:      map[string]string{"Host": "bar.com"},
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   "{\"error_msg\":\"404 Route Not Found\"}\n",
			Sleep:        sleepTime,
		},
	}

	for _, tc := range tests {
		testCaseCheck(tc)
	}
}
