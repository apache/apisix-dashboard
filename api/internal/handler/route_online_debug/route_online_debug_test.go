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
	"github.com/shiningrush/droplet"
	"github.com/shiningrush/droplet/data"
	"github.com/stretchr/testify/assert"
	"net/http"
	"net/http/httptest"
	"testing"
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
	defer server.Close()
	var cases = []struct {
		Desc   string
		Input  *DebugOnlineInput
		Result interface{}
	}{
		{
			Desc: "unsupported method",
			Input: &DebugOnlineInput{
				URL:    server.URL,
				Method: "Lock",
			},
			Result: &data.SpecCodeResponse{StatusCode: http.StatusBadRequest},
		},
		{
			Desc:   "wrong url",
			Input:  &DebugOnlineInput{URL: "grpc://localhost"},
			Result: &data.SpecCodeResponse{StatusCode: http.StatusBadRequest},
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
	}
	for _, c := range cases {
		t.Run(c.Desc, func(t *testing.T) {
			proto := &HTTPProtocolSupport{}
			context := droplet.NewContext()
			context.SetInput(c.Input)
			result, _ := proto.RequestForwarding(context)
			switch result.(type) {
			case *Result:
				assert.Equal(t, result.(*Result).Data, c.Result.(string))
			case *data.SpecCodeResponse:
				assert.Equal(t, result, c.Result)
			}
		})
	}
}
