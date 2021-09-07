package e2e

import (
	"net/http"
	"testing"
)

func TestStreamRouteCreate(t *testing.T) {
	tests := []HttpTestCase{
		{
			Desc:         "hit stream route that not exist",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/stream_routes/sr1",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusNotFound,
		},
		{
			Desc:   "Create Stream Route With Upstream",
			Object: ManagerApiExpect(t),
			Path:   "/apisix/admin/stream_routes",
			Method: http.MethodPost,
			Body: `{
				"id": "sr1",
				"remote_addr": "127.0.0.1",
				"server_addr": "127.0.0.1",
				"server_port": 9090,
				"sni": "test.com"
				"upstream": {
					"nodes": {
						"` + UpstreamIp + `:1980": 1
					},
					"type": "roundrobin"
				}
			}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			//ExpectBody:   []string{"\"id\":\"r1\"", "\"uri\":\"/hello_\""},
		},
		{
			Desc:   "Create Stream Route With Upstream ID",
			Object: ManagerApiExpect(t),
			Path:   "/apisix/admin/stream_routes",
			Method: http.MethodPost,
			Body: `{
				"id": "sr1",
				"remote_addr": "127.0.0.1",
				"server_addr": "127.0.0.1",
				"server_port": 9090,
				"sni": "test.com",
				"upstream_id": "u1" 
			}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:         "delete the stream route just created",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/stream_routes/r1",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:         "hit stream route that not exist",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/stream_routes/sr1",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusNotFound,
		},
	}

	for _, tc := range tests {
		testCaseCheck(tc, t)
	}
}
