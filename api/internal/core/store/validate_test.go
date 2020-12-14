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
	err = json.Unmarshal([]byte(reqBody), consumer)
	assert.Nil(t, err)
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
	err = json.Unmarshal([]byte(reqBody), consumer2)
	assert.Nil(t, err)

	err = validator.Validate(consumer2)
	assert.NotNil(t, err)
	assert.EqualError(t, err, "schema validate failed: id: Must validate at least one schema (anyOf)\nid: Invalid type. Expected: string, given: null")

	//check nil obj
	err = validator.Validate(nil)
	assert.NotNil(t, err)
	assert.EqualError(t, err, "schema validate failed: (root): Invalid type. Expected: object, given: null")

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
	err = json.Unmarshal([]byte(reqBody), consumer3)
	assert.Nil(t, err)
	err = validator.Validate(consumer3)
	assert.NotNil(t, err)
	assert.EqualError(t, err, "schema validate failed: (root): count is required")
}

func TestAPISIXJsonSchemaValidator_checkUpstream(t *testing.T) {
	validator, err := NewAPISIXJsonSchemaValidator("main.route")
	assert.Nil(t, err)

	// type:chash, hash_on: consumer, missing key, ok
	route := &entity.Route{}
	reqBody := `{
		"id": "1",
		"methods": ["GET"],
		"upstream": {
		  "nodes": {
		      "127.0.0.1:8080": 1
		  },
		  "type": "chash",
		  "hash_on":"consumer"
		},
		"desc": "new route",
		"uri": "/index.html"
	}`
	err = json.Unmarshal([]byte(reqBody), route)
	assert.Nil(t, err)
	err = validator.Validate(route)
	assert.Nil(t, err)

	// type:chash, hash_on: default(vars), missing key
	route2 := &entity.Route{}
	reqBody = `{
		"id": "1",
		"methods": ["GET"],
		"upstream": {
		  "nodes": {
		      "127.0.0.1:8080": 1
		  },
		  "type": "chash"
		},
		"desc": "new route",
		"uri": "/index.html"
	}`
	err = json.Unmarshal([]byte(reqBody), route2)
	assert.Nil(t, err)
	err = validator.Validate(route2)
	assert.NotNil(t, err)
	assert.EqualError(t, err, "missing key")

	//type:chash, hash_on: header, missing key
	route3 := &entity.Route{}
	reqBody = `{
		"id": "1",
		"methods": ["GET"],
		"upstream": {
		  "nodes": {
		      "127.0.0.1:8080": 1
		  },
		  "type": "chash",
		  "hash_on":"header"
		},
		"desc": "new route",
		"uri": "/index.html"
	}`
	err = json.Unmarshal([]byte(reqBody), route3)
	assert.Nil(t, err)
	err = validator.Validate(route3)
	assert.NotNil(t, err)
	assert.EqualError(t, err, "missing key")

	//type:chash, hash_on: cookie, missing key
	route4 := &entity.Route{}
	reqBody = `{
		"id": "1",
		"methods": ["GET"],
		"upstream": {
		  "nodes": {
		      "127.0.0.1:8080": 1
		  },
		  "type": "chash",
		  "hash_on":"cookie"
		},
		"desc": "new route",
		"uri": "/index.html"
	}`
	err = json.Unmarshal([]byte(reqBody), route4)
	assert.Nil(t, err)
	err = validator.Validate(route4)
	assert.NotNil(t, err)
	assert.EqualError(t, err, "missing key")

	//type:chash, hash_on: vars, wrong key
	route5 := &entity.Route{}
	reqBody = `{
		"id": "1",
		"methods": ["GET"],
		"upstream": {
		  "nodes": {
		      "127.0.0.1:8080": 1
		  },
		  "type": "chash",
		  "hash_on":"vars",
		  "key": "not_support"
		},
		"desc": "new route",
		"uri": "/index.html"
	}`
	err = json.Unmarshal([]byte(reqBody), route5)
	assert.Nil(t, err)
	err = validator.Validate(route5)
	assert.NotNil(t, err)
	assert.EqualError(t, err, "schema validate failed: (root): Does not match pattern '^((uri|server_name|server_addr|request_uri|remote_port|remote_addr|query_string|host|hostname)|arg_[0-9a-zA-z_-]+)$'")
}

func TestAPISIXJsonSchemaValidator_Plugin(t *testing.T) {
	validator, err := NewAPISIXJsonSchemaValidator("main.route")
	assert.Nil(t, err)

	// validate plugin's schema which has no `properties` or empty `properties`
	route := &entity.Route{}
	reqBody := `{
		"id": "1",
		"uri": "/hello",
		"plugins": {
			"prometheus": {
				"disable": false
			},
			"key-auth": {
				"disable": true
			}
		}
	}`
	err = json.Unmarshal([]byte(reqBody), route)
	assert.Nil(t, err)
	err = validator.Validate(route)
	assert.Nil(t, err)

	// validate plugin's schema which use `oneOf`
	reqBody = `{
		"id": "1",
		"uri": "/hello",
		"plugins": {
                        "ip-restriction": {
                            "blacklist": [
                                "127.0.0.0/24"
                            ],
                            "disable": true
                        }
		}
	}`
	err = json.Unmarshal([]byte(reqBody), route)
	assert.Nil(t, err)
	err = validator.Validate(route)
	assert.Nil(t, err)

	// validate plugin's schema with invalid type for `disable`
	reqBody = `{
		"id": "1",
		"uri": "/hello",
		"plugins": {
                        "ip-restriction": {
                            "blacklist": [
                                "127.0.0.0/24"
                            ],
                            "disable": 1
                        }
		}
	}`
	err = json.Unmarshal([]byte(reqBody), route)
	assert.Nil(t, err)
	err = validator.Validate(route)
	assert.Equal(t, fmt.Errorf("schema validate failed: (root): Must validate one and only one schema (oneOf)\n(root): Additional property disable is not allowed"), err)
}

func TestAPISIXJsonSchemaValidator_Route_checkRemoteAddr(t *testing.T) {
	tests := []struct {
		caseDesc        string
		giveContent     string
		wantNewErr      error
		wantValidateErr error
	}{
		{
			caseDesc: "correct remote_addr",
			giveContent: `{
				"id": "1",
				"uri": "/*",
				"upstream": {
					"nodes": [{
						"host": "127.0.0.1",
						"port": 8080,
						"weight": 1
					}],
					"type": "roundrobin"
				},
				"remote_addr": "127.0.0.1"
			}`,
		},
		{
			caseDesc: "correct remote_addr (CIDR)",
			giveContent: `{
				"id": "1",
				"uri": "/*",
				"upstream": {
					"nodes": [{
						"host": "127.0.0.1",
						"port": 8080,
						"weight": 1
					}],
					"type": "roundrobin"
				},
				"remote_addr": "192.168.1.0/24"
			}`,
		},
		{
			caseDesc: "invalid remote_addr",
			giveContent: `{
				"id": "1",
				"uri": "/*",
				"upstream": {
					"nodes": [{
						"host": "127.0.0.1",
						"port": 8080,
						"weight": 1
					}],
					"type": "roundrobin"
				},
				"remote_addr": "127.0.0."
			}`,
			wantValidateErr: fmt.Errorf("schema validate failed: remote_addr: Must validate at least one schema (anyOf)\nremote_addr: Does not match pattern '^[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}$'"),
		},
		{
			caseDesc: "correct remote_addrs",
			giveContent: `{
				"id": "1",
				"uri": "/*",
				"upstream": {
					"nodes": [{
						"host": "127.0.0.1",
						"port": 8080,
						"weight": 1
					}],
					"type": "roundrobin"
				},
				"remote_addrs": ["127.0.0.1", "192.0.0.0/8", "::1", "fe80::1/64"]
			}`,
		},
		{
			caseDesc: "invalid remote_addrs",
			giveContent: `{
				"id": "1",
				"uri": "/*",
				"upstream": {
					"nodes": [{
						"host": "127.0.0.1",
						"port": 8080,
						"weight": 1
					}],
					"type": "roundrobin"
				},
				"remote_addrs": ["127.0.0.", "192.0.0.0/128", "::1"]
			}`,
			wantValidateErr: fmt.Errorf("schema validate failed: remote_addrs.0: Must validate at least one schema (anyOf)\nremote_addrs.0: Does not match pattern '^[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}$'\nremote_addrs.1: Must validate at least one schema (anyOf)\nremote_addrs.1: Does not match pattern '^[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}$'"),
		},
		{
			caseDesc: "invalid remote_addrs (an empty string item)",
			giveContent: `{
				"id": "1",
				"uri": "/*",
				"upstream": {
					"nodes": [{
						"host": "127.0.0.1",
						"port": 8080,
						"weight": 1
					}],
					"type": "roundrobin"
				},
				"remote_addrs": [""]
			}`,
			wantValidateErr: fmt.Errorf("schema validate failed: invalid field remote_addrs"),
		},
	}

	// todo: add a test case for "remote_addr": ""

	for _, tc := range tests {
		validator, err := NewAPISIXJsonSchemaValidator("main.route")
		if err != nil {
			assert.Equal(t, tc.wantNewErr, err, tc.caseDesc)
			continue
		}
		route := &entity.Route{}
		err = json.Unmarshal([]byte(tc.giveContent), route)
		assert.Nil(t, err, tc.caseDesc)

		err = validator.Validate(route)
		if tc.wantValidateErr == nil {
			assert.Equal(t, nil, err, tc.caseDesc)
			continue
		}

		assert.Equal(t, tc.wantValidateErr, err, tc.caseDesc)
	}
}

func TestAPISIXSchemaValidator_Validate(t *testing.T) {
	validator, err := NewAPISIXSchemaValidator("main.consumer")
	assert.Nil(t, err)

	// normal config, should pass
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
	err = validator.Validate([]byte(reqBody))
	assert.Nil(t, err)

	// config with non existent field, should be failed.
	reqBody = `{
		"username": "jack",
		"not-exist": "val",
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
	err = validator.Validate([]byte(reqBody))
	assert.NotNil(t, err)
	assert.EqualError(t, err, "schema validate failed: (root): Additional property not-exist is not allowed")

}
