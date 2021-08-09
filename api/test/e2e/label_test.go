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
	"net/http"
	"testing"
)

func TestLabel(t *testing.T) {
	// Todo: test ssl after ssl bug fixed
	tests := []HttpTestCase{
		{
			Desc:   "config route",
			Object: ManagerApiExpect(t),
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
						"nodes": [{
							"host": "` + UpstreamIp + `",
							"port": 1980,
							"weight": 1
						}]
					}
				}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:   "create consumer",
			Object: ManagerApiExpect(t),
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
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:   "create upstream",
			Object: ManagerApiExpect(t),
			Method: http.MethodPut,
			Path:   "/apisix/admin/upstreams/u1",
			Body: `{
				"nodes": [{
					"host": "` + UpstreamIp + `",
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
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:   "create service",
			Object: ManagerApiExpect(t),
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
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:   "create plugin_config",
			Object: ManagerApiExpect(t),
			Method: http.MethodPut,
			Path:   "/apisix/admin/plugin_configs/1",
			Body: `{
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
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:         "get route label",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodGet,
			Headers:      map[string]string{"Authorization": token},
			Path:         "/apisix/admin/labels/route",
			ExpectStatus: http.StatusOK,
			ExpectBody:   "{\"build\":\"16\"},{\"env\":\"production\"},{\"version\":\"v2\"}",
			Sleep:        sleepTime,
		},
		{
			Desc:         "get consumer label",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodGet,
			Headers:      map[string]string{"Authorization": token},
			Path:         "/apisix/admin/labels/consumer",
			ExpectStatus: http.StatusOK,
			ExpectBody:   "{\"build\":\"16\"},{\"env\":\"production\"},{\"version\":\"v3\"}",
		},
		{
			Desc:         "get upstream label",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodGet,
			Headers:      map[string]string{"Authorization": token},
			Path:         "/apisix/admin/labels/upstream",
			ExpectStatus: http.StatusOK,
			ExpectBody:   "{\"build\":\"17\"},{\"env\":\"production\"},{\"version\":\"v2\"}",
		},
		{
			Desc:         "get service label",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodGet,
			Headers:      map[string]string{"Authorization": token},
			Path:         "/apisix/admin/labels/service",
			ExpectStatus: http.StatusOK,
			ExpectBody:   "{\"build\":\"16\"},{\"env\":\"production\"},{\"extra\":\"test\"},{\"version\":\"v2\"}",
		},
		{
			Desc:         "get plugin_config label",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodGet,
			Headers:      map[string]string{"Authorization": token},
			Path:         "/apisix/admin/labels/plugin_config",
			ExpectStatus: http.StatusOK,
			ExpectBody:   "{\"build\":\"17\"},{\"extra\":\"test\"},{\"version\":\"v2\"}",
		},
		{
			Desc:   "update plugin_config",
			Object: ManagerApiExpect(t),
			Method: http.MethodPut,
			Path:   "/apisix/admin/plugin_configs/1",
			Body: `{
				"plugins": {
					"response-rewrite": {
						"headers": {
							"X-VERSION":"22.0"
						}
					}
				},
				"labels": {
					"version": "v3",
					"build":   "16",
					"extra":   "test"
				}
			}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:         "get plugin_config label again to verify update",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodGet,
			Headers:      map[string]string{"Authorization": token},
			Path:         "/apisix/admin/labels/plugin_config",
			ExpectStatus: http.StatusOK,
			ExpectBody:   "{\"build\":\"16\"},{\"extra\":\"test\"},{\"version\":\"v3\"}",
		},
		{
			Desc:         "get all label",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodGet,
			Headers:      map[string]string{"Authorization": token},
			Path:         "/apisix/admin/labels/all",
			ExpectStatus: http.StatusOK,
			ExpectBody:   "{\"build\":\"16\"},{\"build\":\"17\"},{\"env\":\"production\"},{\"extra\":\"test\"},{\"version\":\"v2\"},{\"version\":\"v3\"}",
		},
		{
			Desc:         "get label with page",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodGet,
			Query:        "page=1&page_size=1",
			Headers:      map[string]string{"Authorization": token},
			Path:         "/apisix/admin/labels/all",
			ExpectStatus: http.StatusOK,
			ExpectBody:   "{\"build\":\"16\"}",
		},
		{
			Desc:         "get label with page",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodGet,
			Query:        "page=3&page_size=1",
			Headers:      map[string]string{"Authorization": token},
			Path:         "/apisix/admin/labels/all",
			ExpectStatus: http.StatusOK,
			ExpectBody:   "{\"env\":\"production\"}",
		},
		{
			Desc:         "get labels (key = build)",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodGet,
			Headers:      map[string]string{"Authorization": token},
			Query:        "label=build",
			Path:         "/apisix/admin/labels/all",
			ExpectStatus: http.StatusOK,
			ExpectBody:   "{\"build\":\"16\"},{\"build\":\"17\"}",
		},
		{
			Desc:         "get labels with the same key (key = build)",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodGet,
			Headers:      map[string]string{"Authorization": token},
			Query:        "label=build:16,build:17",
			Path:         "/apisix/admin/labels/all",
			ExpectStatus: http.StatusOK,
			ExpectBody:   "{\"build\":\"16\"},{\"build\":\"17\"}",
		},
		{
			Desc:         "get labels (key = build) with page",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodGet,
			Headers:      map[string]string{"Authorization": token},
			Query:        "label=build&page=2&page_size=1",
			Path:         "/apisix/admin/labels/all",
			ExpectStatus: http.StatusOK,
			ExpectBody:   "{\"build\":\"17\"}",
		},
		{
			Desc:         "get labels with same key (key = build) and page",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodGet,
			Headers:      map[string]string{"Authorization": token},
			Query:        "label=build:16,build:17&page=1&page_size=2",
			Path:         "/apisix/admin/labels/all",
			ExpectStatus: http.StatusOK,
			ExpectBody:   "{\"build\":\"16\"},{\"build\":\"17\"}",
		},
		{
			Desc:         "get labels with same key (key = build) and page",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodGet,
			Headers:      map[string]string{"Authorization": token},
			Query:        "label=build:16,build:17&page=2&page_size=1",
			Path:         "/apisix/admin/labels/all",
			ExpectStatus: http.StatusOK,
			ExpectBody:   "{\"build\":\"17\"}",
		},
		{
			Desc:         "get labels (key = build && env = production)",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodGet,
			Headers:      map[string]string{"Authorization": token},
			Query:        "label=build,env:production",
			Path:         "/apisix/admin/labels/all",
			ExpectStatus: http.StatusOK,
			ExpectBody:   "{\"build\":\"16\"},{\"build\":\"17\"},{\"env\":\"production\"}",
		},
		{
			Desc:         "get labels (build=16 | 17 and env = production)",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodGet,
			Headers:      map[string]string{"Authorization": token},
			Query:        "label=build:16,build:17,env:production",
			Path:         "/apisix/admin/labels/all",
			ExpectStatus: http.StatusOK,
			ExpectBody:   "{\"build\":\"16\"},{\"build\":\"17\"},{\"env\":\"production\"}",
		},
		{
			Desc:         "get labels (key = build && env = production) with page",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodGet,
			Headers:      map[string]string{"Authorization": token},
			Query:        "label=build,env:production&page=3&page_size=1",
			Path:         "/apisix/admin/labels/all",
			ExpectStatus: http.StatusOK,
			ExpectBody:   "{\"env\":\"production\"}",
		},
		{
			Desc:         "delete route",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/r1",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:         "delete consumer",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/consumers/c1",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:         "delete service",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/services/s1",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:         "delete upstream",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/upstreams/u1",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:         "delete plugin_config",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/plugin_configs/1",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:         "get route label(check empty response)",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodGet,
			Headers:      map[string]string{"Authorization": token},
			Path:         "/apisix/admin/labels/route",
			ExpectStatus: http.StatusOK,
			ExpectBody:   "{\"rows\":[],\"total_size\":0}",
			Sleep:        sleepTime,
		},
	}

	for _, tc := range tests {
		testCaseCheck(tc, t)
	}
}
