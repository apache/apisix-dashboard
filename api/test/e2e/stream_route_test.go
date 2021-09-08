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
			Desc:   "create stream route with upstream id not found",
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
			ExpectStatus: http.StatusBadRequest,
		},
		{
			Desc:   "create stream route with upstream",
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
			Sleep:        sleepTime,
		},
		{
			Desc:         "hit stream route just create",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/stream_routes/sr1",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:         "delete the stream route just created",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/stream_routes/sr1",
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

func TestStreamRouteUpdate(t *testing.T) {
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
			Desc:   "create stream route with upstream",
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
		},
		{
			Desc:         "hit stream route just create",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/stream_routes/sr1",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			Sleep:        sleepTime,
		},
		{
			Desc:   "update stream route with remote_addr",
			Object: ManagerApiExpect(t),
			Path:   "/apisix/admin/stream_routes/sr1",
			Method: http.MethodPut,
			Body: `{
				"id": "sr1",
				"remote_addr": "127.0.0.2",
				"server_addr": "127.0.0.1",
				"server_port": 9090,
				"sni": "test.com",
				"upstream": {
					"nodes": {
						"` + UpstreamIp + `:1980": 1
					},
					"type": "roundrobin"
				}
			}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:   "update stream route with server_addr",
			Object: ManagerApiExpect(t),
			Path:   "/apisix/admin/stream_routes/sr1",
			Method: http.MethodPut,
			Body: `{
				"id": "sr1",
				"remote_addr": "127.0.0.2",
				"server_addr": "127.0.0.2",
				"server_port": 9090,
				"sni": "test.com",
				"upstream": {
					"nodes": {
						"` + UpstreamIp + `:1980": 1
					},
					"type": "roundrobin"
				}
			}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:   "update stream route with server_port",
			Object: ManagerApiExpect(t),
			Path:   "/apisix/admin/stream_routes/sr1",
			Method: http.MethodPut,
			Body: `{
				"id": "sr1",
				"remote_addr": "127.0.0.2",
				"server_addr": "127.0.0.2",
				"server_port": 9091,
				"sni": "test.com",
				"upstream": {
					"nodes": {
						"` + UpstreamIp + `:1980": 1
					},
					"type": "roundrobin"
				}
			}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:   "update stream route with sni",
			Object: ManagerApiExpect(t),
			Path:   "/apisix/admin/stream_routes/sr1",
			Method: http.MethodPut,
			Body: `{
				"id": "sr1",
				"remote_addr": "127.0.0.2",
				"server_addr": "127.0.0.2",
				"server_port": 9091,
				"sni": "test1.com",
				"upstream": {
					"nodes": {
						"` + UpstreamIp + `:1980": 1
					},
					"type": "roundrobin"
				}
			}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:   "update stream route with upstream",
			Object: ManagerApiExpect(t),
			Path:   "/apisix/admin/stream_routes/sr1",
			Method: http.MethodPut,
			Body: `{
				"id": "sr1",
				"remote_addr": "127.0.0.2",
				"server_addr": "127.0.0.2",
				"server_port": 9091,
				"sni": "test.com",
				"upstream": {
					"nodes": {
						"` + UpstreamIp + `:1981": 1
					},
					"type": "roundrobin"
				}
			}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:         "delete the stream route just created",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/stream_routes/sr1",
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
