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

package schema

import (
	"encoding/json"
	"net/http"
	"testing"

	"github.com/shiningrush/droplet"
	"github.com/shiningrush/droplet/data"
	"github.com/stretchr/testify/assert"
)

func TestSchema(t *testing.T) {
	// init
	ctx := droplet.NewContext()
	handler := &SchemaHandler{}
	assert.NotNil(t, handler)

	input := &SchemaInput{}

	// not exists return nil
	reqBody := `{
		"resource": "not-exists"
	}`
	err := json.Unmarshal([]byte(reqBody), input)
	assert.Nil(t, err)
	ctx.SetInput(input)
	ret, _ := handler.Schema(ctx)
	assert.Equal(t, http.StatusNotFound, ret.(*data.SpecCodeResponse).StatusCode)

	// route
	reqBody = `{
		"resource": "route"
	}`
	err = json.Unmarshal([]byte(reqBody), input)
	assert.Nil(t, err)
	ctx.SetInput(input)
	val, _ := handler.Schema(ctx)
	assert.NotNil(t, val)

	// ----------- plugin schema  ----------

	// limit-count
	pluginInput := &PluginSchemaInput{
		Name: "limit-count",
	}
	ctx.SetInput(pluginInput)
	val, _ = handler.PluginSchema(ctx)
	assert.NotNil(t, val)

	// not exists
	reqBody = `{
	  "name": "not-exists"
	}`
	err = json.Unmarshal([]byte(reqBody), pluginInput)
	assert.Nil(t, err)
	ctx.SetInput(pluginInput)
	res, _ := handler.PluginSchema(ctx)
	assert.Equal(t, http.StatusNotFound, res.(*data.SpecCodeResponse).StatusCode)

	/*
	 get plugin schema with schema_type: consumer
	 plugin has consumer_schema
	 return plugin`s consumer_schema
	*/
	reqBody = `{
	 	"name": "jwt-auth",
		"schema_type": "consumer"
  	}`
	json.Unmarshal([]byte(reqBody), pluginInput)
	ctx.SetInput(pluginInput)
	val, _ = handler.PluginSchema(ctx)
	assert.NotNil(t, val)

	/*
	 get plugin schema with schema_type: consumer
	 plugin does not have consumer_schema
	 return plugin`s schema
	*/
	reqBody = `{
		"name": "limit-count",
		"schema_type": "consumer"
	}`
	json.Unmarshal([]byte(reqBody), pluginInput)
	ctx.SetInput(pluginInput)
	val, _ = handler.PluginSchema(ctx)
	assert.NotNil(t, val)

	/*
	 get plugin schema with wrong schema_type: type,
	 return plugin`s schema
	*/
	reqBody = `{
		"name": "jwt-auth",
		"schema_type": "type"
  	}`
	json.Unmarshal([]byte(reqBody), pluginInput)
	ctx.SetInput(pluginInput)
	val, _ = handler.PluginSchema(ctx)
	assert.NotNil(t, val)
}
