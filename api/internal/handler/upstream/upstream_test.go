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

	"github.com/apisix/manager-api/internal/core/entity"
	"github.com/apisix/manager-api/internal/core/storage"
	"github.com/apisix/manager-api/internal/core/store"
)

func TestUpstream(t *testing.T) {
	// init
	err := storage.InitETCDClient([]string{"127.0.0.1:2379"})
	assert.Nil(t, err)
	err = store.InitStores()
	assert.Nil(t, err)

	handler := &Handler{
		upstreamStore: store.GetStore(store.HubKeyUpstream),
	}
	assert.NotNil(t, handler)

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
	json.Unmarshal([]byte(reqBody), upstream)
	ctx.SetInput(upstream)
	_, err = handler.Create(ctx)
	assert.Nil(t, err)

	//sleep
	time.Sleep(time.Duration(100) * time.Millisecond)

	//get
	input := &GetInput{}
	input.ID = "1"
	ctx.SetInput(input)
	ret, err := handler.Get(ctx)
	stored := ret.(*entity.Upstream)
	assert.Nil(t, err)
	assert.Equal(t, stored.ID, upstream.ID)

	//update
	upstream2 := &UpdateInput{}
	upstream2.ID = "1"
	reqBody = `{
    "id": "aaa",
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
	json.Unmarshal([]byte(reqBody), upstream2)
	ctx.SetInput(upstream2)
	_, err = handler.Update(ctx)
	assert.Nil(t, err)

	//list
	listInput := &ListInput{}
	reqBody = `{"page_size": 1, "page": 1}`
	json.Unmarshal([]byte(reqBody), listInput)
	ctx.SetInput(listInput)
	retPage, err := handler.List(ctx)
	assert.Nil(t, err)
	dataPage := retPage.(*store.ListOutput)
	assert.Equal(t, len(dataPage.Rows), 1)

	//delete test data
	inputDel := &BatchDelete{}
	reqBody = `{"ids": "1"}`
	json.Unmarshal([]byte(reqBody), inputDel)
	ctx.SetInput(inputDel)
	_, err = handler.BatchDelete(ctx)
	assert.Nil(t, err)

}
