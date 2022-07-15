package service_test

import (
	"net/http"
	"time"

	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"

	"github.com/apache/apisix-dashboard/api/test/e2e/base"
)

var _ = Describe("Service", func() {
	Describe("Test service Integrate (Without plugin)", func() {
		It("Create service", func() {
			base.RunTestCase(base.HttpTestCase{
				Object:  base.ManagerApiExpect(),
				Method:  http.MethodPut,
				Path:    "/apisix/admin/services/s1",
				Headers: map[string]string{"Authorization": base.GetToken()},
				Body: `{
					"name": "testservice",
					"upstream": {
						"type": "roundrobin",
						"nodes": {
							"` + base.UpstreamIp + `:1980": 1,
							"` + base.UpstreamIp + `:1981": 2,
							"` + base.UpstreamIp + `:1982": 3
						}
					}
				}`,
				ExpectStatus: http.StatusOK,
				ExpectBody:   []string{`"id":"s1"`, `"name":"testservice"`},
			})
		})
		It("Create route", func() {
			base.RunTestCase(base.HttpTestCase{
				Object: base.ManagerApiExpect(),
				Method: http.MethodPut,
				Path:   "/apisix/admin/routes/r1",
				Body: `{
					"name": "route1",
					"uri": "/server_port",
					"service_id": "s1"
				}`,
				Headers:      map[string]string{"Authorization": base.GetToken()},
				ExpectStatus: http.StatusOK,
				Sleep:        time.Second,
			})
		})
		It("Batch test /server_port API", func() {
			time.Sleep(time.Duration(500) * time.Millisecond)
			res := base.BatchTestServerPort(18, nil, "")
			Expect(res["1980"]).Should(Equal(3))
			Expect(res["1981"]).Should(Equal(6))
			Expect(res["1982"]).Should(Equal(9))
		})
		It("Delete route", func() {
			base.RunTestCase(base.HttpTestCase{
				Object:       base.ManagerApiExpect(),
				Method:       http.MethodDelete,
				Path:         "/apisix/admin/routes/r1",
				Headers:      map[string]string{"Authorization": base.GetToken()},
				ExpectStatus: http.StatusOK,
			})
		})
		It("Delete service", func() {
			base.RunTestCase(base.HttpTestCase{
				Object:       base.ManagerApiExpect(),
				Method:       http.MethodDelete,
				Path:         "/apisix/admin/services/s1",
				Headers:      map[string]string{"Authorization": base.GetToken()},
				ExpectStatus: http.StatusOK,
			})
		})
		It("Hit route just deleted", func() {
			base.RunTestCase(base.HttpTestCase{
				Object:       base.APISIXExpect(),
				Method:       http.MethodGet,
				Path:         "/server_port",
				ExpectStatus: http.StatusNotFound,
				ExpectBody:   `{"error_msg":"404 Route Not Found"}`,
			})
		})
	})
})
