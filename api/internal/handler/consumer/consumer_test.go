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

	"github.com/apisix/manager-api/conf"
	"github.com/apisix/manager-api/internal/core/entity"
	"github.com/apisix/manager-api/internal/core/storage"
	"github.com/apisix/manager-api/internal/core/store"
)

func TestConsumer(t *testing.T) {
	// init
	err := storage.InitETCDClient(conf.ETCDConfig)
	assert.Nil(t, err)
	err = store.InitStores()
	assert.Nil(t, err)

	handler := &Handler{
		consumerStore: store.GetStore(store.HubKeyConsumer),
	}
	assert.NotNil(t, handler)

	//create consumer
	ctx := droplet.NewContext()
	consumer := &SetInput{}
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
	err = json.Unmarshal([]byte(reqBody), consumer)
	assert.Nil(t, err)
	ctx.SetInput(consumer)
	_, err = handler.Set(ctx)
	assert.Nil(t, err)

	//create consumer 2
	consumer2 := &SetInput{}
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
	err = json.Unmarshal([]byte(reqBody), consumer2)
	assert.Nil(t, err)
	ctx.SetInput(consumer2)
	_, err = handler.Set(ctx)
	assert.Nil(t, err)

	//sleep
	time.Sleep(time.Duration(100) * time.Millisecond)

	//get consumer
	input := &GetInput{}
	reqBody = `{"username": "jack"}`
	err = json.Unmarshal([]byte(reqBody), input)
	assert.Nil(t, err)
	ctx.SetInput(input)
	ret, err := handler.Get(ctx)
	stored := ret.(*entity.Consumer)
	assert.Nil(t, err)
	assert.Equal(t, stored.ID, consumer.ID)
	assert.Equal(t, stored.Username, consumer.Consumer.Username)

	//update consumer
	consumer3 := &SetInput{}
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
	err = json.Unmarshal([]byte(reqBody), consumer3)
	assert.Nil(t, err)
	ctx.SetInput(consumer3)
	_, err = handler.Set(ctx)
	assert.Nil(t, err)

	//sleep
	time.Sleep(time.Duration(100) * time.Millisecond)

	//check update
	input3 := &GetInput{}
	reqBody = `{"username": "pony"}`
	err = json.Unmarshal([]byte(reqBody), input3)
	assert.Nil(t, err)
	ctx.SetInput(input3)
	ret3, err := handler.Get(ctx)
	stored3 := ret3.(*entity.Consumer)
	assert.Nil(t, err)
	assert.Equal(t, stored3.Desc, "test description2") //consumer3.Desc)
	assert.Equal(t, stored3.Username, consumer3.Username)

	//list page 1
	listInput := &ListInput{}
	reqBody = `{"page_size": 1, "page": 1}`
	err = json.Unmarshal([]byte(reqBody), listInput)
	assert.Nil(t, err)
	ctx.SetInput(listInput)
	retPage1, err := handler.List(ctx)
	assert.Nil(t, err)
	dataPage1 := retPage1.(*store.ListOutput)
	assert.Equal(t, len(dataPage1.Rows), 1)

	//list page 2
	listInput2 := &ListInput{}
	reqBody = `{"page_size": 1, "page": 2}`
	err = json.Unmarshal([]byte(reqBody), listInput2)
	assert.Nil(t, err)
	ctx.SetInput(listInput2)
	retPage2, err := handler.List(ctx)
	assert.Nil(t, err)
	dataPage2 := retPage2.(*store.ListOutput)
	assert.Equal(t, len(dataPage2.Rows), 1)

	//list search match
	listInput3 := &ListInput{}
	reqBody = `{"page_size": 1, "page": 1, "username": "pony"}`
	err = json.Unmarshal([]byte(reqBody), listInput3)
	assert.Nil(t, err)
	ctx.SetInput(listInput3)
	retPage, err := handler.List(ctx)
	assert.Nil(t, err)
	dataPage := retPage.(*store.ListOutput)
	assert.Equal(t, len(dataPage.Rows), 1)

	//list search not match
	listInput4 := &ListInput{}
	reqBody = `{"page_size": 1, "page": 1, "username": "not-exists"}`
	err = json.Unmarshal([]byte(reqBody), listInput4)
	assert.Nil(t, err)
	ctx.SetInput(listInput4)
	retPage, err = handler.List(ctx)
	assert.Nil(t, err)
	dataPage = retPage.(*store.ListOutput)
	assert.Equal(t, len(dataPage.Rows), 0)

	//delete consumer
	inputDel := &BatchDelete{}
	reqBody = `{"usernames": "jack"}`
	err = json.Unmarshal([]byte(reqBody), inputDel)
	assert.Nil(t, err)
	ctx.SetInput(inputDel)
	_, err = handler.BatchDelete(ctx)
	assert.Nil(t, err)

	reqBody = `{"usernames": "pony"}`
	err = json.Unmarshal([]byte(reqBody), inputDel)
	assert.Nil(t, err)
	ctx.SetInput(inputDel)
	_, err = handler.BatchDelete(ctx)
	assert.Nil(t, err)

	//create consumer fail
	consumer_fail := &SetInput{}
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
	err = json.Unmarshal([]byte(reqBody), consumer_fail)
	assert.Nil(t, err)
	ctx.SetInput(consumer_fail)
	_, err = handler.Set(ctx)
	assert.NotNil(t, err)

	//create consumer using Update
	consumer6 := &SetInput{}
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
	err = json.Unmarshal([]byte(reqBody), consumer6)
	assert.Nil(t, err)
	ctx.SetInput(consumer6)
	_, err = handler.Set(ctx)
	assert.Nil(t, err)

	//sleep
	time.Sleep(time.Duration(100) * time.Millisecond)

	//delete consumer
	reqBody = `{"usernames": "nnn"}`
	err = json.Unmarshal([]byte(reqBody), inputDel)
	assert.Nil(t, err)
	ctx.SetInput(inputDel)
	_, err = handler.BatchDelete(ctx)
	assert.Nil(t, err)

}
