package service_test

import (
	"net/http"
	"time"

	. "github.com/onsi/ginkgo"

	"github.com/apache/apisix-dashboard/api/test/e2e/base"
)

var _ = Describe("Service", func() {
	Describe("Test service Integrate (With plugin)", func() {
		It("Create service", func() {
			base.RunTestCase(base.HttpTestCase{
				Object:  base.ManagerApiExpect(),
				Method:  http.MethodPut,
				Path:    "/apisix/admin/services/s1",
				Headers: map[string]string{"Authorization": base.GetToken()},
				Body: `{
					"name": "testservice",
					"plugins": {
						"limit-count": {
							"count": 100,
							"time_window": 60,
							"rejected_code": 503,
							"key": "remote_addr",
							"policy": "local"
						}
					},
					"upstream": {
						"type": "roundrobin",
						"nodes": {
							"` + base.UpstreamIp + `:1980": 1
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
		It("Hit routes and check the response header", func() {
			base.RunTestCase(base.HttpTestCase{
				Object:       base.APISIXExpect(),
				Method:       http.MethodGet,
				Path:         "/server_port",
				ExpectStatus: http.StatusOK,
				ExpectHeaders: map[string]string{
					"X-Ratelimit-Limit":     "100",
					"X-Ratelimit-Remaining": "99",
				},
			})
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
				Sleep:        base.SleepTime,
			})
		})
		It("Hit the route just deleted", func() {
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
