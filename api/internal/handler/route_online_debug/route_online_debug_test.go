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
