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
			Desc:   "config route with name and desc (r1)",
			Object: ManagerApiExpect(t),
			Path:   "/apisix/admin/routes/r1",
			Method: http.MethodPut,
			Body: `{
					"name": "route1",
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
			Desc:         "check route exists by name",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/notexist/routes",
			Query:        "name=jack",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusBadRequest,
			ExpectBody:   "Route name is reduplicate",
			Sleep:        sleepTime,
		},
		{
			Desc:         "check route exists by name (exclude it self)",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/notexist/routes",
			Query:        "name=jack&exclude=r1",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:         "access the route's uri (r1)",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "hello world",
		},
		{
			Desc:         "verify the route's content (r1)",
			Object:       ManagerApiExpect(t),
			Path:         "/apisix/admin/routes/r1",
			Method:       http.MethodGet,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "\"name\":\"jack\",\"desc\":\"config route with name and desc\"",
		},
	}
	for _, tc := range tests {
		testCaseCheck(tc, t)
	}

	//get the route
	time.Sleep(time.Duration(100) * time.Millisecond)
	basepath := "http://127.0.0.1:9000/apisix/admin/routes"
	request, _ := http.NewRequest("GET", basepath+"/r1", nil)
	request.Header.Add("Authorization", token)
	resp, err := http.DefaultClient.Do(request)
	if err != nil {
		return
	}
	defer resp.Body.Close()
	respBody, _ := ioutil.ReadAll(resp.Body)
	createtime := gjson.Get(string(respBody), "data.create_time")
	updatetime := gjson.Get(string(respBody), "data.update_time")
	assert.Equal(t, true, createtime.Int() >= time.Now().Unix()-1 && createtime.Int() <= time.Now().Unix()+1)
	assert.Equal(t, true, updatetime.Int() >= time.Now().Unix()-1 && updatetime.Int() <= time.Now().Unix()+1)

	tests = []HttpTestCase{
		{
			Desc:   "update the route (r1)",
			Object: ManagerApiExpect(t),
			Path:   "/apisix/admin/routes/r1",
			Method: http.MethodPut,
			Body: `{
					"name": "route1",
					"uri": "/hello",
					"name": "new jack",
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
			Desc:         "access the route's uri (r1)",
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
		testCaseCheck(tc, t)
	}

	//get the route (updated)
	time.Sleep(time.Duration(100) * time.Millisecond)
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
			Desc:         "delete the route (r1)",
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

func TestRoute_with_label(t *testing.T) {
	tests := []HttpTestCase{
		{
			Desc:   "config route with labels (r1)",
			Object: ManagerApiExpect(t),
			Path:   "/apisix/admin/routes/r1",
			Method: http.MethodPut,
			Body: `{
					"name": "route1",
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
			Desc:         "access the route's uri (r1)",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "hello world",
			Sleep:        sleepTime,
		},
		{
			Desc:         "verify the route's detail (r1)",
			Object:       ManagerApiExpect(t),
			Path:         "/apisix/admin/routes/r1",
			Method:       http.MethodGet,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "\"labels\":{\"build\":\"16\",\"env\":\"production\",\"version\":\"v2\"",
			Sleep:        sleepTime,
		},
		{
			Desc:         "delete the route (r1)",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/r1",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:         "access the route after delete it",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusNotFound,
			Sleep:        sleepTime,
		},
	}
	for _, tc := range tests {
		testCaseCheck(tc, t)
	}
}

func TestRoute_search_by_label(t *testing.T) {
	tests := []HttpTestCase{
		{
			Desc:   "config route with labels (r1)",
			Object: ManagerApiExpect(t),
			Path:   "/apisix/admin/routes/r1",
			Method: http.MethodPut,
			Body: `{
					"name": "route1",
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
			Desc:   "config route with labels (r2)",
			Object: ManagerApiExpect(t),
			Path:   "/apisix/admin/routes/r2",
			Method: http.MethodPut,
			Body: `{
					"name": "route2",
					"uri": "/hello2",
					"labels": {
						"build":"17",
						"env":"dev",
						"version":"v2",
						"extra": "test"
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
			Desc:         "access the route's uri (r1)",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "hello world",
			Sleep:        sleepTime,
		},
		{
			Desc:         "verify the route's detail (r1)",
			Object:       ManagerApiExpect(t),
			Path:         "/apisix/admin/routes/r1",
			Method:       http.MethodGet,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "\"labels\":{\"build\":\"16\",\"env\":\"production\",\"version\":\"v2\"",
			Sleep:        sleepTime,
		},
		{
			Desc:         "search the route by label",
			Object:       ManagerApiExpect(t),
			Path:         "/apisix/admin/routes",
			Query:        "label=build:16",
			Method:       http.MethodGet,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "\"labels\":{\"build\":\"16\",\"env\":\"production\",\"version\":\"v2\"",
			Sleep:        sleepTime,
		},
		{
			Desc:         "search the route by label (only key)",
			Object:       ManagerApiExpect(t),
			Path:         "/apisix/admin/routes",
			Query:        "label=extra",
			Method:       http.MethodGet,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "\"labels\":{\"build\":\"17\",\"env\":\"dev\",\"extra\":\"test\",\"version\":\"v2\"",
			Sleep:        sleepTime,
		},
		{
			Desc:         "search the route by label (combination)",
			Object:       ManagerApiExpect(t),
			Path:         "/apisix/admin/routes",
			Query:        "label=extra,build:16",
			Method:       http.MethodGet,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "\"total_size\":2",
			Sleep:        sleepTime,
		},
		{
			Desc:         "search the route by label (combination)",
			Object:       ManagerApiExpect(t),
			Path:         "/apisix/admin/routes",
			Query:        "label=build:16,build:17",
			Method:       http.MethodGet,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "\"total_size\":2",
			Sleep:        sleepTime,
		},
		{
			Desc:         "delete the route (r1)",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/r1",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:         "delete the route (r2)",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/r2",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:         "access the route after delete it",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusNotFound,
			Sleep:        sleepTime,
		},
	}
	for _, tc := range tests {
		testCaseCheck(tc, t)
	}
}

func TestRoute_With_Create_Time(t *testing.T) {
	tests := []HttpTestCase{
		{
			Desc:   "create route with create_time",
			Object: ManagerApiExpect(t),
			Path:   "/apisix/admin/routes/r1",
			Method: http.MethodPut,
			Body: `{
				"name": "route1",
				"uri": "/hello",
				"create_time": 1608792721,
				"upstream": {
					"nodes": {
						"172.16.238.20:1980": 1
					},
					"type": "roundrobin"
				}
			}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusBadRequest,
		},
		{
			Desc:   "create route with update_time",
			Object: ManagerApiExpect(t),
			Path:   "/apisix/admin/routes/r1",
			Method: http.MethodPut,
			Body: `{
				"name": "route1",
				"uri": "/hello",
				"update_time": 1608792721,
				"upstream": {
					"nodes": {
						"172.16.238.20:1980": 1
					},
					"type": "roundrobin"
				}
			}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusBadRequest,
		},
		{
			Desc:   "create route with create_time and update_time",
			Object: ManagerApiExpect(t),
			Path:   "/apisix/admin/routes/r1",
			Method: http.MethodPut,
			Body: `{
				"name": "route1",
				"uri": "/hello",
				"create_time": 1608792721,
				"update_time": 1608792721,
				"upstream": {
					"nodes": {
						"172.16.238.20:1980": 1
					},
					"type": "roundrobin"
				}
			}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusBadRequest,
		},
		{
			Desc:         "make sure the route not created",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   `{"error_msg":"404 Route Not Found"}`,
		},
	}

	for _, tc := range tests {
		testCaseCheck(tc, t)
	}
}
