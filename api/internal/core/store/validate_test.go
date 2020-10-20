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
package store

import (
	"encoding/json"
	"fmt"
	"testing"

	"github.com/stretchr/testify/assert"

	"github.com/apisix/manager-api/internal/core/entity"
)

type TestObj struct {
	Name  string `json:"name"`
	Email string `json:"email"`
	Age   int    `json:"age"`
}

func TestJsonSchemaValidator_Validate(t *testing.T) {
	tests := []struct {
		givePath        string
		giveObj         interface{}
		wantNewErr      error
		wantValidateErr []error
	}{
		{
			givePath: "./test_case.json",
			giveObj: TestObj{
				Name:  "lessName",
				Email: "too long name greater than 10",
				Age:   12,
			},
			wantValidateErr: []error{
				fmt.Errorf("name: String length must be greater than or equal to 10\nemail: String length must be less than or equal to 10"),
				fmt.Errorf("email: String length must be less than or equal to 10\nname: String length must be greater than or equal to 10"),
			},
		},
	}

	for _, tc := range tests {
		v, err := NewJsonSchemaValidator(tc.givePath)
		if err != nil {
			assert.Equal(t, tc.wantNewErr, err)
			continue
		}
		err = v.Validate(tc.giveObj)
		ret := false
		for _, wantErr := range tc.wantValidateErr {
			if wantErr.Error() == err.Error() {
				ret = true
			}
		}
		assert.True(t, ret)
	}
}

func TestAPISIXJsonSchemaValidator_Validate(t *testing.T) {
	validator, err := NewAPISIXJsonSchemaValidator("main.consumer")
	assert.Nil(t, err)

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

	err = validator.Validate(consumer)
	assert.Nil(t, err)

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

	err = validator.Validate(consumer2)
	assert.NotNil(t, err)
	assert.EqualError(t, err, "scheme validate fail: id: Must validate at least one schema (anyOf)\nid: String length must be greater than or equal to 1\nid: Does not match pattern '^[a-zA-Z0-9-_]+$'")

	//check nil obj
	err = validator.Validate(nil)
	assert.NotNil(t, err)
	assert.EqualError(t, err, "scheme validate fail: (root): Invalid type. Expected: object, given: null")

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

	err = validator.Validate(consumer3)
	assert.NotNil(t, err)
	assert.EqualError(t, err, "scheme validate failed: (root): count is required")

}
