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
	table.DescribeTable("test route with remote_addr",
		func(tc base.HttpTestCase) {
			base.RunTestCase(tc)
		},
		table.Entry("config route with invalid remote_addr", base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Method: http.MethodPut,
			Path:   "/apisix/admin/routes/r1",
			Body: `{
					"uri": "/hello",
					"remote_addr": "127.0.0.",
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
			ExpectStatus: http.StatusBadRequest,
			ExpectBody:   "\"code\":10000,\"message\":\"schema validate failed: remote_addr: Must validate at least one schema (anyOf)\\nremote_addr: Does not match format 'ipv4'\"",
		}),
		table.Entry("verify route", base.HttpTestCase{
			Object:       base.APISIXExpect(),
			Method:       http.MethodGet,
			Path:         "/hello",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusNotFound,
			Sleep:        base.SleepTime,
		}),
		table.Entry("config route with invalid remote_addr", base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Method: http.MethodPut,
			Path:   "/apisix/admin/routes/r1",
			Body: `{
					"uri": "/hello",
					"remote_addr": "127.0.0.aa",
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
			ExpectStatus: http.StatusBadRequest,
			ExpectBody:   "\"code\":10000,\"message\":\"schema validate failed: remote_addr: Must validate at least one schema (anyOf)\\nremote_addr: Does not match format 'ipv4'\"",
		}),
		table.Entry("verify route", base.HttpTestCase{
			Object:       base.APISIXExpect(),
			Method:       http.MethodGet,
			Path:         "/hello",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusNotFound,
			Sleep:        base.SleepTime,
		}),
		table.Entry("config route with invalid remote_addrs", base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Method: http.MethodPut,
			Path:   "/apisix/admin/routes/r1",
			Body: `{
					"uri": "/hello",
					"remote_addrs": ["127.0.0.1","192.168.0."],
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
			ExpectStatus: http.StatusBadRequest,
			ExpectBody:   "\"code\":10000,\"message\":\"schema validate failed: remote_addrs.1: Must validate at least one schema (anyOf)\\nremote_addrs.1: Does not match format 'ipv4'\"",
		}),
		table.Entry("verify route", base.HttpTestCase{
			Object:       base.APISIXExpect(),
			Method:       http.MethodGet,
			Path:         "/hello",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusNotFound,
			Sleep:        base.SleepTime,
		}),
	)
})
