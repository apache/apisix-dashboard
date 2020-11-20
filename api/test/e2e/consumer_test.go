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

//CASE 1: add consumer with username
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

//CASE 2: add consumer without username
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

//CASE 3: delete consumer
func TestConsumer_delete_consumer(t *testing.T) {
	tests := []HttpTestCase{
		{
			caseDesc:     "delete consumer",
			Object:       MangerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/consumers/jack",
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

//CASE 4: delete not exit consumer
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

//CASE 5: create consumer with error key
func TestConsumer_create_consumer_with_error_key(t *testing.T) {
	tests := []HttpTestCase{
		{
			caseDesc: "create consumer with error key",
			Object:   MangerApiExpect(t),
			Path:     "/apisix/admin/consumers",
			Method:   http.MethodPut,
			Body: `{
				 "username": "jack_2",
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
			Path:         "/apisix/admin/consumers/jack_2",
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

//CASE 6: create consumer with no value
func TestConsumer_create_consumer_with_no_value(t *testing.T) {
	tests := []HttpTestCase{
		{
			caseDesc: "create consumer with no value",
			Object:   MangerApiExpect(t),
			Path:     "/apisix/admin/consumers",
			Method:   http.MethodPut,
			Body: `{
				 "username": "jack_3",
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
			Path:         "/apisix/admin/consumers/jack_3",
			Method:       http.MethodGet,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			Sleep:        sleepTime, //sleep x millisecond before verify route
		},
		{
			caseDesc:     "delete consumer",
			Object:       MangerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/consumers/jack_3",
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
