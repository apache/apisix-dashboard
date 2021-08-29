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

func TestHandler_Get(t *testing.T) {
	tests := []testCase{
		{
			caseDesc:   "normal",
			giveInput:  &GetInput{ID: "test"},
			wantGetKey: "test",
			giveRet:    &entity.Proto{
				BaseInfo: entity.BaseInfo{
					ID: "r1",
				},
				Content: "test",
			},
			wantRet:    &entity.Proto{
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

func TestRoute_List(t *testing.T) {
	mockData := []*entity.Proto{
		{
			BaseInfo: entity.BaseInfo{
				ID:         "proto1",
				CreateTime: 1609340491,
				UpdateTime: 1609340491,
			},
			Desc: "proto1",
			Content: "proto1",
		},
		{
			BaseInfo: entity.BaseInfo{
				ID:         "proto2",
				CreateTime: 1609340491,
				UpdateTime: 1609340491,
			},
			Desc: "proto2",
			Content: "proto2",
		},
		{
			BaseInfo: entity.BaseInfo{
				ID:         "proto3",
				CreateTime: 1609340491,
				UpdateTime: 1609340491,
			},
			Desc: "proto3",
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
			caseDesc: "list upstream with 'proto1'",
			giveInput: &ListInput{
				Desc: "proto1",
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
				},
				TotalSize: 1,
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