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
	"github.com/tidwall/gjson"
)

func TestRoute_with_name_desc(t *testing.T) {
	tests := []HttpTestCase{
		{
			caseDesc: "config route with name and desc (r1)",
			Object:   MangerApiExpect(t),
			Path:     "/apisix/admin/routes/r1",
			Method:   http.MethodPut,
			Body: `{
					"uri": "/hello",
					"name": "jack",
					"desc": "config route with name and desc",
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
			caseDesc:     "access the route's uri (r1)",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "hello world",
			Sleep:        sleepTime,
		},
		{
			caseDesc:     "verify the route's content (r1)",
			Object:       MangerApiExpect(t),
			Path:         "/apisix/admin/routes/r1",
			Method:       http.MethodGet,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "\"name\":\"jack\",\"desc\":\"config route with name and desc\"",
			Sleep:        sleepTime,
		},
	}
	for _, tc := range tests {
		testCaseCheck(tc)
	}

	tests = []HttpTestCase{
		{
			caseDesc:     "delete the route (r1)",
			Object:       MangerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/r1",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
	}

	for _, tc := range tests {
		testCaseCheck(tc)
	}

	tests = []HttpTestCase{
		{
			caseDesc: "config route with name, desc, create_time, update_time",
			Object:   MangerApiExpect(t),
			Path:     "/apisix/admin/routes/r1",
			Method:   http.MethodPut,
			Body: `{
					"uri": "/hello",
					"name": "jack",
					"create_time": 1604046556,
					"update_time": 1604046556,
					"desc": "config route with name and desc",
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
			caseDesc:     "access the route's uri (r1)",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "hello world",
			Sleep:        sleepTime,
		},
		{
			caseDesc:     "verify the route's detail (r1)",
			Object:       MangerApiExpect(t),
			Path:         "/apisix/admin/routes/r1",
			Method:       http.MethodGet,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "\"name\":\"jack\",\"desc\":\"config route with name and desc\"",
			Sleep:        sleepTime,
		},
	}

	for _, tc := range tests {
		testCaseCheck(tc)
	}

	time.Sleep(time.Duration(100) * time.Millisecond)
	//get the route
	basepath := "http://127.0.0.1:8080/apisix/admin/routes"
	request, _ := http.NewRequest("GET", basepath+"/r1", nil)
	request.Header.Add("Authorization", token)
	resp, _ := http.DefaultClient.Do(request)
	respBody, _ := ioutil.ReadAll(resp.Body)
	createtime := gjson.Get(string(respBody), "data.create_time")
	updatetime := gjson.Get(string(respBody), "data.update_time")
	assert.NotEqual(t, createtime.String(), "")
	assert.NotEqual(t, updatetime.String(), "")

	tests = []HttpTestCase{
		{
			caseDesc: "update the route (r1)",
			Object:   MangerApiExpect(t),
			Path:     "/apisix/admin/routes/r1",
			Method:   http.MethodPut,
			Body: `{
					"uri": "/hello",
					"name": "new jack",
					"create_time": 1606726340,
					"update_time": 1606726340,
					"desc": "new desc",
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
			Sleep:        time.Duration(2) * time.Second,
		},

		{
			caseDesc:     "access the route's uri (r1)",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "hello world",
			Sleep:        sleepTime,
		},
	}

	for _, tc := range tests {
		testCaseCheck(tc)
	}

	//get the route (updated)
	request, _ = http.NewRequest("GET", basepath+"/r1", nil)
	request.Header.Add("Authorization", token)
	resp, _ = http.DefaultClient.Do(request)
	respBody, _ = ioutil.ReadAll(resp.Body)
	createtime2 := gjson.Get(string(respBody), "data.create_time")
	updatetime2 := gjson.Get(string(respBody), "data.update_time")

	//verify the route and compare result
	assert.Equal(t, "new jack", gjson.Get(string(respBody), "data.name").String())
	assert.Equal(t, "new desc", gjson.Get(string(respBody), "data.desc").String())
	assert.Equal(t, createtime.String(), createtime2.String())
	assert.NotEqual(t, updatetime.String(), updatetime2.String())

	tests = []HttpTestCase{
		{
			caseDesc:     "delete the route (r1)",
			Object:       MangerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/r1",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
	}

	for _, tc := range tests {
		testCaseCheck(tc)
	}

	tests = []HttpTestCase{
		{
			caseDesc: "config route with labels (r1)",
			Object:   MangerApiExpect(t),
			Path:     "/apisix/admin/routes/r1",
			Method:   http.MethodPut,
			Body: `{
					"uri": "/hello",
					"labels": {
						"build":"16",
						"env":"production",
						"version":"v2"
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
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			caseDesc:     "access the route's uri (r1)",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "hello world",
			Sleep:        sleepTime,
		},
		{
			caseDesc:     "verify the route's detail (r1)",
			Object:       MangerApiExpect(t),
			Path:         "/apisix/admin/routes/r1",
			Method:       http.MethodGet,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "\"labels\":{\"build\":\"16\",\"env\":\"production\",\"version\":\"v2\"",
			Sleep:        sleepTime,
		},

		{
			caseDesc:     "delete the route (r1)",
			Object:       MangerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/r1",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
	}
	for _, tc := range tests {
		testCaseCheck(tc)
	}
}
