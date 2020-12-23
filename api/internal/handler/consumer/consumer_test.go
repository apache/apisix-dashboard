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
	"context"
	"fmt"
	"github.com/apisix/manager-api/internal/core/entity"
	"github.com/apisix/manager-api/internal/core/store"
	"github.com/shiningrush/droplet"
	"github.com/shiningrush/droplet/data"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"net/http"
	"testing"
)

func TestHandler_Get(t *testing.T) {
	tests := []struct {
		caseDesc   string
		giveInput  *GetInput
		giveRet    interface{}
		giveErr    error
		wantErr    error
		wantGetKey string
		wantRet    interface{}
	}{
		{
			caseDesc:   "normal",
			giveInput:  &GetInput{Username: "test"},
			wantGetKey: "test",
			giveRet:    "hello",
			wantRet:    "hello",
		},
		{
			caseDesc:   "store get failed",
			giveInput:  &GetInput{Username: "failed key"},
			wantGetKey: "failed key",
			giveErr:    fmt.Errorf("get failed"),
			wantErr:    fmt.Errorf("get failed"),
			wantRet: &data.SpecCodeResponse{
				StatusCode: http.StatusInternalServerError,
			},
		},
	}

	for _, tc := range tests {
		t.Run(tc.caseDesc, func(t *testing.T) {
			getCalled := true
			mStore := &store.MockInterface{}
			mStore.On("Get", mock.Anything).Run(func(args mock.Arguments) {
				getCalled = true
				assert.Equal(t, tc.wantGetKey, args.Get(0))
			}).Return(tc.giveRet, tc.giveErr)

			h := Handler{consumerStore: mStore}
			ctx := droplet.NewContext()
			ctx.SetInput(tc.giveInput)
			ret, err := h.Get(ctx)
			assert.True(t, getCalled)
			assert.Equal(t, tc.wantRet, ret)
			assert.Equal(t, tc.wantErr, err)
		})
	}
}

func TestHandler_List(t *testing.T) {
	tests := []struct {
		caseDesc  string
		giveInput *ListInput
		giveData  []*entity.Consumer
		giveErr   error
		wantErr   error
		wantInput store.ListInput
		wantRet   interface{}
	}{
		{
			caseDesc: "list all condition",
			giveInput: &ListInput{
				Username: "testUser",
				Pagination: store.Pagination{
					PageSize:   10,
					PageNumber: 10,
				},
			},
			wantInput: store.ListInput{
				PageSize:   10,
				PageNumber: 10,
			},
			giveData: []*entity.Consumer{
				{Username: "user1"},
				{Username: "testUser"},
				{Username: "iam-testUser"},
				{Username: "testUser-is-me"},
			},
			wantRet: &store.ListOutput{
				Rows: []interface{}{
					&entity.Consumer{Username: "testUser"},
					&entity.Consumer{Username: "iam-testUser"},
					&entity.Consumer{Username: "testUser-is-me"},
				},
				TotalSize: 3,
			},
		},
		{
			caseDesc: "store list failed",
			giveInput: &ListInput{
				Username: "testUser",
				Pagination: store.Pagination{
					PageSize:   10,
					PageNumber: 10,
				},
			},
			wantInput: store.ListInput{
				PageSize:   10,
				PageNumber: 10,
			},
			giveData: []*entity.Consumer{},
			giveErr:  fmt.Errorf("list failed"),
			wantErr:  fmt.Errorf("list failed"),
		},
	}

	for _, tc := range tests {
		t.Run(tc.caseDesc, func(t *testing.T) {
			getCalled := true
			mStore := &store.MockInterface{}
			mStore.On("List", mock.Anything).Run(func(args mock.Arguments) {
				getCalled = true
				input := args.Get(0).(store.ListInput)
				assert.Equal(t, tc.wantInput.PageSize, input.PageSize)
				assert.Equal(t, tc.wantInput.PageNumber, input.PageNumber)
			}).Return(func(input store.ListInput) *store.ListOutput {
				var returnData []interface{}
				for _, c := range tc.giveData {
					if input.Predicate(c) {
						returnData = append(returnData, c)
					}
				}
				return &store.ListOutput{
					Rows:      returnData,
					TotalSize: len(returnData),
				}
			}, tc.giveErr)

			h := Handler{consumerStore: mStore}
			ctx := droplet.NewContext()
			ctx.SetInput(tc.giveInput)
			ret, err := h.List(ctx)
			assert.True(t, getCalled)
			assert.Equal(t, tc.wantRet, ret)
			assert.Equal(t, tc.wantErr, err)
		})
	}
<<<<<<< HEAD
}

func TestHandler_Create(t *testing.T) {
	tests := []struct {
		caseDesc   string
		giveInput  *entity.Consumer
		giveCtx    context.Context
		giveErr    error
		wantErr    error
		wantInput  *entity.Consumer
		wantRet    interface{}
		wantCalled bool
	}{
		{
			caseDesc: "normal",
			giveInput: &entity.Consumer{
				Username: "name",
				Plugins: map[string]interface{}{
					"jwt-auth": map[string]interface{}{},
				},
			},
			giveCtx: context.WithValue(context.Background(), "test", "value"),
			wantInput: &entity.Consumer{
				BaseInfo: entity.BaseInfo{
					ID: "name",
				},
				Username: "name",
				Plugins: map[string]interface{}{
					"jwt-auth": map[string]interface{}{
						"exp": 86400,
					},
				},
			},
			wantRet:    nil,
			wantCalled: true,
		},
		{
			caseDesc: "store create failed",
			giveInput: &entity.Consumer{
				Username: "name",
				Plugins: map[string]interface{}{
					"jwt-auth": map[string]interface{}{
						"exp": 5000,
					},
				},
			},
			giveErr: fmt.Errorf("create failed"),
			wantInput: &entity.Consumer{
				BaseInfo: entity.BaseInfo{
					ID: "name",
				},
				Username: "name",
				Plugins: map[string]interface{}{
					"jwt-auth": map[string]interface{}{
						"exp": 5000,
					},
				},
			},
			wantErr: fmt.Errorf("create failed"),
			wantRet: &data.SpecCodeResponse{
				StatusCode: http.StatusInternalServerError,
			},
			wantCalled: true,
		},
	}

	for _, tc := range tests {
		t.Run(tc.caseDesc, func(t *testing.T) {
			methodCalled := true
			mStore := &store.MockInterface{}
			mStore.On("Create", mock.Anything, mock.Anything).Run(func(args mock.Arguments) {
				methodCalled = true
				assert.Equal(t, tc.giveCtx, args.Get(0))
				assert.Equal(t, tc.wantInput, args.Get(1))
			}).Return(tc.giveErr)

			h := Handler{consumerStore: mStore}
			ctx := droplet.NewContext()
			ctx.SetInput(tc.giveInput)
			ctx.SetContext(tc.giveCtx)
			ret, err := h.Create(ctx)
			assert.Equal(t, tc.wantCalled, methodCalled)
			assert.Equal(t, tc.wantRet, ret)
			assert.Equal(t, tc.wantErr, err)
		})
	}
}

func TestHandler_Update(t *testing.T) {
	tests := []struct {
		caseDesc   string
		giveInput  *UpdateInput
		giveCtx    context.Context
		giveErr    error
		wantErr    error
		wantInput  *entity.Consumer
		wantRet    interface{}
		wantCalled bool
	}{
		{
			caseDesc: "normal",
			giveInput: &UpdateInput{
				Username: "name",
				Consumer: entity.Consumer{
					Plugins: map[string]interface{}{
						"jwt-auth": map[string]interface{}{
							"exp": 500,
						},
					},
				},
			},
			giveCtx: context.WithValue(context.Background(), "test", "value"),
			wantInput: &entity.Consumer{
				BaseInfo: entity.BaseInfo{
					ID: "name",
				},
				Username: "name",
				Plugins: map[string]interface{}{
					"jwt-auth": map[string]interface{}{
						"exp": 500,
					},
				},
			},
			wantRet:    nil,
			wantCalled: true,
		},
		{
			caseDesc: "store update failed",
			giveInput: &UpdateInput{
				Username: "name",
				Consumer: entity.Consumer{
					Plugins: map[string]interface{}{
						"jwt-auth": map[string]interface{}{},
					},
				},
			},
			giveErr: fmt.Errorf("create failed"),
			wantInput: &entity.Consumer{
				BaseInfo: entity.BaseInfo{
					ID: "name",
				},
				Username: "name",
				Plugins: map[string]interface{}{
					"jwt-auth": map[string]interface{}{
						"exp": 86400,
					},
				},
			},
			wantErr: fmt.Errorf("create failed"),
			wantRet: &data.SpecCodeResponse{
				StatusCode: http.StatusInternalServerError,
			},
			wantCalled: true,
		},
	}
=======
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
>>>>>>> fix: delete POST method in /apisix/admin/consumer (#852)

	for _, tc := range tests {
		t.Run(tc.caseDesc, func(t *testing.T) {
			methodCalled := true
			mStore := &store.MockInterface{}
			mStore.On("Update", mock.Anything, mock.Anything, mock.Anything).Run(func(args mock.Arguments) {
				methodCalled = true
				assert.Equal(t, tc.giveCtx, args.Get(0))
				assert.Equal(t, tc.wantInput, args.Get(1))
				assert.True(t, args.Bool(2))
			}).Return(tc.giveErr)

			h := Handler{consumerStore: mStore}
			ctx := droplet.NewContext()
			ctx.SetInput(tc.giveInput)
			ctx.SetContext(tc.giveCtx)
			ret, err := h.Update(ctx)
			assert.Equal(t, tc.wantCalled, methodCalled)
			assert.Equal(t, tc.wantRet, ret)
			assert.Equal(t, tc.wantErr, err)
		})
	}
}

func TestHandler_BatchDelete(t *testing.T) {
	tests := []struct {
		caseDesc  string
		giveInput *BatchDeleteInput
		giveCtx   context.Context
		giveErr   error
		wantErr   error
		wantInput []string
		wantRet   interface{}
	}{
		{
			caseDesc: "normal",
			giveInput: &BatchDeleteInput{
				UserNames: "user1,user2",
			},
			giveCtx: context.WithValue(context.Background(), "test", "value"),
			wantInput: []string{
				"user1",
				"user2",
			},
		},
		{
			caseDesc: "store delete failed",
			giveInput: &BatchDeleteInput{
				UserNames: "user1,user2",
			},
			giveCtx: context.WithValue(context.Background(), "test", "value"),
			giveErr: fmt.Errorf("delete failed"),
			wantInput: []string{
				"user1",
				"user2",
			},
			wantErr: fmt.Errorf("delete failed"),
			wantRet: &data.SpecCodeResponse{
				StatusCode: http.StatusInternalServerError,
			},
		},
	}

	for _, tc := range tests {
		t.Run(tc.caseDesc, func(t *testing.T) {
			methodCalled := true
			mStore := &store.MockInterface{}
			mStore.On("BatchDelete", mock.Anything, mock.Anything, mock.Anything).Run(func(args mock.Arguments) {
				methodCalled = true
				assert.Equal(t, tc.giveCtx, args.Get(0))
				assert.Equal(t, tc.wantInput, args.Get(1))
			}).Return(tc.giveErr)

			h := Handler{consumerStore: mStore}
			ctx := droplet.NewContext()
			ctx.SetInput(tc.giveInput)
			ctx.SetContext(tc.giveCtx)
			ret, err := h.BatchDelete(ctx)
			assert.True(t, methodCalled)
			assert.Equal(t, tc.wantErr, err)
			assert.Equal(t, tc.wantRet, ret)
		})
	}
}
