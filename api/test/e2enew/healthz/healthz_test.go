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
package healthz

import (
	"net/http"

	"github.com/onsi/ginkgo"

	"github.com/apisix/manager-api/test/e2enew/base"
)

var _ = ginkgo.Describe("Healthy check", func() {
	ginkgo.It("ping manager-api", func() {
		base.RunTestCase(base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodGet,
			Path:         "/ping",
			ExpectStatus: http.StatusOK,
			ExpectBody:   "pong",
			Sleep:        base.SleepTime,
		})
	})
})
