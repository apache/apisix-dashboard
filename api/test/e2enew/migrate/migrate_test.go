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
	"hash/crc32"
	"net/http"

	"github.com/onsi/ginkgo"
	"github.com/onsi/gomega"

	"github.com/apisix/manager-api/test/e2enew/base"
)

const (
	checksumLength = 4 // 4 bytes (uint32)
)

type AllData struct {
	Consumers     []interface{}
	Routes        []interface{}
	Services      []interface{}
	SSLs          []interface{}
	Upstreams     []interface{}
	Scripts       []interface{}
	GlobalPlugins []interface{}
	PluginConfigs []interface{}
}

type response struct {
	Code    int    `json:"Code"`
	Message string `json:"Message"`
	Data    struct {
		ConflictItems AllData `json:"ConflictItems"`
	} `json:"Data"`
}

var _ = ginkgo.Describe("Migrate", func() {
	var exportData []byte

	ginkgo.It("prepare config data", prepareConfigData)
	ginkgo.It("export config success", func() {
		req := base.ManagerApiExpect().GET("/apisix/admin/migrate/export")
		resp := req.Expect()
		resp.Status(http.StatusOK)
		exportData = []byte(resp.Body().Raw())
		data := exportData[:len(exportData)-checksumLength]
		checksum := binary.BigEndian.Uint32(exportData[len(exportData)-checksumLength:])
		gomega.Expect(checksum).Should(gomega.Equal(crc32.ChecksumIEEE(data)))
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
		gomega.Expect(err).Should(gomega.BeNil())
		gomega.Expect(rsp.Code).Should(gomega.Equal(20001))
		gomega.Expect(len(rsp.Data.ConflictItems.Routes)).Should(gomega.Equal(1))
		gomega.Expect(len(rsp.Data.ConflictItems.Upstreams)).Should(gomega.Equal(1))
		gomega.Expect(len(rsp.Data.ConflictItems.Services)).Should(gomega.Equal(1))
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
		gomega.Expect(err).Should(gomega.BeNil())
		gomega.Expect(rsp.Code).Should(gomega.Equal(0))
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
		gomega.Expect(err).Should(gomega.BeNil())
		gomega.Expect(rsp.Code).Should(gomega.Equal(0))
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

	ginkgo.It("delete imported route failed", func() {
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
			Sleep:        base.SleepTime,
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
		gomega.Expect(err).Should(gomega.BeNil())
		gomega.Expect(rsp.Code).Should(gomega.Equal(0))
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

	ginkgo.It("delete imported route success", func() {
		base.RunTestCase(base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/r1",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		})
	})

	ginkgo.It("delete imported upstream success", func() {
		base.RunTestCase(base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/upstreams/1",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		})
	})

	ginkgo.It("delete imported service success", func() {
		base.RunTestCase(base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/services/s1",
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
