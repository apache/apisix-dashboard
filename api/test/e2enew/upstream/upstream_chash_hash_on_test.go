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
package upstream

import (
	"encoding/json"
	"io/ioutil"
	"net/http"
	"strconv"
	"time"

	"github.com/onsi/ginkgo"
	"github.com/stretchr/testify/assert"

	"e2enew/base"
)

var nodes []map[string]interface{} = []map[string]interface{}{
	{
		"host":   base.UpstreamIp,
		"port":   1980,
		"weight": 1,
	},
	{
		"host":   base.UpstreamIp,
		"port":   1981,
		"weight": 1,
	},
}

var _ = ginkgo.Describe("Upstream chash hash on custom header", func() {
	ginkgo.It("create chash upstream with hash_on (custom_header)", func() {
		t := ginkgo.GinkgoT()
		createUpstreamBody := make(map[string]interface{})
		createUpstreamBody["nodes"] = nodes
		createUpstreamBody["type"] = "chash"
		createUpstreamBody["key"] = "custom_header"
		createUpstreamBody["hash_on"] = "header"
		_createUpstreamBody, err := json.Marshal(createUpstreamBody)
		assert.Nil(t, err)
		base.RunTestCase(base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodPut,
			Path:         "/apisix/admin/upstreams/1",
			Body:         string(_createUpstreamBody),
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		})
	})
	ginkgo.It("create route using the upstream just created", func() {
		base.RunTestCase(base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Method: http.MethodPut,
			Path:   "/apisix/admin/routes/1",
			Body: `{
				 "uri": "/server_port",
				 "upstream_id": "1"
			 }`,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			Sleep:        base.SleepTime,
		})
	})
	ginkgo.It("hit routes(upstream hash_on (custom_header))", func() {
		t := ginkgo.GinkgoT()
		time.Sleep(time.Duration(500) * time.Millisecond)
		basepath := base.APISIXHost
		res := map[string]int{}
		for i := 0; i <= 3; i++ {
			url := basepath + "/server_port?var=2&var2=" + strconv.Itoa(i)
			req, err := http.NewRequest("GET", url, nil)
			assert.Nil(t, err)
			req.Header.Add("custom_header", `custom-one`)
			resp, err := http.DefaultClient.Do(req)
			assert.Nil(t, err)
			defer resp.Body.Close()
			respBody, err := ioutil.ReadAll(resp.Body)
			assert.Nil(t, err)
			body := string(respBody)
			if _, ok := res[body]; !ok {
				res[body] = 1
			} else {
				res[body]++
			}
		}
		// it is possible to hit any one of upstreams, and only one will be hit
		assert.Equal(t, true, res["1980"] == 4 || res["1981"] == 4)
	})
	ginkgo.It("delete route", func() {
		base.RunTestCase(base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/1",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		})
	})
	ginkgo.It("delete upstream", func() {
		base.RunTestCase(base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/upstreams/1",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		})
	})
	ginkgo.It("hit the route just deleted", func() {
		base.RunTestCase(base.HttpTestCase{
			Object:       base.APISIXExpect(),
			Method:       http.MethodGet,
			Path:         "/server_port",
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   "{\"error_msg\":\"404 Route Not Found\"}\n",
			Sleep:        base.SleepTime,
		})
	})
})

var _ = ginkgo.Describe("Upstream chash hash on cookie", func() {
	ginkgo.It("create chash upstream with hash_on (cookie)", func() {
		t := ginkgo.GinkgoT()
		createUpstreamBody := make(map[string]interface{})
		createUpstreamBody["nodes"] = nodes
		createUpstreamBody["type"] = "chash"
		createUpstreamBody["key"] = "custom_cookie"
		createUpstreamBody["hash_on"] = "cookie"
		_createUpstreamBody, err := json.Marshal(createUpstreamBody)
		assert.Nil(t, err)
		base.RunTestCase(base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodPut,
			Path:         "/apisix/admin/upstreams/1",
			Body:         string(_createUpstreamBody),
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		})
	})
	ginkgo.It("create route using the upstream just created", func() {
		base.RunTestCase(base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Method: http.MethodPut,
			Path:   "/apisix/admin/routes/1",
			Body: `{
				 "uri": "/server_port",
				 "upstream_id": "1"
			 }`,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			Sleep:        base.SleepTime,
		})
	})
	ginkgo.It("hit routes(upstream hash_on (custom_cookie))", func() {
		t := ginkgo.GinkgoT()
		time.Sleep(time.Duration(500) * time.Millisecond)
		basepath := base.APISIXHost
		res := map[string]int{}
		for i := 0; i <= 3; i++ {
			url := basepath + "/server_port"
			req, err := http.NewRequest("GET", url, nil)
			assert.Nil(t, err)
			req.Header.Add("Cookie", `custom-cookie=cuscookie`)
			resp, err := http.DefaultClient.Do(req)
			assert.Nil(t, err)
			defer resp.Body.Close()
			respBody, err := ioutil.ReadAll(resp.Body)
			assert.Nil(t, err)
			body := string(respBody)
			if _, ok := res[body]; !ok {
				res[body] = 1
			} else {
				res[body]++
			}
		}
		// it is possible to hit any one of upstreams, and only one will be hit
		assert.Equal(t, true, res["1980"] == 4 || res["1981"] == 4)
	})
	ginkgo.It("hit routes(upstream hash_on (miss_custom_cookie))", func() {
		t := ginkgo.GinkgoT()
		time.Sleep(time.Duration(500) * time.Millisecond)
		basepath := base.APISIXHost
		res := map[string]int{}
		for i := 0; i <= 3; i++ {
			url := basepath + "/server_port"
			req, err := http.NewRequest("GET", url, nil)
			assert.Nil(t, err)
			req.Header.Add("Cookie", `miss-custom-cookie=cuscookie`)
			resp, err := http.DefaultClient.Do(req)
			assert.Nil(t, err)
			defer resp.Body.Close()
			respBody, err := ioutil.ReadAll(resp.Body)
			assert.Nil(t, err)
			body := string(respBody)
			if _, ok := res[body]; !ok {
				res[body] = 1
			} else {
				res[body]++
			}
		}
		// it is possible to hit any one of upstreams, and only one will be hit
		assert.Equal(t, true, res["1980"] == 4 || res["1981"] == 4)
	})
	ginkgo.It("delete route", func() {
		base.RunTestCase(base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/1",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		})
	})
	ginkgo.It("delete upstream", func() {
		base.RunTestCase(base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/upstreams/1",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		})
	})
	ginkgo.It("hit the route just deleted", func() {
		base.RunTestCase(base.HttpTestCase{
			Object:       base.APISIXExpect(),
			Method:       http.MethodGet,
			Path:         "/server_port",
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   "{\"error_msg\":\"404 Route Not Found\"}\n",
			Sleep:        base.SleepTime,
		})
	})
})

var _ = ginkgo.Describe("Upstream key contains uppercase letters and hyphen", func() {
	ginkgo.It("create chash upstream with key contains uppercase letters and hyphen", func() {
		t := ginkgo.GinkgoT()
		createUpstreamBody := make(map[string]interface{})
		createUpstreamBody["nodes"] = nodes
		createUpstreamBody["type"] = "chash"
		createUpstreamBody["key"] = "X-Sessionid"
		createUpstreamBody["hash_on"] = "header"
		_createUpstreamBody, err := json.Marshal(createUpstreamBody)
		assert.Nil(t, err)
		base.RunTestCase(base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodPut,
			Path:         "/apisix/admin/upstreams/1",
			Body:         string(_createUpstreamBody),
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		})
	})
	ginkgo.It("create route using the upstream just created", func() {
		base.RunTestCase(base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Method: http.MethodPut,
			Path:   "/apisix/admin/routes/1",
			Body: `{
				 "uri": "/server_port",
				 "upstream_id": "1"
			 }`,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			Sleep:        base.SleepTime,
		})
	})
	ginkgo.It("hit routes(upstream hash_on (X-Sessionid)", func() {
		t := ginkgo.GinkgoT()
		time.Sleep(time.Duration(500) * time.Millisecond)
		basepath := base.APISIXHost
		res := map[string]int{}
		for i := 0; i <= 15; i++ {
			url := basepath + "/server_port"
			req, err := http.NewRequest("GET", url, nil)
			req.Header.Add("X-Sessionid", `chash_val_`+strconv.Itoa(i))
			resp, err := http.DefaultClient.Do(req)
			assert.Nil(t, err)
			defer resp.Body.Close()
			respBody, err := ioutil.ReadAll(resp.Body)
			body := string(respBody)
			if _, ok := res[body]; !ok {
				res[body] = 1
			} else {
				res[body]++
			}
		}
		// the X-Sessionid of each request is different, the weight of upstreams are the same, so these requests will be sent to each upstream equally
		assert.Equal(t, true, res["1980"] == 8 && res["1981"] == 8)

	})
	ginkgo.It("delete route", func() {
		base.RunTestCase(base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/1",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		})
	})
	ginkgo.It("delete upstream", func() {
		base.RunTestCase(base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/upstreams/1",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		})
	})
	ginkgo.It("hit the route just deleted", func() {
		base.RunTestCase(base.HttpTestCase{
			Object:       base.APISIXExpect(),
			Method:       http.MethodGet,
			Path:         "/server_port",
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   "{\"error_msg\":\"404 Route Not Found\"}\n",
			Sleep:        base.SleepTime,
		})
	})
})

var _ = ginkgo.Describe("Upstream chash hash on consumer", func() {
	ginkgo.It("create consumer with key-auth", func() {
		base.RunTestCase(base.HttpTestCase{
			Object: base.ManagerApiExpect(),
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
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		})
	})
	ginkgo.It("create chash upstream with hash_on (consumer)", func() {
		t := ginkgo.GinkgoT()
		createUpstreamBody := make(map[string]interface{})
		createUpstreamBody["nodes"] = nodes
		createUpstreamBody["type"] = "chash"
		createUpstreamBody["hash_on"] = "consumer"
		_createUpstreamBody, err := json.Marshal(createUpstreamBody)
		assert.Nil(t, err)
		base.RunTestCase(base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodPut,
			Path:         "/apisix/admin/upstreams/1",
			Body:         string(_createUpstreamBody),
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		})
	})
	ginkgo.It("create route using the upstream just created", func() {
		base.RunTestCase(base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Method: http.MethodPut,
			Path:   "/apisix/admin/routes/1",
			Body: `{
				 "uri": "/server_port",
				 "plugins": {
					"key-auth": {}
				},
				 "upstream_id": "1"
			 }`,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			Sleep:        base.SleepTime,
		})
	})
	ginkgo.It("hit routes(upstream hash_on (consumer))", func() {
		t := ginkgo.GinkgoT()
		time.Sleep(time.Duration(500) * time.Millisecond)
		basepath := base.APISIXHost
		res := map[string]int{}
		for i := 0; i <= 3; i++ {
			url := basepath + "/server_port"
			req, err := http.NewRequest("GET", url, nil)
			assert.Nil(t, err)
			req.Header.Add("apikey", `auth-jack`)
			resp, err := http.DefaultClient.Do(req)
			assert.Nil(t, err)
			defer resp.Body.Close()
			respBody, err := ioutil.ReadAll(resp.Body)
			assert.Nil(t, err)
			body := string(respBody)
			if _, ok := res[body]; !ok {
				res[body] = 1
			} else {
				res[body]++
			}
		}
		// it is possible to hit any one of upstreams, and only one will be hit
		assert.Equal(t, true, res["1980"] == 4 || res["1981"] == 4)
	})
	ginkgo.It("delete consumer", func() {
		base.RunTestCase(base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/consumers/jack",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		})
	})
	ginkgo.It("delete route", func() {
		base.RunTestCase(base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/1",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		})
	})
	ginkgo.It("delete upstream", func() {
		base.RunTestCase(base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/upstreams/1",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		})
	})
	ginkgo.It("hit the route just deleted", func() {
		base.RunTestCase(base.HttpTestCase{
			Object:       base.APISIXExpect(),
			Method:       http.MethodGet,
			Path:         "/server_port",
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   "{\"error_msg\":\"404 Route Not Found\"}\n",
			Sleep:        base.SleepTime,
		})
	})
})

var _ = ginkgo.Describe("Upstream chash hash on wrong key", func() {
	ginkgo.It("verify upstream with wrong key", func() {
		t := ginkgo.GinkgoT()
		createUpstreamBody := make(map[string]interface{})
		createUpstreamBody["nodes"] = nodes
		createUpstreamBody["type"] = "chash"
		createUpstreamBody["key"] = "not_support"
		_createUpstreamBody, err := json.Marshal(createUpstreamBody)
		assert.Nil(t, err)
		base.RunTestCase(base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodPut,
			Path:         "/apisix/admin/upstreams/2",
			Body:         string(_createUpstreamBody),
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusBadRequest,
			ExpectBody:   "schema validate failed: (root): Does not match pattern '^((uri|server_name|server_addr|request_uri|remote_port|remote_addr|query_string|host|hostname)|arg_[0-9a-zA-z_-]+)",
		})
	})
	ginkgo.It("verify upstream with wrong key", func() {
		base.RunTestCase(base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/upstreams/2",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusNotFound,
			Sleep:        base.SleepTime,
		})
	})
})

var _ = ginkgo.Describe("Upstream chash hash on vars", func() {
	ginkgo.It("create chash upstream hash_on (vars)", func() {
		t := ginkgo.GinkgoT()
		createUpstreamBody := make(map[string]interface{})
		createUpstreamBody["nodes"] = nodes
		createUpstreamBody["type"] = "chash"
		createUpstreamBody["hash_on"] = "vars"
		createUpstreamBody["key"] = "arg_device_id"
		_createUpstreamBody, err := json.Marshal(createUpstreamBody)
		assert.Nil(t, err)
		base.RunTestCase(base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodPut,
			Path:         "/apisix/admin/upstreams/1",
			Body:         string(_createUpstreamBody),
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		})
	})

	ginkgo.It("verify upstream", func() {
		base.RunTestCase(base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/upstreams/1",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "\"nodes\":[{\"host\":\"" + base.UpstreamIp + "\",\"port\":1980,\"weight\":1},{\"host\":\"" + base.UpstreamIp + "\",\"port\":1981,\"weight\":1}],\"type\":\"chash\",\"hash_on\":\"vars\",\"key\":\"arg_device_id\"",
			Sleep:        base.SleepTime,
		})
	})
	ginkgo.It("create route using the upstream just created", func() {
		base.RunTestCase(base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Method: http.MethodPut,
			Path:   "/apisix/admin/routes/1",
			Body: `{
				 "uri": "/server_port",
				 "upstream_id": "1"
			 }`,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			Sleep:        base.SleepTime,
		})
	})
	ginkgo.It("verify route", func() {
		base.RunTestCase(base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/routes/1",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "\"uri\":\"/server_port\",\"upstream_id\":\"1\"",
			Sleep:        base.SleepTime,
		})
	})
	ginkgo.It("hit routes(upstream hash_on (var))", func() {
		t := ginkgo.GinkgoT()
		time.Sleep(time.Duration(500) * time.Millisecond)
		basepath := base.APISIXHost
		res := map[string]int{}
		for i := 0; i <= 17; i++ {
			url := basepath + "/server_port?device_id=" + strconv.Itoa(i)
			req, err := http.NewRequest("GET", url, nil)
			resp, err := http.DefaultClient.Do(req)
			assert.Nil(t, err)
			defer resp.Body.Close()
			respBody, err := ioutil.ReadAll(resp.Body)
			body := string(respBody)
			if _, ok := res[body]; !ok {
				res[body] = 1
			} else {
				res[body]++
			}
		}
		assert.True(t, res["1980"] == 9 && res["1981"] == 9)
	})
	ginkgo.It("delete route", func() {
		base.RunTestCase(base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/1",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		})
	})
	ginkgo.It("delete upstream", func() {
		base.RunTestCase(base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/upstreams/1",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		})
	})
	ginkgo.It("hit the route just deleted", func() {
		base.RunTestCase(base.HttpTestCase{
			Object:       base.APISIXExpect(),
			Method:       http.MethodGet,
			Path:         "/server_port",
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   "{\"error_msg\":\"404 Route Not Found\"}\n",
			Sleep:        base.SleepTime,
		})
	})
})
