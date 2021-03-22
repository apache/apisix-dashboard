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
package plugin_config

import (
	"net/http"

	"github.com/onsi/ginkgo"
	"github.com/onsi/ginkgo/extensions/table"

	"github.com/apisix/manager-api/test/e2enew/base"
)

var _ = ginkgo.Describe("Plugin Config", func() {
	table.DescribeTable("test plugin config",
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
		table.Entry("create plugin config", base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Path:   "/apisix/admin/plugin_configs/1",
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
				},
				"labels": {
					"version": "v1",
					"build":   "16"
				}
			}`,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		}),
		table.Entry("create plugin config by Post", base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Path:   "/apisix/admin/plugin_configs",
			Method: http.MethodPost,
			Body: `{
				"id": "2",
				"plugins": {
					"response-rewrite": {
						"headers": {
							"X-VERSION":"22.0"
						}
					}
				},
				"labels": {
					"version": "v2",
					"build":   "17",
					"extra":   "test"
				}
			}`,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		}),
		table.Entry("get plugin config", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Path:         "/apisix/admin/plugin_configs/1",
			Method:       http.MethodGet,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			ExpectBody:   `"plugins":{"response-rewrite":{"headers":{"X-VERSION":"1.0"}},"uri-blocker":{"block_rules":["select.+(from|limit)","(?:(union(.*?)select))"]}}`,
			Sleep:        base.SleepTime,
		}),
		table.Entry("search plugin_config list by label ", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Path:         "/apisix/admin/plugin_configs",
			Query:        "label=build:16",
			Method:       http.MethodGet,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			ExpectBody:   `"labels":{"build":"16","version":"v1"}`,
			Sleep:        base.SleepTime,
		}),
		table.Entry("search plugin_config list by label (only key)", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Path:         "/apisix/admin/plugin_configs",
			Query:        "label=extra",
			Method:       http.MethodGet,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			ExpectBody:   `"labels":{"build":"17","extra":"test","version":"v2"}`,
			Sleep:        base.SleepTime,
		}),
		table.Entry("create route with the plugin config created before", base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Method: http.MethodPut,
			Path:   "/apisix/admin/routes/r1",
			Body: `{
				 "name": "route1",
				 "uri": "/hello",
				 "plugin_config_id": "1",
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
			Sleep:         base.SleepTime,
		}),
		table.Entry("update plugin config by patch", base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Path:   "/apisix/admin/plugin_configs/1",
			Method: http.MethodPatch,
			Body: `{
				"plugins": {
					"response-rewrite": {
						"headers": {
							"X-VERSION":"2.0"
						}
					},
					"uri-blocker": {
						"block_rules": ["none"]
					}
				}
			}`,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		}),
		table.Entry("verify patch update", base.HttpTestCase{
			Object:        base.APISIXExpect(),
			Method:        http.MethodGet,
			Path:          "/hello",
			ExpectStatus:  http.StatusOK,
			ExpectBody:    "hello world",
			ExpectHeaders: map[string]string{"X-VERSION": "2.0"},
			Sleep:         base.SleepTime,
		}),
		table.Entry("verify patch update(should not block)", base.HttpTestCase{
			Object:        base.APISIXExpect(),
			Method:        http.MethodGet,
			Path:          "/hello",
			Query:         "name=;select%20from%20sys",
			ExpectStatus:  http.StatusOK,
			ExpectBody:    "hello world",
			ExpectHeaders: map[string]string{"X-VERSION": "2.0"},
		}),
		table.Entry("update plugin config by sub path patch", base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Path:   "/apisix/admin/plugin_configs/1/plugins",
			Method: http.MethodPatch,
			Body: `{
				"response-rewrite": {
					"headers": {
						"X-VERSION":"3.0"
					}
				}
			}`,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		}),
		table.Entry("verify patch (sub path)", base.HttpTestCase{
			Object:        base.APISIXExpect(),
			Method:        http.MethodGet,
			Path:          "/hello",
			ExpectStatus:  http.StatusOK,
			ExpectBody:    "hello world",
			ExpectHeaders: map[string]string{"X-VERSION": "3.0"},
			Sleep:         base.SleepTime,
		}),
		table.Entry("delete route", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/r1",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		}),
		table.Entry("delete plugin config", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/plugin_configs/1",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			Sleep:        base.SleepTime,
		}),
		table.Entry("make sure the plugin config has been deleted", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/plugin_configs/1",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   `{"code":10001,"message":"data not found"`,
			Sleep:        base.SleepTime,
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
