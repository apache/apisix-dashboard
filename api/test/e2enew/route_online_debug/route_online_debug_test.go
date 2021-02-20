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
package route_online_debug

import (
	"net/http"

	"github.com/onsi/ginkgo"
	"github.com/onsi/ginkgo/extensions/table"

	"e2enew/base"
)

var _ = ginkgo.Describe("Route_Online_Debug", func() {
	table.DescribeTable("Route_Online_Debug_Route_Not_Exist",
		func(tc base.HttpTestCase) {
			base.RunTestCase(tc)
		},
		table.Entry("hit route that not exist", base.HttpTestCase{
			Object:       base.APISIXExpect(),
			Method:       http.MethodGet,
			Path:         "/hello_",
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   "{\"error_msg\":\"404 Route Not Found\"}\n",
		}),
		table.Entry("online debug route with query params", base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Method: http.MethodPost,
			Path:   "/apisix/admin/debug-request-forwarding",
			Headers: map[string]string{
				"Authorization":                 base.GetToken(),
				"online_debug_url":              base.APISIXInternalUrl + `/hello_`,
				"online_debug_request_protocol": "http",
				"online_debug_method":           "POST",
				"Content-Type":                  "multipart/form-data",
				"online_debug_header_params":    `{"test":["test1"]}`,
			},
			ExpectStatus: http.StatusOK,
			ExpectBody:   `{"code":404,"message":"404 Not Found","data":{"error_msg":"404 Route Not Found"}}`,
			Sleep:        base.SleepTime,
		}),
	)

	table.DescribeTable("Route_Online_Debug_Route_With_Query_Params",
		func(tc base.HttpTestCase) {
			base.RunTestCase(tc)
		},
		table.Entry("hit route that not exist", base.HttpTestCase{
			Object:       base.APISIXExpect(),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   "{\"error_msg\":\"404 Route Not Found\"}\n",
		}),
		table.Entry("create route with query params", base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Method: http.MethodPut,
			Path:   "/apisix/admin/routes/r1",
			Body: `{
				"uri": "/hello",
				"methods": ["GET"],
				"vars": [
					["arg_name","==","aaa"]
				],
				"upstream": {
					"type": "roundrobin",
					"nodes": [{
						"host": "172.16.238.20",
						"port": 1980,
						"weight": 1
					}]
				}
			}`,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		}),
		table.Entry("online debug route with query params", base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Method: http.MethodPost,
			Path:   "/apisix/admin/debug-request-forwarding",
			Headers: map[string]string{
				"Authorization":                 base.GetToken(),
				"online_debug_url":              base.APISIXInternalUrl + `/hello?name=aaa`,
				"online_debug_request_protocol": "http",
				"online_debug_method":           "POST",
				"Content-Type":                  "multipart/form-data",
				"online_debug_header_params":    `{"test":["test1"]}`,
			},
			ExpectStatus: http.StatusOK,
			Sleep:        base.SleepTime,
		}),
		table.Entry("delete the route just created", base.HttpTestCase{
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
			ExpectBody:   "{\"error_msg\":\"404 Route Not Found\"}\n",
			Sleep:        base.SleepTime,
		}),
	)

	table.DescribeTable("Route_Online_Debug_Route_With_Header_Params",
		func(tc base.HttpTestCase) {
			base.RunTestCase(tc)
		},

		table.Entry("hit route that not exist", base.HttpTestCase{
			Object:       base.APISIXExpect(),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   "{\"error_msg\":\"404 Route Not Found\"}\n",
		}),
		table.Entry("create route with header params", base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Method: http.MethodPut,
			Path:   "/apisix/admin/routes/r1",
			Body: `{
				"uri": "/hello",
				"methods": ["GET"],
				"vars": [
					["http_version","==","v2"]
				],
				"upstream": {
					"type": "roundrobin",
					"nodes": [{
						"host": "172.16.238.20",
						"port": 1980,
						"weight": 1
					}]
				}
			}`,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			Sleep:        base.SleepTime,
		}),
		table.Entry("online debug route with header params", base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Method: http.MethodPost,
			Path:   "/apisix/admin/debug-request-forwarding",
			Headers: map[string]string{
				"Authorization":                 base.GetToken(),
				"online_debug_url":              base.APISIXInternalUrl + `/hello`,
				"online_debug_request_protocol": "http",
				"online_debug_method":           "POST",
				"Content-Type":                  "multipart/form-data",
				"online_debug_header_params":    `{"test":["test1"]}`,
				"version":                       "v2",
			},
			ExpectStatus: http.StatusOK,
			Sleep:        base.SleepTime,
		}),
		table.Entry("delete the route just created", base.HttpTestCase{
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
			ExpectBody:   "{\"error_msg\":\"404 Route Not Found\"}\n",
			Sleep:        base.SleepTime,
		}),
	)

	table.DescribeTable("Route_Online_Debug_Route_With_Body_Params",
		func(tc base.HttpTestCase) {
			base.RunTestCase(tc)
		},

		table.Entry("hit route that not exist", base.HttpTestCase{
			Object:       base.APISIXExpect(),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   "{\"error_msg\":\"404 Route Not Found\"}\n",
		}),
		table.Entry("create route with method POST", base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Method: http.MethodPut,
			Path:   "/apisix/admin/routes/r1",
			Body: `{
			"uri": "/hello",
			"methods": ["POST"],
			"upstream": {
				"type": "roundrobin",
				"nodes": [{
					"host": "172.16.238.20",
					"port": 1980,
					"weight": 1
				}]
			}
		}`,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			Sleep:        base.SleepTime,
		}),
		table.Entry("online debug route with body params", base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Method: http.MethodPost,
			Path:   "/apisix/admin/debug-request-forwarding",
			Body: `{
				"name": "test",
				"desc": "online debug route with body params"
			}`,
			Headers: map[string]string{
				"Authorization":                 base.GetToken(),
				"online_debug_url":              base.APISIXInternalUrl + `/hello`,
				"online_debug_request_protocol": "http",
				"online_debug_method":           "POST",
				"Content-Type":                  "multipart/form-data",
				"online_debug_header_params":    `{"test":["test1"]}`,
			},
			ExpectStatus: http.StatusOK,
			Sleep:        base.SleepTime,
		}),
		table.Entry("delete the route just created", base.HttpTestCase{
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
			ExpectBody:   "{\"error_msg\":\"404 Route Not Found\"}\n",
			Sleep:        base.SleepTime,
		}),
	)

	table.DescribeTable("Route_Online_Debug_Route_With_Basic_Auth",
		func(tc base.HttpTestCase) {
			base.RunTestCase(tc)
		},

		table.Entry("hit route that not exist", base.HttpTestCase{
			Object:       base.APISIXExpect(),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   "{\"error_msg\":\"404 Route Not Found\"}\n",
		}),
		table.Entry("create route enable basic-auth plugin", base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Method: http.MethodPut,
			Path:   "/apisix/admin/routes/r1",
			Body: `{
				"uri": "/hello",
				"methods": ["GET"],
				"plugins": {
					"basic-auth": {}
				},
				"upstream": {
					"type": "roundrobin",
					"nodes": [{
						"host": "172.16.238.20",
						"port": 1980,
						"weight": 1
					}]
				}
			}`,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			Sleep:        base.SleepTime,
		}),
		table.Entry("make sure the consumer is not created", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/consumers/jack",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusNotFound,
		}),
		table.Entry("create consumer", base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Method: http.MethodPut,
			Path:   "/apisix/admin/consumers",
			Body: `{
				"username": "jack",
				"plugins": {
					"basic-auth": {
						"disable": false,
						"username": "jack",
						"password": "123456"
					}
				},
				"desc": "test description"
			}`,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			Sleep:        base.SleepTime,
		}),
		table.Entry("online debug with basic-auth", base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Method: http.MethodPost,
			Path:   "/apisix/admin/debug-request-forwarding",
			Headers: map[string]string{
				"Authorization":                 base.GetToken(),
				"online_debug_url":              base.APISIXInternalUrl + `/hello`,
				"online_debug_request_protocol": "http",
				"online_debug_method":           "GET",
				"Content-Type":                  "multipart/form-data",
				"online_debug_header_params":    `{"test":["test1"],"Authorization": ["Basic amFjazoxMjM0NTYKIA=="]}`,
			},
			ExpectStatus: http.StatusOK,
		}),
		table.Entry("online debug without basic-auth", base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Method: http.MethodPost,
			Path:   "/apisix/admin/debug-request-forwarding",
			Headers: map[string]string{
				"Authorization":                 base.GetToken(),
				"online_debug_url":              base.APISIXInternalUrl + `/hello`,
				"online_debug_request_protocol": "http",
				"online_debug_method":           "GET",
				"Content-Type":                  "multipart/form-data",
				"online_debug_header_params":    `{"test":["test1"]}`,
			},
			ExpectStatus: http.StatusOK,
			ExpectBody:   `{"code":401,"message":"401 Unauthorized","data":{"message":"Missing authorization in request"}}`,
		}),
		table.Entry("delete the route just created", base.HttpTestCase{
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
			ExpectBody:   "{\"error_msg\":\"404 Route Not Found\"}\n",
			Sleep:        base.SleepTime,
		}),
		table.Entry("delete consumer", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/consumers/jack",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		}),
	)

	table.DescribeTable("Route_Online_Debug_Route_With_Key_Auth",
		func(tc base.HttpTestCase) {
			base.RunTestCase(tc)
		},

		table.Entry("hit route that not exist", base.HttpTestCase{
			Object:       base.APISIXExpect(),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   "{\"error_msg\":\"404 Route Not Found\"}\n",
		}),
		table.Entry("create route with header params", base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Method: http.MethodPut,
			Path:   "/apisix/admin/routes/r1",
			Body: `{
				"uri": "/hello",
				"methods": ["GET"],
				"plugins": {
					"key-auth": {}
				},
				"upstream": {
					"type": "roundrobin",
					"nodes": [{
						"host": "172.16.238.20",
						"port": 1980,
						"weight": 1
					}]
				}
			}`,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			Sleep:        base.SleepTime,
		}),
		table.Entry("make sure the consumer is not created", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/consumers/jack",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusNotFound,
		}),
		table.Entry("create consumer", base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Method: http.MethodPut,
			Path:   "/apisix/admin/consumers",
			Body: `{
				"username": "jack",
				"plugins": {
					"key-auth": {
						"key": "user-key"
					}
				},
				"desc": "test description"
			}`,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		}),
		table.Entry("online debug without key-auth", base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Method: http.MethodPost,
			Path:   "/apisix/admin/debug-request-forwarding",
			Headers: map[string]string{
				"Authorization":                 base.GetToken(),
				"online_debug_url":              base.APISIXInternalUrl + `/hello`,
				"online_debug_request_protocol": "http",
				"online_debug_method":           "GET",
				"Content-Type":                  "multipart/form-data",
				"online_debug_header_params":    `{"test":["test1"]}`,
			},
			ExpectStatus: http.StatusOK,
			ExpectBody:   `"data":{"code":401,"message":"401 Unauthorized","data":{"message":"Missing API key found in request"}}`,
		}),
		table.Entry("delete the route just created", base.HttpTestCase{
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
			ExpectBody:   "{\"error_msg\":\"404 Route Not Found\"}\n",
			Sleep:        base.SleepTime,
		}),
		table.Entry("delete consumer", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/consumers/jack",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		}),
	)
})

