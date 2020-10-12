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

package utils

import (
	"encoding/json"
	"testing"

	"github.com/stretchr/testify/assert"

	"github.com/apisix/manager-api/internal/core/entity"
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

	//plugin schema fail
	consumer3 := &entity.Consumer{}
	reqBody = `{
      "id": "jack",
      "username": "jack",
      "plugins": {
          "limit-count": {
              "time_window": 60,
              "rejected_code": 503,
              "key": "remote_addr"
          }
      },
    "desc": "test description"
  }`
	json.Unmarshal([]byte(reqBody), consumer3)

	err = SchemaCheck("main.consumer", consumer3)
	assert.NotNil(t, err)
	assert.Errorf(t, err, "scheme validate fail: (root): count is required")

}
