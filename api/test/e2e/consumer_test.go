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
)

//case 1: add consumer with username
func TestConsumer_add_consumer_with_username(t *testing.T) {
	tests := []HttpTestCase{
		{
			caseDesc: "create route",
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
					 "nodes": {
						 "172.16.238.20:1980": 1
					 }
				 }
			 }`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			caseDesc:     "verify route",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusUnauthorized,
			ExpectBody:   "Missing API key found in request",
			Sleep:        sleepTime, //sleep x millisecond before verify route
		},
		{
			caseDesc: "create consumer",
			Object:   MangerApiExpect(t),
			Path:     "/apisix/admin/consumers",
			Method:   http.MethodPut,
			Body: `{
				 "username": "case",
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
			caseDesc:     "verify route",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello",
			Headers:      map[string]string{"apikey": "auth-one"},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "hello world",
			Sleep:        sleepTime,
		},
		{
			caseDesc:     "verify route",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello",
			Headers:      map[string]string{"apikey": "auth-new"},
			ExpectStatus: http.StatusUnauthorized,
			ExpectBody:   "Invalid API key in request",
			Sleep:        sleepTime,
		},
	}

	for _, tc := range tests {
		testCaseCheck(tc)
	}
}

//case 2: add consumer without username
func TestConsumer_add_consumer_without_username(t *testing.T) {
	tests := []HttpTestCase{
		{
			caseDesc: "create consumer",
			Object:   MangerApiExpect(t),
			Path:     "/apisix/admin/consumers",
			Method:   http.MethodPut,
			Body: `{
				 "plugins": {
					 "key-auth": {
						 "key": "auth-new"
					 }
				 },
				 "desc": "test description"
			 }`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusBadRequest,
		},
		{
			caseDesc:     "verify route",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello",
			Headers:      map[string]string{"apikey": "auth-new"},
			ExpectStatus: http.StatusUnauthorized,
			ExpectBody:   "Invalid API key in request",
			Sleep:        sleepTime,
		},
	}

	for _, tc := range tests {
		testCaseCheck(tc)
	}
}

//case 3: delete consumer
func TestConsumer_delete_consumer(t *testing.T) {
	tests := []HttpTestCase{
		{
			caseDesc:     "delete consumer",
			Object:       MangerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/consumers/case",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			caseDesc:     "verify route",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusUnauthorized,
			ExpectBody:   "Missing API key found in request",
			Sleep:        sleepTime, //sleep x millisecond before verify route
		},
	}

	for _, tc := range tests {
		testCaseCheck(tc)
	}
}

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

//case 5: create consumer with error key
func TestConsumer_create_consumer_with_error_key(t *testing.T) {
	tests := []HttpTestCase{
		{
			caseDesc: "create consumer with error key",
			Object:   MangerApiExpect(t),
			Path:     "/apisix/admin/consumers",
			Method:   http.MethodPut,
			Body: `{
				 "username": "case_2",
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
			caseDesc:     "verify consumer",
			Object:       MangerApiExpect(t),
			Path:         "/apisix/admin/consumers/case_2",
			Method:       http.MethodGet,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusNotFound,
			Sleep:        sleepTime, //sleep x millisecond before verify route
		},
	}

	for _, tc := range tests {
		testCaseCheck(tc)
	}
}

//case 6: create consumer with no value
func TestConsumer_create_consumer_with_no_value(t *testing.T) {
	tests := []HttpTestCase{
		{
			caseDesc: "create consumer with no value",
			Object:   MangerApiExpect(t),
			Path:     "/apisix/admin/consumers",
			Method:   http.MethodPut,
			Body: `{
				 "username": "case_3",
				 "plugins": {
					 "key-auth": {
						 "key": ""
					 }
				 },
				 "desc": "test description"
			 }`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			caseDesc:     "verify consumer",
			Object:       MangerApiExpect(t),
			Path:         "/apisix/admin/consumers/case_3",
			Method:       http.MethodGet,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			Sleep:        sleepTime, //sleep x millisecond before verify route
		},
		{
			caseDesc:     "delete consumer",
			Object:       MangerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/consumers/case_3",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
	}

	for _, tc := range tests {
		testCaseCheck(tc)
	}
}

//case 7: create consumer with labels
func TestConsumer_add_consumer_with_labels(t *testing.T) {
	tests := []HttpTestCase{
		{
			caseDesc: "create consumer",
			Object:   MangerApiExpect(t),
			Path:     "/apisix/admin/consumers",
			Method:   http.MethodPut,
			Body: `{
				"username": "case_7",
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
			caseDesc:     "verify consumer",
			Object:       MangerApiExpect(t),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/consumers/case_7",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "\"username\":\"case_7\",\"desc\":\"test description\",\"plugins\":{\"key-auth\":{\"key\":\"auth-two\"}},\"labels\":{\"build\":\"16\",\"env\":\"production\",\"version\":\"v2\"}",
			Sleep:        sleepTime,
		},
		{
			caseDesc: "create route",
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
					"nodes": {
						"172.16.238.20:1980": 1
					}
				}
			}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			caseDesc:     "verify route",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello",
			Headers:      map[string]string{"apikey": "auth-two"},
			ExpectStatus: http.StatusOK,
			Sleep:        sleepTime, //sleep x millisecond before verify route
		},
		{
			caseDesc:     "delete consumer",
			Object:       MangerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/consumers/case_7",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
	}

	for _, tc := range tests {
		testCaseCheck(tc)
	}
}

//case 8: create consumer with create_time and update_time
func TestConsumer_create_consumer_with_createtime_updatetime(t *testing.T) {
	tests := []HttpTestCase{
		{
			caseDesc: "create consumer with create_time and update_time",
			Object:   MangerApiExpect(t),
			Path:     "/apisix/admin/consumers",
			Method:   http.MethodPut,
			Body: `{
				"username":"case_8",
				"desc": "new consumer",
				"create_time": 1602883670,
				"update_time": 1602893670
		   }`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			caseDesc:     "verify consumer",
			Object:       MangerApiExpect(t),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/consumers/case_8",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			ExpectJSON:   map[string]interface{}{"code": 0},
			ExpectBody:   "{\"id\":\"case_8\",\"create_time\":1602883670,\"update_time\":1602893670,\"username\":\"case_8\",\"desc\":\"new consumer\"}",
			Sleep: sleepTime,
		},
		{
			caseDesc:     "delete consumer",
			Object:       MangerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/consumers/case_8",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
	}

	for _, tc := range tests {
		testCaseCheck(tc)
	}
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

//Teardown
func TestConsumer_teardown(t *testing.T) {
	_ = []HttpTestCase{
		{
			caseDesc:     "delete route",
			Object:       MangerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/r1",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
	}
}
