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

package migrate

import (
	"bytes"
	"encoding/binary"
	"encoding/json"
	"fmt"
	"hash/crc32"
	"net/http"

	"github.com/onsi/ginkgo"

	"github.com/apisix/manager-api/test/e2enew/base"
)

type response struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
}

var _ = ginkgo.Describe("Migrate", func() {
	var exportData []byte

	ginkgo.It("prepare config data", prepareConfigData)
	ginkgo.It("export config success", func() {
		req := base.ManagerApiExpect().GET("/apisix/admin/migrate/export")
		resp := req.Expect()
		resp.Status(http.StatusOK)
		exportData = []byte(resp.Body().Raw())
		data := exportData[:len(exportData)-4]
		checksum := binary.BigEndian.Uint32(exportData[len(exportData)-4:])
		if checksum != crc32.ChecksumIEEE(data) {
			ginkgo.Fail("Checksum not correct")
		}
	})

	ginkgo.It("import config conflict and return", func() {
		req := base.ManagerApiExpect().POST("/apisix/admin/migrate/import")
		buffer := bytes.NewBuffer(exportData)
		req.WithMultipart().WithForm(map[string]string{"mode": "return"})
		req.WithMultipart().WithFile("file", "apisix-config.bak", buffer)
		resp := req.Expect()
		resp.Status(http.StatusOK)
		rsp := &response{}
		err := json.Unmarshal([]byte(resp.Body().Raw()), rsp)
		if err != nil {
			ginkgo.Fail("json unmarshal:" + err.Error())
		}
		if rsp.Code != 20001 {
			ginkgo.Fail("code not 20001")
		}
	})

	ginkgo.It("import config conflict and skip", func() {
		req := base.ManagerApiExpect().POST("/apisix/admin/migrate/import")
		buffer := bytes.NewBuffer(exportData)
		req.WithMultipart().WithForm(map[string]string{"mode": "skip"})
		req.WithMultipart().WithFile("file", "apisix-config.bak", buffer)
		resp := req.Expect()
		resp.Status(http.StatusOK)
		rsp := &response{}
		err := json.Unmarshal([]byte(resp.Body().Raw()), rsp)
		if err != nil {
			ginkgo.Fail("json unmarshal:" + err.Error())
		}
		if rsp.Code != 0 {
			ginkgo.Fail("code not 0")
		}
	})

	ginkgo.It("import config conflict and overwrite", func() {
		req := base.ManagerApiExpect().POST("/apisix/admin/migrate/import")
		buffer := bytes.NewBuffer(exportData)
		req.WithMultipart().WithForm(map[string]string{"mode": "overwrite"})
		req.WithMultipart().WithFile("file", "apisix-config.bak", buffer)
		resp := req.Expect()
		resp.Status(http.StatusOK)
		rsp := &response{}
		err := json.Unmarshal([]byte(resp.Body().Raw()), rsp)
		if err != nil {
			ginkgo.Fail("json unmarshal:" + err.Error())
		}
		if rsp.Code != 0 {
			ginkgo.Fail("code not 0")
		}
	})

	ginkgo.It("delete all config", deleteConfigData)

	ginkgo.It("delete imported route failed", func() {
		base.RunTestCase(base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/r1",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusNotFound,
		})
	})

	ginkgo.It("import config success", func() {
		req := base.ManagerApiExpect().POST("/apisix/admin/migrate/import")
		buffer := bytes.NewBuffer(exportData)
		req.WithMultipart().WithForm(map[string]string{"mode": "return"})
		req.WithMultipart().WithFile("file", "apisix-config.bak", buffer)
		resp := req.Expect()
		resp.Status(http.StatusOK)
		rsp := &response{}
		err := json.Unmarshal([]byte(resp.Body().Raw()), rsp)
		if err != nil {
			ginkgo.Fail("json unmarshal:" + err.Error())
		}
		if rsp.Code != 0 {
			ginkgo.Fail("code not 0")
		}
	})

	ginkgo.It("delete imported route success", func() {
		base.RunTestCase(base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/r1",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
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
				"127.0.0.1:1980": 1
			},
			"type": "roundrobin"
		}
	}`)
	if statusCode != http.StatusOK || err != nil {
		panic(fmt.Sprintf("%d, %s", statusCode, err))
	}
	_, statusCode, err = base.HttpPut(base.ManagerAPIHost+"/apisix/admin/upstreams/1", headers, `{"name":"upstream1","nodes":[{"host":"172.16.238.20","port":1980,"weight":1}],"type":"roundrobin"}`)
	if statusCode != http.StatusOK || err != nil {
		panic(fmt.Sprintf("%d, %s", statusCode, err))
	}
	_, statusCode, err = base.HttpPut(base.ManagerAPIHost+"/apisix/admin/services/s1", headers, `{"name":"testservice","upstream":{"nodes":[{"host":"172.16.238.20","port":1980,"weight":1},{"host":"172.16.238.20","port":1981,"weight":2},{"host":"172.16.238.20","port":1982,"weight":3}],"type":"roundrobin"}}`)
	if statusCode != http.StatusOK || err != nil {
		panic(fmt.Sprintf("%d, %s", statusCode, err))
	}
}

func deleteConfigData() {
	headers := map[string]string{
		"Content-Type":  "application/json",
		"Authorization": base.GetToken(),
	}
	_, statusCode, err := base.HttpDelete(base.ManagerAPIHost+"/apisix/admin/routes/r1", headers)
	if statusCode != http.StatusOK || err != nil {
		panic(fmt.Sprintf("%d, %s", statusCode, err))
	}
	_, statusCode, err = base.HttpDelete(base.ManagerAPIHost+"/apisix/admin/upstreams/1", headers)
	if statusCode != http.StatusOK || err != nil {
		panic(fmt.Sprintf("%d, %s", statusCode, err))
	}
	_, statusCode, err = base.HttpDelete(base.ManagerAPIHost+"/apisix/admin/services/s1", headers)
	if statusCode != http.StatusOK || err != nil {
		panic(fmt.Sprintf("%d, %s", statusCode, err))
	}
}

const jsonConfig = `{"Counsumers":[],"Routes":[{"id":"r1","create_time":1620922236,"update_time":1620922236,"uri":"/hello_","name":"route1","upstream":{"nodes":{"127.0.0.1:1980":1},"type":"roundrobin"},"status":1}],"Services":[{"id":"s1","create_time":1620922236,"update_time":1620922236,"name":"testservice","upstream":{"nodes":[{"host":"172.16.238.20","port":1980,"weight":1},{"host":"172.16.238.20","port":1981,"weight":2},{"host":"172.16.238.20","port":1982,"weight":3}],"type":"roundrobin"}}],"SSLs":[],"Upstreams":[{"id":"1","create_time":1620922236,"update_time":1620922236,"nodes":[{"host":"172.16.238.20","port":1980,"weight":1}],"type":"roundrobin","name":"upstream1"}],"Scripts":[],"GlobalPlugins":[],"PluginConfigs":[]}`
