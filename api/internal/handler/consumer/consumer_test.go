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

package consumer

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

func TestConsumer(t *testing.T) {
	// init
	err := storage.InitETCDClient([]string{"127.0.0.1:2379"})
	assert.Nil(t, err)
	err = store.InitStores()
	assert.Nil(t, err)

	handler := &Handler{
		consumerStore: store.GetStore(store.HubKeyConsumer),
	}
	assert.NotNil(t, handler)

	//create consumer
	ctx := droplet.NewContext()
	consumer := &entity.Consumer{}
	reqBody := `{
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
	ctx.SetInput(consumer)
	_, err = handler.Create(ctx)
	assert.Nil(t, err)

	//create consumer 2
	consumer2 := &entity.Consumer{}
	reqBody = `{
      "username": "pony",
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
	ctx.SetInput(consumer2)
	_, err = handler.Create(ctx)
	assert.Nil(t, err)

	//sleep
	time.Sleep(time.Duration(100) * time.Millisecond)

	//get consumer
	input := &GetInput{}
	reqBody = `{"username": "jack"}`
	json.Unmarshal([]byte(reqBody), input)
	ctx.SetInput(input)
	ret, err := handler.Get(ctx)
	stored := ret.(*entity.Consumer)
	assert.Nil(t, err)
	assert.Equal(t, stored.ID, consumer.ID)
	assert.Equal(t, stored.Username, consumer.Username)

	//update consumer
	consumer3 := &UpdateInput{}
	consumer3.Username = "pony"
	reqBody = `{
      "username": "pony",
      "plugins": {
          "limit-count": {
              "count": 2,
              "time_window": 60,
              "rejected_code": 503,
              "key": "remote_addr"
          }
      },
    "desc": "test description2"
  }`
	json.Unmarshal([]byte(reqBody), consumer3)
	ctx.SetInput(consumer3)
	_, err = handler.Update(ctx)
	assert.Nil(t, err)

	//sleep
	time.Sleep(time.Duration(100) * time.Millisecond)

	//check update
	input3 := &GetInput{}
	reqBody = `{"username": "pony"}`
	json.Unmarshal([]byte(reqBody), input3)
	ctx.SetInput(input3)
	ret3, err := handler.Get(ctx)
	stored3 := ret3.(*entity.Consumer)
	assert.Nil(t, err)
	assert.Equal(t, stored3.Desc, "test description2") //consumer3.Desc)
	assert.Equal(t, stored3.Username, consumer3.Username)

	//list page 1
	listInput := &ListInput{}
	reqBody = `{"page_size": 1, "page": 1}`
	json.Unmarshal([]byte(reqBody), listInput)
	ctx.SetInput(listInput)
	retPage1, err := handler.List(ctx)
	dataPage1 := retPage1.(*store.ListOutput)
	assert.Equal(t, len(dataPage1.Rows), 1)

	//list page 2
	listInput2 := &ListInput{}
	reqBody = `{"page_size": 1, "page": 2}`
	json.Unmarshal([]byte(reqBody), listInput2)
	ctx.SetInput(listInput2)
	retPage2, err := handler.List(ctx)
	dataPage2 := retPage2.(*store.ListOutput)
	assert.Equal(t, len(dataPage2.Rows), 1)

	//list search match
	listInput3 := &ListInput{}
	reqBody = `{"page_size": 1, "page": 1, "username": "pony"}`
	json.Unmarshal([]byte(reqBody), listInput3)
	ctx.SetInput(listInput3)
	retPage, err := handler.List(ctx)
	dataPage := retPage.(*store.ListOutput)
	assert.Equal(t, len(dataPage.Rows), 1)

	//list search not match
	listInput4 := &ListInput{}
	reqBody = `{"page_size": 1, "page": 1, "username": "not-exists"}`
	json.Unmarshal([]byte(reqBody), listInput4)
	ctx.SetInput(listInput4)
	retPage, err = handler.List(ctx)
	dataPage = retPage.(*store.ListOutput)
	assert.Equal(t, len(dataPage.Rows), 0)

	//delete consumer
	inputDel := &BatchDelete{}
	reqBody = `{"usernames": "jack"}`
	json.Unmarshal([]byte(reqBody), inputDel)
	ctx.SetInput(inputDel)
	_, err = handler.BatchDelete(ctx)
	assert.Nil(t, err)

	reqBody = `{"usernames": "pony"}`
	json.Unmarshal([]byte(reqBody), inputDel)
	ctx.SetInput(inputDel)
	_, err = handler.BatchDelete(ctx)
	assert.Nil(t, err)

	//create consumer fail
	consumer_fail := &entity.Consumer{}
	reqBody = `{
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
	json.Unmarshal([]byte(reqBody), consumer_fail)
	ctx.SetInput(consumer_fail)
	_, err = handler.Create(ctx)
	assert.NotNil(t, err)

	//create consumer using Update
	consumer6 := &UpdateInput{}
	reqBody = `{
      "username": "nnn",
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
	json.Unmarshal([]byte(reqBody), consumer6)
	ctx.SetInput(consumer6)
	_, err = handler.Update(ctx)
	assert.Nil(t, err)

	//sleep
	time.Sleep(time.Duration(100) * time.Millisecond)

	//delete consumer
	reqBody = `{"usernames": "nnn"}`
	json.Unmarshal([]byte(reqBody), inputDel)
	ctx.SetInput(inputDel)
	_, err = handler.BatchDelete(ctx)
	assert.Nil(t, err)

}
