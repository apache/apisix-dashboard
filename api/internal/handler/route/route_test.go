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
package route

import (
	"encoding/json"
	"errors"
	"context"
	"fmt"
	"github.com/gogo/protobuf/test"
	"go/build"
	"golang.org/x/net/html/atom"
	"google.golang.org/genproto/googleapis/devtools/resultstore/v2"
	"net/http"
	"testing"
	"time"

	"github.com/shiningrush/droplet"
	"github.com/shiningrush/droplet/data"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"

	"github.com/apisix/manager-api/internal/core/entity"
	"github.com/apisix/manager-api/internal/core/store"
	"github.com/apisix/manager-api/internal/handler"
	"github.com/apisix/manager-api/internal/conf"
	"github.com/apisix/manager-api/internal/core/storage"
)


type testCase struct {
	caseDesc string
	giveInput interface{}
	mockInput interface{}
	mockRet   interface{}
	mockErr   interface{}
	wantRet   interface{}
	wantErr   interface{}
	called    bool
	upstreamInput string
	scriptInput string
	serviceInput string
}

func genServiceStore(t *testing.T, getInput string) *store.MockInterface {
	ret1 := func(c context.Context, input string) interface{} {
		if input == "s1" {
			return &entity.Service{
				BaseInfo:entity.BaseInfo{
					ID:"s1",
					CreateTime: 1609752277,
				},
				Name: "s1",
				Desc: "service s1",
			}
		}

		return nil
	}

	ret2 := func(c context.Context, input string) interface{} {
		if input == "not_found" {
			return data.ErrNotFound
		}

		if input == "error" {
			return errors.New("service error")
		}

		return nil
	}

	svcStore := &store.MockInterface{}
	svcStore.On("Get", mock.Anything).Run(func(args mock.Arguments){
		id := args.Get(0).(string)
		assert.Equal(t, getInput, id)
	}).Return(ret1, ret2)

	return svcStore
}

func genUpstreamStore(t *testing.T, getInput string) *store.MockInterface {
	ret1 := func(c context.Context, input string) interface{} {
		return nil
	}

	ret2 := func(c context.Context, input string) interface{} {
		if input == "not_found" {
			return data.ErrNotFound
		}

		if input == "error" {
			return errors.New("upstream error")
		}
		return nil
	}

	upstreamStore :=&store.MockInterface{}
	upstreamStore.On("Get", mock.Anything).Run(func(args mock.Arguments){
		id := args.Get(0).(string)
		assert.Equal(t, getInput, id)
	}).Return(ret1, ret2)

	return upstreamStore
}

func genScriptStore(t *testing.T, getInput string) *store.MockInterface {
	ret1 := func(c context.Context, input string) interface{} {
		return nil
	}

	ret2 := func(c context.Context, input string) interface{} {
		return nil
	}

	scriptStore := &store.MockInterface{}
	scriptStore.On("Get", mock.Anything).Run(func(args mock.Arguments){
		id := args.Get(0).(string)
		assert.Equal(t, getInput, id)
	}).Return(ret1, ret2)

	return scriptStore
}



func TestRoute_Get(t *testing.T) {
	tests := []testCase{
		{
			caseDesc: "route: get success",
			giveInput: GetInput{ID: "s1"},
			mockInput: "s1",
			mockRet:  &entity.Route{
				BaseInfo: entity.BaseInfo{
					ID: "s1",
				},
				URI: "/test",
			},
			mockErr: nil,
			wantRet:  &entity.Route{
				BaseInfo: entity.BaseInfo{
					ID: "s1",
				},
				URI: "/test",
			},
			wantErr: nil,
			called: true,
		},
		{
			caseDesc:   "route: store get failed",
			giveInput:  &GetInput{ID: "failed_key"},
			mockInput: "failed_key",
			mockRet: nil,
			mockErr:    fmt.Errorf("get failed"),
			wantRet: &data.SpecCodeResponse{
				StatusCode: http.StatusInternalServerError,
			},
			wantErr:    fmt.Errorf("get failed"),
			called: true,
		},
	}

	for _, tc := range tests{
		getCalled := false
		mStore := &store.MockInterface{}

		mStore.On("Get", mock.Anything).Run(func(args mock.Arguments){
			getCalled = true
			assert.Equal(t, tc.mockInput, args.Get(0))
		}).Return(tc.mockRet, tc.mockErr)

		h := Handler{routeStore: mStore}
		ctx := droplet.NewContext()
		ctx.SetInput(tc.giveInput)
		ret, err := h.Get(ctx)
		assert.True(t, tc.called, getCalled)
		assert.Equal(t, tc.wantRet, ret)
		assert.Equal(t, tc.wantErr, err)
	}
}

func TestRoute_List(t *testing.T) {
	mockData := []*entity.Route{
		{
			BaseInfo:entity.BaseInfo{CreateTime: 1609742634},
			Name: "r1",
			URI: "/test_r1",
			Labels: map[string]string{
			"version": "v1",
			"build": "16",
			},
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
		{
			BaseInfo:entity.BaseInfo{CreateTime: 1609742635},
			Name: "r2",
			URI: "/test_r2",
			Labels: map[string]string{
				"version": "v1",
				"build": "16",
			},
		},
		{
			BaseInfo:entity.BaseInfo{CreateTime: 1609742636},
			Name:"route_test",
			URI:"/test_route_test",
			Labels: map[string]string{
				"version": "v2",
				"build": "17",
			},
		},
		{
			BaseInfo:entity.BaseInfo{CreateTime: 1609742636},
			Name:"test_route",
			URI:"/test_test_route",
			Labels: map[string]string{
				"version": "v2",
				"build": "17",
				"extra":"test",
			},
		},
	}


	tests := []testCase{
		{
			caseDesc: "list all route",
			giveInput: &ListInput{
				Pagination: store.Pagination{
					PageSize: 10,
					PageNumber: 10,
				},
			},
			mockInput: store.ListInput{
				PageSize: 10,
				PageNumber: 10,
			},
			wantRet: &store.ListOutput{
				Rows: []interface{}{
					mockData[0],
					mockData[1],
					mockData[2],
					mockData[3],
				},
				TotalSize: 4,
			},
			called: true,
		},
		{
			caseDesc: "list routes with name",
			giveInput: &ListInput{
				Name :"route",
				Pagination: store.Pagination{
					PageSize:   10,
					PageNumber: 10,
				},
			},
			mockInput: store.ListInput{
				PageSize:   10,
				PageNumber: 10,
			},
			wantRet: &store.ListOutput{
				Rows: []interface{}{
					mockData[2],
					mockData[3],
				},
				TotalSize: 2,
			},
			called: true,
		},
		{
			caseDesc: "list routes with uri",
			giveInput: &ListInput{
				Name:"test_r2",
				Pagination:store.Pagination{
					PageSize: 10,
					PageNumber: 10,
				},
			},
			mockInput: store.ListInput{
				PageSize:10,
				PageNumber: 10,
			},
			wantRet: &store.ListOutput{
				Rows: []interface{}{
					mockData[2],
				},
				TotalSize: 1,
			},
			called: true,
		},
		{
			caseDesc: "list routes with label",
			giveInput: &ListInput{
				Label: "version:v1",
				Pagination:store.Pagination{
					PageSize: 10,
					PageNumber: 10,
				},
			},
			mockInput: store.ListInput{
				PageSize:10,
				PageNumber: 10,
			},
			wantRet: &store.ListOutput{
				Rows: []interface{}{
					mockData[1],
					mockData[2],
				},
				TotalSize: 2,
			},
			called: true,
		},
		{
			caseDesc: "list routes with label",
			giveInput: &ListInput{
				Label: "extra",
				Pagination:store.Pagination{
					PageSize: 10,
					PageNumber: 10,
				},
			},
			mockInput: store.ListInput{
				PageSize:10,
				PageNumber: 10,
			},
			wantRet: &store.ListOutput{
				Rows: []interface{}{
					mockData[3],
				},
				TotalSize: 1,
			},
			called: true,
		},
		{
			caseDesc: "list routes and test format",
			giveInput: &ListInput{
				Name: "r1",
				Pagination:store.Pagination{
					PageSize: 10,
					PageNumber: 10,
				},
			},
			mockInput: store.ListInput{
				PageSize: 10,
				PageNumber: 10,
			},
			wantRet: &store.ListOutput{
				Rows:[]interface{} {
					&entity.Route{
						BaseInfo:entity.BaseInfo{CreateTime: 1609742634},
						Name: "r1",
						URI: "/test_r1",
						Labels: map[string]string{
							"version": "v1",
							"build": "16",
						},
						Upstream: &entity.UpstreamDef{
							Nodes: []*entity.Node{
								{
									Host:   "39.97.63.215",
									Port:   80,
									Weight: 1,
								},
							},
						},
					},
				},

				TotalSize: 1,
			},
			called: true,
		},
	}

	for _, tc := range tests {
		t.Run(tc.caseDesc, func(t *testing.T){
			getCalled := false
			mStore := &store.MockInterface{}
			mStore.On("List", mock.Anything).Run(func(args mock.Arguments) {
				getCalled = true
				input := args.Get(0).(store.ListInput)
				mockInput := tc.mockInput.(ListInput)
				assert.Equal(t, mockInput.PageSize, input.PageSize)
				assert.Equal(t, mockInput.PageNumber, input.PageNumber)
			}).Return(func(input store.ListInput)*store.ListOutput {
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
					Rows: returnData,
					TotalSize: len(returnData),
				}
			}, tc.mockErr)

			h := Handler{routeStore: mStore}
			ctx := droplet.NewContext()
			ctx.SetInput(tc.giveInput)

			ret, err := h.List(ctx)
			assert.Equal(t, tc.called, getCalled)
			assert.Equal(t, tc.wantRet, ret)
			assert.Equal(t, tc.wantErr, err)
		})
	}
}


func TestRoute_Create(t *testing.T) {
	giveInput := &entity.Service{
		BaseInfo: entity.BaseInfo{
			ID: "s1",
			CreateTime: 1609746531,
		},
		Name: "s1",
		Desc: "test_route",
		UpstreamID: "u1",
		Script: "",
		Labels: map[string]string{
			"version": "v1",
		},
	}

	tests := []testCase{
		{
			caseDesc: "create route success",
			giveInput: &entity.Route{
				BaseInfo:entity.BaseInfo{
					ID: "s1",
					CreateTime:1609746531,
				},
				Name: "s1",
				Desc: "test_route",
				UpstreamID: "u1",
				ServiceID: "s1",
				Script: "",
				Labels: map[string]string{
					"version": "v1",
				},
			},
			mockInput: giveInput,
			upstreamInput: "u1",
			serviceInput: "s1",
			scriptInput: "",
			wantRet: nil,
			wantErr: nil,
		},
		{
			caseDesc: "create route failed, service not found",
			giveInput: &entity.Route{
				BaseInfo:entity.BaseInfo{
					ID: "s2",
					CreateTime:1609746531,
				},
				Name: "s1",
				Desc: "test_route",
				UpstreamID: "u1",
				ServiceID: "not_found",
				Script: "",
				Labels: map[string]string{
					"version": "v1",
				},
			},
			wantRet: &data.SpecCodeResponse{StatusCode: http.StatusBadRequest},
			wantErr: fmt.Errorf("service id: not_found not found"),
			upstreamInput: "u1",
			serviceInput: "not_found",
			scriptInput: "",
			called: false,
		},
		{
			caseDesc: "create route failed, service store get error",
			giveInput: &entity.Route{
				BaseInfo: entity.BaseInfo{
					ID:"r1",
					CreateTime: 1609746531,
				},
				Name: "r1",
				Desc: "test route",
				UpstreamID: "r1",
				// mock store will return err if service is s3
				ServiceID: "error",
				Script: "",
				Labels: map[string]string{
					"version": "v1",
				},
			},
			wantRet: &data.SpecCodeResponse{StatusCode: http.StatusBadRequest},
			wantErr: errors.New("service error"),
			upstreamInput: "r1",
			serviceInput: "error",
			scriptInput: "",
			called: false,
		},
		{
			caseDesc: "create route failed, upstream not found",
			giveInput: &entity.Route{
				BaseInfo:entity.BaseInfo{
					ID: "s2",
					CreateTime:1609746531,
				},
				Name: "s1",
				Desc: "test_route",
				UpstreamID: "not_found",
				ServiceID: "s2",
				Script: "",
				Labels: map[string]string{
					"version": "v1",
				},
			},
			wantRet: &data.SpecCodeResponse{StatusCode: http.StatusBadRequest},
			wantErr: fmt.Errorf("upstream id: not_found not found"),
			upstreamInput: "not_found",
			serviceInput: "s2",
			scriptInput: "",
			called: false,
		},
		{
			caseDesc: "create route failed, upstream store get error",
			giveInput: &entity.Route{
				BaseInfo:entity.BaseInfo{
					ID: "s2",
					CreateTime:1609746531,
				},
				Name: "s1",
				Desc: "test_route",
				UpstreamID: "error",
				ServiceID: "s2",
				Script: "",
				Labels: map[string]string{
					"version": "v1",
				},
			},
			wantRet: &data.SpecCodeResponse{StatusCode: http.StatusBadRequest},
			wantErr: fmt.Errorf("upstream error"),
			upstreamInput: "error",
			serviceInput: "s2",
			scriptInput: "",
			called: false,
		},
		{
			caseDesc: "create route failed, script create error",
			giveInput: &entity.Route{
				BaseInfo:entity.BaseInfo{
					ID: "s2",
					CreateTime:1609746531,
				},
				Name: "s1",
				Desc: "test_route",
				UpstreamID: "u1",
				ServiceID: "s2",
				Script: "",
				Labels: map[string]string{
					"version": "v1",
				},
			},
			wantRet: &data.SpecCodeResponse{StatusCode: http.StatusBadRequest},
			wantErr: fmt.Errorf("upstream error"),
			upstreamInput: "u1",
			serviceInput: "s2",
			scriptInput: "",
			called: false,
		},

		// TODO: test script
	}

	for _, tc := range tests {
		t.Run(tc.caseDesc, func(t *testing.T){
			getCalled := false

			mStore := &store.MockInterface{}
			mStore.On("Create", mock.Anything, mock.Anything).Run(func(args mock.Arguments){
				id := args.Get(1).(*entity.Route)
				assert.Equal(t, tc.giveInput, id)
			})
			h := Handler{svcStore: genServiceStore(t, tc.serviceInput),
				         upstreamStore: genUpstreamStore(t, tc.upstreamInput),
			             scriptStore: genScriptStore(t, tc.scriptInput),
			             routeStore: mStore}

			ctx := droplet.NewContext()
			ctx.SetInput(tc.giveInput)
			ret, err := h.Create(ctx)
			assert.Equal(t, tc.giveInput, getCalled, ret)
			assert.Equal(t, tc.wantRet, tc.wantErr, err)
		})
	}
}

func TestRoute_Update(t *testing.T) {
	giveInput := &entity.Route{
		BaseInfo: entity.BaseInfo{
			ID: "r1",
			CreateTime: 1609746531,
		},
		Name: "s1",
		Desc: "test_route",
		UpstreamID: "u1",
		Script: "",
		Labels: map[string]string{
			"version": "v1",
		},
	}

	tests := []testCase{
		{
			caseDesc:  "update script",
			giveInput: &UpdateInput{
				ID: "r1",
				Route:entity.Route{
					Name: "r1",
					Desc: "updated route",
					UpstreamID: "u2",
					Script: "",
					Labels: map[string]string{
						"version":"v2",
					},
				},
			},
			mockInput: &entity.Service{
				BaseInfo: entity.BaseInfo{
					ID: "s1",
				},
				Name:       "s1",
				UpstreamID: "u1",
				Desc:       "test service",
			},
			mockErr: nil,
			upstreamInput: "u1",
			serviceInput: "s2",
			scriptInput:  "",
			called: true,
		},
		{
			caseDesc: "update failed, different id",
			giveInput: &UpdateInput{
				ID: "r1",
				Route: entity.Route{
					BaseInfo: entity.BaseInfo{
						ID: "r2",
					},
					Name:       "s1",
					UpstreamID: "u1",
					Desc:       "test service",
				},
			},
			wantRet: &data.SpecCodeResponse{StatusCode: http.StatusBadRequest},
			wantErr: fmt.Errorf("ID on path (r1) doesn't match ID on body (r2)"),
			called: true,
		},
		{
			caseDesc: "update failed, service not found",
			giveInput: &UpdateInput{
				ID:"r1",
				Route: entity.Route{
					BaseInfo: entity.BaseInfo{
						ID:"r1",
					},
					Name: "test route",
					ServiceID: "not_found",
					UpstreamID: "u1",
				},
			},
			wantRet:  &data.SpecCodeResponse{StatusCode: http.StatusBadRequest},
			wantErr: fmt.Errorf("service id: not_found not found"),
		},
		{
			caseDesc: "update failed, service return error",
			giveInput: &UpdateInput{
				ID:"r1",
				Route: entity.Route{
					BaseInfo:entity.BaseInfo{
						ID:"r1",
					},
					Name: "test route",
					ServiceID: "error",
					UpstreamID: "u1",
				},
			},
			wantRet: &data.SpecCodeResponse{StatusCode: http.StatusBadRequest},
			wantErr: fmt.Errorf("service error"),
		},
		{
			caseDesc: "update failed, upstream not found",
			giveInput: &UpdateInput{
				ID: "r1",
				Route: entity.Route{
					Name:       "s1",
					UpstreamID: "not_found",
					Desc:       "test route",
				},
			},
			wantRet:       &data.SpecCodeResponse{StatusCode: http.StatusBadRequest},
			wantErr:       fmt.Errorf("upstream id: not_found not found"),
			called: false,
		},
		{
			caseDesc: "update failed, upstream return error",
			giveInput: &UpdateInput{
				ID: "r1",
				Route: entity.Route{
					Name:       "r1",
					UpstreamID: "error",
					Desc:       "test route",
				},
			},
			wantErr:       fmt.Errorf("unknown error"),
			wantRet:       &data.SpecCodeResponse{StatusCode: http.StatusBadRequest},
			upstreamInput: "error",
			called: false,
		},
		{
			caseDesc: "update failed, route return error",
			giveInput: &UpdateInput{
				ID:"r1",
				Route: entity.Route{
					Name:"r1",
					Desc: "test route",
				},
			},
			mockInput: &entity.Route{
				Name:"r1",
				Desc: "test route",
			},
			mockErr: fmt.Errorf("route update error"),
			wantErr: fmt.Errorf("route update error"),
			wantRet: &data.SpecCodeResponse{StatusCode: http.StatusBadRequest},
			upstreamInput: "u1",
			serviceInput: "s1",
			scriptInput: "",
			called: true,
		},

		// TODO: test script
	}

	for _, tc := range tests {
		t.Run(tc.caseDesc, func(t *testing.T) {
			getCalled := false
			routeStore := &store.MockInterface{}

			routeStore.On("Update", mock.Anything, mock.Anything, mock.Anything).Run(func(args mock.Arguments){
				getCalled = true
				input  := args.Get(1).(*entity.Route)
				createIfNotExist := args.Get(2).(bool)
				assert.Equal(t, tc.mockInput, input)
				assert.True(t, createIfNotExist)
			})

			upstreamStore := genUpstreamStore(t, tc.upstreamInput)
			scriptStore := genScriptStore(t, tc.scriptInput)
			serviceStore := genServiceStore(t, tc.serviceInput)

			scriptStore.On("Create")
			scriptStore.On("BatchDelete")

			h := Handler{svcStore: serviceStore, upstreamStore: upstreamStore, scriptStore: scriptStore}
			ctx := droplet.NewContext()
			ctx.SetInput(tc.giveInput)
			ret, err := h.Update(ctx)
			assert.Equal(t, tc.called, getCalled)
			assert.Equal(t, tc.wantRet, ret)
			assert.Equal(t, tc.wantErr, err)
		})
	}
}

// Todo: wait for patch fix
/*
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
		giveInput    *UpdateInput
		giveErr      error
		wantInput    *entity.Service
		wantErr      error
		wantRet      interface{}
		serviceInput string
		serviceRet   *entity.Service
		serviceErr   error
	}{
		{
			caseDesc: "patch all success",
			giveInput: &UpdateInput{
				ID: "s1",
				Service: entity.Service{
					Name:            "patched success",
					UpstreamID:      "u2",
					EnableWebsocket: true,
					Labels: map[string]string{
						"version": "v1",
						"build":   "16",
					},
					Plugins: map[string]interface{}{
						"key-auth": map[string]interface{}{
							"key": "auth-one",
						},
					},
				},
			},
			wantInput: &entity.Service{
				Name:            "patched success",
				UpstreamID:      "u2",
				EnableWebsocket: true,
				Labels: map[string]string{
					"version": "v1",
					"build":   "16",
				},
				Plugins: map[string]interface{}{
					"limit-count": map[string]interface{}{
						"count":         2,
						"time_window":   60,
						"rejected_code": 504,
						"key":           "remote_addr",
					},
					"key-auth": map[string]interface{}{
						"key": "auth-one",
					},
				},
			},
			serviceInput: "s1",
			serviceRet:   existService,
		},
		{
			caseDesc: "patch desc success",
			giveInput: &UpdateInput{
				ID: "s1/name",
				Service: entity.Service{
					Name: "patched success",
				},
			},
			wantInput: &entity.Service{
				Name:            "patched success",
				UpstreamID:      "u2",
				EnableWebsocket: true,
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
			},
			serviceInput: "s1",
			serviceRet:   existService,
		},
		{
			caseDesc: "patch labels success",
			giveInput: &UpdateInput{
				ID: "s1/labels",
				Service: entity.Service{
					Labels: map[string]string{
						"version": "v2",
					},
				},
			},
			wantInput: &entity.Service{
				Name:            "patched success",
				UpstreamID:      "u2",
				EnableWebsocket: true,
				Labels: map[string]string{
					"version": "v2",
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
			serviceInput: "s1",
			serviceRet:   existService,
		},
		{
			caseDesc: "patch enable_websocket success",
			giveInput: &UpdateInput{
				ID: "s1/enable_websocket",
				Service: entity.Service{
					EnableWebsocket: false,
				},
			},
			wantInput: &entity.Service{
				Name:            "patched success",
				UpstreamID:      "u2",
				EnableWebsocket: false,
				Labels: map[string]string{
					"version": "v2",
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
			serviceInput: "s1",
			serviceRet:   existService,
		},
		{
			caseDesc: "patch plugins success",
			giveInput: &UpdateInput{
				ID: "s1/plugins",
				Service: entity.Service{
					Plugins: map[string]interface{}{
						"limit-count": map[string]interface{}{
							"count":         2,
							"time_window":   60,
							"rejected_code": 504,
							"key":           "remote_addr",
						},
					},
				},
			},
			wantInput: &entity.Service{
				Name:            "patched success",
				UpstreamID:      "u2",
				EnableWebsocket: false,
				Labels: map[string]string{
					"version": "v2",
				},
				Plugins: map[string]interface{}{
					"limit-count": map[string]interface{}{
						"count":         2,
						"time_window":   60,
						"rejected_code": 504,
						"key":           "remote_addr",
					},
				},
			},
			serviceInput: "s1",
			serviceRet:   existService,
		},
		{
			caseDesc: "patch failed, service store get error",
			giveInput: &UpdateInput{
				ID: "s1",
				Service: entity.Service{
					Name: "test service",
				},
			},
			serviceInput: "s1",
			serviceErr:   fmt.Errorf("get error"),
			wantRet:      handler.SpecCodeResponse(fmt.Errorf("get error")),
			wantErr:      fmt.Errorf("get error"),
		},
		{
			caseDesc: "patch failed, service store update error",
			giveInput: &UpdateInput{
				ID: "s1/name",
				Service: entity.Service{
					Name: "patched success",
				},
			},
			giveErr: fmt.Errorf("update error"),
			wantInput: &entity.Service{
				Name:            "patched success",
				UpstreamID:      "u2",
				EnableWebsocket: true,
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
			},
			serviceInput: "s1",
			serviceRet:   existService,
			wantRet:      handler.SpecCodeResponse(fmt.Errorf("update error")),
			wantErr:      fmt.Errorf("update error"),
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
			}).Return(tc.giveErr)
			serviceStore.On("Get", mock.Anything).Run(func(args mock.Arguments) {
				input := args.Get(0).(string)
				assert.Equal(t, tc.serviceInput, input)
			}).Return(tc.serviceRet, tc.serviceErr)
			h := Handler{serviceStore: serviceStore}
			ctx := droplet.NewContext()
			ctx.SetInput(tc.giveInput)
			ret, err := h.Patch(ctx)
			assert.True(t, getCalled)
			assert.Equal(t, tc.wantRet, ret)
			assert.Equal(t, tc.wantErr, err)
		})
	}
}
*/

func TestServices_Delete(t *testing.T) {
	tests := []testCase {
		{
			caseDesc: "delete success",
			giveInput: &BatchDelete{
				IDs: "r1",
			},
			mockInput: []string{"s1"},
			called: true,
		},
		{
			caseDesc: "batch delete success",
			giveInput: &BatchDelete{
				IDs: "s1,s2",
			},
			mockInput: []string{"s1", "s2"},
			called: true,
		},
		{
			caseDesc: "delete failed",
			giveInput: &BatchDelete{
				IDs: "s1",
			},
			mockInput: []string{"s1"},
			mockErr:   fmt.Errorf("delete error"),
			wantRet:   handler.SpecCodeResponse(fmt.Errorf("delete error")),
			wantErr:   fmt.Errorf("delete error"),
			called: true,
		},
	}

	for _, tc := range tests {
		t.Run(tc.caseDesc, func(t *testing.T) {
			getCalled := false
			serviceStore := &store.MockInterface{}
			serviceStore.On("BatchDelete", mock.Anything, mock.Anything).Run(func(args mock.Arguments) {
				getCalled = true
				input := args.Get(1).([]string)
				assert.Equal(t, tc.mockInput, input)
			}).Return(tc.mockErr)

			h := Handler{routeStore: serviceStore}
			ctx := droplet.NewContext()
			ctx.SetInput(tc.giveInput)
			ret, err := h.BatchDelete(ctx)
			assert.True(t, getCalled)
			assert.Equal(t, tc.wantRet, ret)
			assert.Equal(t, tc.wantErr, err)
		})
	}
}

func TestRoute_Exist(t *testing.T) {
	tests := []testCase{
		{
			caseDesc: "exist "
		},
	}

}

