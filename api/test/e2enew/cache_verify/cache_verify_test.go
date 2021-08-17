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
package cache_verify

import (
	"github.com/apisix/manager-api/test/e2enew/base"
	"github.com/onsi/ginkgo"
	"github.com/onsi/gomega"
	"net/http"
)

var _ = ginkgo.Describe("Cache verify", func() {
	header := map[string]string{"Authorization": base.GetToken()}

	ginkgo.It("prepare config data", prepareConfigData)

	ginkgo.It("cache verify success", func() {
		base.RunTestCase(base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/cache_verify",
			ExpectStatus: http.StatusOK,
			ExpectBody: []string{"inconsistent_consumers", "inconsistent_routes", "inconsistent_services",
				"inconsistent_ssls", "inconsistent_upstreams", "inconsistent_scripts", "inconsistent_global_plugins",
				"inconsistent_plugin_configs", "inconsistent_server_infos"},
			Headers: header,
		})
	})

	ginkgo.It("request hit route r1", func() {
		base.RunTestCase(base.HttpTestCase{
			Object:       base.APISIXExpect(),
			Method:       http.MethodGet,
			Path:         "/hello_",
			ExpectStatus: http.StatusOK,
			ExpectBody:   "hello world",
			Sleep:        base.SleepTime,
		})
	})

	ginkgo.It("delete all config", deleteConfigData)

	ginkgo.It("delete deleted route failed", func() {
		base.RunTestCase(base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/r1",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusNotFound,
		})
	})

	ginkgo.It("request route r1 not found", func() {
		base.RunTestCase(base.HttpTestCase{
			Object:       base.APISIXExpect(),
			Method:       http.MethodGet,
			Path:         "/hello_",
			ExpectStatus: http.StatusNotFound,
			//Sleep:        base.SleepTime,
		})
	})

})

func prepareConfigData() {
	headers := map[string]string{
		"Content-Type":  "application/json",
		"Authorization": base.GetToken(),
	}
	_, statusCode, err := base.HttpPut(base.ManagerAPIHost+"/apisix/admin/routes/r1", headers, `{
		"name": "route1",
		"uri": "/hello_",
		"upstream": {
			"nodes": {
				"`+base.UpstreamIp+`:1980": 1
			},
			"type": "roundrobin"
		}
	}`)
	gomega.Expect(statusCode).Should(gomega.Equal(http.StatusOK))
	gomega.Expect(err).Should(gomega.BeNil())

	_, statusCode, err = base.HttpPut(base.ManagerAPIHost+"/apisix/admin/upstreams/1", headers, `{
		"name": "upstream1",
		"nodes": [
			{
				"host": "`+base.UpstreamIp+`",
				"port": 1980,
				"weight": 1
			}
		],
		"type": "roundrobin"
	}`)
	gomega.Expect(statusCode).Should(gomega.Equal(http.StatusOK))
	gomega.Expect(err).Should(gomega.BeNil())

	_, statusCode, err = base.HttpPut(base.ManagerAPIHost+"/apisix/admin/services/s1", headers, `{
  "name": "testservice",
  "upstream": {
    "nodes": [
      {
        "host": "`+base.UpstreamIp+`",
        "port": 1980,
        "weight": 1
      },
      {
        "host": "`+base.UpstreamIp+`",
        "port": 1981,
        "weight": 2
      },
      {
        "host": "`+base.UpstreamIp+`",
        "port": 1982,
        "weight": 3
      }
    ],
    "type": "roundrobin"
  }
}`)
	gomega.Expect(statusCode).Should(gomega.Equal(http.StatusOK))
	gomega.Expect(err).Should(gomega.BeNil())
}

func deleteConfigData() {
	headers := map[string]string{
		"Content-Type":  "application/json",
		"Authorization": base.GetToken(),
	}
	_, statusCode, err := base.HttpDelete(base.ManagerAPIHost+"/apisix/admin/routes/r1", headers)
	gomega.Expect(statusCode).Should(gomega.Equal(http.StatusOK))
	gomega.Expect(err).Should(gomega.BeNil())
	_, statusCode, err = base.HttpDelete(base.ManagerAPIHost+"/apisix/admin/upstreams/1", headers)
	gomega.Expect(statusCode).Should(gomega.Equal(http.StatusOK))
	gomega.Expect(err).Should(gomega.BeNil())
	_, statusCode, err = base.HttpDelete(base.ManagerAPIHost+"/apisix/admin/services/s1", headers)
	gomega.Expect(statusCode).Should(gomega.Equal(http.StatusOK))
	gomega.Expect(err).Should(gomega.BeNil())
}
