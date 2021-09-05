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

package route_online_debug

import (
	"compress/gzip"
	"github.com/apisix/manager-api/internal/core/entity"
	"github.com/apisix/manager-api/internal/core/store"
	"github.com/shiningrush/droplet"
	"github.com/shiningrush/droplet/data"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"net/http"
	"net/http/httptest"
	"testing"
)

var TestResponse = "test"

//type TestRoute struct {
//	Path string
//	Result string
//}

//var test map[string]TestRoute = map[string]TestRoute {
//	"test1": {
//		Path:   "test1",
//		Result: "test1",
//	},
//	"test2": {
//		Path: "test2",
//		Result: "test2",
//	},
//}

func mockServer() *httptest.Server {
	f := func(w http.ResponseWriter, r *http.Request) {
		w.Header().Add("Content-Type", "plain/text")
		w.Header().Set("Content-Encoding", "gzip")
		writer, _ := gzip.NewWriterLevel(w, gzip.BestCompression)
		defer writer.Close()
		_, _ = writer.Write([]byte(TestResponse))
	}
	return httptest.NewServer(http.HandlerFunc(f))
}

func TestDebugRequestForwardingANDRequestForwarding(t *testing.T) {
	server := mockServer()
	defer server.Close()
	var cases = []struct {
		Desc      string
		Input     *DebugOnlineInput
		Result    interface{}
		MockRoute *entity.Route
	}{
		{
			Desc: "unsupported protocol",
			Input: &DebugOnlineInput{
				ID:              "test1",
				RequestProtocol: "grpc",
			},
			MockRoute: &entity.Route{
				BaseInfo: entity.BaseInfo{
					ID: "",
				},
				URI:     "",
				Methods: []string{""},
				Upstream: &entity.UpstreamDef{
					Nodes: []*entity.Node{
						{Port: 0, Host: ""},
					},
					Retries:       0,
					Timeout:       nil,
					Type:          "",
					Checks:        nil,
					HashOn:        "",
					Key:           "",
					Scheme:        "",
					DiscoveryType: "",
					PassHost:      "",
					UpstreamHost:  "",
					Name:          "",
					Desc:          "",
					ServiceName:   "",
					Labels:        nil,
					TLS:           nil,
				},
				ServiceID:       nil,
				UpstreamID:      nil,
				ServiceProtocol: "",
			},
			Result: &data.SpecCodeResponse{StatusCode: http.StatusBadRequest},
		},
		{
			Desc: "can not get header",
			Input: &DebugOnlineInput{
				ID:              "test2",
				RequestProtocol: "http",
				RequestPath:     "test/1",
				Method:          "get",
			},
			MockRoute: &entity.Route{
				BaseInfo: entity.BaseInfo{
					ID: "test2",
				},
				URI:     "",
				Methods: []string{""},
				Upstream: &entity.UpstreamDef{
					Nodes: []*entity.Node{
						{Port: 0, Host: ""},
					},
					Retries:       0,
					Timeout:       nil,
					Type:          "",
					Checks:        nil,
					HashOn:        "",
					Key:           "",
					Scheme:        "",
					DiscoveryType: "",
					PassHost:      "",
					UpstreamHost:  "",
					Name:          "",
					Desc:          "",
					ServiceName:   "",
					Labels:        nil,
					TLS:           nil,
				},
				ServiceID:       nil,
				UpstreamID:      nil,
				ServiceProtocol: "",
			},
			Result: &data.SpecCodeResponse{StatusCode: http.StatusBadRequest},
		},
	}

	for _, c := range cases {
		routeStore := &store.MockInterface{}
		routeStore.On("Get", mock.Anything, mock.Anything).Run(func(args mock.Arguments) {
		}).Return(c.MockRoute, nil)

		t.Run(c.Desc, func(t *testing.T) {
			handler := Handler{
				routeStore:    routeStore,
				svcStore:      nil,
				upstreamStore: nil,
			}

			//proto := &HTTPProtocolSupport{}
			context := droplet.NewContext()
			context.SetInput(c.Input)

			result, _ := handler.DebugRequestForwarding(context)

			//result, _ := proto.RequestForwarding(context)
			switch result.(type) {
			case *Result:
				assert.Equal(t, c.Result, result.(*Result).Data)
			case *data.SpecCodeResponse:
				assert.Equal(t, c.Result, result)
			}
		})
	}
}
