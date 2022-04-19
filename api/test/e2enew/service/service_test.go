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
	"github.com/onsi/gomega"

	"github.com/onsi/ginkgo/extensions/table"

	"github.com/apisix/manager-api/test/e2enew/base"
)

var _ = ginkgo.Describe("create service without plugin", func() {
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
	ginkgo.It("create service without plugin", func() {
		_createServiceBody, err := json.Marshal(createServiceBody)
		gomega.Expect(err).To(gomega.BeNil())
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
	ginkgo.It("create service2 success", func() {
		createServiceBody["name"] = "testservice2"
		_createServiceBody, err := json.Marshal(createServiceBody)
		gomega.Expect(err).To(gomega.BeNil())
		base.RunTestCase(base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodPut,
			Path:         "/apisix/admin/services/s2",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			Body:         string(_createServiceBody),
			ExpectStatus: http.StatusOK,
			ExpectBody:   []string{"\"id\":\"s2\"", "\"name\":\"testservice2\""},
		})
	})
	ginkgo.It("create service failed, name existed", func() {
		createServiceBody["name"] = "testservice2"
		_createServiceBody, err := json.Marshal(createServiceBody)
		gomega.Expect(err).To(gomega.BeNil())
		base.RunTestCase(base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodPost,
			Path:         "/apisix/admin/services",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			Body:         string(_createServiceBody),
			ExpectStatus: http.StatusBadRequest,
			ExpectBody:   `service name exists`,
			Sleep:        base.SleepTime,
		})
	})
	ginkgo.It("update service failed, name existed", func() {
		createServiceBody["name"] = "testservice2"
		_createServiceBody, err := json.Marshal(createServiceBody)
		gomega.Expect(err).To(gomega.BeNil())
		base.RunTestCase(base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodPut,
			Path:         "/apisix/admin/services/s1",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			Body:         string(_createServiceBody),
			ExpectStatus: http.StatusBadRequest,
			ExpectBody:   `service name exists`,
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
				"name": "route1",
				"uri": "/server_port",
				"service_id": "s1"
			}`,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			Sleep:        base.SleepTime,
		})
	})
	ginkgo.It("batch test /server_port api", func() {
		time.Sleep(time.Duration(500) * time.Millisecond)
		res := base.BatchTestServerPort(18, nil, "")
		gomega.Expect(res["1980"]).Should(gomega.Equal(3))
		gomega.Expect(res["1981"]).Should(gomega.Equal(6))
		gomega.Expect(res["1982"]).Should(gomega.Equal(9))
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
	ginkgo.It("delete service2", func() {
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
			Path:         "/server_port",
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   "{\"error_msg\":\"404 Route Not Found\"}\n",
			Sleep:        base.SleepTime,
		})
	})
})

var _ = ginkgo.Describe("create service with plugin", func() {
	ginkgo.It("create service without plugin", func() {
		var createServiceBody map[string]interface{} = map[string]interface{}{
			"name": "testservice",
			"plugins": map[string]interface{}{
				"limit-count": map[string]interface{}{
					"count":         100,
					"time_window":   60,
					"rejected_code": 503,
					"key":           "remote_addr",
					"policy":        "local",
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
		gomega.Expect(err).To(gomega.BeNil())
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
			ExpectBody: "\"upstream\":{\"nodes\":[{\"host\":\"" + base.UpstreamIp + "\",\"port\":1980,\"weight\":1}],\"type\":\"roundrobin\"},\"plugins\":{\"limit-count\":{\"count\":100,\"key\":\"remote_addr\",\"policy\":\"local\",\"rejected_code\":503,\"time_window\":60}}",
			Sleep:      base.SleepTime,
		})
	})
	ginkgo.It("create route using the service just created", func() {
		base.RunTestCase(base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Method: http.MethodPut,
			Path:   "/apisix/admin/routes/r1",
			Body: `{
				"name": "route1",
				"uri": "/server_port",
				"service_id": "s1"
			}`,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			Sleep:        base.SleepTime,
		})
	})
	ginkgo.It(" hit routes and check the response header", func() {
		time.Sleep(time.Duration(500) * time.Millisecond)
		basepath := base.APISIXHost
		request, err := http.NewRequest("GET", basepath+"/server_port", nil)
		gomega.Expect(err).To(gomega.BeNil())
		request.Header.Add("Authorization", base.GetToken())
		resp, err := http.DefaultClient.Do(request)
		gomega.Expect(err).To(gomega.BeNil())
		defer resp.Body.Close()
		gomega.Expect(resp.StatusCode).Should(gomega.Equal(200))
		gomega.Expect(resp.Header["X-Ratelimit-Limit"][0]).Should(gomega.Equal("100"))
		gomega.Expect(resp.Header["X-Ratelimit-Remaining"][0]).Should(gomega.Equal("99"))
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
		var createServiceBody map[string]interface{} = map[string]interface{}{
			"id":   "s2",
			"name": "testservice22",
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
					"policy":        "local",
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
		gomega.Expect(err).To(gomega.BeNil())
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
			ExpectBody: "\"name\":\"testservice22\",\"desc\":\"testservice_desc\",\"upstream\":{\"nodes\":[{\"host\":\"" + base.UpstreamIp + "\",\"port\":1980,\"weight\":1}],\"type\":\"roundrobin\"},\"plugins\":{\"limit-count\":{\"count\":100,\"key\":\"remote_addr\",\"policy\":\"local\",\"rejected_code\":503,\"time_window\":60}},\"labels\":{\"build\":\"16\",\"env\":\"production\",\"version\":\"v2\"},\"enable_websocket\":true}",
			Sleep:      base.SleepTime,
		})
	})
	ginkgo.It("create route using the service just created", func() {
		base.RunTestCase(base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Method: http.MethodPut,
			Path:   "/apisix/admin/routes/r1",
			Body: `{
				"name": "route1",
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
		gomega.Expect(err).To(gomega.BeNil())
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
		gomega.Expect(err).To(gomega.BeNil())
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
		gomega.Expect(err).To(gomega.BeNil())
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

var _ = ginkgo.Describe("test service delete", func() {
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
	gomega.Expect(err).To(gomega.BeNil())

	table.DescribeTable("test service delete",
		func(tc base.HttpTestCase) {
			base.RunTestCase(tc)
		},
		table.Entry("create service without plugin", base.HttpTestCase{
			Desc:         "create service without plugin",
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodPut,
			Path:         "/apisix/admin/services/s1",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			Body:         string(_createServiceBody),
			ExpectStatus: http.StatusOK,
			ExpectBody:   "\"name\":\"testservice\",\"upstream\":{\"nodes\":[{\"host\":\"" + base.UpstreamIp + "\",\"port\":1980,\"weight\":1}],\"type\":\"roundrobin\"}}",
		}),
		table.Entry("create route use service s1", base.HttpTestCase{
			Desc:   "create route use service s1",
			Object: base.ManagerApiExpect(),
			Method: http.MethodPut,
			Path:   "/apisix/admin/routes/r1",
			Body: `{
				"id": "r1",
				"name": "route1",
				"uri": "/hello",
				"upstream": {
						"type": "roundrobin",
						"nodes": {
								"` + base.UpstreamIp + `:1980": 1
						}
				},
				"service_id": "s1"
			}`,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "\"service_id\":\"s1\"",
		}),
		table.Entry("hit route on apisix", base.HttpTestCase{
			Object:       base.APISIXExpect(),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusOK,
			ExpectBody:   "hello world",
			Sleep:        base.SleepTime,
		}),
		table.Entry("delete service failed", base.HttpTestCase{
			Desc:         "delete service failed",
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/services/s1",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusBadRequest,
			ExpectBody:   "route: route1 is using this service",
		}),
		table.Entry("delete route first", base.HttpTestCase{
			Desc:         "delete route first",
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/r1",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		}),
		table.Entry("check route exist", base.HttpTestCase{
			Desc:         "check route exist",
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/r1",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusNotFound,
		}),
		table.Entry("delete service success", base.HttpTestCase{
			Desc:         "delete service success",
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/services/s1",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		}),
		table.Entry("check the service exist", base.HttpTestCase{
			Desc:         "check the exist",
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/services/s1",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusNotFound,
		}))
})

var _ = ginkgo.Describe("test service with hosts", func() {
	var createServiceBody = map[string]interface{}{
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
		"hosts": []string{
			"test.com",
			"test1.com",
		},
	}
	_createServiceBody, err := json.Marshal(createServiceBody)
	gomega.Expect(err).To(gomega.BeNil())

	var createRouteBody = map[string]interface{}{
		"id":   "r1",
		"name": "route1",
		"uri":  "/hello",
		"upstream": map[string]interface{}{
			"type": "roundrobin",
			"nodes": map[string]interface{}{
				base.UpstreamIp + ":1980": 1,
			},
		},
		"service_id": "s1",
	}
	_createRouteBody, err := json.Marshal(createRouteBody)
	gomega.Expect(err).To(gomega.BeNil())

	table.DescribeTable("test service with hosts",
		func(tc func() base.HttpTestCase) {
			base.RunTestCase(tc())
		},
		table.Entry("create service with hosts params", func() base.HttpTestCase {
			return base.HttpTestCase{
				Desc:         "create service with hosts params",
				Object:       base.ManagerApiExpect(),
				Method:       http.MethodPut,
				Path:         "/apisix/admin/services/s1",
				Headers:      map[string]string{"Authorization": base.GetToken()},
				Body:         string(_createServiceBody),
				ExpectStatus: http.StatusOK,
			}
		}),
		table.Entry("create route use service s1", func() base.HttpTestCase {
			return base.HttpTestCase{
				Desc:         "create route use service s1",
				Object:       base.ManagerApiExpect(),
				Method:       http.MethodPut,
				Path:         "/apisix/admin/routes/r1",
				Body:         string(_createRouteBody),
				Headers:      map[string]string{"Authorization": base.GetToken()},
				ExpectStatus: http.StatusOK,
			}
		}),
		table.Entry("hit route by test.com", func() base.HttpTestCase {
			return base.HttpTestCase{
				Object: base.APISIXExpect(),
				Method: http.MethodGet,
				Path:   "/hello",
				Headers: map[string]string{
					"Host": "test.com",
				},
				ExpectStatus: http.StatusOK,
				ExpectBody:   "hello world",
				Sleep:        base.SleepTime,
			}
		}),
		table.Entry("hit route by test1.com", func() base.HttpTestCase {
			return base.HttpTestCase{
				Object: base.APISIXExpect(),
				Method: http.MethodGet,
				Path:   "/hello",
				Headers: map[string]string{
					"Host": "test1.com",
				},
				ExpectStatus: http.StatusOK,
				ExpectBody:   "hello world",
				Sleep:        base.SleepTime,
			}
		}),
		table.Entry("hit route by test2.com", func() base.HttpTestCase {
			return base.HttpTestCase{
				Object: base.APISIXExpect(),
				Method: http.MethodGet,
				Path:   "/hello",
				Headers: map[string]string{
					"Host": "test2.com",
				},
				ExpectStatus: http.StatusNotFound,
				Sleep:        base.SleepTime,
			}
		}),
		table.Entry("delete route", func() base.HttpTestCase {
			return base.HttpTestCase{
				Desc:         "delete route first",
				Object:       base.ManagerApiExpect(),
				Method:       http.MethodDelete,
				Path:         "/apisix/admin/routes/r1",
				Headers:      map[string]string{"Authorization": base.GetToken()},
				ExpectStatus: http.StatusOK,
			}
		}),
		table.Entry("delete service", func() base.HttpTestCase {
			return base.HttpTestCase{
				Desc:         "delete service success",
				Object:       base.ManagerApiExpect(),
				Method:       http.MethodDelete,
				Path:         "/apisix/admin/services/s1",
				Headers:      map[string]string{"Authorization": base.GetToken()},
				ExpectStatus: http.StatusOK,
			}
		}),
	)
})
