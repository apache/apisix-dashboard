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
	"net/http"

	"github.com/onsi/ginkgo"
	"github.com/onsi/ginkgo/extensions/table"

	"e2enew/base"
)

var _ = ginkgo.Describe("Route", func() {
	table.DescribeTable("test route with vars",
		func(tc base.HttpTestCase) {
			base.RunTestCase(tc)
		},
		table.Entry("add route with vars (args)", base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Method: http.MethodPut,
			Path:   "/apisix/admin/routes/r1",
			Body: `{
					"uri": "/hello",
					"vars": [
						["arg_name","==","aaa"]
					],
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
		table.Entry("hit the route with right args", base.HttpTestCase{
			Object:       base.APISIXExpect(),
			Method:       http.MethodGet,
			Path:         `/hello`,
			Query:        "name=aaa",
			ExpectStatus: http.StatusOK,
			Sleep:        base.SleepTime,
		}),
		table.Entry("hit the route with wrong args", base.HttpTestCase{
			Object:       base.APISIXExpect(),
			Method:       http.MethodGet,
			Path:         `/hello`,
			Query:        "name=bbb",
			ExpectStatus: http.StatusNotFound,
			Sleep:        base.SleepTime,
		}),
		table.Entry("hit the route with no args", base.HttpTestCase{
			Object:       base.APISIXExpect(),
			Method:       http.MethodGet,
			Path:         `/hello`,
			ExpectStatus: http.StatusNotFound,
			Sleep:        base.SleepTime,
		}),
		table.Entry("update route with vars (header)", base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Method: http.MethodPut,
			Path:   "/apisix/admin/routes/r1",
			Body: `{
					"uri": "/hello",
					"vars": [
						["http_k","==","header"]
					],
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
		table.Entry("hit the route with right header", base.HttpTestCase{
			Object:       base.APISIXExpect(),
			Method:       http.MethodGet,
			Headers:      map[string]string{"k": "header"},
			Path:         `/hello`,
			ExpectStatus: http.StatusOK,
			Sleep:        base.SleepTime,
		}),
		table.Entry("hit the route with wrong header", base.HttpTestCase{
			Object:       base.APISIXExpect(),
			Method:       http.MethodGet,
			Headers:      map[string]string{"k": "jack"},
			Path:         `/hello`,
			ExpectStatus: http.StatusNotFound,
			Sleep:        base.SleepTime,
		}),
		table.Entry("hit the route with no header", base.HttpTestCase{
			Object:       base.APISIXExpect(),
			Method:       http.MethodGet,
			Path:         `/hello`,
			ExpectStatus: http.StatusNotFound,
			Sleep:        base.SleepTime,
		}),
		table.Entry("update route with vars (cookie)", base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Method: http.MethodPut,
			Path:   "/apisix/admin/routes/r1",
			Body: `{
					"uri": "/hello",
					"vars": [
						["http_cookie","==","_octo=GH1.1.572248189.1598928545; _device_id=2c1a1a52074e66a3a008e4b73c690500; logged_in=yes;"]
					],
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
		table.Entry("hit the route with right Cookie", base.HttpTestCase{
			Object:       base.APISIXExpect(),
			Method:       http.MethodGet,
			Headers:      map[string]string{"Cookie": "_octo=GH1.1.572248189.1598928545; _device_id=2c1a1a52074e66a3a008e4b73c690500; logged_in=yes;"},
			Path:         `/hello`,
			ExpectStatus: http.StatusOK,
			Sleep:        base.SleepTime,
		}),
		table.Entry("hit the route with wrong Cookie", base.HttpTestCase{
			Object:       base.APISIXExpect(),
			Method:       http.MethodGet,
			Headers:      map[string]string{"Cookie": "jack"},
			Path:         `/hello`,
			ExpectStatus: http.StatusNotFound,
			Sleep:        base.SleepTime,
		}),
		table.Entry("hit the route with no Cookie", base.HttpTestCase{
			Object:       base.APISIXExpect(),
			Method:       http.MethodGet,
			Path:         `/hello`,
			ExpectStatus: http.StatusNotFound,
			Sleep:        base.SleepTime,
		}),
		table.Entry("delete route", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/r1",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			Sleep:        base.SleepTime,
		}),
		table.Entry("add route with multiple vars (args, cookie and header)", base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Method: http.MethodPut,
			Path:   "/apisix/admin/routes/r1",
			Body: `{
					"uri": "/hello",
					"vars": [
						["http_cookie","==","_octo=GH1.1.572248189.1598928545; _device_id=2c1a1a52074e66a3a008e4b73c690500; logged_in=yes;"],
						["http_k","==","header"],
						["arg_name","==","aaa"]
					],
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
		table.Entry("hit the route with right parameters", base.HttpTestCase{
			Object:       base.APISIXExpect(),
			Method:       http.MethodGet,
			Headers:      map[string]string{"k": "header", "Cookie": "_octo=GH1.1.572248189.1598928545; _device_id=2c1a1a52074e66a3a008e4b73c690500; logged_in=yes;"},
			Path:         `/hello`,
			Query:        "name=aaa",
			ExpectStatus: http.StatusOK,
			Sleep:        base.SleepTime,
		}),
		table.Entry("hit the route with wrong arg", base.HttpTestCase{
			Object:       base.APISIXExpect(),
			Method:       http.MethodGet,
			Headers:      map[string]string{"k": "header", "Cookie": "_octo=GH1.1.572248189.1598928545; _device_id=2c1a1a52074e66a3a008e4b73c690500; logged_in=yes;"},
			Path:         `/hello`,
			ExpectStatus: http.StatusNotFound,
			Sleep:        base.SleepTime,
		}),
		table.Entry("hit the route with wrong header", base.HttpTestCase{
			Object:       base.APISIXExpect(),
			Method:       http.MethodGet,
			Headers:      map[string]string{"k": "test", "Cookie": "_octo=GH1.1.572248189.1598928545; _device_id=2c1a1a52074e66a3a008e4b73c690500; logged_in=yes;"},
			Path:         `/hello`,
			Query:        "name=aaa",
			ExpectStatus: http.StatusNotFound,
			Sleep:        base.SleepTime,
		}),
		table.Entry("hit the route with wrong cookie", base.HttpTestCase{
			Object:       base.APISIXExpect(),
			Method:       http.MethodGet,
			Headers:      map[string]string{"k": "header", "Cookie": "_octo=GH1.1.572248189.1598928545; logged_in=yes;"},
			Path:         `/hello`,
			Query:        "name=aaa",
			ExpectStatus: http.StatusNotFound,
			Sleep:        base.SleepTime,
		}),
		table.Entry("delete route", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/r1",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			Sleep:        base.SleepTime,
		}),
		table.Entry("add route with vars (args is digital)", base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Method: http.MethodPut,
			Path:   "/apisix/admin/routes/r1",
			Body: `{
					"uri": "/hello",
					"vars": [
						["arg_name","==",111]
					],
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
		table.Entry("verify route", base.HttpTestCase{
			Object:       base.APISIXExpect(),
			Method:       http.MethodGet,
			Path:         `/hello`,
			Query:        "name=111",
			ExpectStatus: http.StatusOK,
			Sleep:        base.SleepTime,
		}),
		table.Entry("delete the route with vars (args is digital)", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/r1",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			Sleep:        base.SleepTime,
		}),
	)
})
