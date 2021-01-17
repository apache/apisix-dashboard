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
package global_rule

import (
	"net/http"

	"github.com/onsi/ginkgo"
	"github.com/onsi/ginkgo/extensions/table"

	"e2enew/base"
)

var _ = ginkgo.Describe("Global Rule", func() {
	table.DescribeTable("test global rule",
		func(tc base.HttpTestCase) {
			base.RunTestCase(tc)
		},
		table.Entry("make sure the route doesn't exist", base.HttpTestCase{
			Object:       base.APISIXExpect(),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   `{"error_msg":"404 Route Not Found"}`,
		}),
		table.Entry("create route", base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Method: http.MethodPut,
			Path:   "/apisix/admin/routes/r1",
			Body: `{
				 "uri": "/hello",
				 "upstream": {
					 "type": "roundrobin",
					"nodes": [{
						"host": "` + base.UpstreamIp + `",
						"port": 1981,
						"weight": 1
					}]
				 }
			 }`,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		}),
		table.Entry("create global rule", base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Path:   "/apisix/admin/global_rules/1",
			Method: http.MethodPut,
			Body: `{
                                "plugins": {
		                        "response-rewrite": {
		                            "headers": {
		                                "X-VERSION":"1.0"
		                            }
		                        },
					"uri-blocker": {
						"block_rules": ["select.+(from|limit)", "(?:(union(.*?)select))"]
					}
                                }
                        }`,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		}),
		table.Entry("verify route with header", base.HttpTestCase{
			Object:        base.APISIXExpect(),
			Method:        http.MethodGet,
			Path:          "/hello",
			ExpectStatus:  http.StatusOK,
			ExpectBody:    "hello world",
			ExpectHeaders: map[string]string{"X-VERSION": "1.0"},
			Sleep:         base.SleepTime,
		}),
		table.Entry("verify route that should be blocked", base.HttpTestCase{
			Object:        base.APISIXExpect(),
			Method:        http.MethodGet,
			Path:          "/hello",
			Query:         "name=;select%20from%20sys",
			ExpectStatus:  http.StatusForbidden,
			ExpectHeaders: map[string]string{"X-VERSION": "1.0"},
		}),
		table.Entry("update route with same plugin response-rewrite", base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Method: http.MethodPut,
			Path:   "/apisix/admin/routes/r1",
			Body: `{
				"uri": "/hello",
				"plugins": {
					"response-rewrite": {
						"headers": {
							"X-VERSION":"2.0"
						}
					}
				},
				"upstream": {
					"type": "roundrobin",
					"nodes": [{
						"host": "` + base.UpstreamIp + `",
						"port": 1981,
						"weight": 1
					}]
				}
			 }`,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		}),
		table.Entry("verify route that header should be the same as the route config", base.HttpTestCase{
			Object:        base.APISIXExpect(),
			Method:        http.MethodGet,
			Path:          "/hello",
			ExpectStatus:  http.StatusOK,
			ExpectBody:    "hello world",
			ExpectHeaders: map[string]string{"X-VERSION": "2.0"},
			Sleep:         base.SleepTime,
		}),
		table.Entry("the uncovered global plugin should works", base.HttpTestCase{
			Object:       base.APISIXExpect(),
			Method:       http.MethodGet,
			Path:         "/hello",
			Query:        "name=;select%20from%20sys",
			ExpectStatus: http.StatusForbidden,
			//ExpectHeaders: map[string]string{"X-VERSION":"2.0"},
		}),
		table.Entry("route patch to enable key-auth", base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Method: http.MethodPatch,
			Path:   "/apisix/admin/global_rules/1/plugins",
			Body: `{
	                        "response-rewrite": {
	                            "headers": {
	                                "X-VERSION":"1.0"
	                            }
	                        },
				"key-auth": {}
			}`,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		}),
		table.Entry("make sure that patch succeeded", base.HttpTestCase{
			Object:       base.APISIXExpect(),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusUnauthorized,
			Sleep:        base.SleepTime,
		}),
		table.Entry("route patch to disable key-auth", base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Method: http.MethodPatch,
			Path:   "/apisix/admin/global_rules/1",
			Body: `{
				"plugins": {
					"key-auth": null
				}
			}`,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		}),

		table.Entry("make sure that patch succeeded", base.HttpTestCase{
			Object:        base.APISIXExpect(),
			Method:        http.MethodGet,
			Path:          "/hello",
			ExpectStatus:  http.StatusOK,
			ExpectBody:    "hello world",
			ExpectHeaders: map[string]string{"X-VERSION": "2.0"},
			Sleep:         base.SleepTime,
		}),

		table.Entry("update global rule", base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Path:   "/apisix/admin/global_rules/1",
			Method: http.MethodPut,
			Body: `{
                                "id": "1",
                                "plugins": {
		                        "response-rewrite": {
		                            "headers": {
		                                "X-VERSION":"1.0"
		                            }
		                        },
					"uri-blocker": {
						"block_rules": ["root.exe", "root.m+"]
					}
                                }
                        }`,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		}),

		table.Entry("make sure that update succeeded", base.HttpTestCase{
			Object:       base.APISIXExpect(),
			Method:       http.MethodGet,
			Path:         "/hello",
			Query:        "file=root.exe",
			ExpectStatus: http.StatusForbidden,
			Sleep:        base.SleepTime,
		}),

		table.Entry("update global rule to disable all plugins", base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Path:   "/apisix/admin/global_rules/1",
			Method: http.MethodPut,
			Body: `{
                                "id": "1",
                                "plugins": {}
                        }`,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		}),

		table.Entry("verify route that should not be blocked", base.HttpTestCase{
			Object:        base.APISIXExpect(),
			Method:        http.MethodGet,
			Path:          "/hello",
			Query:         "file=root.exe",
			ExpectStatus:  http.StatusOK,
			ExpectHeaders: map[string]string{"X-VERSION": "2.0"},
		}),

		table.Entry("delete global rule", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/global_rules/1",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		}),

		table.Entry("make sure the global rule has been deleted", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/global_rules/1",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   `{"code":10001,"message":"data not found"`,
			Sleep:        base.SleepTime,
		}),
		table.Entry("verify route that should not be blocked", base.HttpTestCase{
			Object:        base.APISIXExpect(),
			Method:        http.MethodGet,
			Path:          "/hello",
			Query:         "file=root.exe",
			ExpectStatus:  http.StatusOK,
			ExpectHeaders: map[string]string{"X-VERSION": "2.0"},
		}),
		table.Entry("delete route", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/r1",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		}),
		table.Entry("make sure the route has been deleted", base.HttpTestCase{
			Object:       base.APISIXExpect(),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   `{"error_msg":"404 Route Not Found"}`,
			Sleep:        base.SleepTime,
		}),
	)
})
