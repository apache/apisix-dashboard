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
package common

import (
	"fmt"
	"net/http"

	"github.com/onsi/ginkgo"
	"github.com/onsi/ginkgo/extensions/table"


	"e2enew/base"
)

var _ = ginkgo.Describe("JSON Schema", func() {
	ginkgo.JustAfterEach(func() {
		if ginkgo.CurrentGinkgoTestDescription().Failed {
			fmt.Println("routes: ", base.GetResourceList("routes"))
		}
	})

	table.DescribeTable("test json schema validate",
		func(tc base.HttpTestCase) {
			base.RunTestCase(tc)
		},
		table.Entry("config route with non-existent fields", base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Path:   "/apisix/admin/routes/r1",
			Method: http.MethodPut,
			Body: `{
                                "uri": "/hello",
                                "nonexistent": "test non-existent",
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
			ExpectBody:   `{"code":10000,"message":"schema validate failed: (root): Additional property nonexistent is not allowed"}`,
		}),
		table.Entry("make sure the route create failed", base.HttpTestCase{
			Object:       base.APISIXExpect(),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusNotFound,
			Sleep:        base.SleepTime,
		}),
	)
})
