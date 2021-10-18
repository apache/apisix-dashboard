package stream_route

import (
	"net/http"

	"github.com/onsi/ginkgo"
	"github.com/onsi/ginkgo/extensions/table"

	"github.com/apisix/manager-api/test/e2enew/base"
)

var _ = ginkgo.Describe("Stream Route", func() {
	table.DescribeTable("test stream_route CURD",
		func(tc base.HttpTestCase) {
			base.RunTestCase(tc)
		},
		table.Entry("create stream route", base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Method: http.MethodPost,
			Path:   "/apisix/admin/stream_routes",
			Body: `{
    "id": "sr1",
    "remote_addr": "127.0.0.1",
    "server_addr": "127.0.0.1",
    "server_port": 10090,
    "sni": "test.com",
    "upstream": {
        "nodes": {
            "` + base.UpstreamIp + `:1980": 1
        },
        "type": "roundrobin"
    }
}`,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		}),
		table.Entry("get stream route #1", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/stream_routes/sr1",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			ExpectBody:   `"server_port":10090`,
		}),
		table.Entry("update stream route", base.HttpTestCase{
			Object:  base.ManagerApiExpect(),
			Method:  http.MethodPut,
			Path:    "/apisix/admin/stream_routes/sr1",
			Headers: map[string]string{"Authorization": base.GetToken()},
			Body: `{
    "id": "sr1",
    "remote_addr": "127.0.0.1",
    "server_addr": "127.0.0.1",
    "server_port": 10091,
    "sni": "test.com",
    "upstream": {
        "nodes": {
            "` + base.UpstreamIp + `:1980": 1
        },
        "type": "roundrobin"
    }
}`,
			ExpectStatus: http.StatusOK,
			ExpectBody:   `"server_port":10091`,
		}),
		table.Entry("get stream route #2", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/stream_routes/sr1",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			ExpectBody:   `"server_port":10091`,
		}),
		table.Entry("hit stream route", base.HttpTestCase{
			Object:       base.APISIXStreamProxyExpect(10091, false),
			Method:       http.MethodGet,
			Path:         "/hello",
			ExpectStatus: http.StatusOK,
			ExpectBody:   "hello world",
		}),
		table.Entry("delete stream route", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/stream_routes/sr1",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		}),
	)
})
