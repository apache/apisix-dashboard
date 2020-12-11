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
	"fmt"
	"io/ioutil"
	"net/http"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/tidwall/gjson"
)

func TestConsumer_Create_And_Get(t *testing.T) {
	tests := []HttpTestCase{
		{
			caseDesc:     "check consumer is not exist",
			Object:       ManagerApiExpect(t),
			Path:         "/apisix/admin/consumers/consumer_1",
			Method:       http.MethodGet,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   "data not found",
		},
		{
			caseDesc:     "check consumer is not exist",
			Object:       ManagerApiExpect(t),
			Path:         "/apisix/admin/consumers/consumer_2",
			Method:       http.MethodGet,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   "data not found",
		},
		{
			caseDesc: "create consumer by POST",
			Object:   ManagerApiExpect(t),
			Path:     "/apisix/admin/consumers",
			Method:   http.MethodPost,
			Body: `{
				"username": "consumer_1",
				"plugins": {
					"limit-count": {
					"count": 2,
					"time_window": 60,
					"rejected_code": 503,
					"key": "remote_addr"
					}
				},
				"desc": "test description"
			}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   "404 page not found",
		},
		{
			caseDesc: "create consumer by PUT",
			Object:   ManagerApiExpect(t),
			Path:     "/apisix/admin/consumers",
			Method:   http.MethodPut,
			Body: `{
				"username": "consumer_2",
				"plugins": {
					"limit-count": {
					"count": 2,
					"time_window": 60,
					"rejected_code": 503,
					"key": "remote_addr"
					}
				},
				"desc": "test description"
			}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "\"code\":0",
			Sleep:        sleepTime,
		},
		{
			caseDesc:     "get consumer",
			Object:       ManagerApiExpect(t),
			Path:         "/apisix/admin/consumers/consumer_2",
			Method:       http.MethodGet,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "\"username\":\"consumer_2\"",
		},
		{
			caseDesc: "create consumer without username",
			Object:   ManagerApiExpect(t),
			Path:     "/apisix/admin/consumers",
			Method:   http.MethodPut,
			Body: `{
				"plugins": {
					"limit-count": {
					"count": 2,
					"time_window": 60,
					"rejected_code": 503,
					"key": "remote_addr"
					}
				},
				"desc": "test description"
			}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusBadRequest,
			ExpectBody:   "\"code\":10000",
		},
		{
			caseDesc:     "delete consumer",
			Object:       ManagerApiExpect(t),
			Path:         "/apisix/admin/consumers/consumer_2",
			Method:       http.MethodDelete,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "\"code\":0",
		},
	}

	for _, tc := range tests {
		testCaseCheck(tc)
	}
}

func TestConsumer_Update_And_Get(t *testing.T) {
	tests := []HttpTestCase{
		{
			caseDesc: "create consumer by PUT",
			Object:   ManagerApiExpect(t),
			Path:     "/apisix/admin/consumers",
			Method:   http.MethodPut,
			Body: `{
				"username": "consumer_3",
				"plugins": {
					"limit-count": {
					"count": 2,
					"time_window": 60,
					"rejected_code": 503,
					"key": "remote_addr"
					}
				},
				"desc": "test description"
			}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "\"code\":0",
			Sleep:        sleepTime,
		},
		{
			caseDesc: "update consumer by PUT",
			Object:   ManagerApiExpect(t),
			Path:     "/apisix/admin/consumers/consumer_3",
			Method:   http.MethodPut,
			Body: `{
				"username": "consumer_3",
				"plugins": {
					"limit-count": {
					"count": 2,
					"time_window": 60,
					"rejected_code": 504,
					"key": "remote_addr"
					}
				},
				"desc": "test description"
			}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "\"code\":0",
			Sleep:        sleepTime,
		},
		{
			caseDesc:     "get consumer",
			Object:       ManagerApiExpect(t),
			Path:         "/apisix/admin/consumers/consumer_3",
			Method:       http.MethodGet,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "\"rejected_code\":504",
		},
		{
			caseDesc:     "delete consumer",
			Object:       ManagerApiExpect(t),
			Path:         "/apisix/admin/consumers/consumer_3",
			Method:       http.MethodDelete,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "\"code\":0",
		},
	}

	for _, tc := range tests {
		testCaseCheck(tc)
	}
}

func TestConsumer_with_key_auth(t *testing.T) {
	tests := []HttpTestCase{
		{
			caseDesc: "create route",
			Object:   ManagerApiExpect(t),
			Method:   http.MethodPut,
			Path:     "/apisix/admin/routes/r1",
			Body: `{
				"uri": "/hello",
				"plugins": {
					"key-auth": {}
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
			caseDesc:     "hit route without apikey",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusUnauthorized,
			ExpectBody:   "Missing API key found in request",
			Sleep:        sleepTime * 2,
		},
		{
			caseDesc: "create consumer",
			Object:   ManagerApiExpect(t),
			Path:     "/apisix/admin/consumers",
			Method:   http.MethodPut,
			Body: `{
				"username": "jack",
				"plugins": {
					"key-auth": {
						"key": "auth-one"
					}
				},
				"desc": "test description"
			}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			caseDesc:     "hit route with correct apikey",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello",
			Headers:      map[string]string{"apikey": "auth-one"},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "hello world",
			Sleep:        sleepTime,
		},
		{
			caseDesc:     "hit route with incorrect apikey",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello",
			Headers:      map[string]string{"apikey": "auth-new"},
			ExpectStatus: http.StatusUnauthorized,
			ExpectBody:   "Invalid API key in request",
			Sleep:        sleepTime,
		},
		{
			caseDesc:     "delete consumer",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/consumers/jack",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			caseDesc:     "delete consumer (as delete not exist consumer)",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/consumers/jack",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusNotFound,
		},
		{
			caseDesc:     "hit route (consumer deleted)",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello",
			Headers:      map[string]string{"apikey": "auth-one"},
			ExpectStatus: http.StatusUnauthorized,
			ExpectBody:   "Missing related consumer",
			Sleep:        sleepTime,
		},
		{
			caseDesc:     "delete route",
			Object:       ManagerApiExpect(t),
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

func TestConsumer_with_notexist_plugin(t *testing.T) {
	tests := []HttpTestCase{
		{
			caseDesc: "create consumer with not exist plugin",
			Object:   ManagerApiExpect(t),
			Path:     "/apisix/admin/consumers",
			Method:   http.MethodPut,
			Body: `{
				"username": "jack",
				"plugins": {
					"key-authaa": {
						"key": "auth-one"
					}
				},
				"desc": "test description"
			}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusBadRequest,
			ExpectBody:   "schema validate failed: schema not found, path: plugins.key-authaa",
		},
		{
			caseDesc:     "verify the consumer",
			Object:       ManagerApiExpect(t),
			Path:         "/apisix/admin/consumers/jack",
			Method:       http.MethodGet,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusNotFound,
			Sleep:        sleepTime,
		},
	}

	for _, tc := range tests {
		testCaseCheck(tc)
	}
}

func TestConsumer_add_consumer_with_labels(t *testing.T) {
	tests := []HttpTestCase{
		{
			caseDesc: "create the consumer",
			Object:   ManagerApiExpect(t),
			Path:     "/apisix/admin/consumers",
			Method:   http.MethodPut,
			Body: `{
				"username": "jack",
				"labels": {
					"build":"16",
					"env":"production",
					"version":"v2"
				},
				"plugins": {
					"key-auth": {
						"key": "auth-two"
					}
				},
				"desc": "test description"
			}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			caseDesc:     "verify the consumer",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/consumers/jack",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "\"username\":\"jack\",\"desc\":\"test description\",\"plugins\":{\"key-auth\":{\"key\":\"auth-two\"}},\"labels\":{\"build\":\"16\",\"env\":\"production\",\"version\":\"v2\"}",
			Sleep:        sleepTime,
		},
		{
			caseDesc: "create the route",
			Object:   ManagerApiExpect(t),
			Method:   http.MethodPut,
			Path:     "/apisix/admin/routes/r1",
			Body: `{
				"uri": "/hello",
				"plugins": {
					"key-auth": {}
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
			caseDesc:     "hit the route with correct apikey",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello",
			Headers:      map[string]string{"apikey": "auth-two"},
			ExpectStatus: http.StatusOK,
			Sleep:        sleepTime,
		},
		{
			caseDesc:     "delete the consumer",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/consumers/jack",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			caseDesc:     "delete the route",
			Object:       ManagerApiExpect(t),
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

func TestConsumer_with_createtime_updatetime(t *testing.T) {
	tests := []HttpTestCase{
		{
			caseDesc: "create the consumer",
			Object:   ManagerApiExpect(t),
			Path:     "/apisix/admin/consumers",
			Method:   http.MethodPut,
			Body: `{
				"username":"jack",
				"desc": "new consumer"
			}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			Sleep:        sleepTime,
		},
	}
	for _, tc := range tests {
		testCaseCheck(tc)
	}

	basepath := "http://127.0.0.1:9000/apisix/admin/consumers"
	time.Sleep(time.Duration(1) * time.Second)

	// get the consumer, save createtime and updatetime
	request, _ := http.NewRequest("GET", basepath+"/jack", nil)
	request.Header.Add("Authorization", token)
	resp, err := http.DefaultClient.Do(request)
	if err != nil {
		fmt.Printf("server not responding %s", err.Error())
	}
	defer resp.Body.Close()
	respBody, _ := ioutil.ReadAll(resp.Body)
	createtime := gjson.Get(string(respBody), "data.create_time")
	updatetime := gjson.Get(string(respBody), "data.update_time")

	// wait 1 second so the update_time should be different
	time.Sleep(time.Duration(1) * time.Second)

	tests = []HttpTestCase{
		{
			caseDesc: "update the consumer",
			Object:   ManagerApiExpect(t),
			Path:     "/apisix/admin/consumers",
			Method:   http.MethodPut,
			Body: `{
				"username":"jack",
				"desc": "updated consumer"
			}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			Sleep:        sleepTime,
		},
	}

	for _, tc := range tests {
		testCaseCheck(tc)
	}

	// get the consumer
	time.Sleep(time.Duration(1) * time.Second)
	request, _ = http.NewRequest("GET", basepath+"/jack", nil)
	request.Header.Add("Authorization", token)
	resp, _ = http.DefaultClient.Do(request)
	respBody, _ = ioutil.ReadAll(resp.Body)
	createtime2 := gjson.Get(string(respBody), "data.create_time")
	updatetime2 := gjson.Get(string(respBody), "data.update_time")

	// verify the consumer and compare result
	assert.Equal(t, "updated consumer", gjson.Get(string(respBody), "data.desc").String())
	assert.Equal(t, createtime.String(), createtime2.String())
	assert.NotEqual(t, updatetime.String(), updatetime2.String())

	tests = []HttpTestCase{
		{
			caseDesc:     "delete the consumer",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/consumers/jack",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			caseDesc:     "after delete consumer verify it again",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/consumers/jack",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusNotFound,
			Sleep:        sleepTime,
		},
	}

	for _, tc := range tests {
		testCaseCheck(tc)
	}
}
