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
	"encoding/json"
	"net/http"

	"github.com/onsi/ginkgo"
	"github.com/onsi/gomega"

	"github.com/apisix/manager-api/test/e2e/base"
)

// just test for schema check
var _ = ginkgo.Describe("Upstream keepalive pool", func() {
	ginkgo.It("create upstream with keepalive pool", func() {
		createUpstreamBody := make(map[string]interface{})
		createUpstreamBody["nodes"] = []map[string]interface{}{
			{
				"host":   base.UpstreamIp,
				"port":   1980,
				"weight": 1,
			},
		}
		createUpstreamBody["type"] = "roundrobin"
		createUpstreamBody["keepalive_pool"] = map[string]interface{}{
			"size":         320,
			"requests":     1000,
			"idle_timeout": 60,
		}
		_createUpstreamBody, err := json.Marshal(createUpstreamBody)
		gomega.Expect(err).To(gomega.BeNil())
		base.RunTestCase(base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodPut,
			Path:         "/apisix/admin/upstreams/kp",
			Body:         string(_createUpstreamBody),
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		})
	})
	ginkgo.It("delete upstream", func() {
		base.RunTestCase(base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/upstreams/kp",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		})
	})
})

// Test idle timeout zero and nil
var _ = ginkgo.Describe("Test Upstream keepalive pool", func() {
	ginkgo.It("create upstream with idle_timeout zero", func() {
		base.RunTestCase(base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Method: http.MethodPut,
			Path:   "/apisix/admin/upstreams/zero_idle_timeout",
			Body: `{
					"name":"upstream1",
					"nodes":[{
							"host": "` + base.UpstreamIp + `",
							"port": 1980,
							"weight": 1
						}],
					"keepalive_pool":{
						"size":         320,
						"requests":     1000,
						"idle_timeout": 0
					},
					"type":"roundrobin"
			}`,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		})
	})

	ginkgo.It("get upstream with idle_timeout zero", func() {
		base.RunTestCase(base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/upstreams/zero_idle_timeout",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			ExpectBody:   []string{`"id":"zero_idle_timeout"`, `"idle_timeout":0`, `"name":"upstream1"`},
		})
	})

	ginkgo.It("create upstream with idle_timeout nil", func() {
		base.RunTestCase(base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Method: http.MethodPut,
			Path:   "/apisix/admin/upstreams/nil_idle_timeout",
			Body: `{
					"name":"upstream2",
					"nodes":[{
							"host":"` + base.UpstreamIp + `",
							"port":1980,
							"weight":1
					}],
					"keepalive_pool":{
						"size":         320,
						"requests":     1000
					},
					"type":"roundrobin"
			}`,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		})
	})

	ginkgo.It("get upstream with idle_timeout nil", func() {
		base.RunTestCase(base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/upstreams/nil_idle_timeout",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			ExpectBody:   []string{`"id":"nil_idle_timeout"`, `"name":"upstream2"`},
			UnexpectBody: []string{`"idle_timeout":0`},
		})
	})

	ginkgo.It("delete upstream", func() {
		base.RunTestCase(base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/upstreams/zero_idle_timeout,nil_idle_timeout",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		})
	})
})
