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
	"time"

	"github.com/stretchr/testify/assert"
)

func TestRoute_With_Auth_Plugin(t *testing.T) {
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
				 "uri": "/hello",
				 "plugins": {
					 "jwt-auth": {}
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
			ExpectBody:   `"code":0`,
		},
		{
			caseDesc:     "make sure the consumer is not created",
			Object:       MangerApiExpect(t),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/consumers/jack",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusNotFound,
		},
		{
			caseDesc: "create consumer",
			Object:   MangerApiExpect(t),
			Path:     "/apisix/admin/consumers",
			Method:   http.MethodPut,
			Body: `{
				"username": "jack",
				"plugins": {
					"jwt-auth": {
						"key": "user-key",
						"secret": "my-secret-key",
						"algorithm": "HS256"
					}
				},
				"desc": "test description"
			}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
	}

	for _, tc := range tests {
		testCaseCheck(tc)
	}

	time.Sleep(sleepTime)

	// sign jwt token
	body, status, err := httpGet("http://127.0.0.1:9080/apisix/plugin/jwt/sign?key=user-key")
	assert.Nil(t, err)
	assert.Equal(t, http.StatusOK, status)
	jwtToken := string(body)

	// sign jwt token with not exists key
	body, status, err = httpGet("http://127.0.0.1:9080/apisix/plugin/jwt/sign?key=not-exist-key")
	assert.Nil(t, err)
	assert.Equal(t, http.StatusNotFound, status)

	// verify token and clean test data
	tests = []HttpTestCase{
		{
			caseDesc:     "verify route without jwt token",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusUnauthorized,
			ExpectBody:   `{"message":"Missing JWT token in request"}`,
			Sleep:        sleepTime,
		},
		{
			caseDesc:     "verify route with correct jwt token",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello",
			Headers:      map[string]string{"Authorization": jwtToken},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "hello world",
		},
		{
			caseDesc:     "verify route with incorrect jwt token",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello",
			Headers:      map[string]string{"Authorization": "invalid-token"},
			ExpectStatus: http.StatusUnauthorized,
			ExpectBody:   `{"message":"invalid jwt string"}`,
		},
		{
			caseDesc:     "delete consumer",
			Object:       MangerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/consumers/jack",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			caseDesc:     "verify route with the jwt token from just deleted consumer",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello",
			Headers:      map[string]string{"Authorization": jwtToken},
			ExpectStatus: http.StatusUnauthorized,
			ExpectBody:   `{"message":"Missing related consumer"}`,
			Sleep:        sleepTime,
		},
		{
			caseDesc:     "delete route",
			Object:       MangerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/r1",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			caseDesc:     "verify the deleted route ",
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
