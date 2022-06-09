package openapi_legacy

import (
	"io/ioutil"
	"testing"

	"github.com/stretchr/testify/assert"
)

var (
	TestFilePrefix = "../../../../../"
)

func TestImport_invalid_content(t *testing.T) {
	l := &Loader{}
	_, err := l.Import([]byte(`{"test": "a"}`))
	assert.EqualError(t, err, "empty or invalid imported file")
}

func TestImport_with_service_id(t *testing.T) {
	fileContent, err := ioutil.ReadFile(TestFilePrefix + "test/testdata/import/with-service-id.yaml")
	assert.NoError(t, err)

	l := &Loader{}
	data, err := l.Import(fileContent)
	assert.NoError(t, err)

	assert.Equal(t, "service1", data.Routes[0].ServiceID)
}

func TestImport_with_upstream_id(t *testing.T) {
	fileContent, err := ioutil.ReadFile(TestFilePrefix + "test/testdata/import/with-upstream-id.yaml")
	assert.NoError(t, err)

	l := &Loader{}
	data, err := l.Import(fileContent)
	assert.NoError(t, err)

	assert.Equal(t, "upstream1", data.Routes[0].UpstreamID)
}
