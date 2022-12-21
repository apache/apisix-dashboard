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
package server_info_test

import (
	"net/http"
	"time"

	. "github.com/onsi/ginkgo/v2"

	"github.com/apisix/manager-api/test/e2e/base"
)

var _ = Describe("server info test", func() {
	DescribeTable("get server info",
		func(tc base.HttpTestCase) {
			time.Sleep(2 * time.Second)
			base.RunTestCase(tc)
		},
		Entry("get server info(apisix-server1)", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Path:         "/apisix/admin/server_info/apisix-server1",
			Method:       http.MethodGet,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "\"hostname\":\"apisix_server1\"",
		}),
		Entry("get server info(apisix-server2)", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Path:         "/apisix/admin/server_info/apisix-server2",
			Method:       http.MethodGet,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "\"hostname\":\"apisix_server2\"",
		}),
	)

	DescribeTable("get server info list",
		func(tc base.HttpTestCase) {
			base.RunTestCase(tc)
		},
		Entry("list all server info", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Path:         "/apisix/admin/server_info",
			Method:       http.MethodGet,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "\"total_size\":2",
		}),
		Entry("list server info with hostname", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Path:         "/apisix/admin/server_info",
			Query:        "hostname=apisix_",
			Method:       http.MethodGet,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "\"total_size\":2",
		}),
		Entry("list server info with hostname", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Path:         "/apisix/admin/server_info",
			Query:        "hostname=apisix_server2",
			Method:       http.MethodGet,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "\"total_size\":1",
		}),
	)
})

var _ = Describe("server info test omitEmptyValue", func() {
	DescribeTable("server info get omitEmptyValue",
		func(tc base.HttpTestCase) {
			time.Sleep(2 * time.Second)
			base.RunTestCase(tc)
		},
		Entry("get server info", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Path:         "/apisix/admin/server_info/apisix-server1",
			Method:       http.MethodGet,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			UnexpectBody: []string{"\"create_time\":", "\"update_time\":"},
		}),
	)

	DescribeTable("server info list omitEmptyValue",
		func(tc base.HttpTestCase) {
			base.RunTestCase(tc)
		},
		Entry("list all server info", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Path:         "/apisix/admin/server_info",
			Method:       http.MethodGet,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "\"total_size\":2",
			UnexpectBody: []string{"\"create_time\":", "\"update_time\":"},
		}),
		Entry("list server info with hostname", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Path:         "/apisix/admin/server_info",
			Query:        "hostname=apisix_",
			Method:       http.MethodGet,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "\"total_size\":2",
			UnexpectBody: []string{"\"create_time\":", "\"update_time\":"},
		}),
	)
})
