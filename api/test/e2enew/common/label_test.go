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
package common

import (
	"e2enew/base"
	"github.com/onsi/ginkgo"
	"github.com/onsi/ginkgo/extensions/table"
	"net/http"
)

var _ = ginkgo.Describe("Label", func() {
	table.DescribeTable("test label",
		func(tc base.HttpTestCase) {
			base.RunTestCase(tc)
		},
		table.Entry("config route", base.HttpTestCase{
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
		table.Entry("create consumer", base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Path:   "/apisix/admin/consumers/c1",
			Method: http.MethodPut,
			Body: `{
				"username": "jack",
				"plugins": {
					"key-auth": {
						"key": "auth-one"
					}
				},
				"labels": {
					"build":"16",
					"env":"production",
					"version":"v3"
				},
				"desc": "test description"
			}`,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		}),
		table.Entry("create upstream", base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Method: http.MethodPut,
			Path:   "/apisix/admin/upstreams/u1",
			Body: `{
				"nodes": [{
					"host": "` + base.UpstreamIp + `",
					"port": 1980,
					"weight": 1
				}],
				"labels": {
					"build":"17",
					"env":"production",
					"version":"v2"
				},
				"type": "roundrobin"
			}`,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		}),
		table.Entry("create service", base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Method: http.MethodPost,
			Path:   "/apisix/admin/services",
			Body: `{
				"id": "s1",
				"plugins": {
					"limit-count": {
						"count": 2,
						"time_window": 60,
						"rejected_code": 503,
						"key": "remote_addr"
					}
				},
				"upstream": {
					"type": "roundrobin",
					"nodes": [{
						"host": "39.97.63.215",
						"port": 80,
						"weight": 1
					}]
				},
				"labels": {
					"build":"16",
					"env":"production",
					"version":"v2",
					"extra": "test"
				}
			}`,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		}),
		table.Entry("get route label", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodGet,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			Path:         "/apisix/admin/labels/route",
			ExpectStatus: http.StatusOK,
			ExpectBody:   "{\"build\":\"16\"},{\"env\":\"production\"},{\"version\":\"v2\"}",
			Sleep:        base.SleepTime,
		}),
		table.Entry("get consumer label", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodGet,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			Path:         "/apisix/admin/labels/consumer",
			ExpectStatus: http.StatusOK,
			ExpectBody:   "{\"build\":\"16\"},{\"env\":\"production\"},{\"version\":\"v3\"}",
		}),
		table.Entry("get upstream label", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodGet,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			Path:         "/apisix/admin/labels/upstream",
			ExpectStatus: http.StatusOK,
			ExpectBody:   "{\"build\":\"17\"},{\"env\":\"production\"},{\"version\":\"v2\"}",
		}),
		table.Entry("get service label", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodGet,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			Path:         "/apisix/admin/labels/service",
			ExpectStatus: http.StatusOK,
			ExpectBody:   "{\"build\":\"16\"},{\"env\":\"production\"},{\"extra\":\"test\"},{\"version\":\"v2\"}",
		}),
		table.Entry("get all label", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodGet,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			Path:         "/apisix/admin/labels/all",
			ExpectStatus: http.StatusOK,
			ExpectBody:   "{\"build\":\"16\"},{\"build\":\"17\"},{\"env\":\"production\"},{\"extra\":\"test\"},{\"version\":\"v2\"},{\"version\":\"v3\"}",
		}),
		table.Entry("get label with page", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodGet,
			Query:        "page=1&page_size=1",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			Path:         "/apisix/admin/labels/all",
			ExpectStatus: http.StatusOK,
			ExpectBody:   "{\"build\":\"16\"}",
		}),
		table.Entry("get label with page", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodGet,
			Query:        "page=3&page_size=1",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			Path:         "/apisix/admin/labels/all",
			ExpectStatus: http.StatusOK,
			ExpectBody:   "{\"env\":\"production\"}",
		}),
		table.Entry("get labels (key = build)", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodGet,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			Query:        "label=build",
			Path:         "/apisix/admin/labels/all",
			ExpectStatus: http.StatusOK,
			ExpectBody:   "{\"build\":\"16\"},{\"build\":\"17\"}",
		}),
		table.Entry("get labels with the same key (key = build)", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodGet,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			Query:        "label=build:16,build:17",
			Path:         "/apisix/admin/labels/all",
			ExpectStatus: http.StatusOK,
			ExpectBody:   "{\"build\":\"16\"},{\"build\":\"17\"}",
		}),
		table.Entry("get labels (key = build) with page", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodGet,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			Query:        "label=build&page=2&page_size=1",
			Path:         "/apisix/admin/labels/all",
			ExpectStatus: http.StatusOK,
			ExpectBody:   "{\"build\":\"17\"}",
		}),
		table.Entry("get labels with same key (key = build) and page", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodGet,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			Query:        "label=build:16,build:17&page=1&page_size=2",
			Path:         "/apisix/admin/labels/all",
			ExpectStatus: http.StatusOK,
			ExpectBody:   "{\"build\":\"16\"},{\"build\":\"17\"}",
		}),
		table.Entry("get labels with same key (key = build) and page", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodGet,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			Query:        "label=build:16,build:17&page=2&page_size=1",
			Path:         "/apisix/admin/labels/all",
			ExpectStatus: http.StatusOK,
			ExpectBody:   "{\"build\":\"17\"}",
		}),
		table.Entry("get labels (key = build && env = production)", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodGet,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			Query:        "label=build,env:production",
			Path:         "/apisix/admin/labels/all",
			ExpectStatus: http.StatusOK,
			ExpectBody:   "{\"build\":\"16\"},{\"build\":\"17\"},{\"env\":\"production\"}",
		}),
		table.Entry("get labels (build=16 | 17 and env = production)", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodGet,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			Query:        "label=build:16,build:17,env:production",
			Path:         "/apisix/admin/labels/all",
			ExpectStatus: http.StatusOK,
			ExpectBody:   "{\"build\":\"16\"},{\"build\":\"17\"},{\"env\":\"production\"}",
		}),
		table.Entry("get labels (key = build && env = production) with page", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodGet,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			Query:        "label=build,env:production&page=3&page_size=1",
			Path:         "/apisix/admin/labels/all",
			ExpectStatus: http.StatusOK,
			ExpectBody:   "{\"env\":\"production\"}",
		}),
		table.Entry("delete route", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/r1",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		}),
		table.Entry("delete consumer", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/consumers/c1",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		}),
		table.Entry("delete service", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/services/s1",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		}),
		table.Entry("delete upstream", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/upstreams/u1",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		}),
	)
})
