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
	"net/http"

	"github.com/apisix/manager-api/test/e2enew/base"
	"github.com/onsi/ginkgo"
	"github.com/onsi/gomega"
	"github.com/tidwall/gjson"
)

var _ = ginkgo.Describe("Cache verify", func() {

	ginkgo.It("cache verify ", func() {

		headers := map[string]string{
			"Authorization": base.GetToken(),
		}

		oldData, status, err := base.HttpGet(base.ManagerAPIHost+"/apisix/admin/cache_verify", headers)
		gomega.Expect(status).Should(gomega.Equal(http.StatusOK))
		gomega.Expect(err).Should(gomega.BeNil())

		oldTotal := gjson.Get((string)(oldData), "data.total")
		gomega.Expect(oldTotal.Exists()).Should(gomega.BeTrue())
		oldTotalInt := oldTotal.Int()

		oldRouteTotal := gjson.Get(string(oldData), "data.items.routes.total")
		gomega.Expect(oldRouteTotal.Exists()).Should(gomega.BeTrue())
		oldRouteTotalInt := oldRouteTotal.Int()

		oldUpstreamTotal := gjson.Get(string(oldData), "data.items.upstreams.total")
		gomega.Expect(oldUpstreamTotal.Exists()).Should(gomega.BeTrue())
		oldUpstreamTotalInt := oldUpstreamTotal.Int()

		oldServiceTotal := gjson.Get(string(oldData), "data.items.services.total")
		gomega.Expect(oldServiceTotal.Exists()).Should(gomega.BeTrue())
		oldServiceTotalInt := oldServiceTotal.Int()

		prepareConfigData()

		newData, status, err := base.HttpGet(base.ManagerAPIHost+"/apisix/admin/cache_verify", headers)
		gomega.Expect(status).Should(gomega.Equal(http.StatusOK))
		gomega.Expect(err).Should(gomega.BeNil())

		newTotal := gjson.Get((string)(newData), "data.total")
		gomega.Expect(newTotal.Exists()).Should(gomega.Equal(true))
		newTotalInt := newTotal.Int()

		newRouteTotal := gjson.Get(string(newData), "data.items.routes.total")
		gomega.Expect(newRouteTotal.Exists()).Should(gomega.BeTrue())
		newRouteTotalInt := newRouteTotal.Int()

		newUpstreamTotal := gjson.Get(string(newData), "data.items.upstreams.total")
		gomega.Expect(newUpstreamTotal.Exists()).Should(gomega.BeTrue())
		newUpstreamTotalInt := newUpstreamTotal.Int()

		newServiceTotal := gjson.Get(string(newData), "data.items.services.total")
		gomega.Expect(newServiceTotal.Exists()).Should(gomega.BeTrue())
		newServiceTotalInt := newServiceTotal.Int()

		// check that we add those configs successfully
		gomega.Expect(newTotalInt).Should(gomega.Equal(oldTotalInt + 3))

		// check route,upstream,service has incremented by 1
		gomega.Expect(newRouteTotalInt).Should(gomega.Equal(oldRouteTotalInt + 1))
		gomega.Expect(newUpstreamTotalInt).Should(gomega.Equal(oldUpstreamTotalInt + 1))
		gomega.Expect(newServiceTotalInt).Should(gomega.Equal(oldServiceTotalInt + 1))

		// check consistent ones + inconsistent ones = total
		consistentRouteCount := gjson.Get(string(newData), "data.items.routes.consistent_count")
		gomega.Expect(consistentRouteCount.Exists()).Should(gomega.BeTrue())
		consistentRouteCountInt := consistentRouteCount.Int()

		inConsistentRouteCount := gjson.Get(string(newData), "data.items.routes.inconsistent_count")
		gomega.Expect(inConsistentRouteCount.Exists()).Should(gomega.BeTrue())
		inConsistentRouteCountInt := inConsistentRouteCount.Int()

		gomega.Expect(consistentRouteCountInt + inConsistentRouteCountInt).Should(gomega.Equal(newRouteTotalInt))

	})

	ginkgo.It("delete all config", deleteConfigData)

})

func prepareConfigData() {
	headers := map[string]string{
		"Content-Type":  "application/json",
		"Authorization": base.GetToken(),
	}
	_, statusCode, err := base.HttpPut(base.ManagerAPIHost+"/apisix/admin/routes/ra", headers, `{
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

	_, statusCode, err = base.HttpPut(base.ManagerAPIHost+"/apisix/admin/upstreams/u1", headers, `{
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

	_, statusCode, err = base.HttpPut(base.ManagerAPIHost+"/apisix/admin/services/sa", headers, `{
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
	_, statusCode, err := base.HttpDelete(base.ManagerAPIHost+"/apisix/admin/routes/ra", headers)
	gomega.Expect(statusCode).Should(gomega.Equal(http.StatusOK))
	gomega.Expect(err).Should(gomega.BeNil())
	_, statusCode, err = base.HttpDelete(base.ManagerAPIHost+"/apisix/admin/upstreams/u1", headers)
	gomega.Expect(statusCode).Should(gomega.Equal(http.StatusOK))
	gomega.Expect(err).Should(gomega.BeNil())
	_, statusCode, err = base.HttpDelete(base.ManagerAPIHost+"/apisix/admin/services/sa", headers)
	gomega.Expect(statusCode).Should(gomega.Equal(http.StatusOK))
	gomega.Expect(err).Should(gomega.BeNil())
}
