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
	"errors"
	"net/http"
	"net/http/httptest"
	"net/url"
	"testing"

	"github.com/shiningrush/droplet"
	"github.com/shiningrush/droplet/data"
	"github.com/stretchr/testify/assert"

	"github.com/apisix/manager-api/internal/conf"
)

var TestResponse = "test"

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

func TestHTTPProtocolSupport_RequestForwarding(t *testing.T) {
	server := mockServer()
	parsedURL, err := url.ParseRequestURI(server.URL)
	assert.Nil(t, err)
	conf.Gateways = append(conf.Gateways, parsedURL.Host)
	defer server.Close()
	var cases = []struct {
		Desc   string
		Input  *DebugOnlineInput
		Result interface{}
		RetErr error
	}{
		{
			Desc: "unsupported method",
			Input: &DebugOnlineInput{
				URL:          server.URL,
				Method:       "Lock",
				HeaderParams: "{}",
			},
			Result: &data.SpecCodeResponse{StatusCode: http.StatusBadRequest},
			RetErr: errors.New("the method is not allowed for debugging"),
		},
		{
			Desc: "wrong url",
			Input: &DebugOnlineInput{
				URL:             "grpc://127.0.0.1:9080",
				Method:          "Get",
				HeaderParams:    "{}",
				RequestProtocol: "grpc",
			},
			Result: &data.SpecCodeResponse{StatusCode: http.StatusBadRequest},
			RetErr: errors.New(`protocol unsupported grpc`),
		},
		{
			Desc: "not specify the accept-encoding request header explicitly",
			Input: &DebugOnlineInput{
				URL:          server.URL,
				Method:       "Get",
				HeaderParams: "{}",
			},
			Result: TestResponse,
		},
		{
			Desc: "specify the accept-encoding request header explicitly",
			Input: &DebugOnlineInput{
				URL:          server.URL,
				Method:       "Get",
				HeaderParams: `{"Accept-Encoding": ["gzip"]}`,
			},
			Result: TestResponse,
		},
		{
			Desc: "not allowed host",
			Input: &DebugOnlineInput{
				URL:          "http://127.0.0.1:8080",
				Method:       "Get",
				HeaderParams: "{}",
			},
			Result: &data.SpecCodeResponse{StatusCode: http.StatusBadRequest},
			RetErr: errors.New(`invalid debugging url: doesn't match any host of APISIX gateways`),
		},
		{
			Desc: "not allowed path",
			Input: &DebugOnlineInput{
				URL:          "http://127.0.0.1:9080/apisix/admin/routes",
				Method:       "Get",
				HeaderParams: "{}",
			},
			Result: &data.SpecCodeResponse{StatusCode: http.StatusBadRequest},
			RetErr: errors.New(`invalid debugging url: the path is forbidden for debugging`),
		},
	}
	for _, c := range cases {
		t.Run(c.Desc, func(t *testing.T) {
			ctx := droplet.NewContext()
			ctx.SetInput(c.Input)
			h := Handler{}
			result, err := h.DebugRequestForwarding(ctx)
			assert.Equal(t, c.RetErr, err)

			switch result.(type) {
			case *Result:
				assert.Equal(t, result.(*Result).Data, c.Result.(string))
			case *data.SpecCodeResponse:
				assert.Equal(t, result, c.Result)
			}
		})
	}
}

func TestCheckHost(t *testing.T) {
	err := checkHost("127.0.0.1:9080")
	assert.Nil(t, err)

	err = checkHost("github.com")
	assert.Equal(t, err, errors.New("doesn't match any host of APISIX gateways"))
}

func TestCheckPath(t *testing.T) {
	err := checkPath("/books/1")
	assert.Nil(t, err)

	err = checkPath("/test/apisix")
	assert.Nil(t, err)

	err = checkPath("/apisix/admin/routes")
	assert.Equal(t, err, errors.New("the path is forbidden for debugging"))
}
