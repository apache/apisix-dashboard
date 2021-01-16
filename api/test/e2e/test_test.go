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
package e2e

import (
        "net/http"

        . "github.com/onsi/ginkgo"
        . "github.com/onsi/ginkgo/extensions/table"
)

var t = GinkgoT()
var _ = Describe("Type()", func() {

        DescribeTable("should always return `portOrRange`",
                func(tc HttpTestCase) {
                        testCaseCheck(tc)
                },
                Entry("create upstream (roundrobin with same weight)", HttpTestCase{
                        Desc:   "create upstream (roundrobin with same weight)",
                        Object: ManagerApiExpect(t),
                        Method: http.MethodPut,
                        Path:   "/apisix/admin/upstreams/1",
                        Body: `{
				"nodes": [{
					"host": "172.16.238.20",
					"port": 1980,
					"weight": 1
				},
				{
					"host": "172.16.238.20",
					"port": 1981,
					"weight": 1
				},
				{
					"host": "172.16.238.20",
					"port": 1982,
					"weight": 1
				}],
				"type": "roundrobin"
			}`,
                        Headers:      map[string]string{"Authorization": getToken()},
                        ExpectStatus: http.StatusUnauthorized,
                }),
                Entry("8080", HttpTestCase{
                        Desc:   "create route using the upstream just created",
                        Object: ManagerApiExpect(t),
                        Method: http.MethodPut,
                        Path:   "/apisix/admin/routes/1",
                        Body: `{
				"uri": "/server_port",
				"upstream_id": "1"
			}`,
                        Headers:      map[string]string{"Authorization": getToken()},
                        ExpectStatus: http.StatusOK,
                        Sleep:        sleepTime,
                }),
        )
})
