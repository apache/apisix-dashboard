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

package service

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

func TestService(t *testing.T) {
	// init
	err := storage.InitETCDClient([]string{"127.0.0.1:2379"})
	assert.Nil(t, err)
	err = store.InitStores()
	assert.Nil(t, err)

	handler := &Handler{
		serviceStore: store.GetStore(store.HubKeyService),
	}
	assert.NotNil(t, handler)

	//create
	ctx := droplet.NewContext()
	service := &entity.Service{}
	reqBody := `{
      "id": "1",
      "plugins": {
          "limit-count": {
              "count": 2,
              "time_window": 60,
              "rejected_code": 503,
              "key": "remote_addr"
          }
      },
      "upstream": {
          "type": "roundrobin",
          "nodes": [{
              "host": "39.97.63.215",
              "port": 80,
              "weight": 1
          }]
      }
  }`
	json.Unmarshal([]byte(reqBody), service)
	ctx.SetInput(service)
	_, err = handler.Create(ctx)
	assert.Nil(t, err)

	//sleep
	time.Sleep(time.Duration(100) * time.Millisecond)

	//get
	input := &GetInput{}
	input.ID = "1"
	ctx.SetInput(input)
	ret, err := handler.Get(ctx)
	stored := ret.(*entity.Service)
	assert.Nil(t, err)
	assert.Equal(t, stored.ID, service.ID)

	//update
	service2 := &UpdateInput{}
	service2.ID = "1"
	reqBody = `{
      "name": "test-service",
      "plugins": {
          "limit-count": {
              "count": 2,
              "time_window": 60,
              "rejected_code": 503,
              "key": "remote_addr"
          }
      },
      "upstream": {
          "type": "roundrobin",
          "nodes": [{
              "host": "39.97.63.215",
              "port": 80,
              "weight": 1
          }]
      }
  }`
	json.Unmarshal([]byte(reqBody), service2)
	ctx.SetInput(service2)
	_, err = handler.Update(ctx)
	assert.Nil(t, err)

	//sleep
	time.Sleep(time.Duration(100) * time.Millisecond)

	//list
	listInput := &ListInput{}
	reqBody = `{"page_size": 1, "page": 1}`
	json.Unmarshal([]byte(reqBody), listInput)
	ctx.SetInput(listInput)
	retPage, err := handler.List(ctx)
	assert.Nil(t, err)
	dataPage := retPage.(*store.ListOutput)
	assert.Equal(t, len(dataPage.Rows), 1)

	//list search match
	listInput2 := &ListInput{}
	reqBody = `{"page_size": 1, "page": 1, "name": "test"}`
	json.Unmarshal([]byte(reqBody), listInput2)
	ctx.SetInput(listInput2)
	retPage, err = handler.List(ctx)
	assert.Nil(t, err)
	dataPage = retPage.(*store.ListOutput)
	assert.Equal(t, len(dataPage.Rows), 1)

	//list search not match
	listInput3 := &ListInput{}
	reqBody = `{"page_size": 1, "page": 1, "name": "not-exists"}`
	json.Unmarshal([]byte(reqBody), listInput3)
	ctx.SetInput(listInput3)
	retPage, err = handler.List(ctx)
	assert.Nil(t, err)
	dataPage = retPage.(*store.ListOutput)
	assert.Equal(t, len(dataPage.Rows), 0)

	//delete test data
	inputDel := &BatchDelete{}
	reqBody = `{"ids": "1"}`
	json.Unmarshal([]byte(reqBody), inputDel)
	ctx.SetInput(inputDel)
	_, err = handler.BatchDelete(ctx)
	assert.Nil(t, err)

	//create without upstream
	service11 := &entity.Service{}
	reqBody = `{
      "id": "11",
      "plugins": {
          "limit-count": {
              "count": 2,
              "time_window": 60,
              "rejected_code": 503,
              "key": "remote_addr"
          }
      }
  }`
	json.Unmarshal([]byte(reqBody), service11)
	ctx.SetInput(service11)
	_, err = handler.Create(ctx)
	assert.Nil(t, err)

	//sleep
	time.Sleep(time.Duration(100) * time.Millisecond)

	//get
	input11 := &GetInput{}
	input11.ID = "11"
	ctx.SetInput(input11)
	ret, err = handler.Get(ctx)
	stored = ret.(*entity.Service)
	assert.Nil(t, err)
	assert.Equal(t, "11", stored.ID)

	//list
	listInput11 := &ListInput{}
	reqBody = `{"page_size": 10, "page": 1}`
	json.Unmarshal([]byte(reqBody), listInput11)
	ctx.SetInput(listInput11)
	retPage, err = handler.List(ctx)
	assert.Nil(t, err)

	//delete test data
	inputDel11 := &BatchDelete{}
	reqBody = `{"ids": "11"}`
	json.Unmarshal([]byte(reqBody), inputDel11)
	ctx.SetInput(inputDel11)
	_, err = handler.BatchDelete(ctx)
	assert.Nil(t, err)

}
