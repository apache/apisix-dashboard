package openapi3

import (
	"fmt"
	"io/ioutil"
	"testing"

	"github.com/stretchr/testify/assert"

	"github.com/apisix/manager-api/internal/core/entity"
)

var (
	TestAPI101 = "../../../../../test/testdata/import/Postman-API101.yaml"
)

// Test API 101 on no MergeMethod mode
func TestParseAPI101NoMerge(t *testing.T) {
	fileContent, err := ioutil.ReadFile(TestAPI101)
	assert.NoError(t, err)

	l := &Loader{MergeMethod: false, TaskName: "test"}
	data, err := l.Import(fileContent)
	assert.NoError(t, err)

	assert.Len(t, data.Routes, 5)
	assert.Len(t, data.Upstreams, 1)

	// Upstream
	assert.Equal(t, "https", data.Upstreams[0].Scheme)
	assert.Equal(t, float64(1), data.Upstreams[0].Nodes.(map[string]float64)["api-101.glitch.me"])
	assert.Equal(t, "test", data.Upstreams[0].Name)
	assert.Equal(t, "roundrobin", data.Upstreams[0].Type)

	// Route
	assert.Equal(t, data.Upstreams[0].ID, data.Routes[0].UpstreamID)
	for _, route := range data.Routes {
		switch route.Name {
		case "test_customer_GET":
			assert.Contains(t, route.Uris, "/customer")
			assert.Contains(t, route.Methods, "GET")
			assert.Equal(t, "Get one customer", route.Desc)
			assert.Equal(t, entity.Status(0), route.Status)
		case "test_customer-customer_id_PUT":
			assert.Contains(t, route.Uris, "/customer/*")
			assert.Contains(t, route.Methods, "PUT")
			assert.Equal(t, "Update customer", route.Desc)
			assert.Equal(t, entity.Status(0), route.Status)
		case "test_customer-customer_id_DELETE":
			assert.Contains(t, route.Uris, "/customer/*")
			assert.Contains(t, route.Methods, "DELETE")
			assert.Equal(t, "Remove customer", route.Desc)
			assert.Equal(t, entity.Status(0), route.Status)
		}
	}
}

// Test API 101 on MergeMethod mode
func TestParseAPI101Merge(t *testing.T) {
	fileContent, err := ioutil.ReadFile(TestAPI101)
	assert.NoError(t, err)

	l := &Loader{MergeMethod: true, TaskName: "test"}
	data, err := l.Import(fileContent)
	assert.NoError(t, err)

	assert.Len(t, data.Routes, 3)
	assert.Len(t, data.Upstreams, 1)

	// Upstream
	assert.Equal(t, "https", data.Upstreams[0].Scheme)
	assert.Equal(t, float64(1), data.Upstreams[0].Nodes.(map[string]float64)["api-101.glitch.me"])
	assert.Equal(t, "test", data.Upstreams[0].Name)
	assert.Equal(t, "roundrobin", data.Upstreams[0].Type)

	fmt.Println(data.Routes)

	// Route
	assert.Equal(t, data.Upstreams[0].ID, data.Routes[0].UpstreamID)
	for _, route := range data.Routes {
		switch route.Name {
		case "test_customer":
			assert.Contains(t, route.Uris, "/customer")
			assert.Contains(t, route.Methods, "GET", "GET")
			assert.Equal(t, entity.Status(0), route.Status)
		case "test_customers":
			assert.Contains(t, route.Uris, "/customers")
			assert.Contains(t, route.Methods, "GET")
			assert.Equal(t, entity.Status(0), route.Status)
		case "test_customer-customer_id":
			assert.Contains(t, route.Uris, "/customer/*")
			assert.Contains(t, route.Methods, "PUT", "DELETE")
			assert.Equal(t, entity.Status(0), route.Status)
		}
	}
}
