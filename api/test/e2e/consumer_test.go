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
	"strings"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/tidwall/gjson"
)

func TestConsumer_with_error_key(t *testing.T) {
	tests := []HttpTestCase{
		{
			caseDesc: "create consumer with error key",
			Object:   MangerApiExpect(t),
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
			ExpectBody:   "scheme validate failed",
		},
		{
			caseDesc:     "verify the consumer",
			Object:       MangerApiExpect(t),
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
			Object:   MangerApiExpect(t),
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
			Object:       MangerApiExpect(t),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/consumers/jack",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "\"username\":\"jack\",\"desc\":\"test description\",\"plugins\":{\"key-auth\":{\"key\":\"auth-two\"}},\"labels\":{\"build\":\"16\",\"env\":\"production\",\"version\":\"v2\"}",
			Sleep:        sleepTime,
		},
		{
			caseDesc: "create the route",
			Object:   MangerApiExpect(t),
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
			Object:       MangerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/consumers/jack",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			caseDesc:     "delete the route",
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

func TestConsumer_with_createtime_updatetime(t *testing.T) {
	//create consumer
	basepath := "http://127.0.0.1:8080/apisix/admin/consumers"
	data := `{
		"username":"jack",
		"desc": "new consumer"
    }`
	request, _ := http.NewRequest("PUT", basepath, strings.NewReader(data))
	request.Header.Add("Authorization", token)
	resp, _ := http.DefaultClient.Do(request)
	defer resp.Body.Close()
	respBody, _ := ioutil.ReadAll(resp.Body)
	code := gjson.Get(string(respBody), "code")
	assert.Equal(t, code.String(), "0")

	time.Sleep(time.Duration(100) * time.Millisecond)
	
	//get the consumer, save createtime and updatetime
	request, _ = http.NewRequest("GET", basepath+"/jack", nil)
	request.Header.Add("Authorization", token)
	resp, _ = http.DefaultClient.Do(request)
	respBody, _ = ioutil.ReadAll(resp.Body)
	createtime := gjson.Get(string(respBody), "data.create_time")
	updatetime := gjson.Get(string(respBody), "data.update_time")

	//Wait one second for update time to be different
	time.Sleep(time.Duration(1000) * time.Millisecond)

	//update the consumer with new desc
	data = `{
		"username":"jack",
		"desc": "updated consumer"
    }`
	request, _ = http.NewRequest("PUT", basepath, strings.NewReader(data))
	request.Header.Add("Authorization", token)
	resp, _ = http.DefaultClient.Do(request)
	respBody, _ = ioutil.ReadAll(resp.Body)
	code = gjson.Get(string(respBody), "code")
	assert.Equal(t, code.String(), "0")

	time.Sleep(time.Duration(100) * time.Millisecond)
	
	//get the consumer
	request, _ = http.NewRequest("GET", basepath+"/jack", nil)
	request.Header.Add("Authorization", token)
	resp, _ = http.DefaultClient.Do(request)
	respBody, _ = ioutil.ReadAll(resp.Body)
	createtime2 := gjson.Get(string(respBody), "data.create_time")
	updatetime2 := gjson.Get(string(respBody), "data.update_time")

	//verify the consumer and compare result
	assert.Equal(t, "updated consumer",gjson.Get(string(respBody), "data.desc").String())
	assert.Equal(t, createtime.String(), createtime2.String())
	assert.NotEqual(t, updatetime.String(), updatetime2.String())

	//delete the consumer
	request, _ = http.NewRequest("DELETE", basepath+"/jack", nil)
	request.Header.Add("Authorization", token)
	_, err := http.DefaultClient.Do(request)
	assert.Nil(t, err)
}
