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
package plugin

import (
	"net/http"

	"github.com/onsi/ginkgo"
	"github.com/onsi/ginkgo/extensions/table"

	"e2enew/base"
)

var _ = ginkgo.Describe("Plugin Basic", func() {
	table.DescribeTable("test plugin basic", func(testCase base.HttpTestCase) {
		base.RunTestCase(testCase)
	},
		table.Entry("get all plugins", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/plugins",
			Query:        "all=true",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			ExpectBody:   []string{"request-id", "syslog", "echo", "proxy-mirror"},
			Sleep:        base.SleepTime,
		}),
		table.Entry("get all plugins", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/plugins",
			Query:        "all=false",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			ExpectBody:   []string{"request-id", "syslog", "echo", "proxy-mirror"},
			Sleep:        base.SleepTime,
		}),
	)

	table.DescribeTable("test schema basic", func(testCase base.HttpTestCase) {
		base.RunTestCase(testCase)
	},
		table.Entry("get consumer schema", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/schema/plugins/jwt-auth",
			Query:        "schema_type=consumer",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			ExpectBody: "{\"dependencies\":{\"algorithm\":{\"oneOf\":[{\"properties\":{\"algorithm\":" +
				"{\"default\":\"HS256\",\"enum\":[\"HS256\",\"HS512\"]}}},{\"properties\":{\"algorithm\":" +
				"{\"enum\":[\"RS256\"]},\"private_key\":{\"type\":\"string\"},\"public_key\":{\"type\":\"string\"}}," +
				"\"required\":[\"private_key\",\"public_key\"]}]}},\"properties\":{\"algorithm\":{\"default\":" +
				"\"HS256\",\"enum\":[\"HS256\",\"HS512\",\"RS256\"],\"type\":\"string\"},\"base64_secret\"" +
				":{\"default\":false,\"type\":\"boolean\"},\"exp\":{\"default\":86400,\"minimum\":1,\"type\":" +
				"\"integer\"},\"key\":{\"type\":\"string\"},\"secret\":{\"type\":\"string\"}}," +
				"\"required\":[\"key\"],\"type\":\"object\"}",
			Sleep: base.SleepTime,
		}),
		table.Entry("get require-id plugin", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/schema/plugins/jwt-auth",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "{\"$comment\":\"this is a mark for our injected plugin schema\",\"additionalProperties\":false,\"properties\":{\"disable\":{\"type\":\"boolean\"}},\"type\":\"object\"}",
			Sleep:        base.SleepTime,
		}),
	)
})
