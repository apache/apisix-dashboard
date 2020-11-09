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

//TEST 1: add consumer with username
 func TestConsumer_add_consumer_with_username(t *testing.T) {
	tests := []HttpTestCase{
		{
			caseDesc: "create consumer",
			Object:   MangerApiExpect(t),
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
			Headers:      map[string]string{"apikey": "auth-one"},
			ExpectStatus: http.StatusOK,
			Sleep:        sleepTime, //sleep x millisecond before verify route
		},
	}

	for _, tc := range tests {
		testCaseCheck(tc)
	}
}

//TEST 2: add consumer without username
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
						"key": "auth-one"
					}
				},
			  "desc": "test description"
			  }`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusBadRequest,
		},
	}

	for _, tc := range tests {
		testCaseCheck(tc)
	}
}

//TEST 3: add consumer with labels
func TestConsumer_add_consumer_with_labels(t *testing.T) {
	tests := []HttpTestCase{
		{
			caseDesc: "create consumer",
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
						"key": "auth-one"
					}
				},
			  "desc": "test description"
			  }`,
			Headers:      map[string]string{"Authorization": token},  
			ExpectStatus: http.StatusOK,
		},
		{
			caseDesc:     "verify consumer",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/consumers/jack",
			Headers:      map[string]string{"X-API-KEY": "edd1c9f034335f136f87ad84b625c8f1"},
			ExpectStatus: http.StatusOK,
			PartialBody:   "\"env\":\"production\"",
			Sleep:        sleepTime, //sleep x millisecond before verify route
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
			Headers:      map[string]string{"apikey": "auth-one"},
			ExpectStatus: http.StatusOK,
			Sleep:        sleepTime, //sleep x millisecond before verify route
		},
	}

	for _, tc := range tests {
		testCaseCheck(tc)
	}
}

//TEST 4: delete consumer
func TestConsumer_delete_consumer(t *testing.T) {
	tests := []HttpTestCase{
		{
			caseDesc: "create consumer",
			Object:   MangerApiExpect(t),
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
			Headers:      map[string]string{"apikey": "auth-one"},
			ExpectStatus: http.StatusOK,
			Sleep:        sleepTime, //sleep x millisecond before verify route
		},
		{
			caseDesc:     "delete consumer",
			Object:       APISIXExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/consumers/jack",
			Headers:      map[string]string{"X-API-KEY": "edd1c9f034335f136f87ad84b625c8f1"},
			ExpectStatus: http.StatusOK,
		},
		{
			caseDesc:     "verify route",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusUnauthorized,
			Sleep:        sleepTime, //sleep x millisecond before verify route
		},



	}

	for _, tc := range tests {
		testCaseCheck(tc)
	}
}


//Test 5: Teardown
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
		{
			caseDesc:     "delete consumer",
			Object:       APISIXExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/consumers/jack",
			Headers:      map[string]string{"X-API-KEY": "edd1c9f034335f136f87ad84b625c8f1"},
			ExpectStatus: http.StatusOK,
		},
	}
}