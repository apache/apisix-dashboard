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
package oidc_test

import (
	"fmt"
	"net/http"

	"github.com/onsi/ginkgo"
	"github.com/onsi/ginkgo/extensions/table"

	"github.com/apisix/manager-api/test/e2e/base"
)

var _ = ginkgo.Describe("Oidc", func() {

	table.DescribeTable("test oidc module",
		func(tc base.HttpTestCase) {
			base.RunTestCase(tc)
		},

		// apisix/admin/oidc/login
		table.Entry("Access the oidc/login", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/oidc/login",
			ExpectStatus: http.StatusOK,
		}),

		// apisix/admin/oidc/callback
		table.Entry("Access with invalid state", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/oidc/callback",
			Query:        fmt.Sprintf("code=%s&state=%s", base.OidcCode, "invalid_state"),
			ExpectStatus: http.StatusForbidden,
		}),
		table.Entry("Access with invalid authentication code, failed to fetch token", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/oidc/callback",
			Query:        fmt.Sprintf("code=%s&state=%s", "invalid_code", base.OidcState),
			ExpectStatus: http.StatusForbidden,
		}),
		table.Entry("Access with valid authentication code, succeed to fetch user's id", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/oidc/callback",
			Query:        fmt.Sprintf("code=%s&state=%s", base.OidcCode, base.OidcState),
			ExpectStatus: http.StatusOK,
		}),

		// apisix/admin/oidc/logout
		table.Entry("oidc logout", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/oidc/logout",
			ExpectStatus: http.StatusOK,
		}),
	)
})
