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
	"context"
	"crypto/tls"
	"encoding/json"
	"io/ioutil"
	"net"
	"net/http"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestSSL_Basic(t *testing.T) {
	// build test body
	testCert, err := ioutil.ReadFile("../certs/test2.crt")
	assert.Nil(t, err)
	testKey, err := ioutil.ReadFile("../certs/test2.key")
	assert.Nil(t, err)
	apisixKey, err := ioutil.ReadFile("../certs/apisix.key")
	assert.Nil(t, err)
	body, err := json.Marshal(map[string]interface{}{
		"id":   "1",
		"cert": string(testCert),
		"key":  string(testKey),
		"labels": map[string]string{
			"build":   "16",
			"env":     "production",
			"version": "v3",
		},
	})
	assert.Nil(t, err)
	invalidBody, err := json.Marshal(map[string]string{
		"id":   "1",
		"cert": string(testCert),
		"key":  string(apisixKey),
	})

	// Before configuring SSL, make a HTTPS request
	// If use the test framework, errors will cause failure, so we need to make a separate https request for testing.
	http.DefaultTransport.(*http.Transport).TLSClientConfig = &tls.Config{InsecureSkipVerify: true}
	http.DefaultTransport.(*http.Transport).DialContext = func(ctx context.Context, network, addr string) (net.Conn, error) {
		if addr == "www.test2.com:9443" {
			addr = "127.0.0.1:9443"
		}
		dialer := &net.Dialer{}
		return dialer.DialContext(ctx, network, addr)
	}
	_, err = http.Get("https://www.test2.com:9443")
	assert.NotNil(t, err)
	assert.EqualError(t, err, "Get https://www.test2.com:9443: remote error: tls: internal error")

	// main test cases
	tests := []HttpTestCase{
		{
			Desc:         "create ssl fail - key and cert not match",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodPost,
			Path:         "/apisix/admin/ssl",
			Body:         string(invalidBody),
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusBadRequest,
		},
		{
			Desc:         "create ssl successfully",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodPost,
			Path:         "/apisix/admin/ssl",
			Body:         string(body),
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			Sleep:        sleepTime,
		},
		{
			Desc:         "check ssl labels",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/ssl/1",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "\"labels\":{\"build\":\"16\",\"env\":\"production\",\"version\":\"v3\"",
		},
		{
			Desc:   "create route",
			Object: ManagerApiExpect(t),
			Method: http.MethodPut,
			Path:   "/apisix/admin/routes/r1",
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
			Desc:         "get the route just created to trigger removing `key`",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/routes/r1",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			Sleep:        sleepTime,
		},
		{
			Desc:         "hit the route just created using HTTPS",
			Object:       APISIXHTTPSExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello_",
			Headers:      map[string]string{"Host": "www.test2.com"},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "hello world\n",
			Sleep:        sleepTime,
		},
		{
			Desc:   "disable SSL",
			Object: ManagerApiExpect(t),
			Method: http.MethodPatch,
			Path:   "/apisix/admin/ssl/1",
			Body: `{
				"status": 0
			}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
	}

	for _, tc := range tests {
		testCaseCheck(tc, t)
	}

	// try again after disable SSL, make a HTTPS request
	// If use the test framework, errors will cause failure, so we need to make a separate https request for testing.
	time.Sleep(sleepTime)
	_, err = http.Get("https://www.test2.com:9443")
	assert.NotNil(t, err)
	assert.EqualError(t, err, "Get https://www.test2.com:9443: remote error: tls: internal error")

	// enable SSL again
	tests = []HttpTestCase{
		{
			Desc:         "enable SSL",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodPatch,
			Path:         "/apisix/admin/ssl/1/status",
			Body:         `1`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:         "hit the route using HTTPS, make sure enable successful",
			Object:       APISIXHTTPSExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello_",
			Headers:      map[string]string{"Host": "www.test2.com"},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "hello world\n",
			Sleep:        sleepTime,
		},
	}
	for _, tc := range tests {
		testCaseCheck(tc, t)
	}

	// delete SSL
	delSSL := HttpTestCase{
		Desc:         "delete SSL",
		Object:       ManagerApiExpect(t),
		Method:       http.MethodDelete,
		Path:         "/apisix/admin/ssl/1",
		Headers:      map[string]string{"Authorization": token},
		ExpectStatus: http.StatusOK,
	}
	testCaseCheck(delSSL, t)

	// try again after deleting SSL, make a HTTPS request
	// If use the test framework, errors will cause failure, so we need to make a separate https request for testing.
	time.Sleep(sleepTime)
	_, err = http.Get("https://www.test2.com:9443")
	assert.NotNil(t, err)
	assert.EqualError(t, err, "Get https://www.test2.com:9443: remote error: tls: internal error")

	// clean test data
	delRoute := HttpTestCase{
		Desc:         "delete route",
		Object:       ManagerApiExpect(t),
		Method:       http.MethodDelete,
		Path:         "/apisix/admin/routes/r1",
		Headers:      map[string]string{"Authorization": token},
		ExpectStatus: http.StatusOK,
	}
	testCaseCheck(delRoute, t)
}
