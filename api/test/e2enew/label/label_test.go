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
package label

import (
	"net/http"

	"github.com/onsi/ginkgo"

	"github.com/apisix/manager-api/test/e2enew/base"
)

var _ = ginkgo.Describe("Test label", func() {
	ginkgo.Context("test label", func() {
		ginkgo.It("config route", func() {
			base.RunTestCase(base.HttpTestCase{
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
						 "nodes": [{
							 "host": "` + base.UpstreamIp + `",
							 "port": 1980,
							 "weight": 1
						 }]
					 }
				 }`,
				Headers:      map[string]string{"Authorization": base.GetToken()},
				ExpectStatus: http.StatusOK,
			})
		})
		ginkgo.It("create consumer", func() {
			base.RunTestCase(base.HttpTestCase{
				Object: base.ManagerApiExpect(),
				Path:   "/apisix/admin/consumers/c1",
				Method: http.MethodPut,
				Body: `{
					 "username": "c1",
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
			})
		})
		ginkgo.It("create upstream", func() {
			base.RunTestCase(base.HttpTestCase{
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
			})
		})
		ginkgo.It("create service", func() {
			base.RunTestCase(base.HttpTestCase{
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
							 "key": "remote_addr",
							 "policy": "local"
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
			})
		})
		ginkgo.It("create plugin_config", func() {
			base.RunTestCase(base.HttpTestCase{
				Object: base.ManagerApiExpect(),
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
				Headers:      map[string]string{"Authorization": base.GetToken()},
				ExpectStatus: http.StatusOK,
			})
		})
		ginkgo.It("get route label", func() {
			base.RunTestCase(base.HttpTestCase{
				Object:       base.ManagerApiExpect(),
				Method:       http.MethodGet,
				Headers:      map[string]string{"Authorization": base.GetToken()},
				Path:         "/apisix/admin/labels/route",
				ExpectStatus: http.StatusOK,
				ExpectBody:   "{\"build\":\"16\"},{\"env\":\"production\"},{\"version\":\"v2\"}",
				Sleep:        base.SleepTime,
			})
		})
		ginkgo.It("get consumer label", func() {
			base.RunTestCase(base.HttpTestCase{
				Object:       base.ManagerApiExpect(),
				Method:       http.MethodGet,
				Headers:      map[string]string{"Authorization": base.GetToken()},
				Path:         "/apisix/admin/labels/consumer",
				ExpectStatus: http.StatusOK,
				ExpectBody:   "{\"build\":\"16\"},{\"env\":\"production\"},{\"version\":\"v3\"}",
			})
		})
		ginkgo.It("get upstream label", func() {
			base.RunTestCase(base.HttpTestCase{
				Object:       base.ManagerApiExpect(),
				Method:       http.MethodGet,
				Headers:      map[string]string{"Authorization": base.GetToken()},
				Path:         "/apisix/admin/labels/upstream",
				ExpectStatus: http.StatusOK,
				ExpectBody:   "{\"build\":\"17\"},{\"env\":\"production\"},{\"version\":\"v2\"}",
			})
		})
		ginkgo.It("get service label", func() {
			base.RunTestCase(base.HttpTestCase{
				Object:       base.ManagerApiExpect(),
				Method:       http.MethodGet,
				Headers:      map[string]string{"Authorization": base.GetToken()},
				Path:         "/apisix/admin/labels/service",
				ExpectStatus: http.StatusOK,
				ExpectBody:   "{\"build\":\"16\"},{\"env\":\"production\"},{\"extra\":\"test\"},{\"version\":\"v2\"}",
			})
		})
		ginkgo.It("get plugin_config label", func() {
			base.RunTestCase(base.HttpTestCase{
				Object:       base.ManagerApiExpect(),
				Method:       http.MethodGet,
				Headers:      map[string]string{"Authorization": base.GetToken()},
				Path:         "/apisix/admin/labels/plugin_config",
				ExpectStatus: http.StatusOK,
				ExpectBody:   "{\"build\":\"17\"},{\"extra\":\"test\"},{\"version\":\"v2\"}",
			})
		})
		ginkgo.It("update plugin_config", func() {
			base.RunTestCase(base.HttpTestCase{
				Object: base.ManagerApiExpect(),
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
				Headers:      map[string]string{"Authorization": base.GetToken()},
				ExpectStatus: http.StatusOK,
			})
		})
		ginkgo.It("get plugin_config label again to verify update", func() {
			base.RunTestCase(base.HttpTestCase{
				Object:       base.ManagerApiExpect(),
				Method:       http.MethodGet,
				Headers:      map[string]string{"Authorization": base.GetToken()},
				Path:         "/apisix/admin/labels/plugin_config",
				ExpectStatus: http.StatusOK,
				ExpectBody:   "{\"build\":\"16\"},{\"extra\":\"test\"},{\"version\":\"v3\"}",
				Sleep:        base.SleepTime,
			})
		})
		ginkgo.It("get all label", func() {
			base.RunTestCase(base.HttpTestCase{
				Object:       base.ManagerApiExpect(),
				Method:       http.MethodGet,
				Headers:      map[string]string{"Authorization": base.GetToken()},
				Path:         "/apisix/admin/labels/all",
				ExpectStatus: http.StatusOK,
				ExpectBody:   "{\"build\":\"16\"},{\"build\":\"17\"},{\"env\":\"production\"},{\"extra\":\"test\"},{\"version\":\"v2\"},{\"version\":\"v3\"}",
			})
		})
		ginkgo.It("get label with page", func() {
			base.RunTestCase(base.HttpTestCase{
				Object:       base.ManagerApiExpect(),
				Method:       http.MethodGet,
				Query:        "page=1&page_size=1",
				Headers:      map[string]string{"Authorization": base.GetToken()},
				Path:         "/apisix/admin/labels/all",
				ExpectStatus: http.StatusOK,
				ExpectBody:   "{\"build\":\"16\"}",
			})
		})
		ginkgo.It("get label with page", func() {
			base.RunTestCase(base.HttpTestCase{
				Object:       base.ManagerApiExpect(),
				Method:       http.MethodGet,
				Query:        "page=3&page_size=1",
				Headers:      map[string]string{"Authorization": base.GetToken()},
				Path:         "/apisix/admin/labels/all",
				ExpectStatus: http.StatusOK,
				ExpectBody:   "{\"env\":\"production\"}",
			})
		})
		ginkgo.It("get labels (key = build)", func() {
			base.RunTestCase(base.HttpTestCase{
				Object:       base.ManagerApiExpect(),
				Method:       http.MethodGet,
				Headers:      map[string]string{"Authorization": base.GetToken()},
				Query:        "label=build",
				Path:         "/apisix/admin/labels/all",
				ExpectStatus: http.StatusOK,
				ExpectBody:   "{\"build\":\"16\"},{\"build\":\"17\"}",
			})
		})
		ginkgo.It("get labels with the same key (key = build)", func() {
			base.RunTestCase(base.HttpTestCase{
				Object:       base.ManagerApiExpect(),
				Method:       http.MethodGet,
				Headers:      map[string]string{"Authorization": base.GetToken()},
				Query:        "label=build:16,build:17",
				Path:         "/apisix/admin/labels/all",
				ExpectStatus: http.StatusOK,
				ExpectBody:   "{\"build\":\"16\"},{\"build\":\"17\"}",
			})
		})
		ginkgo.It("get labels (key = build) with page", func() {
			base.RunTestCase(base.HttpTestCase{
				Object:       base.ManagerApiExpect(),
				Method:       http.MethodGet,
				Headers:      map[string]string{"Authorization": base.GetToken()},
				Query:        "label=build&page=2&page_size=1",
				Path:         "/apisix/admin/labels/all",
				ExpectStatus: http.StatusOK,
				ExpectBody:   "{\"build\":\"17\"}",
			})
		})
		ginkgo.It("get labels with same key (key = build) and page", func() {
			base.RunTestCase(base.HttpTestCase{
				Object:       base.ManagerApiExpect(),
				Method:       http.MethodGet,
				Headers:      map[string]string{"Authorization": base.GetToken()},
				Query:        "label=build:16,build:17&page=1&page_size=2",
				Path:         "/apisix/admin/labels/all",
				ExpectStatus: http.StatusOK,
				ExpectBody:   "{\"build\":\"16\"},{\"build\":\"17\"}",
			})
		})
		ginkgo.It("get labels with same key (key = build) and page", func() {
			base.RunTestCase(base.HttpTestCase{
				Object:       base.ManagerApiExpect(),
				Method:       http.MethodGet,
				Headers:      map[string]string{"Authorization": base.GetToken()},
				Query:        "label=build:16,build:17&page=2&page_size=1",
				Path:         "/apisix/admin/labels/all",
				ExpectStatus: http.StatusOK,
				ExpectBody:   "{\"build\":\"17\"}",
			})
		})
		ginkgo.It("get labels (key = build && env = production)", func() {
			base.RunTestCase(base.HttpTestCase{
				Object:       base.ManagerApiExpect(),
				Method:       http.MethodGet,
				Headers:      map[string]string{"Authorization": base.GetToken()},
				Query:        "label=build,env:production",
				Path:         "/apisix/admin/labels/all",
				ExpectStatus: http.StatusOK,
				ExpectBody:   "{\"build\":\"16\"},{\"build\":\"17\"},{\"env\":\"production\"}",
			})
		})
		ginkgo.It("get labels (build=16 | 17 and env = production)", func() {
			base.RunTestCase(base.HttpTestCase{
				Object:       base.ManagerApiExpect(),
				Method:       http.MethodGet,
				Headers:      map[string]string{"Authorization": base.GetToken()},
				Query:        "label=build:16,build:17,env:production",
				Path:         "/apisix/admin/labels/all",
				ExpectStatus: http.StatusOK,
				ExpectBody:   "{\"build\":\"16\"},{\"build\":\"17\"},{\"env\":\"production\"}",
			})
		})
		ginkgo.It("get labels (key = build && env = production) with page", func() {
			base.RunTestCase(base.HttpTestCase{
				Object:       base.ManagerApiExpect(),
				Method:       http.MethodGet,
				Headers:      map[string]string{"Authorization": base.GetToken()},
				Query:        "label=build,env:production&page=3&page_size=1",
				Path:         "/apisix/admin/labels/all",
				ExpectStatus: http.StatusOK,
				ExpectBody:   "{\"env\":\"production\"}",
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
		ginkgo.It("delete consumer", func() {
			base.RunTestCase(base.HttpTestCase{
				Object:       base.ManagerApiExpect(),
				Method:       http.MethodDelete,
				Path:         "/apisix/admin/consumers/c1",
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
			})
		})
		ginkgo.It("delete upstream", func() {
			base.RunTestCase(base.HttpTestCase{
				Object:       base.ManagerApiExpect(),
				Method:       http.MethodDelete,
				Path:         "/apisix/admin/upstreams/u1",
				Headers:      map[string]string{"Authorization": base.GetToken()},
				ExpectStatus: http.StatusOK,
			})
		})
		ginkgo.It("delete plugin_config", func() {
			base.RunTestCase(base.HttpTestCase{
				Object:       base.ManagerApiExpect(),
				Method:       http.MethodDelete,
				Path:         "/apisix/admin/plugin_configs/1",
				Headers:      map[string]string{"Authorization": base.GetToken()},
				ExpectStatus: http.StatusOK,
			})
		})
	})
})
