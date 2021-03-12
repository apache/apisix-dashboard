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
package service

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/onsi/ginkgo"
	"github.com/stretchr/testify/assert"

	"github.com/apisix/manager-api/test/e2enew/base"
)

var _ = ginkgo.Describe("create service without plugin", func() {
	ginkgo.It("create service without plugin", func() {
		t := ginkgo.GinkgoT()
		var createServiceBody map[string]interface{} = map[string]interface{}{
			"name": "testservice",
			"upstream": map[string]interface{}{
				"type": "roundrobin",
				"nodes": []map[string]interface{}{
					{
						"host":   base.UpstreamIp,
						"port":   1980,
						"weight": 1,
					},
					{
						"host":   base.UpstreamIp,
						"port":   1981,
						"weight": 2,
					},
					{
						"host":   base.UpstreamIp,
						"port":   1982,
						"weight": 3,
					},
				},
			},
		}
		_createServiceBody, err := json.Marshal(createServiceBody)
		assert.Nil(t, err)
		base.RunTestCase(base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodPut,
			Path:         "/apisix/admin/services/s1",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			Body:         string(_createServiceBody),
			ExpectStatus: http.StatusOK,
			ExpectBody:   []string{"\"id\":\"s1\"", "\"name\":\"testservice\""},
		})
	})
	ginkgo.It("get the service s1", func() {
		base.RunTestCase(base.HttpTestCase{
			Object:     base.ManagerApiExpect(),
			Method:     http.MethodGet,
			Path:       "/apisix/admin/services/s1",
			Headers:    map[string]string{"Authorization": base.GetToken()},
			ExpectCode: http.StatusOK,
			ExpectBody: "\"name\":\"testservice\",\"upstream\":{\"nodes\":[{\"host\":\"" + base.UpstreamIp + "\",\"port\":1980,\"weight\":1},{\"host\":\"" + base.UpstreamIp + "\",\"port\":1981,\"weight\":2},{\"host\":\"" + base.UpstreamIp + "\",\"port\":1982,\"weight\":3}],\"type\":\"roundrobin\"}",
			Sleep:      base.SleepTime,
		})
	})
	ginkgo.It("create route using the service just created", func() {
		base.RunTestCase(base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Method: http.MethodPut,
			Path:   "/apisix/admin/routes/r1",
			Body: `{
				"uri": "/server_port",
				"service_id": "s1"
			}`,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			Sleep:        base.SleepTime,
		})
	})
	ginkgo.It("batch test /server_port api", func() {
		t := ginkgo.GinkgoT()
		time.Sleep(time.Duration(500) * time.Millisecond)
		res := base.BatchTestServerPort(18)
		assert.True(t, res["1980"] == 3)
		assert.True(t, res["1981"] == 6)
		assert.True(t, res["1982"] == 9)
	})
	ginkgo.It("delete route", func() {
		base.RunTestCase(base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/r1",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		})
	})
	ginkgo.It("delete service", func() {
		base.RunTestCase(base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/services/s1",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			Sleep:        base.SleepTime,
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

var _ = ginkgo.Describe("create service with plugin", func() {
	ginkgo.It("create service without plugin", func() {
		t := ginkgo.GinkgoT()
		var createServiceBody map[string]interface{} = map[string]interface{}{
			"name": "testservice",
			"plugins": map[string]interface{}{
				"limit-count": map[string]interface{}{
					"count":         100,
					"time_window":   60,
					"rejected_code": 503,
					"key":           "remote_addr",
				},
			},
			"upstream": map[string]interface{}{
				"type": "roundrobin",
				"nodes": []map[string]interface{}{
					{
						"host":   base.UpstreamIp,
						"port":   1980,
						"weight": 1,
					},
				},
			},
		}
		_createServiceBody, err := json.Marshal(createServiceBody)
		assert.Nil(t, err)
		base.RunTestCase(base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodPut,
			Path:         "/apisix/admin/services/s1",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			Body:         string(_createServiceBody),
			ExpectStatus: http.StatusOK,
			ExpectBody:   []string{"\"id\":\"s1\"", "\"name\":\"testservice\""},
		})
	})
	ginkgo.It("get the service s1", func() {
		base.RunTestCase(base.HttpTestCase{
			Object:     base.ManagerApiExpect(),
			Method:     http.MethodGet,
			Path:       "/apisix/admin/services/s1",
			Headers:    map[string]string{"Authorization": base.GetToken()},
			ExpectCode: http.StatusOK,
			ExpectBody: "\"upstream\":{\"nodes\":[{\"host\":\"" + base.UpstreamIp + "\",\"port\":1980,\"weight\":1}],\"type\":\"roundrobin\"},\"plugins\":{\"limit-count\":{\"count\":100,\"key\":\"remote_addr\",\"rejected_code\":503,\"time_window\":60}}",
			Sleep:      base.SleepTime,
		})
	})
	ginkgo.It("create route using the service just created", func() {
		base.RunTestCase(base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Method: http.MethodPut,
			Path:   "/apisix/admin/routes/r1",
			Body: `{
				"uri": "/server_port",
				"service_id": "s1"
			}`,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			Sleep:        base.SleepTime,
		})
	})
	ginkgo.It(" hit routes and check the response header", func() {
		t := ginkgo.GinkgoT()
		time.Sleep(time.Duration(500) * time.Millisecond)
		basepath := base.APISIXHost
		request, err := http.NewRequest("GET", basepath+"/server_port", nil)
		assert.Nil(t, err)
		request.Header.Add("Authorization", base.GetToken())
		resp, err := http.DefaultClient.Do(request)
		assert.Nil(t, err)
		defer resp.Body.Close()
		assert.Equal(t, 200, resp.StatusCode)
		assert.Equal(t, "100", resp.Header["X-Ratelimit-Limit"][0])
		assert.Equal(t, "99", resp.Header["X-Ratelimit-Remaining"][0])
	})
	ginkgo.It("delete route", func() {
		base.RunTestCase(base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/r1",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		})
	})
	ginkgo.It("delete service", func() {
		base.RunTestCase(base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/services/s1",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			Sleep:        base.SleepTime,
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

var _ = ginkgo.Describe("create service with all options via POST method", func() {
	ginkgo.It("create service with all options via POST method", func() {
		t := ginkgo.GinkgoT()
		var createServiceBody map[string]interface{} = map[string]interface{}{
			"id":   "s2",
			"name": "testservice",
			"desc": "testservice_desc",
			"labels": map[string]interface{}{
				"build":   "16",
				"env":     "production",
				"version": "v2",
			},
			"enable_websocket": true,
			"plugins": map[string]interface{}{
				"limit-count": map[string]interface{}{
					"count":         100,
					"time_window":   60,
					"rejected_code": 503,
					"key":           "remote_addr",
				},
			},
			"upstream": map[string]interface{}{
				"type":        "roundrobin",
				"create_time": 1602883670,
				"update_time": 1602893670,
				"nodes": []map[string]interface{}{
					{
						"host":   base.UpstreamIp,
						"port":   1980,
						"weight": 1,
					},
				},
			},
		}
		_createServiceBody, err := json.Marshal(createServiceBody)
		assert.Nil(t, err)
		base.RunTestCase(base.HttpTestCase{
			Desc:         "create service with all options via POST method",
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodPost,
			Path:         "/apisix/admin/services",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			Body:         string(_createServiceBody),
			ExpectStatus: http.StatusOK,
			ExpectBody:   "\"id\":\"s2\"",
		})
	})
	ginkgo.It("get the service s2", func() {
		base.RunTestCase(base.HttpTestCase{
			Object:     base.ManagerApiExpect(),
			Method:     http.MethodGet,
			Path:       "/apisix/admin/services/s2",
			Headers:    map[string]string{"Authorization": base.GetToken()},
			ExpectCode: http.StatusOK,
			ExpectBody: "\"name\":\"testservice\",\"desc\":\"testservice_desc\",\"upstream\":{\"nodes\":[{\"host\":\"" + base.UpstreamIp + "\",\"port\":1980,\"weight\":1}],\"type\":\"roundrobin\"},\"plugins\":{\"limit-count\":{\"count\":100,\"key\":\"remote_addr\",\"rejected_code\":503,\"time_window\":60}},\"labels\":{\"build\":\"16\",\"env\":\"production\",\"version\":\"v2\"},\"enable_websocket\":true}",
			Sleep:      base.SleepTime,
		})
	})
	ginkgo.It("create route using the service just created", func() {
		base.RunTestCase(base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Method: http.MethodPut,
			Path:   "/apisix/admin/routes/r1",
			Body: `{
				"uri": "/hello",
				"service_id": "s2"
			}`,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			Sleep:        base.SleepTime,
		})
	})
	ginkgo.It("verify route", func() {
		base.RunTestCase(base.HttpTestCase{
			Object:       base.APISIXExpect(),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusOK,
			ExpectBody:   "hello world",
			Sleep:        base.SleepTime,
		})
	})
	ginkgo.It("delete route", func() {
		base.RunTestCase(base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/r1",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		})
	})
	ginkgo.It("delete service", func() {
		base.RunTestCase(base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/services/s2",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			Sleep:        base.SleepTime,
		})
	})
	ginkgo.It("hit the route just deleted", func() {
		base.RunTestCase(base.HttpTestCase{
			Object:       base.APISIXExpect(),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   "{\"error_msg\":\"404 Route Not Found\"}\n",
			Sleep:        base.SleepTime,
		})
	})
})

var _ = ginkgo.Describe("service update use patch method", func() {
	ginkgo.It("create service without plugin", func() {
		t := ginkgo.GinkgoT()
		var createServiceBody map[string]interface{} = map[string]interface{}{
			"name": "testservice",
			"upstream": map[string]interface{}{
				"type": "roundrobin",
				"nodes": []map[string]interface{}{
					{
						"host":   base.UpstreamIp,
						"port":   1980,
						"weight": 1,
					},
				},
			},
		}
		_createServiceBody, err := json.Marshal(createServiceBody)
		assert.Nil(t, err)
		base.RunTestCase(base.HttpTestCase{
			Desc:         "create service without plugin",
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodPut,
			Path:         "/apisix/admin/services/s5",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			Body:         string(_createServiceBody),
			ExpectStatus: http.StatusOK,
			ExpectBody:   "\"name\":\"testservice\",\"upstream\":{\"nodes\":[{\"host\":\"" + base.UpstreamIp + "\",\"port\":1980,\"weight\":1}],\"type\":\"roundrobin\"}}",
		})
	})
	ginkgo.It("update service use patch method", func() {
		t := ginkgo.GinkgoT()
		var createServiceBody map[string]interface{} = map[string]interface{}{
			"name": "testpatch",
			"upstream": map[string]interface{}{
				"type": "roundrobin",
				"nodes": []map[string]interface{}{
					{
						"host":   base.UpstreamIp,
						"port":   1981,
						"weight": 1,
					},
				},
			},
		}
		_createServiceBody, err := json.Marshal(createServiceBody)
		assert.Nil(t, err)
		base.RunTestCase(base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodPatch,
			Path:         "/apisix/admin/services/s5",
			Body:         string(_createServiceBody),
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			Sleep:        base.SleepTime,
		})
	})
	ginkgo.It("get the service s5", func() {
		base.RunTestCase(base.HttpTestCase{
			Object:     base.ManagerApiExpect(),
			Method:     http.MethodGet,
			Path:       "/apisix/admin/services/s5",
			Headers:    map[string]string{"Authorization": base.GetToken()},
			ExpectCode: http.StatusOK,
			ExpectBody: "\"name\":\"testpatch\",\"upstream\":{\"nodes\":[{\"host\":\"" + base.UpstreamIp + "\",\"port\":1981,\"weight\":1}],\"type\":\"roundrobin\"}}",
			Sleep:      base.SleepTime,
		})
	})
	ginkgo.It("Update service using path parameter patch method", func() {
		t := ginkgo.GinkgoT()
		var createUpstreamBody map[string]interface{} = map[string]interface{}{
			"type": "roundrobin",
			"nodes": []map[string]interface{}{
				{
					"host":   base.UpstreamIp,
					"port":   1980,
					"weight": 1,
				},
			},
		}
		_createUpstreamBody, err := json.Marshal(createUpstreamBody)
		assert.Nil(t, err)
		base.RunTestCase(base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Method: http.MethodPatch,
			Path:   "/apisix/admin/services/s5/upstream",
			Body:   string(_createUpstreamBody),
			Headers: map[string]string{
				"Authorization": base.GetToken(),
				"Content-Type":  "text/plain",
			},
			ExpectStatus: http.StatusOK,
		})
	})
	ginkgo.It("get service data", func() {
		base.RunTestCase(base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/services/s5",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "\"name\":\"testpatch\",\"upstream\":{\"nodes\":[{\"host\":\"" + base.UpstreamIp + "\",\"port\":1980,\"weight\":1}],\"type\":\"roundrobin\"}}",
			Sleep:        base.SleepTime,
		})
	})
	ginkgo.It("delete service", func() {
		base.RunTestCase(base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/services/s5",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		})
	})
})
