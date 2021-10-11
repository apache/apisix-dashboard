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
package proto

import (
	"fmt"
	"net/http"
	"testing"

	"github.com/shiningrush/droplet"
	"github.com/shiningrush/droplet/data"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"

	"github.com/apisix/manager-api/internal/core/entity"
	"github.com/apisix/manager-api/internal/core/store"
	"github.com/apisix/manager-api/internal/handler"
)

type testCase struct {
	caseDesc   string
	giveInput  interface{}
	giveRet    interface{}
	giveErr    error
	wantErr    error
	wantGetKey string
	wantRet    interface{}
}

func TestProto_Get(t *testing.T) {
	tests := []testCase{
		{
			caseDesc:   "normal",
			giveInput:  &GetInput{ID: "test"},
			wantGetKey: "test",
			giveRet: &entity.Proto{
				BaseInfo: entity.BaseInfo{
					ID: "r1",
				},
				Content: "test",
			},
			wantRet: &entity.Proto{
				BaseInfo: entity.BaseInfo{
					ID: "r1",
				},
				Content: "test",
			},
		},
		{
			caseDesc:   "store get failed",
			giveInput:  &GetInput{ID: "failed key"},
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

			h := Handler{protoStore: mStore}
			ctx := droplet.NewContext()
			ctx.SetInput(tc.giveInput)
			ret, err := h.Get(ctx)
			assert.True(t, getCalled)
			assert.Equal(t, tc.wantRet, ret)
			assert.Equal(t, tc.wantErr, err)
		})
	}
}

func TestProto_List(t *testing.T) {
	mockData := []*entity.Proto{
		{
			BaseInfo: entity.BaseInfo{
				ID:         "proto1",
				CreateTime: 1609340491,
				UpdateTime: 1609340491,
			},
			Desc:    "test",
			Content: "proto1",
		},
		{
			BaseInfo: entity.BaseInfo{
				ID:         "proto2",
				CreateTime: 1609340491,
				UpdateTime: 1609340491,
			},
			Desc:    "test",
			Content: "proto2",
		},
		{
			BaseInfo: entity.BaseInfo{
				ID:         "proto3",
				CreateTime: 1609340491,
				UpdateTime: 1609340491,
			},
			Desc:    "proto3",
			Content: "proto3",
		},
	}

	tests := []struct {
		caseDesc  string
		giveInput *ListInput
		giveData  []*entity.Upstream
		giveErr   error
		wantErr   error
		wantInput store.ListInput
		wantRet   interface{}
	}{
		{
			caseDesc: "list all proto",
			giveInput: &ListInput{
				Pagination: store.Pagination{
					PageSize:   10,
					PageNumber: 10,
				},
			},
			wantInput: store.ListInput{
				PageSize:   10,
				PageNumber: 10,
			},
			wantRet: &store.ListOutput{
				Rows: []interface{}{
					mockData[0],
					mockData[1],
					mockData[2],
				},
				TotalSize: 3,
			},
		},
		{
			caseDesc: "list proto with test desc",
			giveInput: &ListInput{
				Desc: "test",
				Pagination: store.Pagination{
					PageSize:   10,
					PageNumber: 10,
				},
			},
			wantInput: store.ListInput{
				PageSize:   10,
				PageNumber: 10,
			},
			wantRet: &store.ListOutput{
				Rows: []interface{}{
					mockData[0],
					mockData[1],
				},
				TotalSize: 2,
			},
		},
	}

	for _, tc := range tests {
		t.Run(tc.caseDesc, func(t *testing.T) {
			getCalled := true
			upstreamStore := &store.MockInterface{}
			upstreamStore.On("List", mock.Anything, mock.Anything).Run(func(args mock.Arguments) {
				getCalled = true
				input := args.Get(0).(store.ListInput)
				assert.Equal(t, tc.wantInput.PageSize, input.PageSize)
				assert.Equal(t, tc.wantInput.PageNumber, input.PageNumber)
			}).Return(func(input store.ListInput) *store.ListOutput {
				var returnData []interface{}
				for _, c := range mockData {
					if input.Predicate(c) {
						if input.Format == nil {
							returnData = append(returnData, c)
							continue
						}
						returnData = append(returnData, input.Format(c))
					}
				}
				return &store.ListOutput{
					Rows:      returnData,
					TotalSize: len(returnData),
				}
			}, tc.giveErr)

			h := Handler{protoStore: upstreamStore}
			ctx := droplet.NewContext()
			ctx.SetInput(tc.giveInput)
			ret, err := h.List(ctx)
			assert.True(t, getCalled)
			assert.Equal(t, tc.wantRet, ret)
			assert.Equal(t, tc.wantErr, err)
		})
	}
}

func TestProto_Create(t *testing.T) {
	tests := []struct {
		caseDesc     string
		getCalled    bool
		giveInput    *entity.Proto
		giveRet      interface{}
		giveErr      error
		wantInput    *entity.Proto
		wantErr      error
		wantRet      interface{}
		nameExistRet []interface{}
	}{
		{
			caseDesc:  "create success",
			getCalled: true,
			giveInput: &entity.Proto{
				BaseInfo: entity.BaseInfo{
					ID: "p1",
				},
				Desc:    "p1",
				Content: "p1",
			},
			giveRet: &entity.Proto{
				BaseInfo: entity.BaseInfo{
					ID: "p1",
				},
				Desc:    "p1",
				Content: "p1",
			},
			wantInput: &entity.Proto{
				BaseInfo: entity.BaseInfo{
					ID: "p1",
				},
				Desc:    "p1",
				Content: "p1",
			},
			wantRet: &entity.Proto{
				BaseInfo: entity.BaseInfo{
					ID: "p1",
				},
				Desc:    "p1",
				Content: "p1",
			},
			wantErr: nil,
		},
		{
			caseDesc:  "create failed, create return error",
			getCalled: true,
			giveInput: &entity.Proto{
				BaseInfo: entity.BaseInfo{
					ID: "p1",
				},
				Desc:    "p1",
				Content: "p1",
			},
			giveErr: fmt.Errorf("create failed"),
			wantInput: &entity.Proto{
				BaseInfo: entity.BaseInfo{
					ID: "p1",
				},
				Desc:    "p1",
				Content: "p1",
			},
			wantErr: fmt.Errorf("create failed"),
			wantRet: handler.SpecCodeResponse(fmt.Errorf("create failed")),
		},
	}

	for _, tc := range tests {
		t.Run(tc.caseDesc, func(t *testing.T) {
			getCalled := false

			protoStore := &store.MockInterface{}
			protoStore.On("Create", mock.Anything, mock.Anything).Run(func(args mock.Arguments) {
				getCalled = true
				input := args.Get(1).(*entity.Proto)
				assert.Equal(t, tc.wantInput, input)
			}).Return(tc.giveRet, tc.giveErr)

			protoStore.On("Get", mock.Anything).Run(func(args mock.Arguments) {
				getCalled = true
				assert.Equal(t, tc.wantInput.ID, args.Get(0))
			}).Return(nil, nil)

			h := Handler{protoStore: protoStore}

			ctx := droplet.NewContext()
			ctx.SetInput(tc.giveInput)
			ret, err := h.Create(ctx)
			assert.True(t, getCalled)
			assert.Equal(t, tc.wantRet, ret)
			assert.Equal(t, tc.wantErr, err)
		})
	}
}
