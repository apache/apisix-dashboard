package consumer_test

import (
	"net/http"

	. "github.com/onsi/ginkgo/extensions/table"

	"github.com/apisix/manager-api/test/e2enew/base"
)

var _ = DescribeTable("Consumer With key-auth",
	func(tc base.HttpTestCase) {
		base.RunTestCase(tc)
	},
	Entry("create route", base.HttpTestCase{
		Object: base.ManagerApiExpect(),
		Method: http.MethodPut,
		Path:   "/apisix/admin/routes/r1",
		Body: `{
			"name": "route1",
			"uri": "/hello",
			"plugins": {
				"key-auth": {}
			},
			"upstream": {
				"type": "roundrobin",
				"nodes": [{
					"host": "` + base.UpstreamIp + `",
					"port": 1980,
					"weight": 1
				}]
			}
		}`,
		Headers:      map[string]string{"Authorization": base.GetToken()},
		ExpectStatus: http.StatusOK,
	}),
	Entry("hit route without apikey", base.HttpTestCase{
		Object:       base.APISIXExpect(),
		Method:       http.MethodGet,
		Path:         "/hello",
		ExpectStatus: http.StatusUnauthorized,
		ExpectBody:   "Missing API key found in request",
		Sleep:        base.SleepTime * 2,
	}),
	Entry("create consumer", base.HttpTestCase{
		Object: base.ManagerApiExpect(),
		Method: http.MethodPut,
		Path:   "/apisix/admin/consumers",
		Body: `{
			"username": "jack",
			"plugins": {
				"key-auth": {
					"key": "auth-one"
				}
			},
			"desc": "test description"
		}`,
		Headers:      map[string]string{"Authorization": base.GetToken()},
		ExpectStatus: http.StatusOK,
	}),
	Entry("hit route with correct apikey", base.HttpTestCase{
		Object:       base.APISIXExpect(),
		Method:       http.MethodGet,
		Path:         "/hello",
		Headers:      map[string]string{"apikey": "auth-one"},
		ExpectStatus: http.StatusOK,
		ExpectBody:   "hello world",
		Sleep:        base.SleepTime * 2,
	}),
	Entry("hit route with incorrect apikey", base.HttpTestCase{
		Object:       base.APISIXExpect(),
		Method:       http.MethodGet,
		Path:         "/hello",
		Headers:      map[string]string{"apikey": "auth-new"},
		ExpectStatus: http.StatusUnauthorized,
		ExpectBody:   "Invalid API key in request",
		Sleep:        base.SleepTime * 2,
	}),
	Entry("delete consumer", base.HttpTestCase{
		Object:       base.ManagerApiExpect(),
		Method:       http.MethodDelete,
		Path:         "/apisix/admin/consumers/jack",
		Headers:      map[string]string{"Authorization": base.GetToken()},
		ExpectStatus: http.StatusOK,
	}),
	Entry("hit route (consumer deleted)", base.HttpTestCase{
		Object:       base.APISIXExpect(),
		Method:       http.MethodGet,
		Path:         "/hello",
		Headers:      map[string]string{"apikey": "auth-one"},
		ExpectStatus: http.StatusUnauthorized,
		ExpectBody:   "Missing related consumer",
		Sleep:        base.SleepTime * 2,
	}),
	Entry("delete route", base.HttpTestCase{
		Object:       base.ManagerApiExpect(),
		Method:       http.MethodDelete,
		Path:         "/apisix/admin/routes/r1",
		Headers:      map[string]string{"Authorization": base.GetToken()},
		ExpectStatus: http.StatusOK,
	}),
)
