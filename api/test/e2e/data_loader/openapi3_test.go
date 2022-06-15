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
package data_loader_test

import (
	"net/http"
	"path/filepath"

	. "github.com/onsi/ginkgo"
	. "github.com/onsi/ginkgo/extensions/table"
	. "github.com/onsi/gomega"
	"github.com/tidwall/gjson"

	"github.com/apisix/manager-api/test/e2e/base"
)

var _ = Describe("OpenAPI 3", func() {
	DescribeTable("Import cases",
		func(f func()) {
			f()
		},
		Entry("default.yaml", func() {
			path, err := filepath.Abs("../../testdata/import/default.yaml")
			Expect(err).To(BeNil())

			req := base.ManagerApiExpect().POST("/apisix/admin/import/routes")
			req.WithMultipart().WithForm(map[string]string{
				"type":      "openapi3",
				"task_name": "test_default_yaml",
				"_file":     "default.yaml",
			})
			req.WithMultipart().WithFile("file", path)
			req.WithHeader("Authorization", base.GetToken())
			resp := req.Expect()
			resp.Status(http.StatusOK)
			r := gjson.ParseBytes([]byte(resp.Body().Raw()))

			Expect(r.Get("code").Uint()).To(Equal(uint64(0)))

			r = r.Get("data")
			for s, result := range r.Map() {
				if s == "route" {
					Expect(result.Get("total").Uint()).To(Equal(uint64(1)))
					Expect(result.Get("failed").Uint()).To(Equal(uint64(0)))
				}
			}
		}),
		Entry("default.json", func() {
			path, err := filepath.Abs("../../testdata/import/default.json")
			Expect(err).To(BeNil())

			req := base.ManagerApiExpect().POST("/apisix/admin/import/routes")
			req.WithMultipart().WithForm(map[string]string{
				"type":      "openapi3",
				"task_name": "test_default_json",
				"_file":     "default.json",
			})
			req.WithMultipart().WithFile("file", path)
			req.WithHeader("Authorization", base.GetToken())
			resp := req.Expect()
			resp.Status(http.StatusOK)
			r := gjson.ParseBytes([]byte(resp.Body().Raw()))

			Expect(r.Get("code").Uint()).To(Equal(uint64(0)))

			r = r.Get("data")
			for s, result := range r.Map() {
				if s == "route" {
					Expect(result.Get("total").Uint()).To(Equal(uint64(1)))
					Expect(result.Get("failed").Uint()).To(Equal(uint64(0)))
				}
			}
		}),
		Entry("Postman-API101.yaml merge method", func() {
			path, err := filepath.Abs("../../testdata/import/Postman-API101.yaml")
			Expect(err).To(BeNil())

			req := base.ManagerApiExpect().POST("/apisix/admin/import/routes")
			req.WithMultipart().WithForm(map[string]string{
				"type":         "openapi3",
				"task_name":    "test_postman_api101_yaml",
				"_file":        "Postman-API101.yaml",
				"merge_method": "true",
			})
			req.WithMultipart().WithFile("file", path)
			req.WithHeader("Authorization", base.GetToken())
			resp := req.Expect()
			resp.Status(http.StatusOK)
			r := gjson.ParseBytes([]byte(resp.Body().Raw()))

			Expect(r.Get("code").Uint()).To(Equal(uint64(0)))

			r = r.Get("data")
			for s, result := range r.Map() {
				if s == "route" {
					Expect(result.Get("total").Uint()).To(Equal(uint64(3)))
					Expect(result.Get("failed").Uint()).To(Equal(uint64(0)))
				}
				if s == "upstream" {
					Expect(result.Get("total").Uint()).To(Equal(uint64(1)))
					Expect(result.Get("failed").Uint()).To(Equal(uint64(0)))
				}
			}
		}),
		Entry("Postman-API101.yaml non-merge method", func() {
			path, err := filepath.Abs("../../testdata/import/Postman-API101.yaml")
			Expect(err).To(BeNil())

			req := base.ManagerApiExpect().POST("/apisix/admin/import/routes")
			req.WithMultipart().WithForm(map[string]string{
				"type":         "openapi3",
				"task_name":    "test_postman_api101_yaml",
				"_file":        "Postman-API101.yaml",
				"merge_method": "false",
			})
			req.WithMultipart().WithFile("file", path)
			req.WithHeader("Authorization", base.GetToken())
			resp := req.Expect()
			resp.Status(http.StatusOK)
			r := gjson.ParseBytes([]byte(resp.Body().Raw()))

			Expect(r.Get("code").Uint()).To(Equal(uint64(0)))

			r = r.Get("data")
			for s, result := range r.Map() {
				if s == "route" {
					Expect(result.Get("total").Uint()).To(Equal(uint64(5)))
					Expect(result.Get("failed").Uint()).To(Equal(uint64(0)))
				}
				if s == "upstream" {
					Expect(result.Get("total").Uint()).To(Equal(uint64(1)))
					Expect(result.Get("failed").Uint()).To(Equal(uint64(0)))
				}
			}
		}),
	)
})
