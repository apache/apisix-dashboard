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
package upstream

import (
	"io/ioutil"
	"net/http"

	"github.com/onsi/ginkgo"
	"github.com/onsi/ginkgo/extensions/table"
	"github.com/stretchr/testify/assert"

	"e2enew/base"
)

var _ = ginkgo.Describe("Upstream", func() {
	table.DescribeTable("test upstream create",
		func(tc base.HttpTestCase) {
			base.RunTestCase(tc)
		},
		table.Entry("use upstream that not exist", base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Method: http.MethodPut,
			Path:   "/apisix/admin/routes/r1",
			Body: `{
				 "uri": "/hello",
				 "upstream_id": "not-exists"
			 }`,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusBadRequest,
		}),
		table.Entry("create upstream", base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Method: http.MethodPut,
			Path:   "/apisix/admin/upstreams/1",
			Body: `{
				 "name": "upstream1",
				 "nodes": [{
					 "host": "172.16.238.20",
					 "port": 1980,
					 "weight": 1
				 }],
				 "type": "roundrobin"
			 }`,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		}),
		table.Entry("check upstream exists by name", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/notexist/upstreams",
			Query:        "name=upstream1",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusBadRequest,
			ExpectBody:   "Upstream name is reduplicate",
			Sleep:        base.SleepTime,
		}),
		table.Entry("upstream name list", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/names/upstreams",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			ExpectBody:   `"name":"upstream1"`,
			Sleep:        base.SleepTime,
		}),
		table.Entry("check upstream exists by name (exclude it self)", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/notexist/upstreams",
			Query:        "name=upstream1&exclude=1",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			Sleep:        base.SleepTime,
		}),
		table.Entry("create route using the upstream just created", base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Method: http.MethodPut,
			Path:   "/apisix/admin/routes/1",
			Body: `{
				 "uri": "/hello",
				 "upstream_id": "1"
			 }`,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			Sleep:        base.SleepTime,
		}),
		table.Entry("hit the route just created", base.HttpTestCase{
			Object:       base.APISIXExpect(),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusOK,
			ExpectBody:   "hello world",
			Sleep:        base.SleepTime,
		}),
		table.Entry("update upstream with domain", base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Method: http.MethodPut,
			Path:   "/apisix/admin/upstreams/1",
			Body: `{
				 "nodes": [{
					 "host": "172.16.238.20",
					 "port": 1981,
					 "weight": 1
				 }],
				 "type": "roundrobin"
			 }`,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		}),
		table.Entry("hit the route using upstream 1", base.HttpTestCase{
			Object:       base.APISIXExpect(),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusOK,
			ExpectBody:   "hello world",
			Sleep:        base.SleepTime,
		}),
		table.Entry("delete not exist upstream", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/upstreams/not-exist",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusNotFound,
		}),
		table.Entry("delete route", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/1",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		}),
		table.Entry("delete upstream", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/upstreams/1",
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
})

var _ = ginkgo.Describe("Upstream chash remote addr", func() {
	ginkgo.It("create chash upstream with key (remote_addr)", func() {
		base.RunTestCase(base.HttpTestCase{
			Object: base.ManagerApiExpect(),
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
				 "type": "chash",
				 "hash_on":"header",
				 "key": "remote_addr"
			 }`,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		})
	})

	ginkgo.It("create route using the upstream just created", func() {
		base.RunTestCase(base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Method: http.MethodPut,
			Path:   "/apisix/admin/routes/1",
			Body: `{
				 "uri": "/server_port",
				 "upstream_id": "1"
			 }`,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			Sleep:        base.SleepTime,
		})
	})

	ginkgo.It("hit routes(upstream weight 1)", func() {
		t := ginkgo.GinkgoT()
		//hit routes
		basepath := "http://127.0.0.1:9080/"
		request, err := http.NewRequest("GET", basepath+"/server_port", nil)
		assert.Nil(t, err)
		request.Header.Add("Authorization", base.GetToken())
		res := map[string]int{}
		for i := 0; i < 18; i++ {
			resp, err := http.DefaultClient.Do(request)
			assert.Nil(t, err)
			respBody, err := ioutil.ReadAll(resp.Body)
			assert.Nil(t, err)
			body := string(respBody)
			if _, ok := res[body]; !ok {
				res[body] = 1
			} else {
				res[body]++
			}
			resp.Body.Close()
		}
		assert.Equal(t, 18, res["1982"])
	})

	ginkgo.It("create chash upstream with key (remote_addr, weight equal 0 or 1)", func() {
		base.RunTestCase(base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Method: http.MethodPut,
			Path:   "/apisix/admin/upstreams/1",
			Body: `{
				"nodes": [
				{
					"host": "172.16.238.20",
					"port": 1980,
					"weight": 1
				},
				{
					"host": "172.16.238.20",
					"port": 1981,
					"weight": 0
				},
				{
					"host": "172.16.238.20",
					"port": 1982,
					"weight": 0
				}],
				"type": "chash",
				"hash_on":"header",
				"key": "remote_addr"
			}`,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		})
	})

	ginkgo.It("create route using the upstream just created", func() {
		base.RunTestCase(base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Method: http.MethodPut,
			Path:   "/apisix/admin/routes/1",
			Body: `{
				"uri": "/server_port",
				"upstream_id": "1"
			}`,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			Sleep:        base.SleepTime,
		})
	})

	ginkgo.It("hit routes(remote_addr, weight equal 0 or 1)", func() {
		t := ginkgo.GinkgoT()
		basepath := "http://127.0.0.1:9080/"
		request, err := http.NewRequest("GET", basepath+"/server_port", nil)
		assert.Nil(t, err)
		request.Header.Add("Authorization", base.GetToken())
		count := 0
		for i := 0; i <= 17; i++ {
			resp, err := http.DefaultClient.Do(request)
			assert.Nil(t, err)
			respBody, err := ioutil.ReadAll(resp.Body)
			if string(respBody) == "1980" {
				count++
			}
			resp.Body.Close()
		}
		assert.Equal(t, 18, count)
	})
	ginkgo.It("create chash upstream with key (remote_addr, all weight equal 0)", func() {
		base.RunTestCase(base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Method: http.MethodPut,
			Path:   "/apisix/admin/upstreams/1",
			Body: `{
				 "nodes": [
				 {
					 "host": "172.16.238.20",
					 "port": 1980,
					 "weight": 0
				 },
				 {
					 "host": "172.16.238.20",
					 "port": 1981,
					 "weight": 0
				 }],
				 "type": "chash",
				 "hash_on":"header",
				 "key": "remote_addr"
			 }`,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		})
	})
	ginkgo.It("create route using the upstream just created", func() {
		base.RunTestCase(base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Method: http.MethodPut,
			Path:   "/apisix/admin/routes/1",
			Body: `{
				 "uri": "/server_port",
				 "upstream_id": "1"
			 }`,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			Sleep:        base.SleepTime,
		})
	})
	ginkgo.It("hit the route(remote_addr, all weight equal 0)", func() {
		base.RunTestCase(base.HttpTestCase{
			Object:       base.APISIXExpect(),
			Method:       http.MethodGet,
			Path:         "/server_port",
			ExpectStatus: http.StatusBadGateway,
			ExpectBody:   "<head><title>502 Bad Gateway</title></head>",
			Sleep:        base.SleepTime,
		})
	})
	ginkgo.It("delete route", func() {
		base.RunTestCase(base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/1",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		})
	})
	ginkgo.It("delete upstream", func() {
		base.RunTestCase(base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/upstreams/1",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		})
	})
	ginkgo.It("hit the route just deleted", func() {
		base.RunTestCase(base.HttpTestCase{
			Object:       base.APISIXExpect(),
			Method:       http.MethodGet,
			Path:         "/hello1",
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   "{\"error_msg\":\"404 Route Not Found\"}\n",
			Sleep:        base.SleepTime,
		})
	})
})

var _ = ginkgo.Describe("Upstream create via post", func() {
	table.DescribeTable("test upstream create via post",
		func(tc base.HttpTestCase) {
			base.RunTestCase(tc)
		},
		table.Entry("create upstream via POST", base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Method: http.MethodPost,
			Path:   "/apisix/admin/upstreams",
			Body: `{
				 "id": "u1",
				 "nodes": [{
					 "host": "172.16.238.20",
					 "port": 1980,
					 "weight": 1
				 }],
				 "type": "roundrobin"
			 }`,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			// should return id and other request body content
			ExpectBody: []string{"\"id\":\"u1\"", "\"type\":\"roundrobin\""},
		}),
		table.Entry("create route using the upstream just created", base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Method: http.MethodPut,
			Path:   "/apisix/admin/routes/1",
			Body: `{
				 "uri": "/hello",
				 "upstream_id": "u1"
			 }`,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			Sleep:        base.SleepTime,
		}),
		table.Entry("hit the route just created", base.HttpTestCase{
			Object:       base.APISIXExpect(),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusOK,
			ExpectBody:   "hello world",
			Sleep:        base.SleepTime,
		}),
		table.Entry("delete route", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/1",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		}),
		table.Entry("delete upstream", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/upstreams/u1",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		}),
	)
})

var _ = ginkgo.Describe("Upstream update use patch method", func() {
	table.DescribeTable("test upstream update use patch method",
		func(tc base.HttpTestCase) {
			base.RunTestCase(tc)
		},
		table.Entry("create upstream via POST", base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Method: http.MethodPost,
			Path:   "/apisix/admin/upstreams",
			Body: `{
				 "id": "u1",
				 "nodes": [{
					 "host": "172.16.238.20",
					 "port": 1980,
					 "weight": 1
				 }],
				 "type": "roundrobin"
			 }`,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			ExpectBody:   []string{"\"id\":\"u1\"", "\"type\":\"roundrobin\""},
		}),
		table.Entry("update upstream use patch method", base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Method: http.MethodPatch,
			Path:   "/apisix/admin/upstreams/u1",
			Body: `{
				 "nodes": [{
					 "host": "172.16.238.20",
					 "port": 1981,
					 "weight": 1
				 }],
				 "type": "roundrobin"
			 }`,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		}),
		table.Entry("get upstream data", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/upstreams/u1",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "nodes\":[{\"host\":\"172.16.238.20\",\"port\":1981,\"weight\":1}],\"type\":\"roundrobin\"}",
		}),
		table.Entry("Update upstream using path parameter patch method", base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Method: http.MethodPatch,
			Path:   "/apisix/admin/upstreams/u1/nodes",
			Body:   `[{"host":"172.16.238.20","port": 1980,"weight":1}]`,
			Headers: map[string]string{
				"Authorization": base.GetToken(),
				"Content-Type":  "text/plain",
			},
			ExpectStatus: http.StatusOK,
		}),
		table.Entry("get upstream data", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/upstreams/u1",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "nodes\":[{\"host\":\"172.16.238.20\",\"port\":1980,\"weight\":1}],\"type\":\"roundrobin\"}",
		}),
		table.Entry("delete upstream", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/upstreams/u1",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		}),
	)
})
