package utils

import (
	"encoding/json"
	"github.com/apisix/manager-api/internal/core/entity"
	"github.com/stretchr/testify/assert"
	"testing"
)

func TestSchemaCheck(t *testing.T) {
	//schema check ok
	consumer := &entity.Consumer{}
	reqBody := `{
      "id": "jack",
      "username": "jack",
      "plugins": {
          "limit-count": {
              "count": 2,
              "time_window": 60,
              "rejected_code": 503,
              "key": "remote_addr"
          }
      },
    "desc": "test description"
  }`
	json.Unmarshal([]byte(reqBody), consumer)

	err := SchemaCheck("main.consumer", consumer)
	assert.Nil(t, err)

	//missing id
	consumer2 := &entity.Consumer{}
	reqBody = `{
      "username": "jack",
      "plugins": {
          "limit-count": {
              "count": 2,
              "time_window": 60,
              "rejected_code": 503,
              "key": "remote_addr"
          }
      },
    "desc": "test description"
  }`
	json.Unmarshal([]byte(reqBody), consumer2)

	err = SchemaCheck("main.consumer", consumer2)
	assert.NotNil(t, err)
	assert.Errorf(t, err, "scheme validate fail: id: Must validate at least one schema (anyOf)")

	//nil
	err = SchemaCheck("main.consumer", nil)
	assert.NotNil(t, err)
	assert.Errorf(t, err, "scheme validate fail: id: Must validate at least one schema (anyOf)")

	//schema not defined
	err = SchemaCheck("main.notfound", nil)
	assert.NotNil(t, err)
	assert.Errorf(t, err, "schema not found")

}
