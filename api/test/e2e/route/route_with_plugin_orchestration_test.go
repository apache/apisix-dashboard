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

	"github.com/onsi/ginkgo"
	"github.com/onsi/ginkgo/extensions/table"
	"github.com/onsi/gomega"
	"github.com/tidwall/gjson"

	"github.com/apisix/manager-api/test/e2e/base"
)

var _ = ginkgo.Describe("route with plugin orchestration", func() {
	bytes, err := ioutil.ReadFile("../../testdata/dag-conf.json")
	ginkgo.It("panics if readfile dag-conf.json error", func() {
		gomega.Expect(err).To(gomega.BeNil())
	})
	dagConf := string(bytes)

	// invalid dag config that not specified root node
	bytes, err = ioutil.ReadFile("../../testdata/invalid-dag-conf.json")
	ginkgo.It("panics if readfile invalid-dag-conf.json error", func() {
		gomega.Expect(err).To(gomega.BeNil())
	})
	invalidDagConf := string(bytes)

	table.DescribeTable("test route with plugin orchestration",
		func(tc base.HttpTestCase) {
			base.RunTestCase(tc)
		},
		table.Entry("make sure the route is not created", base.HttpTestCase{
			Object:       base.APISIXExpect(),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   `{"error_msg":"404 Route Not Found"}`,
		}),
		table.Entry("create route with invalid dag config", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodPut,
			Path:         "/apisix/admin/routes/r1",
			Body:         invalidDagConf,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusBadRequest,
		}),
		table.Entry("make sure the route created failed", base.HttpTestCase{
			Object:       base.APISIXExpect(),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   `{"error_msg":"404 Route Not Found"}`,
			Sleep:        base.SleepTime,
		}),
		table.Entry("create route with correct dag config", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodPut,
			Path:         "/apisix/admin/routes/r1",
			Body:         dagConf,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		}),
		table.Entry("verify the route(should be blocked)", base.HttpTestCase{
			Object:       base.APISIXExpect(),
			Method:       http.MethodGet,
			Path:         "/hello",
			Query:        "t=root.exe",
			ExpectStatus: http.StatusForbidden,
			ExpectBody:   `blocked`,
			Sleep:        base.SleepTime,
		}),
		table.Entry("verify the route(should not be blocked)", base.HttpTestCase{
			Object:       base.APISIXExpect(),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusOK,
			ExpectBody:   `hello world`,
		}),
		table.Entry("delete route", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/r1",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		}),
		table.Entry("hit the route just deleted", base.HttpTestCase{
			Object:       base.APISIXExpect(),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   `{"error_msg":"404 Route Not Found"}`,
			Sleep:        base.SleepTime,
		}),
	)

	table.DescribeTable("test route with plugin orchestration (post method)",
		func(tc base.HttpTestCase) {
			base.RunTestCase(tc)
		},
		table.Entry("make sure the route is not created", base.HttpTestCase{
			Object:       base.APISIXExpect(),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   `{"error_msg":"404 Route Not Found"}`,
		}),
	)

	var routeID string
	ginkgo.It("create route with correct dag config by post", func() {
		resp, code, err := base.HttpPost(base.ManagerAPIHost+"/apisix/admin/routes",
			map[string]string{"Authorization": base.GetToken()}, dagConf)
		gomega.Expect(err).To(gomega.BeNil())
		gomega.Expect(code).Should(gomega.Equal(200))
		routeID = gjson.Get(string(resp), "data.id").String()
	})

	ginkgo.It("test the route with plugin orchestration", func() {
		base.RunTestCase(base.HttpTestCase{
			Desc:         "verify the route (should be blocked)",
			Object:       base.APISIXExpect(),
			Method:       http.MethodGet,
			Path:         "/hello",
			Query:        "t=root.exe",
			ExpectStatus: http.StatusForbidden,
			ExpectBody:   `blocked`,
			Sleep:        base.SleepTime,
		})
		base.RunTestCase(base.HttpTestCase{
			Desc:         "verify the route (should not be blocked)",
			Object:       base.APISIXExpect(),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusOK,
			ExpectBody:   `hello world`,
		})
		base.RunTestCase(base.HttpTestCase{
			Desc:         "delete the route by routeID",
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/" + routeID,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		})
		base.RunTestCase(base.HttpTestCase{
			Desc:         "make sure the route has been deleted",
			Object:       base.APISIXExpect(),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   `{"error_msg":"404 Route Not Found"}`,
			Sleep:        base.SleepTime,
		})
	})
})
