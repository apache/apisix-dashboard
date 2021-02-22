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
	"encoding/json"
	"io/ioutil"
	"net/http"
	"path/filepath"

	"github.com/onsi/ginkgo"
	"github.com/onsi/ginkgo/extensions/table"
	"github.com/stretchr/testify/assert"
	"github.com/tidwall/gjson"

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
				"online_debug_method":           "GET",
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
				"online_debug_method":           "GET",
				"Content-Type":                  "multipart/form-data",
				"online_debug_header_params":    `{"test":["test1"]}`,
			},
			ExpectStatus: http.StatusOK,
			ExpectBody:   `"data":{"code":200,"message":"200 OK","data":"hello world`,
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
				"online_debug_method":           "GET",
				"Content-Type":                  "multipart/form-data",
				"online_debug_header_params":    `{"test":["test1"],"version":["v2"]}`,
			},
			ExpectStatus: http.StatusOK,
			ExpectBody:   `"data":{"code":200,"message":"200 OK","data":"hello world`,
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
				"online_debug_method":           http.MethodPost,
				"Content-Type":                  "application/json",
				"online_debug_header_params":    `{"test":["test1"]}`,
			},
			ExpectStatus: http.StatusOK,
			ExpectBody:   `"data":{"code":200,"message":"200 OK","data":"hello world`,
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
			ExpectBody:   `"data":{"code":200,"message":"200 OK","data":"hello world`,
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
		table.Entry("online debug with key-auth", base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Method: http.MethodPost,
			Path:   "/apisix/admin/debug-request-forwarding",
			Headers: map[string]string{
				"Authorization":                 base.GetToken(),
				"online_debug_url":              base.APISIXInternalUrl + `/hello`,
				"online_debug_request_protocol": "http",
				"online_debug_method":           "GET",
				"Content-Type":                  "multipart/form-data",
				"online_debug_header_params":    `{"test":["test1"],"apikey":["user-key"]}`,
			},
			ExpectStatus: http.StatusOK,
			ExpectBody:   `"data":{"code":200,"message":"200 OK","data":"hello world`,
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

var _ = ginkgo.Describe("Route_Online_Debug_Route_With_JWT_Auth", func() {
	ginkgo.It("hit route that not exist", func() {
		base.RunTestCase(base.HttpTestCase{
			Object:       base.APISIXExpect(),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   "{\"error_msg\":\"404 Route Not Found\"}\n",
		})
	})
	ginkgo.It("create route enable jwt-auth plugin", func() {
		base.RunTestCase(base.HttpTestCase{
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
					"host": "172.16.238.20",
					"port": 1980,
					"weight": 1
				}]
			}
		}`,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			Sleep:        base.SleepTime,
		})
	})
	ginkgo.It("make sure the consumer is not created", func() {
		base.RunTestCase(base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/consumers/jack",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusNotFound,
		})
	})
	ginkgo.It("create consumer", func() {
		base.RunTestCase(base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Method: http.MethodPut,
			Path:   "/apisix/admin/consumers",
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
		})
	})
	ginkgo.It("online debug with JWT-auth", func() {
		t := ginkgo.GinkgoT()
		jsonStr := `{"test":["test1"]}`
		var _headerParams map[string]interface{}
		err := json.Unmarshal([]byte(jsonStr), &_headerParams)
		assert.Nil(t, err)
		jwtToken := base.GetJwtToken("user-key")
		l := []string{jwtToken}
		_headerParams["Authorization"] = l
		headerParams, err := json.Marshal(_headerParams)
		assert.Nil(t, err)
		base.RunTestCase(base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Method: http.MethodPost,
			Path:   "/apisix/admin/debug-request-forwarding",
			Headers: map[string]string{
				"Authorization":                 base.GetToken(),
				"online_debug_url":              base.APISIXInternalUrl + `/hello`,
				"online_debug_request_protocol": "http",
				"online_debug_method":           "GET",
				"Content-Type":                  "multipart/form-data",
				"online_debug_header_params":    string(headerParams),
			},
			ExpectStatus: http.StatusOK,
			ExpectBody:   `"data":{"code":200,"message":"200 OK","data":"hello world`,
		})
	})
	ginkgo.It("online debug without JWT-auth", func() {
		base.RunTestCase(base.HttpTestCase{
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
			ExpectBody:   `"data":{"code":401,"message":"401 Unauthorized","data":{"message":"Missing JWT token in request"}}`,
		})
	})
	ginkgo.It("delete the route just created", func() {
		base.RunTestCase(base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/r1",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		})
	})
	ginkgo.It("hit the route just deleted", func() {
		base.RunTestCase(base.HttpTestCase{
			Object:       base.APISIXExpect(),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   "{\"error_msg\":\"404 Route Not Found\"}\n",
			Sleep:        base.SleepTime,
		})
	})
	ginkgo.It("delete consumer", func() {
		base.RunTestCase(base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/consumers/jack",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		})
	})
})

var _ = ginkgo.Describe("Route_Online_Debug_Route_With_Files", func() {
	ginkgo.It("hit route that not exist", func() {
		base.RunTestCase(base.HttpTestCase{
			Object:       base.APISIXExpect(),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   "{\"error_msg\":\"404 Route Not Found\"}\n",
		})
	})
	ginkgo.It("create route enable basic-auth plugin", func() {
		base.RunTestCase(base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Method: http.MethodPut,
			Path:   "/apisix/admin/routes/r2",
			Body: `{
				"uri": "/hello_",
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
		})
	})
	ginkgo.It("online debug with file", func() {
		t := ginkgo.GinkgoT()
		path, err := filepath.Abs("../../testdata/import/default.yaml")
		assert.Nil(t, err)
		files := []base.UploadFile{
			{Name: "file", Filepath: path},
		}

		headers := map[string]string{}

		jsonStr := `{"test":["test1"]}`
		var _headerParams map[string]interface{}
		err = json.Unmarshal([]byte(jsonStr), &_headerParams)
		assert.Nil(t, err)
		l := []string{base.GetToken()}
		_headerParams["Authorization"] = l
		headerParams, err := json.Marshal(_headerParams)
		assert.Nil(t, err)

		basePath := "http://127.0.0.1:9000/apisix/admin/debug-request-forwarding"
		requestBody, requestContentType := base.GetReader(headers, "multipart/form-data", files)
		httpRequest, err := http.NewRequest(http.MethodPost, basePath, requestBody)
		assert.Nil(t, err)
		httpRequest.Header.Add("Content-Type", requestContentType)
		httpRequest.Header.Add("Authorization", base.GetToken())
		httpRequest.Header.Add("online_debug_request_protocol", "http")
		httpRequest.Header.Add("online_debug_url", base.ManagerAPIHost+`/apisix/admin/import/routes`)
		httpRequest.Header.Add("online_debug_method", http.MethodPost)
		httpRequest.Header.Add("online_debug_header_params", string(headerParams))
		client := &http.Client{}
		resp, err := client.Do(httpRequest)
		assert.Nil(t, err)

		defer resp.Body.Close()

		respBody, err := ioutil.ReadAll(resp.Body)
		assert.Nil(t, err)
		realBody := gjson.Get(string(respBody), "data")
		// todo get successful result and compare
		assert.Contains(t, realBody.String(), `"data":{"paths":1,"routes":1}`)
	})

	ginkgo.It("verify the route just imported and delete data", func() {
		t := ginkgo.GinkgoT()
		request, _ := http.NewRequest("GET", base.ManagerAPIHost+"/apisix/admin/routes", nil)
		request.Header.Add("Authorization", base.GetToken())
		resp, err := http.DefaultClient.Do(request)
		assert.Nil(t, err)
		defer resp.Body.Close()
		respBody, _ := ioutil.ReadAll(resp.Body)
		list := gjson.Get(string(respBody), "data.rows").Value().([]interface{})

		var tests []base.HttpTestCase
		for _, item := range list {
			route := item.(map[string]interface{})
			tc := base.HttpTestCase{
				Desc:         "route patch for update status(online)",
				Object:       base.ManagerApiExpect(),
				Method:       http.MethodPatch,
				Path:         "/apisix/admin/routes/" + route["id"].(string),
				Body:         `{"status":1}`,
				Headers:      map[string]string{"Authorization": base.GetToken()},
				ExpectStatus: http.StatusOK,
				Sleep:        base.SleepTime,
			}
			tests = append(tests, tc)
		}

		// verify route
		tests = append(tests, base.HttpTestCase{
			Desc:         "verify the route just imported",
			Object:       base.APISIXExpect(),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusOK,
			ExpectBody:   "hello world",
			Sleep:        base.SleepTime,
		})

		// delete test data
		for _, item := range list {
			route := item.(map[string]interface{})
			tc := base.HttpTestCase{
				Desc:         "delete route",
				Object:       base.ManagerApiExpect(),
				Method:       http.MethodDelete,
				Path:         "/apisix/admin/routes/" + route["id"].(string),
				Headers:      map[string]string{"Authorization": base.GetToken()},
				ExpectStatus: http.StatusOK,
			}
			tests = append(tests, tc)
		}

		for _, tc := range tests {
			base.RunTestCase(tc)
		}

	})

	ginkgo.It("hit the route just deleted", func() {
		base.RunTestCase(base.HttpTestCase{
			Object:       base.APISIXExpect(),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   "{\"error_msg\":\"404 Route Not Found\"}\n",
			Sleep:        base.SleepTime,
		})
	})

	ginkgo.It("hit the route just deleted", func() {
		base.RunTestCase(base.HttpTestCase{
			Object:       base.APISIXExpect(),
			Method:       http.MethodGet,
			Path:         "/hello_",
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   "{\"error_msg\":\"404 Route Not Found\"}\n",
			Sleep:        base.SleepTime,
		})
	})
})
