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

func TestService_Get(t *testing.T) {
	tests := []struct {
		caseDesc   string
		giveInput  *GetInput
		giveRet    *entity.Service
		giveErr    error
		wantErr    error
		wantGetKey string
		wantRet    interface{}
	}{
		{
			caseDesc:   "normal",
			giveInput:  &GetInput{ID: "s1"},
			wantGetKey: "s1",
			giveRet: &entity.Service{
				BaseInfo: entity.BaseInfo{
					ID: "s1",
				},
				Plugins: map[string]interface{}{
					"limit-count": map[string]interface{}{
						"count":         2,
						"time_window":   60,
						"rejected_code": 503,
						"key":           "remote_addr",
					},
				},
			},
			wantRet: &entity.Service{
				BaseInfo: entity.BaseInfo{
					ID: "s1",
				},
				Plugins: map[string]interface{}{
					"limit-count": map[string]interface{}{
						"count":         2,
						"time_window":   60,
						"rejected_code": 503,
						"key":           "remote_addr",
					},
				},
			},
		},
		{
			caseDesc:   "store get failed",
			giveInput:  &GetInput{ID: "failed_key"},
			wantGetKey: "failed_key",
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
			mStore.On("Get", mock.Anything, mock.Anything).Run(func(args mock.Arguments) {
				getCalled = true
				assert.Equal(t, tc.wantGetKey, args.Get(0))
			}).Return(tc.giveRet, tc.giveErr)

			h := Handler{serviceStore: mStore}
			ctx := droplet.NewContext()
			ctx.SetInput(tc.giveInput)
			ret, err := h.Get(ctx)
			assert.True(t, getCalled)
			assert.Equal(t, tc.wantRet, ret)
			assert.Equal(t, tc.wantErr, err)
		})
	}
}

func TestService_List(t *testing.T) {
	tests := []struct {
		caseDesc  string
		giveInput *ListInput
		giveData  []*entity.Service
		giveErr   error
		wantErr   error
		wantInput store.ListInput
		wantRet   interface{}
	}{
		{
			caseDesc: "list all service",
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
			giveData: []*entity.Service{
				{Name: "s1"},
				{Name: "s2"},
				{Name: "test_service"},
				{Name: "service_test"},
			},
			wantRet: &store.ListOutput{
				Rows: []interface{}{
					&entity.Service{Name: "s1"},
					&entity.Service{Name: "s2"},
					&entity.Service{Name: "test_service"},
					&entity.Service{Name: "service_test"},
				},
				TotalSize: 4,
			},
		},
		{
			caseDesc: "list service with 'service'",
			giveInput: &ListInput{
				Name: "service",
				Pagination: store.Pagination{
					PageSize:   10,
					PageNumber: 10,
				},
			},
			wantInput: store.ListInput{
				PageSize:   10,
				PageNumber: 10,
			},
			giveData: []*entity.Service{
				{BaseInfo: entity.BaseInfo{CreateTime: 1609376661}, Name: "s1"},
				{BaseInfo: entity.BaseInfo{CreateTime: 1609376662}, Name: "s2"},
				{BaseInfo: entity.BaseInfo{CreateTime: 1609376663}, Name: "test_service"},
				{BaseInfo: entity.BaseInfo{CreateTime: 1609376664}, Name: "service_test"},
			},
			wantRet: &store.ListOutput{
				Rows: []interface{}{
					&entity.Service{BaseInfo: entity.BaseInfo{CreateTime: 1609376663}, Name: "test_service"},
					&entity.Service{BaseInfo: entity.BaseInfo{CreateTime: 1609376664}, Name: "service_test"},
				},
				TotalSize: 2,
			},
		},
		{
			caseDesc: "list service with key s1",
			giveInput: &ListInput{
				Name: "s1",
				Pagination: store.Pagination{
					PageSize:   10,
					PageNumber: 10,
				},
			},
			wantInput: store.ListInput{
				PageSize:   10,
				PageNumber: 10,
			},
			giveData: []*entity.Service{
				{Name: "s1"},
				{Name: "s2"},
				{Name: "test_service"},
				{Name: "service_test"},
			},
			wantRet: &store.ListOutput{
				Rows: []interface{}{
					&entity.Service{Name: "s1"},
				},
				TotalSize: 1,
			},
		},
		{
			caseDesc: "list service and format",
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
			giveData: []*entity.Service{
				{
					Name: "s1",
					Upstream: &entity.UpstreamDef{
						Nodes: []interface{}{
							map[string]interface{}{
								"host":   "39.97.63.215",
								"port":   float64(80),
								"weight": float64(1),
							},
						},
					},
				},
				{Name: "s2"},
				{Name: "test_service"},
				{Name: "service_test"},
			},
			wantRet: &store.ListOutput{
				Rows: []interface{}{
					&entity.Service{Name: "s1", Upstream: &entity.UpstreamDef{
						Nodes: []*entity.Node{
							{
								Host:   "39.97.63.215",
								Port:   80,
								Weight: 1,
							},
						},
					}},
					&entity.Service{Name: "s2"},
					&entity.Service{Name: "test_service"},
					&entity.Service{Name: "service_test"},
				},
				TotalSize: 4,
			},
		},
	}

	for _, tc := range tests {
		t.Run(tc.caseDesc, func(t *testing.T) {
			getCalled := true
			mStore := &store.MockInterface{}
			mStore.On("List", mock.Anything, mock.Anything).Run(func(args mock.Arguments) {
				getCalled = true
				input := args.Get(0).(store.ListInput)
				assert.Equal(t, tc.wantInput.PageSize, input.PageSize)
				assert.Equal(t, tc.wantInput.PageNumber, input.PageNumber)
			}).Return(func(input store.ListInput) *store.ListOutput {
				var returnData []interface{}
				for _, c := range tc.giveData {
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

			h := Handler{serviceStore: mStore}
			ctx := droplet.NewContext()
			ctx.SetInput(tc.giveInput)
			ret, err := h.List(ctx)
			assert.True(t, getCalled)
			assert.Equal(t, tc.wantRet, ret)
			assert.Equal(t, tc.wantErr, err)
		})
	}
}

func TestService_Create(t *testing.T) {
	tests := []struct {
		caseDesc      string
		getCalled     bool
		giveInput     *entity.Service
		giveRet       interface{}
		giveErr       error
		wantInput     *entity.Service
		wantErr       error
		wantRet       interface{}
		upstreamInput string
		upstreamRet   interface{}
		upstreamErr   interface{}
	}{
		{
			caseDesc:  "create success",
			getCalled: true,
			giveInput: &entity.Service{
				Name:       "s1",
				UpstreamID: "u1",
				Desc:       "test service",
			},
			wantInput: &entity.Service{
				Name:       "s1",
				UpstreamID: "u1",
				Desc:       "test service",
			},
			upstreamInput: "u1",
			upstreamRet: entity.Upstream{
				BaseInfo: entity.BaseInfo{
					ID: "u1",
				},
			},
		},
		{
			caseDesc:  "create failed, upstream not found",
			getCalled: false,
			giveInput: &entity.Service{
				Name:       "s1",
				UpstreamID: "u1",
				Desc:       "test service",
			},
			wantInput: &entity.Service{
				Name:       "s1",
				UpstreamID: "u1",
				Desc:       "test service",
			},
			wantErr:       fmt.Errorf("upstream id: u1 not found"),
			wantRet:       &data.SpecCodeResponse{StatusCode: http.StatusBadRequest},
			upstreamInput: "u1",
			upstreamErr:   data.ErrNotFound,
		},
		{
			caseDesc:  "create failed, upstream return error",
			getCalled: false,
			giveInput: &entity.Service{
				Name:       "s1",
				UpstreamID: "u1",
				Desc:       "test service",
			},
			wantInput: &entity.Service{
				Name:       "s1",
				UpstreamID: "u1",
				Desc:       "test service",
			},
			wantErr:       fmt.Errorf("unknown error"),
			wantRet:       &data.SpecCodeResponse{StatusCode: http.StatusBadRequest},
			upstreamInput: "u1",
			upstreamErr:   fmt.Errorf("unknown error"),
		},
		{
			caseDesc:  "create failed, create return error",
			getCalled: true,
			giveInput: &entity.Service{
				Name:       "s1",
				UpstreamID: "u1",
				Desc:       "test service",
			},
			giveErr: fmt.Errorf("create failed"),
			wantInput: &entity.Service{
				Name:       "s1",
				UpstreamID: "u1",
				Desc:       "test service",
			},
			upstreamInput: "u1",
			upstreamRet: entity.Upstream{
				BaseInfo: entity.BaseInfo{
					ID: "u1",
				},
			},
			wantErr: fmt.Errorf("create failed"),
			wantRet: handler.SpecCodeResponse(fmt.Errorf("create failed")),
		},
	}

	for _, tc := range tests {
		t.Run(tc.caseDesc, func(t *testing.T) {
			getCalled := false
			serviceStore := &store.MockInterface{}
			serviceStore.On("Create", mock.Anything, mock.Anything).Run(func(args mock.Arguments) {
				getCalled = true
				input := args.Get(1).(*entity.Service)
				assert.Equal(t, tc.wantInput, input)
			}).Return(tc.giveRet, tc.giveErr)

			upstreamStore := &store.MockInterface{}
			upstreamStore.On("Get", mock.Anything, mock.Anything).Run(func(args mock.Arguments) {
				id := args.Get(0).(string)
				assert.Equal(t, tc.upstreamInput, id)
			}).Return(tc.upstreamRet, tc.upstreamErr)

			h := Handler{serviceStore: serviceStore, upstreamStore: upstreamStore}
			ctx := droplet.NewContext()
			ctx.SetInput(tc.giveInput)
			ret, err := h.Create(ctx)
			assert.Equal(t, tc.getCalled, getCalled)
			assert.Equal(t, tc.wantRet, ret)
			assert.Equal(t, tc.wantErr, err)
		})
	}
}

func TestService_Update(t *testing.T) {
	tests := []struct {
		caseDesc      string
		getCalled     bool
		giveInput     *UpdateInput
		giveErr       error
		giveRet       interface{}
		wantInput     *entity.Service
		wantErr       error
		wantRet       interface{}
		upstreamInput string
		upstreamRet   interface{}
		upstreamErr   interface{}
	}{
		{
			caseDesc:  "create success",
			getCalled: true,
			giveInput: &UpdateInput{
				ID: "s1",
				Service: entity.Service{
					Name:       "s1",
					UpstreamID: "u1",
					Desc:       "test service",
				},
			},
			wantInput: &entity.Service{
				BaseInfo: entity.BaseInfo{
					ID: "s1",
				},
				Name:       "s1",
				UpstreamID: "u1",
				Desc:       "test service",
			},
			upstreamInput: "u1",
			upstreamRet: entity.Upstream{
				BaseInfo: entity.BaseInfo{
					ID: "u1",
				},
			},
		},
		{
			caseDesc: "create failed, different id",
			giveInput: &UpdateInput{
				ID: "s1",
				Service: entity.Service{
					BaseInfo: entity.BaseInfo{
						ID: "s2",
					},
					Name:       "s1",
					UpstreamID: "u1",
					Desc:       "test service",
				},
			},
			wantRet: &data.SpecCodeResponse{StatusCode: http.StatusBadRequest},
			wantErr: fmt.Errorf("ID on path (s1) doesn't match ID on body (s2)"),
		},
		{
			caseDesc: "update failed, upstream not found",
			giveInput: &UpdateInput{
				ID: "s1",
				Service: entity.Service{
					Name:       "s1",
					UpstreamID: "u1",
					Desc:       "test service",
				},
			},
			wantInput: &entity.Service{
				Name:       "s1",
				UpstreamID: "u1",
				Desc:       "test service",
			},
			wantErr:       fmt.Errorf("upstream id: u1 not found"),
			wantRet:       &data.SpecCodeResponse{StatusCode: http.StatusBadRequest},
			upstreamInput: "u1",
			upstreamErr:   data.ErrNotFound,
		},
		{
			caseDesc: "update failed, upstream return error",
			giveInput: &UpdateInput{
				ID: "s1",
				Service: entity.Service{
					Name:       "s1",
					UpstreamID: "u1",
					Desc:       "test service",
				},
			},
			wantInput: &entity.Service{
				Name:       "s1",
				UpstreamID: "u1",
				Desc:       "test service",
			},
			wantErr:       fmt.Errorf("unknown error"),
			wantRet:       &data.SpecCodeResponse{StatusCode: http.StatusBadRequest},
			upstreamInput: "u1",
			upstreamErr:   fmt.Errorf("unknown error"),
		},
		{
			caseDesc:  "update failed, update return error",
			getCalled: true,
			giveInput: &UpdateInput{
				ID: "s1",
				Service: entity.Service{
					Name:       "s1",
					UpstreamID: "u1",
					Desc:       "test service",
				},
			},
			giveErr:       fmt.Errorf("update failed"),
			upstreamInput: "u1",
			upstreamRet: entity.Upstream{
				BaseInfo: entity.BaseInfo{
					ID: "u1",
				},
			},
			wantInput: &entity.Service{
				BaseInfo:   entity.BaseInfo{ID: "s1"},
				Name:       "s1",
				UpstreamID: "u1",
				Desc:       "test service",
			},
			wantErr: fmt.Errorf("update failed"),
			wantRet: handler.SpecCodeResponse(fmt.Errorf("update failed")),
		},
	}

	for _, tc := range tests {
		t.Run(tc.caseDesc, func(t *testing.T) {
			getCalled := false
			serviceStore := &store.MockInterface{}
			serviceStore.On("Update", mock.Anything, mock.Anything, mock.Anything).Run(func(args mock.Arguments) {
				getCalled = true
				input := args.Get(1).(*entity.Service)
				createIfNotExist := args.Get(2).(bool)
				assert.Equal(t, tc.wantInput, input)
				assert.True(t, createIfNotExist)
			}).Return(tc.giveRet, tc.giveErr)

			upstreamStore := &store.MockInterface{}
			upstreamStore.On("Get", mock.Anything, mock.Anything).Run(func(args mock.Arguments) {
				id := args.Get(0).(string)
				assert.Equal(t, tc.upstreamInput, id)
			}).Return(tc.upstreamRet, tc.upstreamErr)

			h := Handler{serviceStore: serviceStore, upstreamStore: upstreamStore}
			ctx := droplet.NewContext()
			ctx.SetInput(tc.giveInput)
			ret, err := h.Update(ctx)
			assert.Equal(t, tc.getCalled, getCalled)
			assert.Equal(t, tc.wantRet, ret)
			assert.Equal(t, tc.wantErr, err)
		})
	}
}

func TestService_Patch(t *testing.T) {
	existService := &entity.Service{
		BaseInfo: entity.BaseInfo{
			ID:         "s1",
			CreateTime: 1609340491,
			UpdateTime: 1609340491,
		},
		Name:            "exist_service",
		UpstreamID:      "u1",
		EnableWebsocket: false,
		Labels: map[string]string{
			"version": "v1",
		},
		Plugins: map[string]interface{}{
			"limit-count": map[string]interface{}{
				"count":         2,
				"time_window":   60,
				"rejected_code": 503,
				"key":           "remote_addr",
			},
		},
	}

	tests := []struct {
		caseDesc     string
		giveInput    *PatchInput
		giveErr      error
		giveRet      interface{}
		wantInput    *entity.Service
		wantErr      error
		wantRet      interface{}
		serviceInput string
		serviceRet   *entity.Service
		serviceErr   error
		called       bool
	}{
		{
			caseDesc: "patch all success",
			giveInput: &PatchInput{
				ID:      "s1",
				SubPath: "",
				Body: []byte(`{
						"name":"patched",
						"upstream_id":"u2",
						"enable_websocket":true,
						"labels":{
							"version":"v1",
							"build":"16"
						},
						"plugins":{
							"limit-count":{
								"count":2,
								"time_window":60,
								"rejected_code": 504,
								"key":"remote_addr"
							},
							"key-auth":{
								"key":"auth-one"
							}
						}
					}`),
			},
			wantInput: &entity.Service{
				BaseInfo: entity.BaseInfo{
					ID:         "s1",
					CreateTime: 1609340491,
					UpdateTime: 1609340491,
				},
				Name:            "patched",
				UpstreamID:      "u2",
				EnableWebsocket: true,
				Labels: map[string]string{
					"version": "v1",
					"build":   "16",
				},
				Plugins: map[string]interface{}{
					"limit-count": map[string]interface{}{
						"count":         float64(2),
						"time_window":   float64(60),
						"rejected_code": float64(504),
						"key":           "remote_addr",
					},
					"key-auth": map[string]interface{}{
						"key": "auth-one",
					},
				},
			},
			serviceInput: "s1",
			serviceRet:   existService,
			called:       true,
		},
		{
			caseDesc: "patch part of service success",
			giveInput: &PatchInput{
				ID:      "s1",
				SubPath: "",
				Body: []byte(`{
						"name":"patched",
						"upstream_id":"u2",
						"enable_websocket":true,
						"labels":{
							"version":"v1",
							"build":"16"
						}
					}`),
			},
			wantInput: &entity.Service{
				BaseInfo: entity.BaseInfo{
					ID:         "s1",
					CreateTime: 1609340491,
					UpdateTime: 1609340491,
				},
				Name:            "patched",
				UpstreamID:      "u2",
				EnableWebsocket: true,
				Labels: map[string]string{
					"version": "v1",
					"build":   "16",
				},
				Plugins: map[string]interface{}{
					"limit-count": map[string]interface{}{
						"count":         float64(2),
						"time_window":   float64(60),
						"rejected_code": float64(503),
						"key":           "remote_addr",
					},
				},
			},
			serviceInput: "s1",
			serviceRet:   existService,
			called:       true,
		},
		{
			caseDesc: "patch name success with sub path",
			giveInput: &PatchInput{
				ID:      "s1",
				SubPath: "/upstream_id",
				Body:    []byte(`{"upstream_id":"u3"}`),
			},
			wantInput: &entity.Service{
				BaseInfo: entity.BaseInfo{
					ID:         "s1",
					CreateTime: 1609340491,
					UpdateTime: 1609340491,
				},
				Name: "exist_service",
				UpstreamID: map[string]interface{}{
					"upstream_id": "u3",
				},
				EnableWebsocket: false,
				Labels: map[string]string{
					"version": "v1",
				},
				Plugins: map[string]interface{}{
					"limit-count": map[string]interface{}{
						"count":         float64(2),
						"time_window":   float64(60),
						"rejected_code": float64(503),
						"key":           "remote_addr",
					},
				},
			},
			serviceInput: "s1",
			serviceRet:   existService,
			called:       true,
		},
		{
			caseDesc: "patch labels success",
			giveInput: &PatchInput{
				ID:      "s1",
				SubPath: "/labels",
				Body:    []byte(`{"version": "v3"}`),
			},
			wantInput: &entity.Service{
				BaseInfo: entity.BaseInfo{
					ID:         "s1",
					CreateTime: 1609340491,
					UpdateTime: 1609340491,
				},
				Name:            "exist_service",
				EnableWebsocket: false,
				Labels: map[string]string{
					"version": "v3",
				},
				UpstreamID: "u1",
				Plugins: map[string]interface{}{
					"limit-count": map[string]interface{}{
						"count":         float64(2),
						"time_window":   float64(60),
						"rejected_code": float64(503),
						"key":           "remote_addr",
					},
				},
			},
			serviceInput: "s1",
			serviceRet:   existService,
			called:       true,
		},
		{
			caseDesc: "patch failed, service store get error",
			giveInput: &PatchInput{
				ID:   "s1",
				Body: []byte{},
			},
			serviceInput: "s1",
			serviceErr:   fmt.Errorf("get error"),
			wantRet:      handler.SpecCodeResponse(fmt.Errorf("get error")),
			wantErr:      fmt.Errorf("get error"),
			called:       false,
		},
	}

	for _, tc := range tests {
		t.Run(tc.caseDesc, func(t *testing.T) {
			getCalled := false
			serviceStore := &store.MockInterface{}
			serviceStore.On("Update", mock.Anything, mock.Anything, mock.Anything).Run(func(args mock.Arguments) {
				getCalled = true
				input := args.Get(1).(*entity.Service)
				createIfNotExist := args.Get(2).(bool)
				assert.Equal(t, tc.wantInput, input)
				assert.False(t, createIfNotExist)
			}).Return(tc.giveRet, tc.giveErr)

			serviceStore.On("Get", mock.Anything, mock.Anything).Run(func(args mock.Arguments) {
				input := args.Get(0).(string)
				assert.Equal(t, tc.serviceInput, input)
			}).Return(tc.serviceRet, tc.serviceErr)

			h := Handler{serviceStore: serviceStore}
			ctx := droplet.NewContext()
			ctx.SetInput(tc.giveInput)
			ret, err := h.Patch(ctx)
			assert.Equal(t, tc.called, getCalled)
			assert.Equal(t, tc.wantRet, ret)
			assert.Equal(t, tc.wantErr, err)
		})
	}
}

func TestServices_Delete(t *testing.T) {
	tests := []struct {
		caseDesc  string
		giveInput *BatchDelete
		giveErr   error
		wantInput []string
		wantErr   error
		wantRet   interface{}
	}{
		{
			caseDesc: "delete success",
			giveInput: &BatchDelete{
				IDs: "s1",
			},
			wantInput: []string{"s1"},
		},
		{
			caseDesc: "batch delete success",
			giveInput: &BatchDelete{
				IDs: "s1,s2",
			},
			wantInput: []string{"s1", "s2"},
		},
		{
			caseDesc: "delete failed",
			giveInput: &BatchDelete{
				IDs: "s1",
			},
			giveErr:   fmt.Errorf("delete error"),
			wantInput: []string{"s1"},
			wantRet:   handler.SpecCodeResponse(fmt.Errorf("delete error")),
			wantErr:   fmt.Errorf("delete error"),
		},
	}

	for _, tc := range tests {
		t.Run(tc.caseDesc, func(t *testing.T) {
			getCalled := false
			serviceStore := &store.MockInterface{}
			serviceStore.On("BatchDelete", mock.Anything, mock.Anything).Run(func(args mock.Arguments) {
				getCalled = true
				input := args.Get(1).([]string)
				assert.Equal(t, tc.wantInput, input)
			}).Return(tc.giveErr)

			h := Handler{serviceStore: serviceStore}
			ctx := droplet.NewContext()
			ctx.SetInput(tc.giveInput)
			ret, err := h.BatchDelete(ctx)
			assert.True(t, getCalled)
			assert.Equal(t, tc.wantRet, ret)
			assert.Equal(t, tc.wantErr, err)
		})
	}
}
