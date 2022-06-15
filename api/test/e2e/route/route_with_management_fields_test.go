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
package route

import (
	"io/ioutil"
	"net/http"
	"time"

	"github.com/onsi/ginkgo"
	"github.com/onsi/ginkgo/extensions/table"
	"github.com/onsi/gomega"
	"github.com/tidwall/gjson"

	"github.com/apisix/manager-api/test/e2e/base"
)

var _ = ginkgo.Describe("route with management fields", func() {
	var (
		createtime, updatetime gjson.Result
	)

	table.DescribeTable("test for route with name description",
		func(tc base.HttpTestCase) {
			base.RunTestCase(tc)
		},
		table.Entry("config route with name and desc (r1)", base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Path:   "/apisix/admin/routes/r1",
			Method: http.MethodPut,
			Body: `{
					"name": "route1",
					"uri": "/hello",
					"name": "jack",
					"desc": "config route with name and desc",
					"upstream": {
						"type": "roundrobin",
						"nodes": {
							"` + base.UpstreamIp + `:1980": 1
						}
					}
				}`,
			Headers: map[string]string{"Authorization": base.GetToken()},
			ExpectBody: []string{`"code":0`, `"id":"r1"`, `"uri":"/hello"`, `"name":"jack"`,
				`"upstream":{"nodes":{"` + base.UpstreamIp + `:1980":1},"type":"roundrobin"}`},
			ExpectStatus: http.StatusOK,
		}),
		table.Entry("check route exists by name", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/notexist/routes",
			Query:        "name=jack",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusBadRequest,
			ExpectBody:   "Route name is reduplicate",
			Sleep:        base.SleepTime,
		}),
		table.Entry("check route exists by name (exclude it self)", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/notexist/routes",
			Query:        "name=jack&exclude=r1",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		}),
		table.Entry("access the route's uri (r1)", base.HttpTestCase{
			Object:       base.APISIXExpect(),
			Method:       http.MethodGet,
			Path:         "/hello",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "hello world",
		}),
		table.Entry("verify the route's content (r1)", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Path:         "/apisix/admin/routes/r1",
			Method:       http.MethodGet,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "\"name\":\"jack\",\"desc\":\"config route with name and desc\"",
		}),
	)

	ginkgo.It("get the route information", func() {
		time.Sleep(time.Duration(100) * time.Millisecond)
		basepath := base.ManagerAPIHost + "/apisix/admin/routes"
		request, _ := http.NewRequest("GET", basepath+"/r1", nil)
		request.Header.Add("Authorization", base.GetToken())
		resp, err := http.DefaultClient.Do(request)
		gomega.Expect(err).Should(gomega.BeNil())
		defer resp.Body.Close()
		respBody, _ := ioutil.ReadAll(resp.Body)
		createtime = gjson.Get(string(respBody), "data.create_time")
		updatetime = gjson.Get(string(respBody), "data.update_time")
		gomega.Expect(createtime.Int()).To(gomega.SatisfyAll(
			gomega.BeNumerically(">=", time.Now().Unix()-1),
			gomega.BeNumerically("<=", time.Now().Unix()+1),
		))

		gomega.Expect(updatetime.Int()).To(gomega.SatisfyAll(
			gomega.BeNumerically(">=", time.Now().Unix()-1),
			gomega.BeNumerically("<=", time.Now().Unix()+1),
		))
	})

	table.DescribeTable("test for route with name description",
		func(tc base.HttpTestCase) {
			base.RunTestCase(tc)
		},
		table.Entry("update the route (r1)", base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Path:   "/apisix/admin/routes/r1",
			Method: http.MethodPut,
			Body: `{
					"name": "route1",
					"uri": "/hello",
					"name": "new jack",
					"desc": "new desc",
					"upstream": {
						"type": "roundrobin",
						"nodes": {
							"` + base.UpstreamIp + `:1980": 1
						}
					}
				}`,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			ExpectBody: []string{`"code":0`, `"id":"r1"`, `"uri":"/hello"`, `"name":"new jack"`,
				`"upstream":{"nodes":{"` + base.UpstreamIp + `:1980":1},"type":"roundrobin"}`},
			Sleep: time.Duration(2) * time.Second,
		}),
		table.Entry("access the route's uri (r1)", base.HttpTestCase{
			Object:       base.APISIXExpect(),
			Method:       http.MethodGet,
			Path:         "/hello",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "hello world",
			Sleep:        base.SleepTime,
		}),
	)

	ginkgo.It("get the updated route information", func() {
		time.Sleep(time.Duration(100) * time.Millisecond)
		basepath := base.ManagerAPIHost + "/apisix/admin/routes"

		request, _ := http.NewRequest("GET", basepath+"/r1", nil)
		request.Header.Add("Authorization", base.GetToken())
		resp, _ := http.DefaultClient.Do(request)
		respBody, _ := ioutil.ReadAll(resp.Body)
		createtime2 := gjson.Get(string(respBody), "data.create_time")
		updatetime2 := gjson.Get(string(respBody), "data.update_time")
		//verify the route and compare result
		gomega.Expect(gjson.Get(string(respBody), "data.name").String()).To(gomega.Equal("new jack"))
		gomega.Expect(gjson.Get(string(respBody), "data.desc").String()).To(gomega.Equal("new desc"))
		gomega.Expect(createtime2.String()).To(gomega.Equal(createtime.String()))
		gomega.Expect(updatetime2.String()).NotTo(gomega.Equal(updatetime.String()))
	})

	ginkgo.It("delete the route (r1)", func() {
		base.RunTestCase(base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/r1",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		})
	})

	ginkgo.It("verify delete route (r1) success", func() {
		base.RunTestCase(base.HttpTestCase{
			Object:       base.APISIXExpect(),
			Method:       http.MethodGet,
			Path:         "/hello",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   `{"error_msg":"404 Route Not Found"}`,
			Sleep:        base.SleepTime,
		})
	})
})

var _ = ginkgo.Describe("route with management fields", func() {
	table.DescribeTable("test route with label",
		func(tc base.HttpTestCase) {
			base.RunTestCase(tc)
		},
		table.Entry("config route with labels (r1)", base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Path:   "/apisix/admin/routes/r1",
			Method: http.MethodPut,
			Body: `{
					"name": "route1",
					"uri": "/hello",
					"labels": {
						"build":"16",
						"env":"production",
						"version":"v2"
					},
					"upstream": {
						"type": "roundrobin",
						"nodes": {
							"` + base.UpstreamIp + `:1980": 1
						}
					}
				}`,
			Headers: map[string]string{"Authorization": base.GetToken()},
			ExpectBody: []string{`"code":0`, `"id":"r1"`, `"uri":"/hello"`, `"name":"route1"`,
				`"upstream":{"nodes":{"` + base.UpstreamIp + `:1980":1},"type":"roundrobin"}`,
				`"labels":{"build":"16","env":"production","version":"v2"}`},
			ExpectStatus: http.StatusOK,
		}),
		table.Entry("access the route's uri (r1)", base.HttpTestCase{
			Object:       base.APISIXExpect(),
			Method:       http.MethodGet,
			Path:         "/hello",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "hello world",
			Sleep:        base.SleepTime,
		}),
		table.Entry("verify the route's detail (r1)", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Path:         "/apisix/admin/routes/r1",
			Method:       http.MethodGet,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "\"labels\":{\"build\":\"16\",\"env\":\"production\",\"version\":\"v2\"",
			Sleep:        base.SleepTime,
		}),
		table.Entry("delete the route (r1)", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/r1",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		}),
		table.Entry("access the route after delete it", base.HttpTestCase{
			Object:       base.APISIXExpect(),
			Method:       http.MethodGet,
			Path:         "/hello",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   `{"error_msg":"404 Route Not Found"}`,
			Sleep:        base.SleepTime,
		}),
	)
})

var _ = ginkgo.Describe("route with management fields", func() {
	table.DescribeTable("test route search with label",
		func(tc base.HttpTestCase) {
			base.RunTestCase(tc)
		},
		table.Entry("config route with labels (r1)", base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Path:   "/apisix/admin/routes/r1",
			Method: http.MethodPut,
			Body: `{
					"name": "route1",
					"uri": "/hello",
					"labels": {
						"build":"16",
						"env":"production",
						"version":"v2"
					},
					"upstream": {
						"type": "roundrobin",
						"nodes": {
							"` + base.UpstreamIp + `:1980": 1
						}
					}
				}`,
			Headers: map[string]string{"Authorization": base.GetToken()},
			ExpectBody: []string{`"code":0`, `"id":"r1"`, `"uri":"/hello"`, `"name":"route1"`,
				`"upstream":{"nodes":{"` + base.UpstreamIp + `:1980":1},"type":"roundrobin"}`,
				`"labels":{"build":"16","env":"production","version":"v2"}`},
			ExpectStatus: http.StatusOK,
		}),
		table.Entry("config route with labels (r2)", base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Path:   "/apisix/admin/routes/r2",
			Method: http.MethodPut,
			Body: `{
					"name": "route2",
					"uri": "/hello2",
					"labels": {
						"build":"17",
						"env":"dev",
						"version":"v2",
						"extra": "test"
					},
					"upstream": {
						"type": "roundrobin",
						"nodes": {
							"` + base.UpstreamIp + `:1980": 1
						}
					}
				}`,
			Headers: map[string]string{"Authorization": base.GetToken()},
			ExpectBody: []string{`"code":0`, `"id":"r2"`, `"uri":"/hello2"`, `"name":"route2"`,
				`"upstream":{"nodes":{"` + base.UpstreamIp + `:1980":1},"type":"roundrobin"}`,
				`"labels":{"build":"17","env":"dev","extra":"test","version":"v2"}`,
			},
			ExpectStatus: http.StatusOK,
		}),
		table.Entry("access the route's uri (r1)", base.HttpTestCase{
			Object:       base.APISIXExpect(),
			Method:       http.MethodGet,
			Path:         "/hello",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "hello world",
			Sleep:        base.SleepTime,
		}),
		table.Entry("verify the route's detail (r1)", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Path:         "/apisix/admin/routes/r1",
			Method:       http.MethodGet,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "\"labels\":{\"build\":\"16\",\"env\":\"production\",\"version\":\"v2\"",
			Sleep:        base.SleepTime,
		}),
		table.Entry("search the route by label", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Path:         "/apisix/admin/routes",
			Query:        "label=build:16",
			Method:       http.MethodGet,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "\"labels\":{\"build\":\"16\",\"env\":\"production\",\"version\":\"v2\"",
			Sleep:        base.SleepTime,
		}),
		table.Entry("search the route by label (only key)", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Path:         "/apisix/admin/routes",
			Query:        "label=extra",
			Method:       http.MethodGet,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "\"labels\":{\"build\":\"17\",\"env\":\"dev\",\"extra\":\"test\",\"version\":\"v2\"",
			Sleep:        base.SleepTime,
		}),
		table.Entry("search the route by label (combination)", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Path:         "/apisix/admin/routes",
			Query:        "label=extra,build:16",
			Method:       http.MethodGet,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "\"total_size\":2",
			Sleep:        base.SleepTime,
		}),
		table.Entry("search the route by label (combination)", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Path:         "/apisix/admin/routes",
			Query:        "label=build:16,build:17",
			Method:       http.MethodGet,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "\"total_size\":2",
			Sleep:        base.SleepTime,
		}),
		table.Entry("delete the route (r1)", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/r1",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		}),
		table.Entry("delete the route (r2)", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/r2",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		}),
		table.Entry("access the route after delete it", base.HttpTestCase{
			Object:       base.APISIXExpect(),
			Method:       http.MethodGet,
			Path:         "/hello",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   `{"error_msg":"404 Route Not Found"}`,
			Sleep:        base.SleepTime,
		}),
	)
})

var _ = ginkgo.Describe("route with management fields", func() {
	table.DescribeTable("test route search with create time",
		func(tc base.HttpTestCase) {
			base.RunTestCase(tc)
		},
		table.Entry("create route with create_time", base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Path:   "/apisix/admin/routes/r1",
			Method: http.MethodPut,
			Body: `{
				"name": "route1",
				"uri": "/hello",
				"create_time": 1608792721,
				"upstream": {
					"type": "roundrobin",
					"nodes": {
						"` + base.UpstreamIp + `:1980": 1
					}
				}
			}`,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectBody:   `"message":"we don't accept create_time from client"`,
			ExpectStatus: http.StatusBadRequest,
		}),
		table.Entry("create route with update_time", base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Path:   "/apisix/admin/routes/r1",
			Method: http.MethodPut,
			Body: `{
				"name": "route1",
				"uri": "/hello",
				"update_time": 1608792721,
				"upstream": {
					"type": "roundrobin",
					"nodes": {
						"` + base.UpstreamIp + `:1980": 1
					}
				}
			}`,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectBody:   `"message":"we don't accept update_time from client"`,
			ExpectStatus: http.StatusBadRequest,
		}),
		table.Entry("create route with create_time and update_time", base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Path:   "/apisix/admin/routes/r1",
			Method: http.MethodPut,
			Body: `{
				"name": "route1",
				"uri": "/hello",
				"create_time": 1608792721,
				"update_time": 1608792721,
				"upstream": {
					"type": "roundrobin",
					"nodes": {
						"` + base.UpstreamIp + `:1980": 1
					}
				}
			}`,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectBody:   `"message":"we don't accept create_time from client"`,
			ExpectStatus: http.StatusBadRequest,
		}),
		table.Entry("make sure the route not created", base.HttpTestCase{
			Object:       base.APISIXExpect(),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   `{"error_msg":"404 Route Not Found"}`,
		}),
	)
})
