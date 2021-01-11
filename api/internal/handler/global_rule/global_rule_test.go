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
package global_rule

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/shiningrush/droplet"
	"github.com/shiningrush/droplet/data"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"

	"github.com/apisix/manager-api/internal/core/entity"
	"github.com/apisix/manager-api/internal/core/store"
)

func performRequest(r http.Handler, method, path string) *httptest.ResponseRecorder {
	req := httptest.NewRequest(method, path, nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	return w
}

func TestHandler_ApplyRoute(t *testing.T) {
	mStore := &store.MockInterface{}
	giveRet := `{
		"id": "test",
		"plugins": {
			"jwt-auth": {}
		}
	}`
	mStore.On("Get", mock.Anything).Run(func(args mock.Arguments) {
		assert.Equal(t, "test", args.Get(0))
	}).Return(giveRet, nil)

	h := Handler{globalRuleStore: mStore}
	r := gin.New()
	h.ApplyRoute(r)

	w := performRequest(r, "GET", "/apisix/admin/global_rules/test")
	assert.Equal(t, 200, w.Code)
}

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
			giveInput:  &GetInput{ID: "test"},
			wantGetKey: "test",
			giveRet: `{
				"id": "test",
				"plugins": {
					"jwt-auth": {}
				}
			}`,
			wantRet: `{
				"id": "test",
				"plugins": {
					"jwt-auth": {}
				}
			}`,
		},
		{
			caseDesc:   "store get failed",
			giveInput:  &GetInput{ID: "non-existent-key"},
			wantGetKey: "non-existent-key",
			giveErr:    fmt.Errorf("data not found"),
			wantErr:    fmt.Errorf("data not found"),
			wantRet: &data.SpecCodeResponse{
				StatusCode: http.StatusNotFound,
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

			h := Handler{globalRuleStore: mStore}
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
		giveData  []*entity.GlobalPlugins
		giveErr   error
		wantErr   error
		wantInput store.ListInput
		wantRet   interface{}
	}{
		{
			caseDesc: "list all condition",
			giveInput: &ListInput{
				Pagination: store.Pagination{
					PageSize:   10,
					PageNumber: 1,
				},
			},
			wantInput: store.ListInput{
				PageSize:   10,
				PageNumber: 1,
			},
			giveData: []*entity.GlobalPlugins{
				{BaseInfo: entity.BaseInfo{ID: "global-rules-1"}},
				{BaseInfo: entity.BaseInfo{ID: "global-rules-2"}},
				{BaseInfo: entity.BaseInfo{ID: "global-rules-3"}},
			},
			wantRet: &store.ListOutput{
				Rows: []interface{}{
					&entity.GlobalPlugins{BaseInfo: entity.BaseInfo{ID: "global-rules-1"}},
					&entity.GlobalPlugins{BaseInfo: entity.BaseInfo{ID: "global-rules-2"}},
					&entity.GlobalPlugins{BaseInfo: entity.BaseInfo{ID: "global-rules-3"}},
				},
				TotalSize: 3,
			},
		},
		{
			caseDesc: "store list failed",
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
			giveData: []*entity.GlobalPlugins{},
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
					if input.Predicate == nil || input.Predicate(c) {
						returnData = append(returnData, c)
					}
				}
				return &store.ListOutput{
					Rows:      returnData,
					TotalSize: len(returnData),
				}
			}, tc.giveErr)

			h := Handler{globalRuleStore: mStore}
			ctx := droplet.NewContext()
			ctx.SetInput(tc.giveInput)
			ret, err := h.List(ctx)
			assert.True(t, getCalled)
			assert.Equal(t, tc.wantRet, ret)
			assert.Equal(t, tc.wantErr, err)
		})
	}
}

func TestHandler_Set(t *testing.T) {
	tests := []struct {
		caseDesc   string
		giveInput  *SetInput
		giveCtx    context.Context
		giveErr    error
		wantErr    error
		wantInput  *entity.GlobalPlugins
		wantRet    interface{}
		wantCalled bool
	}{
		{
			caseDesc: "normal",
			giveInput: &SetInput{
				ID: "name",
				GlobalPlugins: entity.GlobalPlugins{
					Plugins: map[string]interface{}{
						"jwt-auth": map[string]interface{}{},
					},
				},
			},
			giveCtx: context.WithValue(context.Background(), "test", "value"),
			wantInput: &entity.GlobalPlugins{
				BaseInfo: entity.BaseInfo{ID: "name"},
				Plugins: map[string]interface{}{
					"jwt-auth": map[string]interface{}{},
				},
			},
			wantRet:    nil,
			wantCalled: true,
		},
		{
			caseDesc: "store create failed",
			giveInput: &SetInput{
				ID:            "name",
				GlobalPlugins: entity.GlobalPlugins{},
			},
			giveErr: fmt.Errorf("create failed"),
			wantInput: &entity.GlobalPlugins{
				BaseInfo: entity.BaseInfo{ID: "name"},
				Plugins:  map[string]interface{}(nil),
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
				assert.Equal(t, tc.wantInput, args.Get(1))
				assert.True(t, args.Bool(2))
			}).Return(tc.giveErr)

			h := Handler{globalRuleStore: mStore}
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
				ID: "user1",
			},
			giveCtx: context.WithValue(context.Background(), "test", "value"),
			wantInput: []string{
				"user1",
			},
		},
		{
			caseDesc: "store delete failed",
			giveInput: &BatchDeleteInput{
				ID: "user2",
			},
			giveCtx: context.WithValue(context.Background(), "test", "value"),
			giveErr: fmt.Errorf("delete failed"),
			wantInput: []string{
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

			h := Handler{globalRuleStore: mStore}
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
