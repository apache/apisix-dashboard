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

//case 4: delete consumer(id: not_found)
func TestConsumer_delete_notexit_consumer(t *testing.T) {
	tests := []HttpTestCase{
		{
			caseDesc:     "delete notexit consumer",
			Object:       MangerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/consumers/notexit",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusNotFound,
		},
	}

	for _, tc := range tests {
		testCaseCheck(tc)
	}
}

//case 8: update consumer, check if updatetime is updated
func TestConsumer_create_consumer_with_createtime_updatetime(t *testing.T) {
	//create consumer, save the result_A ( create_time and update_time )
	data := `{
		"username":"case_8",
		"desc": "new consumer"
   }`
	request, _ := http.NewRequest("PUT", "http://127.0.0.1:8080/apisix/admin/consumers", strings.NewReader(data))
	request.Header.Add("Authorization", token)
	resp, _ := http.DefaultClient.Do(request)
	defer resp.Body.Close()
	respBody, _ := ioutil.ReadAll(resp.Body)
	code := gjson.Get(string(respBody), "code")
	assert.Equal(t, code.String(), "0")

	time.Sleep(1 * time.Second)

	request, _ = http.NewRequest("GET", "http://127.0.0.1:8080/apisix/admin/consumers/case_8", nil)
	request.Header.Add("Authorization", token)
	resp, _ = http.DefaultClient.Do(request)
	defer resp.Body.Close()
	respBody, _ = ioutil.ReadAll(resp.Body)
	createtime := gjson.Get(string(respBody), "data.create_time")
	updatetime := gjson.Get(string(respBody), "data.update_time")

	//create consumer again, compare the new result and the result_A
	data = `{
		"username":"case_8",
		"desc": "new consumer haha"
   }`
	request, _ = http.NewRequest("PUT", "http://127.0.0.1:8080/apisix/admin/consumers", strings.NewReader(data))
	request.Header.Add("Authorization", token)
	resp, _ = http.DefaultClient.Do(request)
	defer resp.Body.Close()
	respBody, _ = ioutil.ReadAll(resp.Body)
	code = gjson.Get(string(respBody), "code")
	assert.Equal(t, code.String(), "0")

	time.Sleep(1 * time.Second)

	request, _ = http.NewRequest("GET", "http://127.0.0.1:8080/apisix/admin/consumers/case_8", nil)
	request.Header.Add("Authorization", token)
	resp, _ = http.DefaultClient.Do(request)
	defer resp.Body.Close()
	respBody, _ = ioutil.ReadAll(resp.Body)
	createtime2 := gjson.Get(string(respBody), "data.create_time")
	updatetime2 := gjson.Get(string(respBody), "data.update_time")

	assert.Equal(t, createtime.String(), createtime2.String())
	assert.NotEqual(t, updatetime.String(), updatetime2.String())

	//deletea consumer
	request, _ = http.NewRequest("DELETE", "http://127.0.0.1:8080/apisix/admin/consumers/case_8", nil)
	request.Header.Add("Authorization", token)
	_, err := http.DefaultClient.Do(request)
	assert.Nil(t, err)

}

//case9: create consumers with post method
func TestConsumer_create_consumer_with_post_method(t *testing.T) {
	tests := []HttpTestCase{
		{
			caseDesc: "create consumers with post method",
			Object:   MangerApiExpect(t),
			Path:     "/apisix/admin/consumers",
			Method:   http.MethodPost,
			Body: `{
				"username":"case_9",
				"desc": "new consumer",
				"create_time": 1602883670,
				"update_time": 1602893670
		   }`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusMethodNotAllowed,
		},
		{
			caseDesc:     "delete consumer",
			Object:       MangerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/consumers/case_9",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
	}

	for _, tc := range tests {
		testCaseCheck(tc)
	}
}

//case10: create consumers with invalid format of label value
func TestConsumer_create_consumer_with_invalid_format_of_label(t *testing.T) {
	tests := []HttpTestCase{
		{
			caseDesc: "create consumers with invalid format of label value",
			Object:   MangerApiExpect(t),
			Path:     "/apisix/admin/consumers",
			Method:   http.MethodPost,
			Body: `{
				"username":"case_10",
				"desc": "new consumer",
				"labels": {
				   "env": ["production", "release"]
				}
		   }`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusBadRequest,
		},
	}

	for _, tc := range tests {
		testCaseCheck(tc)
	}
}

//case11: create consumers with two auth plugin
func TestConsumer_create_consumer_with_two_authplugin(t *testing.T) {
	tests := []HttpTestCase{
		{
			caseDesc: "create consumers with two auth plugin",
			Object:   MangerApiExpect(t),
			Path:     "/apisix/admin/consumers",
			Method:   http.MethodPut,
			Body: `{
						"username": "case_11",
						"plugins": {
							"jwt-auth": {
								"key": "a36c3049b36249a3c9f8891cb127243c",
								"secret": "e71829c351aa4242c2719cbfbe671c09"
							},
							"key-auth": {
							"key": "auth-one"
							}
						}
			   }`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusBadRequest,
			ExpectBody:   "scheme validate failed",
		},
		{
			caseDesc:     "verify consumer",
			Object:       MangerApiExpect(t),
			Path:         "/apisix/admin/consumers/case_2",
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
