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

type response struct {
	Code    int    `json:"Code"`
	Message string `json:"Message"`
}

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
				if s == "route" || s == "upstream" {
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
				if s == "route" || s == "upstream" {
					Expect(result.Get("total").Uint()).To(Equal(uint64(1)))
					Expect(result.Get("failed").Uint()).To(Equal(uint64(0)))
				}
			}
		}),
		Entry("petstore-expanded.yaml", func() {
			path, err := filepath.Abs("../../testdata/import/petstore-expanded.yaml")
			Expect(err).To(BeNil())

			req := base.ManagerApiExpect().POST("/apisix/admin/import/routes")
			req.WithMultipart().WithForm(map[string]string{
				"type":      "openapi3",
				"task_name": "test_petstore_expanded_yaml",
				"_file":     "petstore-expanded.yaml",
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
					Expect(result.Get("total").Uint()).To(Equal(uint64(2)))
					Expect(result.Get("failed").Uint()).To(Equal(uint64(0)))
				}
				if s == "upstream" {
					Expect(result.Get("total").Uint()).To(Equal(uint64(1)))
					Expect(result.Get("failed").Uint()).To(Equal(uint64(0)))
				}
			}
		}),
		Entry("Postman-API101.yaml", func() {
			path, err := filepath.Abs("../../testdata/import/Postman-API101.yaml")
			Expect(err).To(BeNil())

			req := base.ManagerApiExpect().POST("/apisix/admin/import/routes")
			req.WithMultipart().WithForm(map[string]string{
				"type":      "openapi3",
				"task_name": "test_postman_api101_yaml",
				"_file":     "Postman-API101.yaml",
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
