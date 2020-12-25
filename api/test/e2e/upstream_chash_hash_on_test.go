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
	"strconv"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

// todo: the code to access the route should be encapsulated as a function, like line 75-96, 134-154, 160-174, 212-233, 294-314
func TestUpstream_chash_hash_on_custom_header(t *testing.T) {
	tests := []HttpTestCase{
		{
			Desc:   "create chash upstream with hash_on (custom_header)",
			Object: ManagerApiExpect(t),
			Method: http.MethodPut,
			Path:   "/apisix/admin/upstreams/1",
			Body: `{
					 "nodes": [{
						 "host": "172.16.238.20",
						 "port": 1980,
						 "weight": 1
					 },
					 {
						 "host": "172.16.238.20",
						 "port": 1981,
						 "weight": 1
					 }],
					 "type": "chash",
					 "key": "custom_header",
					 "hash_on": "header"
				 }`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:   "create route using the upstream just created",
			Object: ManagerApiExpect(t),
			Method: http.MethodPut,
			Path:   "/apisix/admin/routes/1",
			Body: `{
					 "uri": "/server_port",
					 "upstream_id": "1"
				 }`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			Sleep:        sleepTime,
		},
	}

	for _, tc := range tests {
		testCaseCheck(tc, t)
	}

	// hit routes
	time.Sleep(time.Duration(100) * time.Millisecond)
	basepath := "http://127.0.0.1:9080"
	var req *http.Request
	var err error
	var url string
	var resp *http.Response
	var respBody []byte
	res := map[string]int{}
	for i := 0; i <= 3; i++ {
		url = basepath + "/server_port?var=2&var2=" + strconv.Itoa(i)
		req, err = http.NewRequest("GET", url, nil)
		req.Header.Add("custom_header", `custom-one`)
		resp, err = http.DefaultClient.Do(req)
		assert.Nil(t, err)
		respBody, err = ioutil.ReadAll(resp.Body)
		body := string(respBody)
		if _, ok := res[body]; !ok {
			res[body] = 1
		} else {
			res[body] += 1
		}
	}
	// it is possible to hit any one of upstreams, and only one will be hit
	assert.Equal(t, true, res["1980"] == 4 || res["1981"] == 4)
	resp.Body.Close()
}

func TestUpstream_chash_hash_on_cookie(t *testing.T) {
	tests := []HttpTestCase{
		{
			Desc:   "create chash upstream with hash_on (cookie)",
			Object: ManagerApiExpect(t),
			Method: http.MethodPut,
			Path:   "/apisix/admin/upstreams/1",
			Body: `{
					 "nodes": [{
						 "host": "172.16.238.20",
						 "port": 1980,
						 "weight": 1
					 },
					 {
						 "host": "172.16.238.20",
						 "port": 1981,
						 "weight": 1
					 }],
					 "type": "chash",
					 "key": "custom-cookie",
					 "hash_on": "cookie"
				 }`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
	}

	for _, tc := range tests {
		testCaseCheck(tc, t)
	}

	// hit routes
	time.Sleep(time.Duration(100) * time.Millisecond)
	basepath := "http://127.0.0.1:9080"
	var req *http.Request
	var err error
	var url string
	var resp *http.Response
	var respBody []byte
	res := map[string]int{}
	for i := 0; i <= 3; i++ {
		url = basepath + "/server_port"
		req, err = http.NewRequest("GET", url, nil)
		req.Header.Add("Cookie", `custom-cookie=cuscookie`)
		resp, err = http.DefaultClient.Do(req)
		assert.Nil(t, err)
		respBody, err = ioutil.ReadAll(resp.Body)
		body := string(respBody)
		if _, ok := res[body]; !ok {
			res[body] = 1
		} else {
			res[body] += 1
		}
	}
	// it is possible to hit any one of upstreams, and only one will be hit
	assert.Equal(t, true, res["1980"] == 4 || res["1981"] == 4)
	resp.Body.Close()

	// hit routes with miss cookie
	res = map[string]int{}
	for i := 0; i <= 3; i++ {
		url = basepath + "/server_port"
		req, err = http.NewRequest("GET", url, nil)
		req.Header.Add("Cookie", `miss-custom-cookie=cuscookie`)
		resp, err = http.DefaultClient.Do(req)
		assert.Nil(t, err)
		respBody, err = ioutil.ReadAll(resp.Body)
		body := string(respBody)
		if _, ok := res[body]; !ok {
			res[body] = 1
		} else {
			res[body] += 1
		}
	}
	// it is possible to hit any one of upstreams, and only one will be hit
	assert.Equal(t, true, res["1980"] == 4 || res["1981"] == 4)
	resp.Body.Close()
}

func TestUpstream_key_contains_uppercase_letters_and_hyphen(t *testing.T) {
	tests := []HttpTestCase{
		{
			Desc:   "create chash upstream with key contains uppercase letters and hyphen",
			Object: ManagerApiExpect(t),
			Method: http.MethodPut,
			Path:   "/apisix/admin/upstreams/1",
			Body: `{
					 "nodes": [{
						 "host": "172.16.238.20",
						 "port": 1980,
						 "weight": 1
					 },
					 {
						 "host": "172.16.238.20",
						 "port": 1981,
						 "weight": 1
					 }],
					 "type": "chash",
					 "key": "X-Sessionid",
					 "hash_on": "header"
				 }`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
	}

	for _, tc := range tests {
		testCaseCheck(tc, t)
	}

	// hit routes
	time.Sleep(time.Duration(100) * time.Millisecond)
	basepath := "http://127.0.0.1:9080"
	var req *http.Request
	var err error
	var url string
	var resp *http.Response
	var respBody []byte
	res := map[string]int{}
	for i := 0; i <= 15; i++ {
		url = basepath + "/server_port"
		req, err = http.NewRequest("GET", url, nil)
		req.Header.Add("X-Sessionid", `chash_val_`+strconv.Itoa(i))
		resp, err = http.DefaultClient.Do(req)
		assert.Nil(t, err)
		respBody, err = ioutil.ReadAll(resp.Body)
		body := string(respBody)
		if _, ok := res[body]; !ok {
			res[body] = 1
		} else {
			res[body] += 1
		}
	}
	// the X-Sessionid of each request is different, the weight of upstreams are the same, so these requests will be sent to each upstream equally
	assert.Equal(t, true, res["1980"] == 8 && res["1981"] == 8)
	resp.Body.Close()
}

func TestUpstream_chash_hash_on_consumer(t *testing.T) {
	tests := []HttpTestCase{
		{
			Desc:   "create consumer with key-auth",
			Object: ManagerApiExpect(t),
			Method: http.MethodPut,
			Path:   "/apisix/admin/consumers",
			Body: `{
					 "username": "jack",
					 "plugins": {
						 "key-auth": {
							 "key": "auth-jack"
						 }
					 }
				 }`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:   "create route with key-auth",
			Object: ManagerApiExpect(t),
			Method: http.MethodPut,
			Path:   "/apisix/admin/routes/1",
			Body: `{
					 "uri": "/server_port",
					 "plugins": {
						 "key-auth": {}
					 },
					 "upstream": {
						 "nodes": [{
							 "host": "172.16.238.20",
							 "port": 1980,
							 "weight": 1
						 },
						 {
							 "host": "172.16.238.20",
							 "port": 1981,
							 "weight": 1
						 }],
						 "type": "chash",
						 "hash_on": "consumer"
					 }
				 }`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			Sleep:        sleepTime,
		},
	}

	for _, tc := range tests {
		testCaseCheck(tc, t)
	}

	// hit routes
	time.Sleep(time.Duration(100) * time.Millisecond)
	basepath := "http://127.0.0.1:9080"
	var req *http.Request
	var err error
	var url string
	var resp *http.Response
	var respBody []byte
	res := map[string]int{}
	for i := 0; i <= 3; i++ {
		url = basepath + "/server_port"
		req, err = http.NewRequest("GET", url, nil)
		req.Header.Add("apikey", `auth-jack`)
		resp, err = http.DefaultClient.Do(req)
		assert.Nil(t, err)
		respBody, err = ioutil.ReadAll(resp.Body)
		body := string(respBody)
		if _, ok := res[body]; !ok {
			res[body] = 1
		} else {
			res[body] += 1
		}
	}
	// it is possible to hit any one of upstreams, and only one will be hit
	assert.Equal(t, true, res["1980"] == 4 || res["1981"] == 4)
	resp.Body.Close()
}

func TestUpstream_chash_hash_on_wrong_key(t *testing.T) {
	tests := []HttpTestCase{
		{
			Desc:   "create chash upstream with wrong key",
			Object: ManagerApiExpect(t),
			Method: http.MethodPut,
			Path:   "/apisix/admin/upstreams/2",
			Body: `{
					"nodes": [{
						"host": "172.16.238.20",
						"port": 1980,
						"weight": 1
					},
					{
						"host": "172.16.238.20",
						"port": 1981,
						"weight": 1
					}],
					"type": "chash",
					"key": "not_support"
				}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusBadRequest,
			ExpectBody:   "schema validate failed: (root): Does not match pattern '^((uri|server_name|server_addr|request_uri|remote_port|remote_addr|query_string|host|hostname)|arg_[0-9a-zA-z_-]+)",
		},
		{
			Desc:         "verify upstream with wrong key",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/routes/2",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusNotFound,
			Sleep:        sleepTime,
		},
	}

	for _, tc := range tests {
		testCaseCheck(tc, t)
	}

}

func TestUpstream_chash_hash_on_vars(t *testing.T) {
	tests := []HttpTestCase{
		{
			Desc:   "create chash upstream hash_on (vars)",
			Object: ManagerApiExpect(t),
			Method: http.MethodPut,
			Path:   "/apisix/admin/upstreams/1",
			Body: `{
					"nodes": [{
						"host": "172.16.238.20",
						"port": 1980,
						"weight": 1
					},
					{
						"host": "172.16.238.20",
						"port": 1981,
						"weight": 1
					}],
					"type": "chash",
					"hash_on": "vars",
					"key": "arg_device_id"
				}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:         "verify upstream",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/upstreams/1",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "\"nodes\":[{\"host\":\"172.16.238.20\",\"port\":1980,\"weight\":1},{\"host\":\"172.16.238.20\",\"port\":1981,\"weight\":1}],\"type\":\"chash\",\"hash_on\":\"vars\",\"key\":\"arg_device_id\"",
			Sleep:        sleepTime,
		},
		{
			Desc:   "create route using the upstream just created",
			Object: ManagerApiExpect(t),
			Method: http.MethodPut,
			Path:   "/apisix/admin/routes/1",
			Body: `{
				"uri": "/server_port",
				"upstream_id": "1"
			}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			Sleep:        sleepTime,
		},
		{
			Desc:         "verify route",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/routes/1",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "\"uri\":\"/server_port\",\"upstream_id\":\"1\"",
			Sleep:        sleepTime,
		},
	}

	for _, tc := range tests {
		testCaseCheck(tc, t)
	}

	// hit routes
	time.Sleep(time.Duration(500) * time.Millisecond)
	basepath := "http://127.0.0.1:9080"
	var url string
	var respBody []byte
	res := map[string]int{}
	for i := 0; i <= 17; i++ {
		url = basepath + "/server_port?device_id=" + strconv.Itoa(i)
		req, err := http.NewRequest("GET", url, nil)
		resp, err := http.DefaultClient.Do(req)
		assert.Nil(t, err)
		respBody, err = ioutil.ReadAll(resp.Body)
		body := string(respBody)
		if _, ok := res[body]; !ok {
			res[body] = 1
		} else {
			res[body] += 1
		}
		resp.Body.Close()
	}
	assert.True(t, res["1980"] == 9 && res["1981"] == 9)
}

func TestUpstream_Delete_hash_on(t *testing.T) {
	tests := []HttpTestCase{
		{
			Desc:         "delete consumer",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/consumers/jack",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:         "delete route",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/1",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:         "delete upstream",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/upstreams/1",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:         "hit the route just deleted",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/server_port",
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   "{\"error_msg\":\"404 Route Not Found\"}\n",
			Sleep:        sleepTime,
		},
	}

	for _, tc := range tests {
		testCaseCheck(tc, t)
	}
}
