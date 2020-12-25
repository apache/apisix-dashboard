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
	"sort"
	"strconv"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestUpstream_chash_query_string(t *testing.T) {
	tests := []HttpTestCase{
		{
			Desc:   "create chash upstream with key (query_string)",
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
					"key": "query_string"
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
	time.Sleep(time.Duration(500) * time.Millisecond)
	basepath := "http://127.0.0.1:9080"
	var url string
	var respBody []byte
	res := map[string]int{}
	for i := 0; i < 180; i++ {
		url = basepath + "/server_port?var=2&var2=" + strconv.Itoa(i)
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
	var counts []int
	for _, value := range res {
		counts = append(counts, value)
	}
	sort.Ints(counts)
	assert.True(t, float64(counts[2]-counts[0])/float64(counts[1]) < 0.4) // todo: the result is unstable, fix it later
}

func TestUpstream_chash_arg_xxx(t *testing.T) {
	tests := []HttpTestCase{
		{
			Desc:   "create chash upstream with key (arg_xxx)",
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
					"key": "arg_device_id"
				}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
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
	var counts []int
	for _, value := range res {
		counts = append(counts, value)
	}
	sort.Ints(counts)
	assert.True(t, float64(counts[2]-counts[0])/float64(counts[1]) < 0.4) // todo: the result is unstable, fix it later
}

func TestUpstream_Delete_chash(t *testing.T) {
	tests := []HttpTestCase{
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
