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
	"testing"

	"github.com/stretchr/testify/assert"
)

// todo: the code to access the route should be encapsulated as a function, like line 245-263, 316-327
func TestUpstream_Create(t *testing.T) {
	tests := []HttpTestCase{
		{
			Desc:   "use upstream that not exist",
			Object: ManagerApiExpect(t),
			Method: http.MethodPut,
			Path:   "/apisix/admin/routes/r1",
			Body: `{
				"uri": "/hello",
				"upstream_id": "not-exists"
			}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusBadRequest,
		},
		{
			Desc:   "create upstream",
			Object: ManagerApiExpect(t),
			Method: http.MethodPut,
			Path:   "/apisix/admin/upstreams/1",
			Body: `{
				"nodes": [{
					"host": "172.16.238.20",
					"port": 1980,
					"weight": 1
				}],
				"type": "roundrobin"
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
				"uri": "/hello",
				"upstream_id": "1"
			}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			Sleep:        sleepTime,
		},
		{
			Desc:         "hit the route just created",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusOK,
			ExpectBody:   "hello world",
			Sleep:        sleepTime,
		},
	}

	for _, tc := range tests {
		testCaseCheck(tc, t)
	}
}

func TestUpstream_Update(t *testing.T) {
	tests := []HttpTestCase{
		{
			Desc:   "update upstream with domain",
			Object: ManagerApiExpect(t),
			Method: http.MethodPut,
			Path:   "/apisix/admin/upstreams/1",
			Body: `{
				"nodes": [{
					"host": "172.16.238.20",
					"port": 1981,
					"weight": 1
				}],
				"type": "roundrobin"
			}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:         "hit the route using upstream 1",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusOK,
			ExpectBody:   "hello world",
			Sleep:        sleepTime,
		},
	}

	for _, tc := range tests {
		testCaseCheck(tc, t)
	}
}

func TestRoute_Node_Host(t *testing.T) {
	tests := []HttpTestCase{
		{
			Desc:   "update upstream - pass host: node",
			Object: ManagerApiExpect(t),
			Method: http.MethodPut,
			Path:   "/apisix/admin/upstreams/1",
			Body: `{
				"nodes": [{
					"host": "httpbin.org",
					"port": 80,
					"weight": 1
				}],
				"type": "roundrobin",
				"pass_host": "node"
			}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:   "update path for route",
			Object: ManagerApiExpect(t),
			Method: http.MethodPut,
			Path:   "/apisix/admin/routes/1",
			Body: `{
					"uri": "/*",
					"upstream_id": "1"
				}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:         "hit the route ",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/get",
			ExpectStatus: http.StatusOK,
			ExpectBody:   "\"Host\": \"httpbin.org\"",
			Sleep:        sleepTime,
		},
		{
			Desc:   "update upstream - pass host: rewrite",
			Object: ManagerApiExpect(t),
			Method: http.MethodPut,
			Path:   "/apisix/admin/upstreams/1",
			Body: `{
				"nodes": [{
					"host": "172.16.238.20",
					"port": 1980,
					"weight": 1
				}],
				"type": "roundrobin",
				"pass_host": "rewrite",
				"upstream_host": "httpbin.org"
			}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:         "hit the route ",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/uri",
			ExpectStatus: http.StatusOK,
			ExpectBody:   "x-forwarded-host: 127.0.0.1",
			Sleep:        sleepTime,
		},
	}

	for _, tc := range tests {
		testCaseCheck(tc, t)
	}
}

func TestUpstream_chash_remote_addr(t *testing.T) {
	tests := []HttpTestCase{
		{
			Desc:   "create chash upstream with key (remote_addr)",
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
				},
				{
					"host": "172.16.238.20",
					"port": 1982,
					"weight": 1
				}],
				"type": "chash",
				"hash_on":"header",
				"key": "remote_addr"
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

	//hit routes
	basepath := "http://127.0.0.1:9080/"
	request, err := http.NewRequest("GET", basepath+"/server_port", nil)
	request.Header.Add("Authorization", token)
	var resp *http.Response
	var respBody []byte
	var count int
	res := map[string]int{}
	for i := 0; i < 18; i++ {
		resp, err = http.DefaultClient.Do(request)
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
	assert.Equal(t, 18, res["1982"])

	tests = []HttpTestCase{
		{
			Desc:   "create chash upstream with key (remote_addr, weight equal 0 or 1)",
			Object: ManagerApiExpect(t),
			Method: http.MethodPut,
			Path:   "/apisix/admin/upstreams/1",
			Body: `{
				"nodes": [
				{
					"host": "172.16.238.20",
					"port": 1980,
					"weight": 1
				},
				{
					"host": "172.16.238.20",
					"port": 1981,
					"weight": 0
				},
				{
					"host": "172.16.238.20",
					"port": 1982,
					"weight": 0
				}],
				"type": "chash",
				"hash_on":"header",
				"key": "remote_addr"
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

	//hit routes
	basepath = "http://127.0.0.1:9080/"
	request, err = http.NewRequest("GET", basepath+"/server_port", nil)
	request.Header.Add("Authorization", token)
	count = 0
	for i := 0; i <= 17; i++ {
		resp, err = http.DefaultClient.Do(request)
		assert.Nil(t, err)
		respBody, err = ioutil.ReadAll(resp.Body)
		if string(respBody) == "1980" {
			count++
		}
	}
	assert.Equal(t, 18, count)
	defer resp.Body.Close()

	tests = []HttpTestCase{
		{
			Desc:   "create chash upstream with key (remote_addr, all weight equal 0)",
			Object: ManagerApiExpect(t),
			Method: http.MethodPut,
			Path:   "/apisix/admin/upstreams/1",
			Body: `{
				"nodes": [
				{
					"host": "172.16.238.20",
					"port": 1980,
					"weight": 0
				},
				{
					"host": "172.16.238.20",
					"port": 1981,
					"weight": 0
				}],
				"type": "chash",
				"hash_on":"header",
				"key": "remote_addr"
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
		{
			Desc:         "hit the route ",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/server_port",
			ExpectStatus: http.StatusBadGateway,
			ExpectBody:   "<head><title>502 Bad Gateway</title></head>",
			Sleep:        sleepTime,
		},
	}

	for _, tc := range tests {
		testCaseCheck(tc, t)
	}

}

func TestUpstream_Delete(t *testing.T) {
	tests := []HttpTestCase{
		{
			Desc:         "delete not exist upstream",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/upstreams/not-exist",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusNotFound,
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
			Path:         "/hello1",
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   "{\"error_msg\":\"404 Route Not Found\"}\n",
			Sleep:        sleepTime,
		},
	}

	for _, tc := range tests {
		testCaseCheck(tc, t)
	}
}
