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
package version

import (
	"fmt"
	"net/http"

	"github.com/onsi/ginkgo"
	"github.com/onsi/ginkgo/extensions/table"

	"github.com/apisix/manager-api/test/e2enew/base"
)

var _ = ginkgo.Describe("Version", func() {
	table.DescribeTable("version test",
		func(tc base.HttpTestCase) {
			base.RunTestCase(tc)
		},
		table.Entry("get version", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/tool/version",
			ExpectStatus: http.StatusOK,
			ExpectBody:   []string{"commit_hash", "\"version\""},
		}),
		table.Entry("check version matched (not matched)", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/tool/version_match",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			ExpectBody: []string{"\"code\":2000001",
				fmt.Sprintf("\"message\":\"The manager-api and apache apisix are mismatched. The version "+
					"of Dashboard is %s and should be used with APISIX %s\"", "version1", "version2"),
				"\"matched\":false", "apisix_server1", "apisix_server2"},
		}),
	)
})
