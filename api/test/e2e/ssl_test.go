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
	"encoding/json"
	"github.com/stretchr/testify/assert"
	"io/ioutil"
	"net/http"
	"testing"
)

func TestSSL_Basic(t *testing.T) {
	testCert, err := ioutil.ReadFile("../certs/test2.crt")
	assert.Nil(t, err)
	testKey, err := ioutil.ReadFile("../certs/test2.key")
	assert.Nil(t, err)
	apisixKey, err := ioutil.ReadFile("../certs/apisix.key")
	assert.Nil(t, err)
	body, err := json.Marshal(map[string]string{
		"id":   "1",
		"cert": string(testCert),
		"key":  string(testKey),
	})
	assert.Nil(t, err)
	invalidBody, err := json.Marshal(map[string]string{
		"id":   "1",
		"cert": string(testCert),
		"key":  string(apisixKey),
	})

	tests := []HttpTestCase{
		{
			caseDesc:     "create ssl fail - key and cert not match",
			Object:       MangerApiExpect(t),
			Method:       http.MethodPost,
			Path:         "/apisix/admin/ssl",
			Body:         string(invalidBody),
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusBadRequest,
		},
		{
			caseDesc:     "create ssl successful",
			Object:       MangerApiExpect(t),
			Method:       http.MethodPost,
			Path:         "/apisix/admin/ssl",
			Body:         string(body),
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			caseDesc: "create route",
			Object:   MangerApiExpect(t),
			Method:   http.MethodPut,
			Path:     "/apisix/admin/routes/r1",
			Body: `{
				"uri": "/hello_",
				"hosts": ["test2.com", "*.test2.com"],
				"upstream": {
					"nodes": {
						"172.16.238.20:1980": 1
					},
					"type": "roundrobin"
				}
			}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			caseDesc:     "hit the route just created",
			Object:       APISIXHTTPSExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello_",
			Headers:      map[string]string{"Host": "www.test2.com"},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "hello world\n",
			SkipVerify:   true,
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
			caseDesc:     "delete ssl",
			Object:       MangerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/ssl/1",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
	}

	for _, tc := range tests {
		testCaseCheck(tc)
	}
}
