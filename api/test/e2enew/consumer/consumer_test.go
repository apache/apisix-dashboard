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
package consumer

import (
	"fmt"
	"net/http"
	"time"

	"github.com/onsi/ginkgo"
	"github.com/onsi/ginkgo/extensions/table"
	"github.com/stretchr/testify/assert"
	"github.com/tidwall/gjson"

	"e2enew/base"
)

var _ = ginkgo.Describe("Consumer", func() {
	table.DescribeTable("test consumer CURD",
		func(tc base.HttpTestCase) {
			base.RunTestCase(tc)
		},
		table.Entry("check consumer is not exist", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Path:         "/apisix/admin/consumers/consumer_1",
			Method:       http.MethodGet,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   "data not found",
		}),
		table.Entry("check consumer_2 is not exist", base.HttpTestCase{
			Desc:         "check consumer is not exist",
			Object:       base.ManagerApiExpect(),
			Path:         "/apisix/admin/consumers/consumer_2",
			Method:       http.MethodGet,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   "data not found",
		}),
		table.Entry("create consumer by POST method", base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Path:   "/apisix/admin/consumers",
			Method: http.MethodPost,
			Body: `{
				"username": "consumer_1",
				"plugins": {
					"limit-count": {
					"count": 2,
					"time_window": 60,
					"rejected_code": 503,
					"key": "remote_addr"
					}
				},
				"desc": "test description"
			}`,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   "404 page not found",
		}),

		table.Entry("create consumer_2 by PUT method", base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Path:   "/apisix/admin/consumers",
			Method: http.MethodPut,
			Body: `{
				"username": "consumer_2",
				"plugins": {
					"limit-count": {
					"count": 2,
					"time_window": 60,
					"rejected_code": 503,
					"key": "remote_addr"
					}
				},
				"desc": "test description"
			}`,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "\"code\":0",
		}),
		table.Entry("get consumer_2", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Path:         "/apisix/admin/consumers/consumer_2",
			Method:       http.MethodGet,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "\"username\":\"consumer_2\"",
			Sleep:        base.SleepTime,
		}),
		table.Entry("create consumer without username(should failed)", base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Path:   "/apisix/admin/consumers",
			Method: http.MethodPut,
			Body: `{
				"plugins": {
					"limit-count": {
					"count": 2,
					"time_window": 60,
					"rejected_code": 503,
					"key": "remote_addr"
					}
				},
				"desc": "test description"
			}`,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusBadRequest,
			ExpectBody:   "\"code\":10000",
		}),

		table.Entry("delete consumer_2", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Path:         "/apisix/admin/consumers/consumer_2",
			Method:       http.MethodDelete,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "\"code\":0",
		}),

		table.Entry("create consumer_3 by PUT", base.HttpTestCase{
			Desc:   "create consumer by PUT",
			Object: base.ManagerApiExpect(),
			Path:   "/apisix/admin/consumers",
			Method: http.MethodPut,
			Body: `{
				"username": "consumer_3",
				"plugins": {
					"limit-count": {
					"count": 2,
					"time_window": 60,
					"rejected_code": 503,
					"key": "remote_addr"
					}
				},
				"desc": "test description"
			}`,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "\"code\":0",
		}),

		table.Entry("update consumer_3 by PUT", base.HttpTestCase{
			Desc:   "update consumer by PUT",
			Object: base.ManagerApiExpect(),
			Path:   "/apisix/admin/consumers/consumer_3",
			Method: http.MethodPut,
			Body: `{
				"username": "consumer_3",
				"plugins": {
					"limit-count": {
					"count": 2,
					"time_window": 60,
					"rejected_code": 504,
					"key": "remote_addr"
					}
				},
				"desc": "test description"
			}`,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "\"code\":0",
		}),

		table.Entry("get consumer_3", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Path:         "/apisix/admin/consumers/consumer_3",
			Method:       http.MethodGet,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "\"rejected_code\":504",
			Sleep:        base.SleepTime,
		}),

		table.Entry("delete consumer_3", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Path:         "/apisix/admin/consumers/consumer_3",
			Method:       http.MethodDelete,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "\"code\":0",
		}),
	)

	table.DescribeTable("test consumer with plugin key-auth",
		func(tc base.HttpTestCase) {
			base.RunTestCase(tc)
		},
		table.Entry("create route with plugin key-auth", base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Method: http.MethodPut,
			Path:   "/apisix/admin/routes/r1",
			Body: `{
				"uri": "/hello",
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
		table.Entry("hit route without apikey", base.HttpTestCase{
			Object:       base.APISIXExpect(),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusUnauthorized,
			ExpectBody:   "Missing API key found in request",
			Sleep:        base.SleepTime,
		}),
		table.Entry("create consumer with plugin key-auth", base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Path:   "/apisix/admin/consumers",
			Method: http.MethodPut,
			Body: `{
				"username": "jack",
				"plugins": {
					"key-auth": {
						"key": "auth-one"
					}
				},
				"desc": "test description"
			}`,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		}),

		table.Entry("hit route with correct apikey", base.HttpTestCase{
			Object:       base.APISIXExpect(),
			Method:       http.MethodGet,
			Path:         "/hello",
			Headers:      map[string]string{"apikey": "auth-one"},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "hello world",
			Sleep:        base.SleepTime,
		}),
		table.Entry("hit route with incorrect apikey", base.HttpTestCase{
			Object:       base.APISIXExpect(),
			Method:       http.MethodGet,
			Path:         "/hello",
			Headers:      map[string]string{"apikey": "auth-new"},
			ExpectStatus: http.StatusUnauthorized,
			ExpectBody:   "Invalid API key in request",
			Sleep:        base.SleepTime,
		}),
		table.Entry("delete consumer", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/consumers/jack",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		}),

		table.Entry("delete consumer (as delete not exist consumer)", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/consumers/jack",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusNotFound,
		}),

		table.Entry("hit route (consumer deleted)", base.HttpTestCase{
			Object:       base.APISIXExpect(),
			Method:       http.MethodGet,
			Path:         "/hello",
			Headers:      map[string]string{"apikey": "auth-one"},
			ExpectStatus: http.StatusUnauthorized,
			ExpectBody:   "Missing related consumer",
			Sleep:        base.SleepTime,
		}),

		table.Entry("delete route", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/r1",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		}),
	)

	table.DescribeTable("test consumer with not exist plugin",
		func(tc base.HttpTestCase) {
			base.RunTestCase(tc)
		},
		table.Entry("create consumer with not exist plugin", base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Path:   "/apisix/admin/consumers",
			Method: http.MethodPut,
			Body: `{
				"username": "jack",
				"plugins": {
					"key-authaa": {
						"key": "auth-one"
					}
				},
				"desc": "test description"
			}`,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusBadRequest,
			ExpectBody:   "schema validate failed: schema not found, path: plugins.key-authaa",
		}),
		table.Entry("verify the consumer not created", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Path:         "/apisix/admin/consumers/jack",
			Method:       http.MethodGet,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusNotFound,
			Sleep:        base.SleepTime,
		}),
	)

	table.DescribeTable("test consumer with labels",
		func(tc base.HttpTestCase) {
			base.RunTestCase(tc)
		},
		table.Entry("create the consumer", base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Path:   "/apisix/admin/consumers",
			Method: http.MethodPut,
			Body: `{
				"username": "jack",
				"labels": {
					"build":"16",
					"env":"production",
					"version":"v2"
				},
				"plugins": {
					"key-auth": {
						"key": "auth-two"
					}
				},
				"desc": "test description"
			}`,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		}),
		table.Entry("verify the consumer", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/consumers/jack",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "\"username\":\"jack\",\"desc\":\"test description\",\"plugins\":{\"key-auth\":{\"key\":\"auth-two\"}},\"labels\":{\"build\":\"16\",\"env\":\"production\",\"version\":\"v2\"}",
			Sleep:        base.SleepTime,
		}),
		table.Entry("create the route", base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Method: http.MethodPut,
			Path:   "/apisix/admin/routes/r1",
			Body: `{
				"uri": "/hello",
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
		table.Entry("hit the route with correct apikey", base.HttpTestCase{
			Object:       base.APISIXExpect(),
			Method:       http.MethodGet,
			Path:         "/hello",
			Headers:      map[string]string{"apikey": "auth-two"},
			ExpectStatus: http.StatusOK,
			Sleep:        base.SleepTime,
		}),

		table.Entry("delete the consumer", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/consumers/jack",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		}),
		table.Entry("delete the route", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/r1",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		}),
	)

	table.DescribeTable("test consumer with create_time and update_time",
		func(tc base.HttpTestCase) {
			base.RunTestCase(tc)
		},
		table.Entry("create the consumer", base.HttpTestCase{
			Desc:   "create the consumer",
			Object: base.ManagerApiExpect(),
			Path:   "/apisix/admin/consumers",
			Method: http.MethodPut,
			Body: `{
				"username":"jack",
				"desc": "new consumer"
			}`,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			Sleep:        base.SleepTime,
		}),
	)

	ginkgo.It("verify create_time and update_time", func() {
		time.Sleep(base.SleepTime)

		url := base.ManagerAPIHost + "/apisix/admin/consumers/jack"
		headers := map[string]string{
			"Authorization": base.GetToken(),
		}
		respBody, status, err := base.HttpGet(url, headers)
		if err != nil {
			fmt.Printf("err1: %s", err)
		}
		assert.Equal(ginkgo.GinkgoT(), 200, status)
		assert.Nil(ginkgo.GinkgoT(), err)

		createTime := gjson.Get(string(respBody), "data.create_time")
		updateTime := gjson.Get(string(respBody), "data.update_time")

		assert.Equal(ginkgo.GinkgoT(), true, createTime.Int() >= time.Now().Unix()-1 && createTime.Int() <= time.Now().Unix()+1)
		assert.Equal(ginkgo.GinkgoT(), true, updateTime.Int() >= time.Now().Unix()-1 && updateTime.Int() <= time.Now().Unix()+1)

		// sleep 1 second for time compare
		time.Sleep(1 * time.Second)
		// update consumer
		reqBody := `{
		        "username":"jack",
		        "desc": "updated consumer"
	        }`
		respBody, status, err = base.HttpPut(base.ManagerAPIHost+"/apisix/admin/consumers", headers, reqBody)
		if err != nil {
			fmt.Printf("err2: %s", err)
		}
		assert.Nil(ginkgo.GinkgoT(), err)
		assert.Equal(ginkgo.GinkgoT(), 200, status)

		time.Sleep(base.SleepTime)

		// check update
		respBody, status, err = base.HttpGet(url, headers)
		assert.Equal(ginkgo.GinkgoT(), 200, status)
		assert.Nil(ginkgo.GinkgoT(), err)

		createTime2 := gjson.Get(string(respBody), "data.create_time")
		updateTime2 := gjson.Get(string(respBody), "data.update_time")

		// verify the consumer and compare result
		assert.Equal(ginkgo.GinkgoT(), "updated consumer", gjson.Get(string(respBody), "data.desc").String())
		assert.Equal(ginkgo.GinkgoT(), createTime.String(), createTime2.String())
		assert.NotEqual(ginkgo.GinkgoT(), updateTime.String(), updateTime2.String())
	})
})
