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

	"github.com/apisix/manager-api/internal/conf"
)

func TestPlugin(t *testing.T) {
	// init
	handler := &Handler{}
	assert.NotNil(t, handler)

	// plugin list(old api, return name only)
	listInput := &ListInput{}
	ctx := droplet.NewContext()
	ctx.SetInput(listInput)
	list, err := handler.Plugins(ctx)
	assert.Nil(t, err)
	assert.Contains(t, list.([]string), "limit-count")

	// plugin list(return all fields of plugin)
	listInput = &ListInput{
		All: true,
	}
	ctx = droplet.NewContext()
	ctx.SetInput(listInput)
	list, err = handler.Plugins(ctx)
	assert.Nil(t, err)
	plugins := list.([]map[string]interface{})
	var authPlugins []string
	var basicAuthConsumerSchema string
	for _, plugin := range plugins {
		if plugin["type"] == "auth" {
			authPlugins = append(authPlugins, plugin["name"].(string))
		}
		if plugin["name"] == "basic-auth" {
			consumerSchemaByte, err := json.Marshal(plugin["consumer_schema"])
			basicAuthConsumerSchema = string(consumerSchemaByte)
			assert.Nil(t, err)
		}

		assert.Contains(t, conf.Plugins, plugin["name"])
	}

	assert.Contains(t, conf.Plugins, "server-info")
	assert.Contains(t, conf.Plugins, "traffic-split")
	assert.NotContains(t, conf.Plugins, "dubbo-proxy")

	// plugin type
	assert.ElementsMatch(t, []string{"basic-auth", "jwt-auth", "hmac-auth", "key-auth", "wolf-rbac"}, authPlugins)
	// consumer schema
	assert.Equal(t, `{"additionalProperties":false,"properties":{"password":{"type":"string"},"username":{"type":"string"}},"required":["password","username"],"title":"work with consumer object","type":"object"}`, basicAuthConsumerSchema)

	// schema
	input := &GetInput{
		Name: "limit-count",
	}
	ctx.SetInput(input)
	val, _ := handler.Schema(ctx)
	assert.NotNil(t, val)

	// not exists
	reqBody := `{
	  "name": "not-exists"
	}`
	err = json.Unmarshal([]byte(reqBody), input)
	assert.Nil(t, err)
	ctx.SetInput(input)
	val, _ = handler.Schema(ctx)
	assert.Nil(t, val)

	/*
	 get plugin schema with schema_type: consumer
	 plugin has consumer_schema
	 return plugin`s consumer_schema
	*/
	reqBody = `{
	 	"name": "jwt-auth",
		"schema_type": "consumer"
  	}`
	json.Unmarshal([]byte(reqBody), input)
	ctx.SetInput(input)
	val, _ = handler.Schema(ctx)
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
	json.Unmarshal([]byte(reqBody), input)
	ctx.SetInput(input)
	val, _ = handler.Schema(ctx)
	assert.NotNil(t, val)

	/*
	 get plugin schema with wrong schema_type: type,
	 return plugin`s schema
	*/
	reqBody = `{
		"name": "jwt-auth",
		"schema_type": "type"
  	}`
	json.Unmarshal([]byte(reqBody), input)
	ctx.SetInput(input)
	val, _ = handler.Schema(ctx)
	assert.NotNil(t, val)

	// schema of dubbo-proxy
	input = &GetInput{
		Name: "dubbo-proxy",
	}
	ctx.SetInput(input)
	val, err = handler.Schema(ctx)
	assert.NotNil(t, val)
	assert.Nil(t, err)
}
