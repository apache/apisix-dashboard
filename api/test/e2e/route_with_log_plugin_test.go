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
	"io/ioutil"
	"net/http"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)


func readAPISIXErrorLog(t *testing.T) string {
	bytes, err := ioutil.ReadFile("../docker/apisix_logs/error.log")
	assert.Nil(t, err)
	logContent := string(bytes)
	return logContent
}

func cleanAPISIXErrorLog(t *testing.T){
	content := []byte("")
	err := ioutil.WriteFile("../docker/apisix_logs/error.log", content, 0644)
	assert.Nil(t, err)
}

func TestRoute_With_Log_Plugin(t *testing.T) {
	tests := []HttpTestCase{
		{
			caseDesc:     "make sure the route is not created ",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello_",
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   `{"error_msg":"404 Route Not Found"}`,
		},
		{
			caseDesc: "create route",
			Object:   MangerApiExpect(t),
			Method:   http.MethodPut,
			Path:     "/apisix/admin/routes/r1",
			Body: `{
				"uri": "/hello_",
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
			Path:         "/hello_",
			ExpectStatus: http.StatusOK,
			ExpectBody:   "hello world",
			Sleep:        sleepTime,
		},
	}

	for _, tc := range tests {
		testCaseCheck(tc)
	}

	// sleep for process log
	time.Sleep(1500 * time.Millisecond)

	// verify http logger by checking log
	//todo: should use a fake upstream for confirming whether we got the log data.
	logContent := readAPISIXErrorLog(t)
	assert.Contains(t, logContent, "Batch Processor[http logger] successfully processed the entries")

	// clean log
	cleanAPISIXErrorLog(t)

	tests = []HttpTestCase{
		{
			caseDesc: "create route with wrong https endpoint",
			Object:   MangerApiExpect(t),
			Method:   http.MethodPut,
			Path:     "/apisix/admin/routes/r2",
			Body: `{
				"uri": "/hello",
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
						"port": 1982,
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
			Path:         "/hello",
			ExpectStatus: http.StatusOK,
			ExpectBody:   "hello world",
			Sleep:        sleepTime,
		},
	}

	for _, tc := range tests {
		testCaseCheck(tc)
	}

	// sleep for process log
	time.Sleep(1500 * time.Millisecond)

	// verify http logger by checking log
	//todo: should use a fake upstream for confirming whether we got the log data.
	logContent = readAPISIXErrorLog(t)
	assert.Contains(t, logContent, "Batch Processor[http logger] failed to process entries: failed to connect to host[127.0.0.1] port[8888] connection refused")

	tests = []HttpTestCase{
		{
			caseDesc: "disable http logger for route r1",
			Object:   MangerApiExpect(t),
			Method:   http.MethodPut,
			Path:     "/apisix/admin/routes/r1",
			Body: `{
				"uri": "/hello_",
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
			caseDesc: "disable http logger for route r2",
			Object:   MangerApiExpect(t),
			Method:   http.MethodPut,
			Path:     "/apisix/admin/routes/r2",
			Body: `{
				"uri": "/hello",
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
	}

	for _, tc := range tests {
		testCaseCheck(tc)
	}

	time.Sleep(sleepTime)

	// clean log after disable http logger
	cleanAPISIXErrorLog(t)

	// try to trigger logger
	tests = []HttpTestCase{
		{
			caseDesc:     "access route to trigger log",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusOK,
			ExpectBody:   "hello world",
		},
		{
			caseDesc:     "access route to trigger log",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello_",
			ExpectStatus: http.StatusOK,
			ExpectBody:   "hello world",
		},
	}

	for _, tc := range tests {
		testCaseCheck(tc)
	}


	// sleep for process log
	time.Sleep(1500 * time.Millisecond)

	// verify http logger by checking log
	//todo: should use a fake upstream for confirming whether we got the log data.
	logContent = readAPISIXErrorLog(t)
	assert.NotContains(t, logContent, "Batch Processor[http logger]")

	// clean log
	cleanAPISIXErrorLog(t)

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
			caseDesc:     "make sure the route has been deleted",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello_",
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   `{"error_msg":"404 Route Not Found"}`,
			Sleep:        sleepTime,
		},
		{
			caseDesc:     "delete route 2",
			Object:       MangerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/r2",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			caseDesc:     "make sure the route 2 has been deleted",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   `{"error_msg":"404 Route Not Found"}`,
			Sleep:        sleepTime,
		},
	}

	for _, tc := range tests {
		testCaseCheck(tc)
	}
}
