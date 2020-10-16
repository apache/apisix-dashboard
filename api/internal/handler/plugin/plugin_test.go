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

package plugin

import (
	"encoding/json"
	"testing"

	"github.com/shiningrush/droplet"
	"github.com/stretchr/testify/assert"
)

func TestPlugin(t *testing.T) {
	// init
	handler := &Handler{}
	assert.NotNil(t, handler)

	//plugin list
	ctx := droplet.NewContext()
	list, err := handler.Plugins(ctx)
	assert.Nil(t, err)
	assert.Contains(t, list.([]string), "limit-count")

	//schema
	input := &GetInput{}
	reqBody := `{
	  "name": "limit-count"
  }`
	json.Unmarshal([]byte(reqBody), input)
	ctx.SetInput(input)
	val, _ := handler.Schema(ctx)
	assert.NotNil(t, val)

	//not exists
	input2 := &GetInput{}
	reqBody = `{
	  "name": "not-exists"
  }`
	json.Unmarshal([]byte(reqBody), input2)
	ctx.SetInput(input2)
	val, _ = handler.Schema(ctx)
	assert.Nil(t, val)
}
