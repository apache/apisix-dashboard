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

package upstream

import (
	"encoding/json"
	"testing"
	"time"

	"github.com/shiningrush/droplet"
	"github.com/stretchr/testify/assert"

	"github.com/apisix/manager-api/internal/conf"
	"github.com/apisix/manager-api/internal/core/entity"
	"github.com/apisix/manager-api/internal/core/storage"
	"github.com/apisix/manager-api/internal/core/store"
)

var upstreamHandler *Handler

func TestUpstream(t *testing.T) {
	// init
	err := storage.InitETCDClient(conf.ETCDConfig)
	assert.Nil(t, err)
	err = store.InitStores()
	assert.Nil(t, err)

	upstreamHandler = &Handler{
		upstreamStore: store.GetStore(store.HubKeyUpstream),
	}
	assert.NotNil(t, upstreamHandler)

	//create
	ctx := droplet.NewContext()
	upstream := &entity.Upstream{}
	reqBody := `{
		"id": "1",
		"name": "upstream3",
		"description": "upstream upstream",
		"type": "roundrobin",
		"nodes": [{
			"host": "a.a.com",
			"port": 80,
			"weight": 1
		}],
		"timeout":{
			"connect":15,
			"send":15,
			"read":15
		},
		"hash_on": "header",
		"key": "server_addr",
		"checks": {
			"active": {
				"timeout": 5,
				"http_path": "/status",
				"host": "foo.com",
				"healthy": {
					"interval": 2,
					"successes": 1
				},
				"unhealthy": {
					"interval": 1,
					"http_failures": 2
				},
				"req_headers": ["User-Agent: curl/7.29.0"]
			},
			"passive": {
				"healthy": {
					"http_statuses": [200, 201],
					"successes": 3
				},
				"unhealthy": {
					"http_statuses": [500],
					"http_failures": 3,
					"tcp_failures": 3
				}
			}
		}
	}`
	err = json.Unmarshal([]byte(reqBody), upstream)
	assert.Nil(t, err)
	ctx.SetInput(upstream)
	ret, err := upstreamHandler.Create(ctx)
	assert.Nil(t, err)
	objRet, ok := ret.(*entity.Upstream)
	assert.True(t, ok)
	assert.Equal(t, "1", objRet.ID)

	//sleep
	time.Sleep(time.Duration(100) * time.Millisecond)

	//get
	input := &GetInput{}
	input.ID = "1"
	ctx.SetInput(input)
	ret, err = upstreamHandler.Get(ctx)
	stored := ret.(*entity.Upstream)
	assert.Nil(t, err)
	assert.Equal(t, stored.ID, upstream.ID)

	//update
	upstream2 := &UpdateInput{}
	upstream2.ID = "1"
	reqBody = `{
		"id": "1",
		"name": "upstream3",
		"description": "upstream upstream",
		"type": "roundrobin",
		"nodes": [{
			"host": "a.a.com",
			"port": 80,
			"weight": 1
		}],
		"timeout":{
			"connect":15,
			"send":15,
			"read":15
		},
		"enable_websocket": true,
		"hash_on": "header",
		"key": "server_addr",
		"checks": {
			"active": {
				"timeout": 5,
				"http_path": "/status",
				"host": "foo.com",
				"healthy": {
					"interval": 2,
					"successes": 1
				},
				"unhealthy": {
					"interval": 1,
					"http_failures": 2
				},
				"req_headers": ["User-Agent: curl/7.29.0"]
			},
			"passive": {
				"healthy": {
					"http_statuses": [200, 201],
					"successes": 3
				},
				"unhealthy": {
					"http_statuses": [500],
					"http_failures": 3,
					"tcp_failures": 3
				}
			}
		}
	}`
	err = json.Unmarshal([]byte(reqBody), upstream2)
	assert.Nil(t, err)
	ctx.SetInput(upstream2)
	ret, err = upstreamHandler.Update(ctx)
	assert.Nil(t, err)
	// check the returned value
	objRet, ok = ret.(*entity.Upstream)
	assert.True(t, ok)
	assert.Equal(t, upstream2.ID, objRet.ID)

	//list
	listInput := &ListInput{}
	reqBody = `{"page_size": 1, "page": 1}`
	err = json.Unmarshal([]byte(reqBody), listInput)
	assert.Nil(t, err)
	ctx.SetInput(listInput)
	retPage, err := upstreamHandler.List(ctx)
	assert.Nil(t, err)
	dataPage := retPage.(*store.ListOutput)
	assert.Equal(t, len(dataPage.Rows), 1)

	//delete test data
	inputDel := &BatchDelete{}
	reqBody = `{"ids": "1"}`
	err = json.Unmarshal([]byte(reqBody), inputDel)
	assert.Nil(t, err)
	ctx.SetInput(inputDel)
	_, err = upstreamHandler.BatchDelete(ctx)
	assert.Nil(t, err)

}

func TestUpstream_Pass_Host(t *testing.T) {
	//create
	ctx := droplet.NewContext()
	upstream := &entity.Upstream{}
	reqBody := `{
		"id": "2",
		"nodes": [{
			"host": "httpbin.org",
			"port": 80,
			"weight": 1
		}],
		"type": "roundrobin",
		"pass_host": "node"
	}`
	err := json.Unmarshal([]byte(reqBody), upstream)
	assert.Nil(t, err)
	ctx.SetInput(upstream)
	ret, err := upstreamHandler.Create(ctx)
	assert.Nil(t, err)
	objRet, ok := ret.(*entity.Upstream)
	assert.True(t, ok)
	assert.Equal(t, "2", objRet.ID)

	//sleep
	time.Sleep(time.Duration(20) * time.Millisecond)

	//get
	input := &GetInput{}
	input.ID = "2"
	ctx.SetInput(input)
	ret, err = upstreamHandler.Get(ctx)
	stored := ret.(*entity.Upstream)
	assert.Nil(t, err)
	assert.Equal(t, stored.ID, upstream.ID)

	//delete test data
	inputDel := &BatchDelete{}
	reqBody = `{"ids": "2"}`
	err = json.Unmarshal([]byte(reqBody), inputDel)
	assert.Nil(t, err)
	ctx.SetInput(inputDel)
	_, err = upstreamHandler.BatchDelete(ctx)
	assert.Nil(t, err)

}
