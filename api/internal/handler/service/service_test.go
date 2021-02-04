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
	"strings"
	"testing"
	"time"

	"github.com/shiningrush/droplet"
	"github.com/stretchr/testify/assert"

	"github.com/apisix/manager-api/internal/conf"
	"github.com/apisix/manager-api/internal/core/entity"
	"github.com/apisix/manager-api/internal/core/storage"
	"github.com/apisix/manager-api/internal/core/store"
)

func TestService(t *testing.T) {
	// init
	err := storage.InitETCDClient(conf.ETCDConfig)
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
	err = json.Unmarshal([]byte(reqBody), service)
	assert.Nil(t, err)
	ctx.SetInput(service)
	ret, err := handler.Create(ctx)
	assert.Nil(t, err)
	objRet, ok := ret.(*entity.Service)
	assert.True(t, ok)
	assert.Equal(t, "1", objRet.ID)

	//sleep
	time.Sleep(time.Duration(100) * time.Millisecond)

	//get
	input := &GetInput{}
	input.ID = "1"
	ctx.SetInput(input)
	ret, err = handler.Get(ctx)
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
		"enable_websocket": true,
		"upstream": {
		  "type": "roundrobin",
		  "nodes": [{
		      "host": "39.97.63.215",
		      "port": 80,
		      "weight": 1
		  }]
		}
	}`
	err = json.Unmarshal([]byte(reqBody), service2)
	assert.Nil(t, err)
	ctx.SetInput(service2)
	ret, err = handler.Update(ctx)
	assert.Nil(t, err)
	// Check the returned value
	objRet, ok = ret.(*entity.Service)
	assert.True(t, ok)
	assert.Equal(t, service2.ID, objRet.ID)
	assert.Equal(t, service2.Name, objRet.Name)

	//sleep
	time.Sleep(time.Duration(100) * time.Millisecond)

	//list
	listInput := &ListInput{}
	reqBody = `{"page_size": 1, "page": 1}`
	err = json.Unmarshal([]byte(reqBody), listInput)
	assert.Nil(t, err)
	ctx.SetInput(listInput)
	retPage, err := handler.List(ctx)
	assert.Nil(t, err)
	dataPage := retPage.(*store.ListOutput)
	assert.Equal(t, len(dataPage.Rows), 1)

	//list search match
	listInput2 := &ListInput{}
	reqBody = `{"page_size": 1, "page": 1, "name": "test"}`
	err = json.Unmarshal([]byte(reqBody), listInput2)
	assert.Nil(t, err)
	ctx.SetInput(listInput2)
	retPage, err = handler.List(ctx)
	assert.Nil(t, err)
	dataPage = retPage.(*store.ListOutput)
	assert.Equal(t, len(dataPage.Rows), 1)

	//list search not match
	listInput3 := &ListInput{}
	reqBody = `{"page_size": 1, "page": 1, "name": "not-exists"}`
	err = json.Unmarshal([]byte(reqBody), listInput3)
	assert.Nil(t, err)
	ctx.SetInput(listInput3)
	retPage, err = handler.List(ctx)
	assert.Nil(t, err)
	dataPage = retPage.(*store.ListOutput)
	assert.Equal(t, len(dataPage.Rows), 0)

	//delete test data
	inputDel := &BatchDelete{}
	reqBody = `{"ids": "1"}`
	err = json.Unmarshal([]byte(reqBody), inputDel)
	assert.Nil(t, err)
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
	err = json.Unmarshal([]byte(reqBody), service11)
	assert.Nil(t, err)
	ctx.SetInput(service11)
	ret, err = handler.Create(ctx)
	assert.Nil(t, err)
	objRet, ok = ret.(*entity.Service)
	assert.True(t, ok)
	assert.Equal(t, "11", objRet.ID)

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
	err = json.Unmarshal([]byte(reqBody), listInput11)
	assert.Nil(t, err)
	ctx.SetInput(listInput11)
	_, err = handler.List(ctx)
	assert.Nil(t, err)

	//delete test data
	inputDel11 := &BatchDelete{}
	reqBody = `{"ids": "11"}`
	err = json.Unmarshal([]byte(reqBody), inputDel11)
	assert.Nil(t, err)
	ctx.SetInput(inputDel11)
	_, err = handler.BatchDelete(ctx)
	assert.Nil(t, err)

}

func TestService_Patch_Update(t *testing.T) {
	//create
	handler := &Handler{
		serviceStore: store.GetStore(store.HubKeyService),
	}
	ctx := droplet.NewContext()
	service := &entity.Service{}
	reqBody := `{
		"id": "3",
		"name": "testservice",
		"upstream": {
			"type": "roundrobin",
			"nodes": [{
				"host": "172.16.238.20",
				"port": 1980,
				"weight": 1
			}]
		}
	}`
	err := json.Unmarshal([]byte(reqBody), service)
	assert.Nil(t, err)
	ctx.SetInput(service)
	ret, err := handler.Create(ctx)
	assert.Nil(t, err)
	objRet, ok := ret.(*entity.Service)
	assert.True(t, ok)
	assert.Equal(t, "3", objRet.ID)

	//sleep
	time.Sleep(time.Duration(20) * time.Millisecond)

	reqBody1 := `{
		"id": "3",
		"name": "testpatch",
		"upstream": {
			"type": "roundrobin",
			"nodes": [{
				"host": "172.16.238.20",
				"port": 1981,
				"weight": 1
			}]
		}
	}`
	responesBody := `"nodes":[{"host":"172.16.238.20","port":1981,"weight":1}],"type":"roundrobin"}`

	// Test interface "/apisix/admin/services/:id"
	input2 := &PatchInput{}
	input2.ID = "3"
	input2.SubPath = ""
	input2.Body = []byte(reqBody1)
	ctx.SetInput(input2)

	ret2, err := handler.Patch(ctx)
	assert.Nil(t, err)
	_ret2, err := json.Marshal(ret2)
	assert.Nil(t, err)
	isContains := strings.Contains(string(_ret2), responesBody)
	assert.True(t, isContains)

	//delete test data
	inputDel2 := &BatchDelete{}
	reqBody = `{"ids": "3"}`
	err = json.Unmarshal([]byte(reqBody), inputDel2)
	assert.Nil(t, err)
	ctx.SetInput(inputDel2)
	_, err = handler.BatchDelete(ctx)
	assert.Nil(t, err)

}

func TestService_Patch_Path_Update(t *testing.T) {
	//create
	handler := &Handler{
		serviceStore: store.GetStore(store.HubKeyService),
	}
	ctx := droplet.NewContext()
	service := &entity.Service{}
	reqBody := `{
		"id": "4",
		"name": "testservice",
		"upstream": {
			"type": "roundrobin",
			"nodes": [{
				"host": "172.16.238.20",
				"port": 1980,
				"weight": 1
			}]
		}
	}`
	err := json.Unmarshal([]byte(reqBody), service)
	assert.Nil(t, err)
	ctx.SetInput(service)
	ret, err := handler.Create(ctx)
	assert.Nil(t, err)
	objRet, ok := ret.(*entity.Service)
	assert.True(t, ok)
	assert.Equal(t, "4", objRet.ID)

	//sleep
	time.Sleep(time.Duration(20) * time.Millisecond)

	reqBody1 := `"test_path_patch"`
	responesBody := `"name":"test_path_patch"`

	// Test interface "/apisix/admin/services/:id/*path"
	input2 := &PatchInput{}
	input2.ID = "4"
	input2.SubPath = "/name"
	input2.Body = []byte(reqBody1)
	ctx.SetInput(input2)

	ret2, err := handler.Patch(ctx)
	assert.Nil(t, err)
	_ret2, err := json.Marshal(ret2)
	assert.Nil(t, err)
	isContains := strings.Contains(string(_ret2), responesBody)
	assert.True(t, isContains)

	//delete test data
	inputDel2 := &BatchDelete{}
	reqBody = `{"ids": "4"}`
	err = json.Unmarshal([]byte(reqBody), inputDel2)
	assert.Nil(t, err)
	ctx.SetInput(inputDel2)
	_, err = handler.BatchDelete(ctx)
	assert.Nil(t, err)

}

