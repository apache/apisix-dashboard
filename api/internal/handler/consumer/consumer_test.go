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
	"net/http"
	"testing"

	"github.com/shiningrush/droplet"
	"github.com/shiningrush/droplet/data"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"

	"github.com/apisix/manager-api/internal/core/entity"
	"github.com/apisix/manager-api/internal/core/store"
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
			getCalled := false
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
					&entity.Consumer{Username: "iam-testUser"},
					&entity.Consumer{Username: "testUser"},
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
			getCalled := false
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
}

func TestHandler_Create(t *testing.T) {
	tests := []struct {
		caseDesc   string
		giveInput  *SetInput
		giveCtx    context.Context
		giveErr    error
		giveRet    interface{}
		wantErr    error
		wantInput  *SetInput
		wantRet    interface{}
		wantCalled bool
	}{
		{
			caseDesc: "normal",
			giveInput: &SetInput{
				Consumer: entity.Consumer{
					Username: "name",
					Plugins: map[string]interface{}{
						"jwt-auth": map[string]interface{}{},
					},
				},
			},
			giveCtx: context.WithValue(context.Background(), "test", "value"),
			giveRet: &entity.Consumer{
				Username: "name",
				Plugins: map[string]interface{}{
					"jwt-auth": map[string]interface{}{
						"exp": 86400,
					},
				},
			},
			wantInput: &SetInput{
				Consumer: entity.Consumer{
					Username: "name",
					Plugins: map[string]interface{}{
						"jwt-auth": map[string]interface{}{
							"exp": 86400,
						},
					},
				},
			},
			wantRet: &entity.Consumer{
				Username: "name",
				Plugins: map[string]interface{}{
					"jwt-auth": map[string]interface{}{
						"exp": 86400,
					},
				},
			},
			wantCalled: true,
		},
		{
			caseDesc: "store create failed",
			giveInput: &SetInput{
				Consumer: entity.Consumer{
					Username: "name",
					Plugins: map[string]interface{}{
						"jwt-auth": map[string]interface{}{
							"exp": 5000,
						},
					},
				},
			},
			giveRet: &data.SpecCodeResponse{
				StatusCode: http.StatusInternalServerError,
			},
			giveErr: fmt.Errorf("create failed"),
			wantInput: &SetInput{
				Consumer: entity.Consumer{
					Username: "name",
					Plugins: map[string]interface{}{
						"jwt-auth": map[string]interface{}{
							"exp": 5000,
						},
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
			mStore.On("Update", mock.Anything, mock.Anything, mock.Anything).Run(func(args mock.Arguments) {
				methodCalled = true
				assert.Equal(t, tc.giveCtx, args.Get(0))
				assert.True(t, args.Bool(2))
			}).Return(tc.giveRet, tc.giveErr)

			mStore.On("Get", mock.Anything).Run(func(args mock.Arguments) {
			}).Return(nil, nil)

			h := Handler{consumerStore: mStore}
			ctx := droplet.NewContext()
			ctx.SetInput(tc.giveInput)
			ctx.SetContext(tc.giveCtx)
			ret, err := h.Set(ctx)
			assert.Equal(t, tc.wantCalled, methodCalled)
			assert.Equal(t, tc.wantRet, ret)
			assert.Equal(t, tc.wantErr, err)
		})
	}
}

func TestHandler_Update(t *testing.T) {
	tests := []struct {
		caseDesc   string
		giveInput  *SetInput
		giveCtx    context.Context
		giveRet    interface{}
		giveErr    error
		wantErr    error
		wantInput  *entity.Consumer
		wantRet    interface{}
		wantCalled bool
		getRet     interface{}
	}{
		{
			caseDesc: "normal",
			giveInput: &SetInput{
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
			giveRet: &entity.Consumer{
				Username: "name",
				Plugins: map[string]interface{}{
					"jwt-auth": map[string]interface{}{
						"exp": 500,
					},
				},
				CreateTime: 1618648423,
			},
			wantInput: &entity.Consumer{
				Username: "name",
				Plugins: map[string]interface{}{
					"jwt-auth": map[string]interface{}{
						"exp": 500,
					},
				},
			},
			wantRet: &entity.Consumer{
				Username: "name",
				Plugins: map[string]interface{}{
					"jwt-auth": map[string]interface{}{
						"exp": 500,
					},
				},
				CreateTime: 1618648423,
			},
			wantCalled: true,
			getRet: &entity.Consumer{
				Username:   "name",
				CreateTime: 1618648423,
				UpdateTime: 1618648423,
			},
		},
		{
			caseDesc: "store update failed",
			giveInput: &SetInput{
				Username: "name",
				Consumer: entity.Consumer{
					Plugins: map[string]interface{}{
						"jwt-auth": map[string]interface{}{},
					},
				},
			},
			giveRet: &data.SpecCodeResponse{
				StatusCode: http.StatusInternalServerError,
			},
			giveErr: fmt.Errorf("create failed"),
			wantInput: &entity.Consumer{
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

	for _, tc := range tests {
		t.Run(tc.caseDesc, func(t *testing.T) {
			methodCalled := true
			mStore := &store.MockInterface{}
			mStore.On("Update", mock.Anything, mock.Anything, mock.Anything).Run(func(args mock.Arguments) {
				methodCalled = true
				assert.Equal(t, tc.giveCtx, args.Get(0))
				assert.True(t, args.Bool(2))
			}).Return(tc.giveRet, tc.giveErr)

			mStore.On("Get", mock.Anything).Run(func(args mock.Arguments) {
			}).Return(tc.getRet, nil)

			h := Handler{consumerStore: mStore}
			ctx := droplet.NewContext()
			ctx.SetInput(tc.giveInput)
			ctx.SetContext(tc.giveCtx)
			ret, err := h.Set(ctx)
			assert.Equal(t, tc.wantCalled, methodCalled)
			assert.Equal(t, tc.wantRet, ret)
			assert.Equal(t, tc.wantErr, err)
			if err == nil {
				assert.Equal(t, tc.getRet.(*entity.Consumer).CreateTime, ret.(*entity.Consumer).CreateTime)
				assert.NotEqual(t, tc.getRet.(*entity.Consumer).UpdateTime, ret.(*entity.Consumer).UpdateTime)
			}
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
