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
package cache_verify

import (
	"github.com/apisix/manager-api/test/e2enew/base"
	"github.com/onsi/ginkgo"
	"github.com/onsi/ginkgo/extensions/table"
	"net/http"
)

var _ = ginkgo.Describe("Cache verify", func() {
	table.DescribeTable("cache verify test",
		func(tc base.HttpTestCase) {
			base.RunTestCase(tc)
		},
		table.Entry("get cache verify", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/cache_verify",
			ExpectStatus: http.StatusOK,
			ExpectBody: []string{"inconsistent_consumers", "inconsistent_routes", "inconsistent_services",
				"inconsistent_ssls", "inconsistent_upstreams", "inconsistent_scripts", "inconsistent_global_plugins",
				"inconsistent_plugin_configs", "inconsistent_server_infos"},
			Headers: map[string]string{"Authorization": base.GetToken()},
		}),
	)
})
