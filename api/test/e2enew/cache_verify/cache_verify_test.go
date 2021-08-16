package cache_verify

import (
	"github.com/apisix/manager-api/test/e2enew/base"
	"github.com/onsi/ginkgo"
	"github.com/onsi/ginkgo/extensions/table"
	"net/http"
)

var _ = ginkgo.Describe("Cache verify", func() {
	table.DescribeTable("cache verify test",
		func(tc base.HttpTestCase) {
			base.RunTestCase(tc)
		},
		table.Entry("get cache verify", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/cache_verify",
			ExpectStatus: http.StatusOK,
			ExpectBody: []string{"inconsistent_consumers", "inconsistent_routes", "inconsistent_services",
				"inconsistent_ssls", "inconsistent_upstreams", "inconsistent_scripts", "inconsistent_global_plugins",
				"inconsistent_plugin_configs", "inconsistent_server_infos"},
			Headers: map[string]string{"Authorization": base.GetToken()},
		}),
	)
})
