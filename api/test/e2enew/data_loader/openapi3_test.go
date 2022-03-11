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
	"path/filepath"

	"github.com/go-resty/resty/v2"
	. "github.com/onsi/ginkgo"
	. "github.com/onsi/ginkgo/extensions/table"
	. "github.com/onsi/gomega"
	"github.com/tidwall/gjson"

	"github.com/apisix/manager-api/test/e2enew/base"
)

var client = resty.New()

var _ = Describe("OpenAPI 3", func() {
	It("setup HTTP client", func() {
		client.SetHeaders(map[string]string{
			"Authorization": base.GetToken(),
		})
	})
	DescribeTable("Import cases",
		func(f func()) {
			f()
		},
		Entry("default.yaml", func() {
			path, err := filepath.Abs("../../testdata/import/default.yaml")
			Expect(err).To(BeNil())

			resp, err := client.R().
				SetFile("file", path).
				SetFormData(map[string]string{
					"_file":     "default.yaml",
					"type":      "openapi3",
					"task_name": "test_default_yaml",
				}).
				Post(base.ManagerAPIHost + "/apisix/admin/import/routes")

			Expect(err).To(BeNil())
			Expect(resp.IsError()).To(BeFalse())

			r := gjson.ParseBytes(resp.Body())
			Expect(r.Get("code").Uint()).To(Equal(uint64(0)))

			r = r.Get("data")
			for s, result := range r.Map() {
				if s == "route" || s == "upstream" {
					Expect(result.Get("total").Uint()).To(Equal(uint64(1)))
					Expect(result.Get("failed").Uint()).To(Equal(uint64(0)))
				}
			}
		}),
		Entry("default.json", func() {
			path, err := filepath.Abs("../../testdata/import/default.json")
			Expect(err).To(BeNil())

			resp, err := client.R().
				SetFile("file", path).
				SetFormData(map[string]string{
					"_file":     "default.json",
					"type":      "openapi3",
					"task_name": "test_default_json",
				}).
				Post(base.ManagerAPIHost + "/apisix/admin/import/routes")

			Expect(err).To(BeNil())
			Expect(resp.IsError()).To(BeFalse())

			r := gjson.ParseBytes(resp.Body())
			Expect(r.Get("code").Uint()).To(Equal(uint64(0)))

			r = r.Get("data")
			for s, result := range r.Map() {
				if s == "route" || s == "upstream" {
					Expect(result.Get("total").Uint()).To(Equal(uint64(1)))
					Expect(result.Get("failed").Uint()).To(Equal(uint64(0)))
				}
			}
		}),
		Entry("petstore-expanded.yaml", func() {
			path, err := filepath.Abs("../../testdata/import/petstore-expanded.yaml")
			Expect(err).To(BeNil())

			resp, err := client.R().
				SetFile("file", path).
				SetFormData(map[string]string{
					"_file":     "default.json",
					"type":      "openapi3",
					"task_name": "test_petstore_expanded_yaml",
				}).
				Post(base.ManagerAPIHost + "/apisix/admin/import/routes")

			Expect(err).To(BeNil())
			Expect(resp.IsError()).To(BeFalse())

			r := gjson.ParseBytes(resp.Body())
			Expect(r.Get("code").Uint()).To(Equal(uint64(0)))

			r = r.Get("data")
			for s, result := range r.Map() {
				if s == "route" {
					Expect(result.Get("total").Uint()).To(Equal(uint64(2)))
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
