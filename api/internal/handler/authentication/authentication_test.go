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

package authentication

import (
	"encoding/json"
	"testing"

	"github.com/shiningrush/droplet"
	"github.com/stretchr/testify/assert"
)

func TestAuthentication(t *testing.T) {
	// init
	handler := &Handler{}
	assert.NotNil(t, handler)

	//login
	input := &LoginInput{}
	ctx := droplet.NewContext()
	reqBody := `{
	  "username": "admin",
	  "password": "admin"
	}`
	err := json.Unmarshal([]byte(reqBody), input)
	assert.Nil(t, err)
	ctx.SetInput(input)
	_, err = handler.userLogin(ctx)
	assert.Nil(t, err)

	//username error
	input2 := &LoginInput{}
	reqBody = `{
	  "username": "sdfasdf",
	  "password": "admin"
	}`
	err = json.Unmarshal([]byte(reqBody), input2)
	assert.Nil(t, err)
	ctx.SetInput(input2)
	_, err = handler.userLogin(ctx)
	assert.EqualError(t, err, "username or password error")

	//password error
	input3 := &LoginInput{}
	reqBody = `{
	  "username": "admin",
	  "password": "admin9384938"
	}`
	err = json.Unmarshal([]byte(reqBody), input3)
	assert.Nil(t, err)
	ctx.SetInput(input3)
	_, err = handler.userLogin(ctx)
	assert.EqualError(t, err, "username or password error")

}
