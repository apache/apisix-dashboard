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
package stream_route

import (
	"encoding/json"
	"io"
	"io/ioutil"
	"net"
	"net/http"

	"github.com/onsi/ginkgo"
	"github.com/onsi/ginkgo/extensions/table"
	"github.com/onsi/gomega"

	"github.com/apisix/manager-api/test/e2enew/base"
)

var _ = ginkgo.Describe("Stream Route", func() {
	table.DescribeTable("test stream route data CURD",
		func(tc base.HttpTestCase) {
			base.RunTestCase(tc)
		},
		table.Entry("create stream route", base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Method: http.MethodPost,
			Path:   "/apisix/admin/stream_routes",
			Body: `{
				"id": "sr1",
				"remote_addr": "127.0.0.1",
				"server_addr": "127.0.0.1",
				"server_port": 10090,
				"sni": "test.com",
				"upstream": {
					"nodes": {
						"` + base.UpstreamIp + `:1980": 1
					},
					"type": "roundrobin"
				}
			}`,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		}),
		table.Entry("get stream route #1", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/stream_routes/sr1",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			ExpectBody:   `"server_port":10090`,
		}),
		table.Entry("update stream route", base.HttpTestCase{
			Object:  base.ManagerApiExpect(),
			Method:  http.MethodPut,
			Path:    "/apisix/admin/stream_routes/sr1",
			Headers: map[string]string{"Authorization": base.GetToken()},
			Body: `{
				"id": "sr1",
				"server_port": 10091,
				"upstream": {
					"nodes": {
						"` + base.UpstreamIp + `:1980": 1
					},
					"type": "roundrobin"
				}
			}`,
			ExpectStatus: http.StatusOK,
			ExpectBody:   `"server_port":10091`,
		}),
		table.Entry("get stream route #2", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/stream_routes/sr1",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			ExpectBody:   `"server_port":10091`,
		}),
		table.Entry("hit stream route", base.HttpTestCase{
			Object:       base.APISIXStreamProxyExpect(10091, ""),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusOK,
			ExpectBody:   "hello world",
		}),
		table.Entry("delete stream route", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/stream_routes/sr1",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		}),
	)

	table.DescribeTable("test stream route with HTTP upstream",
		func(tc base.HttpTestCase) {
			base.RunTestCase(tc)
		},
		table.Entry("create upstream", base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Method: http.MethodPost,
			Path:   "/apisix/admin/upstreams",
			Body: `{
				"id": "u1",
				"nodes": {
					"` + base.UpstreamIp + `:1980": 1
				},
				"type": "roundrobin"
			}`,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		}),
		table.Entry("create stream route", base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Method: http.MethodPost,
			Path:   "/apisix/admin/stream_routes",
			Body: `{
				"id": "sr1",
				"server_port": 10090,
				"upstream_id": "u1"
			}`,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		}),
		table.Entry("hit stream route", base.HttpTestCase{
			Object:       base.APISIXStreamProxyExpect(10090, ""),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusOK,
			ExpectBody:   "hello world",
		}),
		table.Entry("delete used upstream", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/upstreams/u1",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusBadRequest,
			ExpectBody:   "stream route: sr1 is using this upstream",
		}),
		table.Entry("delete stream route", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/stream_routes/sr1",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		}),
		table.Entry("delete unused upstream", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/upstreams/u1",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		}),
	)

	// prepare ssl certificate
	apisixCert, err := ioutil.ReadFile("../../certs/apisix.crt")
	gomega.Expect(err).To(gomega.BeNil())
	apisixKey, err := ioutil.ReadFile("../../certs/apisix.key")
	gomega.Expect(err).To(gomega.BeNil())
	apisixSSLBody, err := json.Marshal(map[string]string{"cert": string(apisixCert), "key": string(apisixKey)})
	gomega.Expect(err).To(gomega.BeNil())
	table.DescribeTable("test stream route with HTTPS upstream",
		func(tc base.HttpTestCase) {
			base.RunTestCase(tc)
		},
		table.Entry("create ssl cert", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodPost,
			Path:         "/apisix/admin/ssl",
			Body:         string(apisixSSLBody),
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		}),
		table.Entry("create stream route", base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Method: http.MethodPost,
			Path:   "/apisix/admin/stream_routes",
			Body: `{
				"id": "sr1",
				"server_port": 10093,
				"sni": "test.com",
				"upstream": {
					"nodes": {
						"` + base.UpstreamIp + `:1980": 1
					},
					"type": "roundrobin"
				}
			}`,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		}),
		table.Entry("hit stream route through https", base.HttpTestCase{
			Object:       base.APISIXStreamProxyExpect(10093, "test.com"),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusOK,
			ExpectBody:   "hello world",
		}),
	)

	ginkgo.Describe("test stream route with TCP upstream", func() {
		ginkgo.It("create stream route", func() {
			base.RunTestCase(base.HttpTestCase{
				Object: base.ManagerApiExpect(),
				Method: http.MethodPost,
				Path:   "/apisix/admin/stream_routes",
				Body: `{
					"id": "sr1tcp",
					"server_port": 10090,
					"upstream": {
						"nodes": {
							"` + base.UpstreamEchoIp + `:3333": 1
						},
						"type": "roundrobin"
					}
				}`,
				Headers:      map[string]string{"Authorization": base.GetToken()},
				ExpectStatus: http.StatusOK,
			})
		})
		ginkgo.It("hit stream route through tcp", func() {
			conn, err := net.Dial("tcp", "127.0.0.1:10090")
			gomega.Expect(err).To(gomega.BeNil())

			_, err = conn.Write([]byte("a"))
			gomega.Expect(err).To(gomega.BeNil())

			result := make([]byte, 0, 4096)
			tmp := make([]byte, 256)
			for {
				n, err := conn.Read(tmp)
				if err == io.EOF {
					break
				}
				result = append(result, tmp[:n]...)
			}
			gomega.Expect(string(result)).To(gomega.ContainSubstring("Container information"))

			err = conn.Close()
			gomega.Expect(err).To(gomega.BeNil())
		})
	})

	ginkgo.Describe("test stream route with UDP upstream", func() {
		ginkgo.It("create stream route", func() {
			base.RunTestCase(base.HttpTestCase{
				Object: base.ManagerApiExpect(),
				Method: http.MethodPost,
				Path:   "/apisix/admin/stream_routes",
				Body: `{
					"id": "sr1udp",
					"server_port": 10095,
					"upstream": {
						"nodes": {
							"` + base.UpstreamEchoIp + `:3333": 1
						},
						"type": "roundrobin"
					}
				}`,
				Headers:      map[string]string{"Authorization": base.GetToken()},
				ExpectStatus: http.StatusOK,
			})
		})
		ginkgo.It("hit stream route through udp", func() {
			conn, err := net.Dial("udp", "127.0.0.1:10095")
			gomega.Expect(err).To(gomega.BeNil())

			_, err = conn.Write([]byte("a"))
			gomega.Expect(err).To(gomega.BeNil())

			err = conn.Close()
			gomega.Expect(err).To(gomega.BeNil())
		})
	})

	table.DescribeTable("test stream route data CURD exception",
		func(tc base.HttpTestCase) {
			base.RunTestCase(tc)
		},
		table.Entry("create stream route with upstream id not found", base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Method: http.MethodPost,
			Path:   "/apisix/admin/stream_routes",
			Body: `{
				"id": "sr1",
				"server_port": 10090,
				"upstream_id": "u1"
			}`,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusBadRequest,
		}),
	)
})
