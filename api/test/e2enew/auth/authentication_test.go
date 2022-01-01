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
package auth_test

import (
	"net/http"

	"github.com/onsi/ginkgo"
	"github.com/onsi/ginkgo/extensions/table"

	"github.com/apisix/manager-api/test/e2enew/base"
)

var _ = ginkgo.Describe("Authentication", func() {

	table.DescribeTable("test auth module",
		func(tc base.HttpTestCase) {
			base.RunTestCase(tc)
		},
		table.Entry("Access with valid authentication token", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/routes",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			ExpectBody:   `"code":0`,
		}),
		table.Entry("Access with malformed authentication token", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/routes",
			Headers:      map[string]string{"Authorization": "Not-A-Valid-Token"},
			ExpectStatus: http.StatusUnauthorized,
			ExpectBody:   `"message":"request unauthorized"`,
		}),
		table.Entry("Access without authentication token", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/routes",
			ExpectStatus: http.StatusUnauthorized,
			ExpectBody:   `"message":"request unauthorized"`,
		}),
	)
})
