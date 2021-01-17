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
	"e2enew/base"
	"github.com/onsi/ginkgo"
	"github.com/onsi/ginkgo/extensions/table"
	"github.com/stretchr/testify/assert"
	"github.com/tidwall/gjson"
	"net/http"
	"time"
)

var _ = ginkgo.Describe("Route", func() {
	table.DescribeTable("test route with name and desc",
		func(tc base.HttpTestCase) {
			base.RunTestCase(tc)
		},
		table.Entry("create route with name and desc (r1)", base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Path:   "/apisix/admin/routes/r1",
			Method: http.MethodPut,
			Body: `{
					"uri": "/hello",
					"name": "jack",
					"desc": "config route with name and desc",
					"upstream": {
						"type": "roundrobin",
						"nodes": [{
							"host": "` + base.UpstreamIp + `",
							"port": 1980,
							"weight": 1
						}]
					}
				}`,
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
			Sleep:        base.SleepTime,
		}),
		table.Entry("verify the route's content (r1)", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Path:         "/apisix/admin/routes/r1",
			Method:       http.MethodGet,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "\"name\":\"jack\",\"desc\":\"config route with name and desc\"",
			Sleep:        base.SleepTime,
		}),
		table.Entry("update the route (r1)", base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Path:   "/apisix/admin/routes/r1",
			Method: http.MethodPut,
			Body: `{
					"uri": "/hello",
					"name": "new jack",
					"desc": "new desc",
					"upstream": {
						"type": "roundrobin",
						"nodes": [{
							"host": "` + base.UpstreamIp + `",
							"port": 1980,
							"weight": 1
						}]
					}
				}`,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			Sleep:        time.Duration(2) * time.Second,
		}),
		table.Entry("verify the update", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Path:         "/apisix/admin/routes/r1",
			Method:       http.MethodGet,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "\"name\":\"new jack\",\"desc\":\"new desc\"",
			Sleep:        base.SleepTime,
		}),

		table.Entry("", base.HttpTestCase{
			Desc:         "delete the route (r1)",
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/r1",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		}),
	)

	table.DescribeTable("test route with name and desc",
		func(tc base.HttpTestCase) {
			base.RunTestCase(tc)
		},
		table.Entry("create route with labels (r1)", base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Path:   "/apisix/admin/routes/r1",
			Method: http.MethodPut,
			Body: `{
					"uri": "/hello",
					"labels": {
						"build":"16",
						"env":"production",
						"version":"v2"
					},
					"upstream": {
						"type": "roundrobin",
						"nodes": [{
							"host": "` + base.UpstreamIp + `",
							"port": 1980,
							"weight": 1
						}]
					}
				}`,
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
			Sleep:        base.SleepTime,
		}),
	)

	table.DescribeTable("test route search by label",
		func(tc base.HttpTestCase) {
			base.RunTestCase(tc)
		},
		table.Entry("create route with labels (r1)", base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Path:   "/apisix/admin/routes/r1",
			Method: http.MethodPut,
			Body: `{
					"uri": "/hello",
					"labels": {
						"build":"16",
						"env":"production",
						"version":"v2"
					},
					"upstream": {
						"type": "roundrobin",
						"nodes": [{
							"host": "` + base.UpstreamIp + `",
							"port": 1980,
							"weight": 1
						}]
					}
				}`,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		}),
		table.Entry("create route with labels (r2)", base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Path:   "/apisix/admin/routes/r2",
			Method: http.MethodPut,
			Body: `{
					"uri": "/hello2",
					"labels": {
						"build":"17",
						"env":"dev",
						"version":"v2",
						"extra": "test"
					},
					"upstream": {
						"type": "roundrobin",
						"nodes": [{
							"host": "` + base.UpstreamIp + `",
							"port": 1980,
							"weight": 1
						}]
					}
				}`,
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
			Sleep:        base.SleepTime,
		}),
	)

	table.DescribeTable("test route with create_time and update_time",
		func(tc base.HttpTestCase) {
			base.RunTestCase(tc)
		},
		table.Entry("create route with create_time", base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Path:   "/apisix/admin/routes/r1",
			Method: http.MethodPut,
			Body: `{
				"uri": "/hello",
				"create_time": 1608792721,
				"upstream": {
					"nodes": {
						"` + base.UpstreamIp + `:1980": 1
					},
					"type": "roundrobin"
				}
			}`,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusBadRequest,
		}),
		table.Entry("create route with update_time", base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Path:   "/apisix/admin/routes/r1",
			Method: http.MethodPut,
			Body: `{
				"uri": "/hello",
				"update_time": 1608792721,
				"upstream": {
					"nodes": {
						"` + base.UpstreamIp + `:1980": 1
					},
					"type": "roundrobin"
				}
			}`,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusBadRequest,
		}),
		table.Entry("create route with create_time and update_time", base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Path:   "/apisix/admin/routes/r1",
			Method: http.MethodPut,
			Body: `{
				"uri": "/hello",
				"create_time": 1608792721,
				"update_time": 1608792721,
				"upstream": {
					"nodes": {
						"` + base.UpstreamIp + `:1980": 1
					},
					"type": "roundrobin"
				}
			}`,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusBadRequest,
		}),
		table.Entry("make sure the route not created", base.HttpTestCase{
			Object:       base.APISIXExpect(),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   `{"error_msg":"404 Route Not Found"}`,
		}),

		table.Entry("create route with labels (r1)", base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Path:   "/apisix/admin/routes/r1",
			Method: http.MethodPut,
			Body: `{
					"uri": "/hello",
					"upstream": {
						"type": "roundrobin",
						"nodes": [{
							"host": "` + base.UpstreamIp + `",
							"port": 1980,
							"weight": 1
						}]
					}
				}`,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		}),
	)

	ginkgo.It("verify create_time and update_time", func() {
		time.Sleep(base.SleepTime)

		url := base.ManagerAPIHost + "/apisix/admin/routes/r1"
		headers := map[string]string{
			"Authorization": base.GetToken(),
		}
		respBody, status, err := base.HttpGet(url, headers)
		assert.Equal(ginkgo.GinkgoT(), 200, status)
		assert.Nil(ginkgo.GinkgoT(), err)

		createTime := gjson.Get(string(respBody), "data.create_time")
		updateTime := gjson.Get(string(respBody), "data.update_time")

		assert.Equal(ginkgo.GinkgoT(), true, createTime.Int() >= time.Now().Unix()-1 && createTime.Int() <= time.Now().Unix()+1)
		assert.Equal(ginkgo.GinkgoT(), true, updateTime.Int() >= time.Now().Unix()-1 && updateTime.Int() <= time.Now().Unix()+1)

		// sleep 1 second for time compare
		time.Sleep(1 * time.Second)
		// update consumer
		reqBody := `{
			"name": "route1",
			"uri": "/hello",
			"upstream": {
				"type": "roundrobin",
				"nodes": [{
					"host": "` + base.UpstreamIp + `",
					"port": 1980,
					"weight": 1
				}]
			}
		}`
		respBody, status, err = base.HttpPut(base.ManagerAPIHost+"/apisix/admin/routes/r1", headers, reqBody)
		assert.Nil(ginkgo.GinkgoT(), err)
		assert.Equal(ginkgo.GinkgoT(), 200, status)

		time.Sleep(base.SleepTime)

		// check update
		respBody, status, err = base.HttpGet(url, headers)
		assert.Equal(ginkgo.GinkgoT(), 200, status)
		assert.Nil(ginkgo.GinkgoT(), err)

		createTime2 := gjson.Get(string(respBody), "data.create_time")
		updateTime2 := gjson.Get(string(respBody), "data.update_time")

		// compare time
		assert.Equal(ginkgo.GinkgoT(), createTime.String(), createTime2.String())
		assert.NotEqual(ginkgo.GinkgoT(), updateTime.String(), updateTime2.String())

		// delete test route r1
		url = base.ManagerAPIHost + "/apisix/admin/routes/r1"
		headers = map[string]string{
			"Authorization": base.GetToken(),
		}
		_, status, err = base.HttpDelete(url, headers)
		time.Sleep(base.SleepTime)
		assert.Equal(ginkgo.GinkgoT(), 200, status)
		assert.Nil(ginkgo.GinkgoT(), err)
	})

})
