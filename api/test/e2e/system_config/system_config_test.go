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
package system_config

import (
	"net/http"

	. "github.com/onsi/ginkgo"
	. "github.com/onsi/ginkgo/extensions/table"

	"github.com/apisix/manager-api/test/e2e/base"
)

var _ = Describe("system config", func() {
	DescribeTable("test system config data CURD",
		func(tc base.HttpTestCase) {
			base.RunTestCase(tc)
		},

		Entry("get system config should get not found error", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/system_config/grafana",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusNotFound,
		}),

		Entry("create system config should get schema validate failed error", base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Method: http.MethodPost,
			Path:   "/apisix/admin/system_config",
			Body: `{
				"config_name": "",
				"payload": {"url":"http://127.0.0.1:3000"}
			}`,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusBadRequest,
		}),

		Entry("create system config should success", base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Method: http.MethodPost,
			Path:   "/apisix/admin/system_config",
			Body: `{
				"config_name": "grafana",
				"payload": {"url":"http://127.0.0.1:3000"}
			}`,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "\"config_name\":\"grafana\",\"payload\":{\"url\":\"http://127.0.0.1:3000\"}",
		}),

		Entry("after create system config get config should succeed", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/system_config/grafana",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "\"config_name\":\"grafana\",\"payload\":{\"url\":\"http://127.0.0.1:3000\"}",
		}),

		Entry("update system config should get schema validate failed error", base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Method: http.MethodPut,
			Path:   "/apisix/admin/system_config",
			Body: `{
				"config_name": "",
				"payload": {"url":"http://127.0.0.1:2000"}
			}`,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusBadRequest,
		}),

		Entry("update system config should success", base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Method: http.MethodPut,
			Path:   "/apisix/admin/system_config",
			Body: `{
				"config_name": "grafana",
				"payload": {"url":"http://127.0.0.1:2000"}
			}`,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "\"config_name\":\"grafana\",\"payload\":{\"url\":\"http://127.0.0.1:2000\"}",
		}),

		Entry("after update system config get config should succeed", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/system_config/grafana",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "\"config_name\":\"grafana\",\"payload\":{\"url\":\"http://127.0.0.1:2000\"}",
		}),

		Entry("delete system config should success", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/system_config/grafana",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		}),

		Entry("get system config should get not found error", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/system_config/grafana",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusNotFound,
		}),
	)
})
