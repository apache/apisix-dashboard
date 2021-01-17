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
package route

import (
	"net/http"
	"time"

	"github.com/onsi/ginkgo"
	"github.com/onsi/ginkgo/extensions/table"
	"github.com/stretchr/testify/assert"
	"github.com/tidwall/gjson"

	"e2enew/base"
)

var _ = ginkgo.Describe("Online Debug", func() {
	table.DescribeTable("test online debug(route not exists)",
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
	)

	ginkgo.It("debug route not exists", func() {
		time.Sleep(base.SleepTime)

		url := base.ManagerAPIHost + "/apisix/admin/debug-request-forwarding"
		headers := map[string]string{
			"Authorization": base.GetToken(),
		}
		reqBody := `{"url": "` + base.APISIXInternalUrl + `/hello_","method": "GET","request_protocol": "http"}`
		respBody, _, err := base.HttpPost(url, headers, reqBody)
		realBody := gjson.Get(string(respBody), "data")

		assert.Equal(ginkgo.GinkgoT(), `{"code":404,"message":"404 Not Found","data":{"error_msg":"404 Route Not Found"}}`, realBody.String())
		assert.Nil(ginkgo.GinkgoT(), err)
	})

})

var _ = ginkgo.Describe("Online Debug", func() {
	table.DescribeTable("test online debug with query params",
		func(tc base.HttpTestCase) {
			base.RunTestCase(tc)
		},
		table.Entry("hit route that not exist", base.HttpTestCase{
			Object:       base.APISIXExpect(),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   "{\"error_msg\":\"404 Route Not Found\"}\n",
			Sleep:        base.SleepTime,
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
						"host": "` + base.UpstreamIp + `",
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
			Body: `{
				"url": "` + base.APISIXInternalUrl + `/hello?name=aaa",
				"request_protocol": "http",
				"method": "GET"
			}`,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			Sleep:        base.SleepTime,
		}),
		table.Entry("delete route", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/r1",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		}),
		table.Entry("verify the deleted route", base.HttpTestCase{
			Object:       base.APISIXExpect(),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   `{"error_msg":"404 Route Not Found"}`,
			Sleep:        base.SleepTime,
		}),
	)
})

var _ = ginkgo.Describe("Online Debug", func() {
	table.DescribeTable("test online debug with header params",
		func(tc base.HttpTestCase) {
			base.RunTestCase(tc)
		},
		table.Entry("make sure the route is not created", base.HttpTestCase{
			Object:       base.APISIXExpect(),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   `{"error_msg":"404 Route Not Found"}`,
			Sleep:        base.SleepTime,
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
						"host": "` + base.UpstreamIp + `",
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
			Body: `{
				"url": "` + base.APISIXInternalUrl + `/hello",
				"request_protocol": "http",
				"method": "GET",
				"header_params": {
					"version": ["v2"]
				}
			}`,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		}),
		table.Entry("delete route", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/r1",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		}),
		table.Entry("verify the deleted route", base.HttpTestCase{
			Object:       base.APISIXExpect(),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   `{"error_msg":"404 Route Not Found"}`,
			Sleep:        base.SleepTime,
		}),
	)
})

var _ = ginkgo.Describe("Online Debug", func() {
	table.DescribeTable("test online debug with body params",
		func(tc base.HttpTestCase) {
			base.RunTestCase(tc)
		},
		table.Entry("make sure the route is not created", base.HttpTestCase{
			Object:       base.APISIXExpect(),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   `{"error_msg":"404 Route Not Found"}`,
			Sleep:        base.SleepTime,
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
						"host": "` + base.UpstreamIp + `",
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
				"url": "` + base.APISIXInternalUrl + `/hello",
				"request_protocol": "http",
				"method": "POST",
				"body_params": "{\"name\":\"test\",\"desc\":\"online debug route with body params\"}"
			}`,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		}),
		table.Entry("delete route", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/r1",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		}),
		table.Entry("verify the deleted route", base.HttpTestCase{
			Object:       base.APISIXExpect(),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   `{"error_msg":"404 Route Not Found"}`,
			Sleep:        base.SleepTime,
		}),
	)
})

var _ = ginkgo.Describe("Online Debug", func() {
	table.DescribeTable("test online debug with basic auth",
		func(tc base.HttpTestCase) {
			base.RunTestCase(tc)
		},
		table.Entry("make sure the route is not created", base.HttpTestCase{
			Object:       base.APISIXExpect(),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   `{"error_msg":"404 Route Not Found"}`,
			Sleep:        base.SleepTime,
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
						"host": "` + base.UpstreamIp + `",
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
			Path:   "/apisix/admin/consumers",
			Method: http.MethodPut,
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
		table.Entry("online debug route with username and password", base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Method: http.MethodPost,
			Path:   "/apisix/admin/debug-request-forwarding",
			Body: `{
				"url": "` + base.APISIXInternalUrl + `/hello",
				"request_protocol": "http",
				"method": "GET",
				"header_params": {
					"Authorization": ["Basic amFjazoxMjM0NTYKIA=="]
				}
			}`,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		}),
		table.Entry("online debug without basic-auth", base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Method: http.MethodPost,
			Path:   "/apisix/admin/debug-request-forwarding",
			Body: `{
				"url": "` + base.APISIXInternalUrl + `/hello",
				"request_protocol": "http",
				"method": "GET"
			}`,
			Headers:    map[string]string{"Authorization": base.GetToken()},
			ExpectBody: `{"code":401,"message":"401 Unauthorized","data":{"message":"Missing authorization in request"}}`,
		}),
		table.Entry("delete consumer", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/consumers/jack",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		}),
		table.Entry("verify route with the jwt token from just deleted consumer", base.HttpTestCase{
			Object:       base.APISIXExpect(),
			Method:       http.MethodGet,
			Path:         "/hello",
			Headers:      map[string]string{"Authorization": "Basic amFjazoxMjM0NTYKIA=="},
			ExpectStatus: http.StatusUnauthorized,
			ExpectBody:   `{"message":"Missing related consumer"}`,
			Sleep:        base.SleepTime,
		}),
		table.Entry("delete route", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/r1",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		}),
		table.Entry("verify the deleted route", base.HttpTestCase{
			Object:       base.APISIXExpect(),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   `{"error_msg":"404 Route Not Found"}`,
			Sleep:        base.SleepTime,
		}),
	)
})

var _ = ginkgo.Describe("Online Debug", func() {
	table.DescribeTable("test online debug with jwt auth",
		func(tc base.HttpTestCase) {
			base.RunTestCase(tc)
		},
		table.Entry("make sure the route is not created", base.HttpTestCase{
			Object:       base.APISIXExpect(),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   `{"error_msg":"404 Route Not Found"}`,
			Sleep:        base.SleepTime,
		}),
		table.Entry("create route enable jwt-auth plugin", base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Method: http.MethodPut,
			Path:   "/apisix/admin/routes/r1",
			Body: `{
				"uri": "/hello",
				"methods": ["GET"],
				"plugins": {
					"jwt-auth": {}
				},
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
			ExpectStatus: http.StatusOK,
			Sleep:        base.SleepTime,
		}),
		table.Entry("make sure the consumer is not created", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/consumers/jack",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusNotFound,
			Sleep:        base.SleepTime,
		}),
		table.Entry("create consumer", base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Path:   "/apisix/admin/consumers",
			Method: http.MethodPut,
			Body: `{
				"username": "jack",
				"plugins": {
					"jwt-auth": {
						"key": "user-key",
						"secret": "my-secret-key",
						"algorithm": "HS256"
					}
				},
				"desc": "test description"
			}`,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		}),
		table.Entry("online debug route without jwt token", base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Method: http.MethodPost,
			Path:   "/apisix/admin/debug-request-forwarding",
			Body: `{
				"url": "` + base.APISIXInternalUrl + `/hello",
				"request_protocol": "http",
				"method": "GET"
			}`,
			Headers:    map[string]string{"Authorization": base.GetToken()},
			ExpectBody: `{"code":401,"message":"401 Unauthorized","data":{"message":"Missing JWT token in request"}}`,
		}),
	)

	ginkgo.It("online debug route with jwt token", func() {
		time.Sleep(base.SleepTime)

		url := base.ManagerAPIHost + "/apisix/admin/debug-request-forwarding"
		headers := map[string]string{
			"Authorization": base.GetToken(),
		}
		jwtToken := base.GetJwtToken("user-key")
		reqBody := `{
				"url": "` + base.APISIXInternalUrl + `/hello",
				"request_protocol": "http",
				"method": "GET",
				"header_params": {
					"Authorization": ["` + jwtToken + `"]
				}
			}`
		_, status, err := base.HttpPost(url, headers, reqBody)
		assert.Equal(ginkgo.GinkgoT(), 200, status)
		assert.Nil(ginkgo.GinkgoT(), err)

		// delete consumer
		url = base.ManagerAPIHost + "/apisix/admin/consumers/jack"
		headers = map[string]string{
			"Authorization": base.GetToken(),
		}
		_, status, err = base.HttpDelete(url, headers)
		assert.Equal(ginkgo.GinkgoT(), 200, status)
		assert.Nil(ginkgo.GinkgoT(), err)

		// verify route with the jwt token from just deleted consumer
		time.Sleep(base.SleepTime)
		url = base.APISIXHost + "/hello"
		headers = map[string]string{
			"Authorization": jwtToken,
		}
		_, status, err = base.HttpGet(url, headers)
		assert.Equal(ginkgo.GinkgoT(), http.StatusUnauthorized, status)
		assert.Nil(ginkgo.GinkgoT(), err)
	})

	table.DescribeTable("test online debug with jwt auth(clean test data)",
		func(tc base.HttpTestCase) {
			base.RunTestCase(tc)
		},
		table.Entry("delete route", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/r1",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		}),
		table.Entry("verify the deleted route", base.HttpTestCase{
			Object:       base.APISIXExpect(),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   `{"error_msg":"404 Route Not Found"}`,
			Sleep:        base.SleepTime,
		}),
	)
})

var _ = ginkgo.Describe("Online Debug", func() {
	table.DescribeTable("test online debug with key-auth",
		func(tc base.HttpTestCase) {
			base.RunTestCase(tc)
		},
		table.Entry("make sure the route is not created", base.HttpTestCase{
			Object:       base.APISIXExpect(),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   `{"error_msg":"404 Route Not Found"}`,
		}),
		table.Entry("create route enable key-auth plugin", base.HttpTestCase{
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
						"host": "` + base.UpstreamIp + `",
						"port": 1980,
						"weight": 1
					}]
				}
			}`,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
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
			Path:   "/apisix/admin/consumers",
			Method: http.MethodPut,
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
		table.Entry("online debug route with apikey", base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Method: http.MethodPost,
			Path:   "/apisix/admin/debug-request-forwarding",
			Body: `{
				"url": "` + base.APISIXInternalUrl + `/hello",
				"request_protocol": "http",
				"method": "GET",
				"header_params": {
					"apikey": ["user-key"]
				}
			}`,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		}),
		table.Entry("online debug route without apikey", base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Method: http.MethodPost,
			Path:   "/apisix/admin/debug-request-forwarding",
			Body: `{
				"url": "` + base.APISIXInternalUrl + `/hello",
				"request_protocol": "http",
				"method": "GET"
			}`,
			Headers:    map[string]string{"Authorization": base.GetToken()},
			ExpectBody: `{"code":401,"message":"401 Unauthorized","data":{"message":"Missing API key found in request"}}`,
		}),
		table.Entry("delete consumer", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/consumers/jack",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		}),
		table.Entry("verify route with the jwt token from just deleted consumer", base.HttpTestCase{
			Object:       base.APISIXExpect(),
			Method:       http.MethodGet,
			Path:         "/hello",
			Headers:      map[string]string{"apikey": "user-key"},
			ExpectStatus: http.StatusUnauthorized,
			ExpectBody:   `{"message":"Missing related consumer"}`,
			Sleep:        base.SleepTime,
		}),
		table.Entry("delete route", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/r1",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		}),
		table.Entry("verify the deleted route", base.HttpTestCase{
			Object:       base.APISIXExpect(),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   `{"error_msg":"404 Route Not Found"}`,
			Sleep:        base.SleepTime,
		}),
	)
})

var _ = ginkgo.Describe("Online Debug", func() {
	table.DescribeTable("test online debug with query params key-auth",
		func(tc base.HttpTestCase) {
			base.RunTestCase(tc)
		},
		table.Entry("make sure the route is not created", base.HttpTestCase{
			Object:       base.APISIXExpect(),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   `{"error_msg":"404 Route Not Found"}`,
		}),
		table.Entry("create route enable key-auth plugin", base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Method: http.MethodPut,
			Path:   "/apisix/admin/routes/r1",
			Body: `{
				"uri": "/hello",
				"methods": ["GET"],
				"vars": [
					["arg_name","==","aaa"]
				],
				"plugins": {
					"key-auth": {}
				},
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
			ExpectStatus: http.StatusOK,
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
			Path:   "/apisix/admin/consumers",
			Method: http.MethodPut,
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
		table.Entry("online debug route with apikey", base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Method: http.MethodPost,
			Path:   "/apisix/admin/debug-request-forwarding",
			Body: `{
				"url": "` + base.APISIXInternalUrl + `/hello?name=aaa",
				"request_protocol": "http",
				"method": "GET",
				"header_params": {
					"apikey": ["user-key"]
				}
			}`,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		}),
		table.Entry("online debug route without apikey", base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Method: http.MethodPost,
			Path:   "/apisix/admin/debug-request-forwarding",
			Body: `{
				"url": "` + base.APISIXInternalUrl + `/hello?name=aaa",
				"request_protocol": "http",
				"method": "GET"
			}`,
			Headers:    map[string]string{"Authorization": base.GetToken()},
			ExpectBody: `{"code":401,"message":"401 Unauthorized","data":{"message":"Missing API key found in request"}}`,
		}),
		table.Entry("delete consumer", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/consumers/jack",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		}),
		table.Entry("verify route with the jwt token from just deleted consumer", base.HttpTestCase{
			Object:       base.APISIXExpect(),
			Method:       http.MethodGet,
			Path:         `/hello`,
			Query:        "name=aaa",
			Headers:      map[string]string{"apikey": "user-key"},
			ExpectStatus: http.StatusUnauthorized,
			ExpectBody:   `{"message":"Missing related consumer"}`,
			Sleep:        base.SleepTime,
		}),
		table.Entry("delete route", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/r1",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		}),
		table.Entry("verify the deleted route", base.HttpTestCase{
			Object:       base.APISIXExpect(),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   `{"error_msg":"404 Route Not Found"}`,
			Sleep:        base.SleepTime,
		}),
	)
})
