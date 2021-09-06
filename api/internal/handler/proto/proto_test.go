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
	"encoding/json"
	"errors"
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

func TestProto_Update(t *testing.T) {
	mockData := []*entity.Proto{
		{
			BaseInfo: entity.BaseInfo{
				ID: "p1",
			},
			Content: "p1-origin",
		},
	}

	tests := []struct {
		caseDesc     string
		getCalled    bool
		giveInput    *UpdateInput
		giveErr      error
		giveRet      interface{}
		wantInput    *entity.Proto
		wantErr      error
		wantRet      interface{}
		nameExistRet []interface{}
	}{
		{
			caseDesc:  "update success",
			getCalled: true,
			giveInput: &UpdateInput{
				ID: "p1",
				Proto: entity.Proto{
					Content: "p1",
				},
			},
			giveRet: &entity.Proto{
				BaseInfo: entity.BaseInfo{
					ID: "p1",
				},
				Content: "p1",
			},
			wantInput: &entity.Proto{
				BaseInfo: entity.BaseInfo{
					ID: "p1",
				},
				Content: "p1",
			},
			wantRet: &entity.Proto{
				BaseInfo: entity.BaseInfo{
					ID: "p1",
				},
				Content: "p1",
			},
		},
	}

	for _, tc := range tests {
		t.Run(tc.caseDesc, func(t *testing.T) {
			getCalled := false
			protoStore := &store.MockInterface{}
			protoStore.On("Update", mock.Anything, mock.Anything, mock.Anything).Run(func(args mock.Arguments) {
				getCalled = true
				input := args.Get(1).(*entity.Proto)
				createIfNotExist := args.Get(2).(bool)
				assert.Equal(t, tc.wantInput, input)
				assert.True(t, createIfNotExist)
			}).Return(tc.giveRet, tc.giveErr)

			protoStore.On("Get", mock.Anything).Run(func(args mock.Arguments) {
				getCalled = true
				assert.Equal(t, tc.wantInput.ID, args.Get(0))
			}).Return(mockData[0], nil)

			h := Handler{protoStore: protoStore}
			ctx := droplet.NewContext()
			ctx.SetInput(tc.giveInput)
			ret, err := h.Update(ctx)
			assert.Equal(t, tc.getCalled, getCalled)
			assert.Equal(t, tc.wantRet, ret)
			assert.Equal(t, tc.wantErr, err)
		})
	}
}

func TestProto_Patch(t *testing.T) {
	existProto := &entity.Proto{
		BaseInfo: entity.BaseInfo{
			ID: "p1",
		},
		Content: "p1",
	}

	patchUpstream := &entity.Proto{
		BaseInfo: entity.BaseInfo{
			ID: "p1",
		},
		Content: "p2",
	}
	patchUpstreamBytes, err := json.Marshal(patchUpstream)
	assert.Nil(t, err)

	tests := []struct {
		caseDesc  string
		getCalled bool
		giveInput *PatchInput
		giveErr   error
		giveRet   interface{}
		wantInput *entity.Proto
		wantErr   error
		wantRet   interface{}
	}{
		{
			caseDesc: "patch success",
			giveRet: &entity.Proto{
				BaseInfo: entity.BaseInfo{
					ID: "p1",
				},
				Content: "p2",
			},
			giveInput: &PatchInput{
				ID:      "u1",
				SubPath: "",
				Body:    patchUpstreamBytes,
			},
			wantInput: &entity.Proto{
				BaseInfo: entity.BaseInfo{
					ID: "p1",
				},
				Content: "p2",
			},
			wantRet: &entity.Proto{
				BaseInfo: entity.BaseInfo{
					ID: "p1",
				},
				Content: "p2",
			},
			getCalled: true,
		},
		{
			caseDesc: "patch success by path",
			giveInput: &PatchInput{
				ID:      "p1",
				SubPath: "/content",
				Body:    []byte(`"p2"`),
			},
			giveRet: &entity.Proto{
				BaseInfo: entity.BaseInfo{
					ID: "p1",
				},
				Content: "p2",
			},
			wantInput: &entity.Proto{
				BaseInfo: entity.BaseInfo{
					ID: "p1",
				},
				Content: "p2",
			},
			wantRet: &entity.Proto{
				BaseInfo: entity.BaseInfo{
					ID: "p1",
				},
				Content: "p2",
			},
			getCalled: true,
		},
		{
			caseDesc: "patch failed, path error",
			giveInput: &PatchInput{
				ID:      "u1",
				SubPath: "error",
				Body:    []byte("0"),
			},
			wantRet: handler.SpecCodeResponse(
				errors.New("add operation does not apply: doc is missing path: \"error\": missing value")),
			wantErr: errors.New("add operation does not apply: doc is missing path: \"error\": missing value"),
		},
	}
	for _, tc := range tests {
		t.Run(tc.caseDesc, func(t *testing.T) {
			getCalled := false

			protoStore := &store.MockInterface{}
			protoStore.On("Get", mock.Anything, mock.Anything).Return(existProto, nil)
			protoStore.On("Update", mock.Anything, mock.Anything, mock.Anything).Run(func(args mock.Arguments) {
				getCalled = true
				input := args.Get(1).(*entity.Proto)
				createIfNotExist := args.Get(2).(bool)
				assert.Equal(t, tc.wantInput, input)
				assert.False(t, createIfNotExist)
			}).Return(tc.giveRet, tc.giveErr)

			h := Handler{protoStore: protoStore}
			ctx := droplet.NewContext()
			ctx.SetInput(tc.giveInput)
			ret, err := h.Patch(ctx)
			assert.Equal(t, tc.getCalled, getCalled)
			assert.Equal(t, tc.wantRet, ret)
			if tc.wantErr != nil && err != nil {
				assert.Error(t, tc.wantErr.(error), err.Error())
			} else {
				assert.Equal(t, tc.wantErr, err)
			}
		})
	}
}

func TestProtos_Delete(t *testing.T) {
	tests := []struct {
		caseDesc        string
		giveInput       *BatchDeleteInput
		giveErr         error
		wantInput       []string
		wantErr         error
		wantRet         interface{}
		routeMockData   []*entity.Route
		routeMockErr    error
		serviceMockData []*entity.Service
		serviceMockErr  error
		getCalled       bool
	}{
		{
			caseDesc: "delete success",
			giveInput: &BatchDeleteInput{
				IDs: "p1",
			},
			wantInput: []string{"p1"},
			getCalled: true,
		},
		{
			caseDesc: "batch delete success",
			giveInput: &BatchDeleteInput{
				IDs: "p1,p2",
			},
			wantInput: []string{"p1", "p2"},
			getCalled: true,
		},
		{
			caseDesc: "delete failed",
			giveInput: &BatchDeleteInput{
				IDs: "p1",
			},
			giveErr:   fmt.Errorf("delete error"),
			wantInput: []string{"p1"},
			wantRet:   handler.SpecCodeResponse(fmt.Errorf("delete error")),
			wantErr:   fmt.Errorf("delete error"),
			getCalled: true,
		},
		{
			caseDesc: "delete failed, route is using",
			giveInput: &BatchDeleteInput{
				IDs: "p1",
			},
			wantInput: []string{"s1"},
			routeMockData: []*entity.Route{
				&entity.Route{
					BaseInfo: entity.BaseInfo{
						ID:         "r1",
						CreateTime: 1609746531,
					},
					Name: "route1",
					Desc: "test_route",
					Plugins: map[string]interface{}{
						"grpc-transcode": map[string]interface{}{
							"disable":  false,
							"proto_id": "p1",
						},
					},
				},
			},
			routeMockErr: nil,
			getCalled:    false,
			wantRet:      &data.SpecCodeResponse{StatusCode: 400},
			wantErr:      errors.New("proto used check invalid: route: r1 is using this proto"),
		},
		{
			caseDesc: "delete failed, route list error",
			giveInput: &BatchDeleteInput{
				IDs: "p1",
			},
			wantInput:     []string{"p1"},
			routeMockData: nil,
			routeMockErr:  errors.New("route list error"),
			wantRet:       handler.SpecCodeResponse(errors.New("route list error")),
			wantErr:       errors.New("route list error"),
			getCalled:     false,
		},
		{
			caseDesc: "delete failed, service is using",
			giveInput: &BatchDeleteInput{
				IDs: "p1",
			},
			wantInput: []string{"s1"},
			serviceMockData: []*entity.Service{
				&entity.Service{
					BaseInfo: entity.BaseInfo{
						ID:         "s1",
						CreateTime: 1609746531,
					},
					Name: "service1",
					Plugins: map[string]interface{}{
						"grpc-transcode": map[string]interface{}{
							"disable":  false,
							"proto_id": "p1",
						},
					},
				},
			},
			serviceMockErr: nil,
			getCalled:      false,
			wantRet:        &data.SpecCodeResponse{StatusCode: 400},
			wantErr:        errors.New("proto used check invalid: service: s1 is using this proto"),
		},
		{
			caseDesc: "delete failed, service list error",
			giveInput: &BatchDeleteInput{
				IDs: "p1",
			},
			wantInput:      []string{"p1"},
			serviceMockErr: errors.New("service list error"),
			wantRet:        handler.SpecCodeResponse(errors.New("service list error")),
			wantErr:        errors.New("service list error"),
			getCalled:      false,
		},
	}

	for _, tc := range tests {
		t.Run(tc.caseDesc, func(t *testing.T) {
			getCalled := false
			protoStore := &store.MockInterface{HubKey: store.HubKeyProto}
			protoStore.On("BatchDelete", mock.Anything, mock.Anything).Run(func(args mock.Arguments) {
				getCalled = true
				input := args.Get(1).([]string)
				assert.Equal(t, tc.wantInput, input)
			}).Return(tc.giveErr)

			routeStore := &store.MockInterface{HubKey: store.HubKeyRoute}
			routeStore.On("List", mock.Anything).Return(func(input store.ListInput) *store.ListOutput {
				var returnData []interface{}
				for _, c := range tc.routeMockData {
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
			}, tc.routeMockErr)

			serviceStore := &store.MockInterface{HubKey: store.HubKeyService}
			serviceStore.On("List", mock.Anything).Return(func(input store.ListInput) *store.ListOutput {
				var returnData []interface{}
				for _, c := range tc.serviceMockData {
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
			}, tc.serviceMockErr)

			consumerStore := &store.MockInterface{HubKey: store.HubKeyConsumer}
			consumerStore.On("List", mock.Anything).Return(&store.ListOutput{Rows: nil, TotalSize: 0}, nil)

			pluginConfigStore := &store.MockInterface{HubKey: store.HubKeyPluginConfig}
			pluginConfigStore.On("List", mock.Anything).Return(&store.ListOutput{Rows: nil, TotalSize: 0}, nil)

			globalRuleStore := &store.MockInterface{HubKey: store.HubKeyGlobalRule}
			globalRuleStore.On("List", mock.Anything).Return(&store.ListOutput{Rows: nil, TotalSize: 0}, nil)

			h := Handler{
				protoStore:        protoStore,
				routeStore:        routeStore,
				serviceStore:      serviceStore,
				consumerStore:     consumerStore,
				pluginConfigStore: pluginConfigStore,
				globalRuleStore:   globalRuleStore,
			}
			ctx := droplet.NewContext()
			ctx.SetInput(tc.giveInput)
			ret, err := h.BatchDelete(ctx)
			assert.Equal(t, tc.getCalled, getCalled)
			assert.Equal(t, tc.wantRet, ret)
			assert.Equal(t, tc.wantErr, err)
		})
	}
}
