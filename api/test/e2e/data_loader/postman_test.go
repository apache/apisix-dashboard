package data_loader_test

import (
	"path/filepath"
	"net/http"
	. "github.com/onsi/ginkgo"
	. "github.com/onsi/ginkgo/extensions/table"
	. "github.com/onsi/gomega"
	"github.com/apisix/manager-api/test/e2e/base"
	"github.com/tidwall/gjson"
)

var _ = Describe("Postman Collection v2.1", func() {
	It("Ensure all resources had cleaned", func() {
		base.CleanResource("routes")
		base.CleanResource("upstreams")
	})
	DescribeTable("Import cases",
		func(f func()) {
			f()
		},
		Entry("API_101.postman_collection", func() {
			path, err := filepath.Abs("../../testdata/import/API_101.postman_collection")
			Expect(err).To(BeNil())
			req := base.ManagerApiExpect().POST("/apisix/admin/import/routes")
			req.WithMultipart().WithForm(map[string]string{
				"type":         "postman",
				"task_name":    "api_101_postman",
				"_file":        "API_101.postman_collection",
				"merge_method": "false",
			})
			req.WithMultipart().WithFile("file", path)

			req.WithHeader("Authorization", base.GetToken())

			resp := req.Expect()
			resp.Status(http.StatusOK)
			r := gjson.ParseBytes([]byte(resp.Body().Raw()))

			Expect(r.Get("code").Uint()).To(Equal(uint64(0)))
			r = r.Get("data")
			r = r.Get("data")
			for s, result := range r.Map() {
				if s == "route" {
					Expect(result.Get("total").Uint()).To(Equal(uint64(1)))
					Expect(result.Get("failed").Uint()).To(Equal(uint64(0)))
				}
			}

		}),
	)
})
