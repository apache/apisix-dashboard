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

package upstream

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
	"github.com/apisix/manager-api/internal/utils/consts"
)

func TestUpstream_Get(t *testing.T) {
	tests := []struct {
		caseDesc   string
		giveInput  *GetInput
		giveRet    *entity.Upstream
		giveErr    error
		wantErr    error
		wantGetKey string
		wantRet    interface{}
	}{
		{
			caseDesc:   "upstream: get success",
			giveInput:  &GetInput{ID: "u1"},
			wantGetKey: "u1",
			giveRet: &entity.Upstream{
				BaseInfo: entity.BaseInfo{
					ID: "u1",
				},
				UpstreamDef: entity.UpstreamDef{
					Name: "upstream1",
					Timeout: &entity.Timeout{
						Connect: 15,
						Send:    15,
						Read:    15,
					},
					Checks: map[string]interface{}{
						"active": map[string]interface{}{
							"timeout":   float64(5),
							"http_path": "/status",
							"host":      "foo.com",
							"healthy": map[string]interface{}{
								"interval":  2,
								"successes": 1,
							},
							"unhealthy": map[string]interface{}{
								"interval":      1,
								"http_failures": 2,
							},
							"req_headers": []interface{}{"User-Agent: curl/7.29.0"},
						},
						"passive": map[string]interface{}{
							"healthy": map[string]interface{}{
								"http_statuses": []interface{}{float64(200), float64(201)},
								"successes":     float64(3),
							},
							"unhealthy": map[string]interface{}{
								"http_statuses": []interface{}{float64(500)},
								"http_failures": float64(3),
								"tcp_failures":  float64(3),
							},
						},
					},
					Key: "server_addr",
					Nodes: []map[string]interface{}{
						{
							"host":   "39.97.63.215",
							"port":   float64(80),
							"weight": float64(1),
						},
					},
				},
			},
			wantRet: &entity.Upstream{
				BaseInfo: entity.BaseInfo{
					ID: "u1",
				},
				UpstreamDef: entity.UpstreamDef{
					Name: "upstream1",
					Timeout: &entity.Timeout{
						Connect: 15,
						Send:    15,
						Read:    15,
					},
					Checks: map[string]interface{}{
						"active": map[string]interface{}{
							"timeout":   float64(5),
							"http_path": "/status",
							"host":      "foo.com",
							"healthy": map[string]interface{}{
								"interval":  2,
								"successes": 1,
							},
							"unhealthy": map[string]interface{}{
								"interval":      1,
								"http_failures": 2,
							},
							"req_headers": []interface{}{"User-Agent: curl/7.29.0"},
						},
						"passive": map[string]interface{}{
							"healthy": map[string]interface{}{
								"http_statuses": []interface{}{float64(200), float64(201)},
								"successes":     float64(3),
							},
							"unhealthy": map[string]interface{}{
								"http_statuses": []interface{}{float64(500)},
								"http_failures": float64(3),
								"tcp_failures":  float64(3),
							},
						},
					},
					Key: "server_addr",
					Nodes: []map[string]interface{}{
						{
							"host":   "39.97.63.215",
							"port":   float64(80),
							"weight": float64(1),
						},
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
			upstreamStore := &store.MockInterface{}
			upstreamStore.On("Get", mock.Anything, mock.Anything).Run(func(args mock.Arguments) {
				getCalled = true
				assert.Equal(t, tc.wantGetKey, args.Get(0))
			}).Return(tc.giveRet, tc.giveErr)

			h := Handler{upstreamStore: upstreamStore}
			ctx := droplet.NewContext()
			ctx.SetInput(tc.giveInput)
			ret, err := h.Get(ctx)
			assert.True(t, getCalled)
			assert.Equal(t, tc.wantRet, ret)
			assert.Equal(t, tc.wantErr, err)
		})
	}
}

func TestUpstreams_List(t *testing.T) {
	mockData := []*entity.Upstream{
		{
			BaseInfo: entity.BaseInfo{
				ID:         "u1",
				CreateTime: 1609340491,
				UpdateTime: 1609340491,
			},
			UpstreamDef: entity.UpstreamDef{
				Name: "upstream1",
				Key:  "server_addr",
				Nodes: []map[string]interface{}{
					{
						"host":   "39.97.63.215",
						"port":   float64(80),
						"weight": float64(1),
					},
				},
			},
		},
		{
			BaseInfo: entity.BaseInfo{
				ID:         "u2",
				CreateTime: 1609340491,
				UpdateTime: 1609340491,
			},
			UpstreamDef: entity.UpstreamDef{
				Name: "upstream2",
				Key:  "server_addr2",

				Nodes: entity.Node{
					Host:   "39.97.63.215",
					Port:   80,
					Weight: 0,
				},
			},
		},
		{
			BaseInfo: entity.BaseInfo{
				ID:         "u3",
				CreateTime: 1609340491,
				UpdateTime: 1609340491,
			},
			UpstreamDef: entity.UpstreamDef{
				Name: "upstream3",
				Key:  "server_addr3",
				Nodes: []entity.Node{
					{
						Host:   "39.97.63.215",
						Port:   80,
						Weight: 0,
					},
				},
			},
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
			caseDesc: "list all upstream",
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
			caseDesc: "list upstream with 'upstream1'",
			giveInput: &ListInput{
				Name: "upstream1",
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

			h := Handler{upstreamStore: upstreamStore}
			ctx := droplet.NewContext()
			ctx.SetInput(tc.giveInput)
			ret, err := h.List(ctx)
			assert.True(t, getCalled)
			assert.Equal(t, tc.wantRet, ret)
			assert.Equal(t, tc.wantErr, err)
		})
	}
}

func TestUpstream_Create(t *testing.T) {
	tests := []struct {
		caseDesc     string
		getCalled    bool
		giveInput    *entity.Upstream
		giveRet      interface{}
		giveErr      error
		wantInput    *entity.Upstream
		wantErr      error
		wantRet      interface{}
		nameExistRet []interface{}
	}{
		{
			caseDesc:  "create success",
			getCalled: true,
			giveInput: &entity.Upstream{
				BaseInfo: entity.BaseInfo{
					ID: "u1",
				},
				UpstreamDef: entity.UpstreamDef{
					Name: "upstream1",
					Timeout: &entity.Timeout{
						Connect: 15,
						Send:    15,
						Read:    15,
					},
					Checks: map[string]interface{}{
						"active": map[string]interface{}{
							"timeout":   float64(5),
							"http_path": "/status",
							"host":      "foo.com",
							"healthy": map[string]interface{}{
								"interval":  2,
								"successes": 1,
							},
							"unhealthy": map[string]interface{}{
								"interval":      1,
								"http_failures": 2,
							},
							"req_headers": []interface{}{"User-Agent: curl/7.29.0"},
						},
						"passive": map[string]interface{}{
							"healthy": map[string]interface{}{
								"http_statuses": []interface{}{float64(200), float64(201)},
								"successes":     float64(3),
							},
							"unhealthy": map[string]interface{}{
								"http_statuses": []interface{}{float64(500)},
								"http_failures": float64(3),
								"tcp_failures":  float64(3),
							},
						},
					},
					Key: "server_addr",
					Nodes: []map[string]interface{}{
						{
							"host":   "39.97.63.215",
							"port":   float64(80),
							"weight": float64(1),
						},
					},
				},
			},
			giveRet: &entity.Upstream{
				BaseInfo: entity.BaseInfo{
					ID: "u1",
				},
				UpstreamDef: entity.UpstreamDef{
					Name: "upstream1",
					Timeout: &entity.Timeout{
						Connect: 15,
						Send:    15,
						Read:    15,
					},
					Checks: map[string]interface{}{
						"active": map[string]interface{}{
							"timeout":   float64(5),
							"http_path": "/status",
							"host":      "foo.com",
							"healthy": map[string]interface{}{
								"interval":  2,
								"successes": 1,
							},
							"unhealthy": map[string]interface{}{
								"interval":      1,
								"http_failures": 2,
							},
							"req_headers": []interface{}{"User-Agent: curl/7.29.0"},
						},
						"passive": map[string]interface{}{
							"healthy": map[string]interface{}{
								"http_statuses": []interface{}{float64(200), float64(201)},
								"successes":     float64(3),
							},
							"unhealthy": map[string]interface{}{
								"http_statuses": []interface{}{float64(500)},
								"http_failures": float64(3),
								"tcp_failures":  float64(3),
							},
						},
					},
					Key: "server_addr",
					Nodes: []map[string]interface{}{
						{
							"host":   "39.97.63.215",
							"port":   float64(80),
							"weight": float64(1),
						},
					},
				},
			},
			wantInput: &entity.Upstream{
				BaseInfo: entity.BaseInfo{
					ID: "u1",
				},
				UpstreamDef: entity.UpstreamDef{
					Name: "upstream1",
					Timeout: &entity.Timeout{
						Connect: 15,
						Send:    15,
						Read:    15,
					},
					Checks: map[string]interface{}{
						"active": map[string]interface{}{
							"timeout":   float64(5),
							"http_path": "/status",
							"host":      "foo.com",
							"healthy": map[string]interface{}{
								"interval":  2,
								"successes": 1,
							},
							"unhealthy": map[string]interface{}{
								"interval":      1,
								"http_failures": 2,
							},
							"req_headers": []interface{}{"User-Agent: curl/7.29.0"},
						},
						"passive": map[string]interface{}{
							"healthy": map[string]interface{}{
								"http_statuses": []interface{}{float64(200), float64(201)},
								"successes":     float64(3),
							},
							"unhealthy": map[string]interface{}{
								"http_statuses": []interface{}{float64(500)},
								"http_failures": float64(3),
								"tcp_failures":  float64(3),
							},
						},
					},
					Key: "server_addr",
					Nodes: []map[string]interface{}{
						{
							"host":   "39.97.63.215",
							"port":   float64(80),
							"weight": float64(1),
						},
					},
				},
			},
			wantRet: &entity.Upstream{
				BaseInfo: entity.BaseInfo{
					ID: "u1",
				},
				UpstreamDef: entity.UpstreamDef{
					Name: "upstream1",
					Timeout: &entity.Timeout{
						Connect: 15,
						Send:    15,
						Read:    15,
					},
					Checks: map[string]interface{}{
						"active": map[string]interface{}{
							"timeout":   float64(5),
							"http_path": "/status",
							"host":      "foo.com",
							"healthy": map[string]interface{}{
								"interval":  2,
								"successes": 1,
							},
							"unhealthy": map[string]interface{}{
								"interval":      1,
								"http_failures": 2,
							},
							"req_headers": []interface{}{"User-Agent: curl/7.29.0"},
						},
						"passive": map[string]interface{}{
							"healthy": map[string]interface{}{
								"http_statuses": []interface{}{float64(200), float64(201)},
								"successes":     float64(3),
							},
							"unhealthy": map[string]interface{}{
								"http_statuses": []interface{}{float64(500)},
								"http_failures": float64(3),
								"tcp_failures":  float64(3),
							},
						},
					},
					Key: "server_addr",
					Nodes: []map[string]interface{}{
						{
							"host":   "39.97.63.215",
							"port":   float64(80),
							"weight": float64(1),
						},
					},
				},
			},
			wantErr: nil,
		},
		{
			caseDesc:  "when nodes address without port and pass host is node, create should succeed",
			getCalled: true,
			giveInput: &entity.Upstream{
				BaseInfo: entity.BaseInfo{
					ID: "u1",
				},
				UpstreamDef: entity.UpstreamDef{
					Name: "upstream1",
					Timeout: &entity.Timeout{
						Connect: 15,
						Send:    15,
						Read:    15,
					},
					Key:      "server_addr",
					Nodes:    map[string]float64{"127.0.0.1": 100},
					PassHost: "node",
				},
			},
			giveRet: &entity.Upstream{
				BaseInfo: entity.BaseInfo{
					ID: "u1",
				},
				UpstreamDef: entity.UpstreamDef{
					Name: "upstream1",
					Timeout: &entity.Timeout{
						Connect: 15,
						Send:    15,
						Read:    15,
					},
					Key:      "server_addr",
					Nodes:    map[string]float64{"127.0.0.1": 100},
					PassHost: "node",
				},
			},
			wantInput: &entity.Upstream{
				BaseInfo: entity.BaseInfo{
					ID: "u1",
				},
				UpstreamDef: entity.UpstreamDef{
					Name: "upstream1",
					Timeout: &entity.Timeout{
						Connect: 15,
						Send:    15,
						Read:    15,
					},
					Key:      "server_addr",
					Nodes:    map[string]float64{"127.0.0.1": 100},
					PassHost: "node",
				},
			},
			wantRet: &entity.Upstream{
				BaseInfo: entity.BaseInfo{
					ID: "u1",
				},
				UpstreamDef: entity.UpstreamDef{
					Name: "upstream1",
					Timeout: &entity.Timeout{
						Connect: 15,
						Send:    15,
						Read:    15,
					},
					Key:      "server_addr",
					Nodes:    map[string]float64{"127.0.0.1": 100},
					PassHost: "node",
				},
			},
			wantErr: nil,
		},
		{
			caseDesc:  "create failed, create return error",
			getCalled: true,
			giveInput: &entity.Upstream{
				BaseInfo: entity.BaseInfo{
					ID: "u1",
				},
				UpstreamDef: entity.UpstreamDef{
					Name: "upstream1",
					Timeout: &entity.Timeout{
						Connect: 15,
						Send:    15,
						Read:    15,
					},
					Checks: map[string]interface{}{
						"active": map[string]interface{}{
							"timeout":   float64(5),
							"http_path": "/status",
							"host":      "foo.com",
							"healthy": map[string]interface{}{
								"interval":  2,
								"successes": 1,
							},
							"unhealthy": map[string]interface{}{
								"interval":      1,
								"http_failures": 2,
							},
							"req_headers": []interface{}{"User-Agent: curl/7.29.0"},
						},
						"passive": map[string]interface{}{
							"healthy": map[string]interface{}{
								"http_statuses": []interface{}{float64(200), float64(201)},
								"successes":     float64(3),
							},
							"unhealthy": map[string]interface{}{
								"http_statuses": []interface{}{float64(500)},
								"http_failures": float64(3),
								"tcp_failures":  float64(3),
							},
						},
					},
					Key: "server_addr",
					Nodes: []map[string]interface{}{
						{
							"host":   "39.97.63.215",
							"port":   float64(80),
							"weight": float64(1),
						},
					},
				},
			},
			giveErr: fmt.Errorf("create failed"),
			wantInput: &entity.Upstream{
				BaseInfo: entity.BaseInfo{
					ID: "u1",
				},
				UpstreamDef: entity.UpstreamDef{
					Name: "upstream1",
					Timeout: &entity.Timeout{
						Connect: 15,
						Send:    15,
						Read:    15,
					},
					Checks: map[string]interface{}{
						"active": map[string]interface{}{
							"timeout":   float64(5),
							"http_path": "/status",
							"host":      "foo.com",
							"healthy": map[string]interface{}{
								"interval":  2,
								"successes": 1,
							},
							"unhealthy": map[string]interface{}{
								"interval":      1,
								"http_failures": 2,
							},
							"req_headers": []interface{}{"User-Agent: curl/7.29.0"},
						},
						"passive": map[string]interface{}{
							"healthy": map[string]interface{}{
								"http_statuses": []interface{}{float64(200), float64(201)},
								"successes":     float64(3),
							},
							"unhealthy": map[string]interface{}{
								"http_statuses": []interface{}{float64(500)},
								"http_failures": float64(3),
								"tcp_failures":  float64(3),
							},
						},
					},
					Key: "server_addr",
					Nodes: []map[string]interface{}{
						{
							"host":   "39.97.63.215",
							"port":   float64(80),
							"weight": float64(1),
						},
					},
				},
			},
			wantErr: fmt.Errorf("create failed"),
			wantRet: handler.SpecCodeResponse(fmt.Errorf("create failed")),
		},
	}

	for _, tc := range tests {
		t.Run(tc.caseDesc, func(t *testing.T) {
			getCalled := false

			upstreamStore := &store.MockInterface{}
			upstreamStore.On("Create", mock.Anything, mock.Anything).Run(func(args mock.Arguments) {
				getCalled = true
				input := args.Get(1).(*entity.Upstream)
				assert.Equal(t, tc.wantInput, input)
			}).Return(tc.giveRet, tc.giveErr)

			upstreamStore.On("List", mock.Anything, mock.Anything).Run(func(args mock.Arguments) {
			}).Return(func(input store.ListInput) *store.ListOutput {
				return &store.ListOutput{
					Rows:      tc.nameExistRet,
					TotalSize: len(tc.nameExistRet),
				}
			}, nil)

			h := Handler{upstreamStore: upstreamStore}

			ctx := droplet.NewContext()
			ctx.SetInput(tc.giveInput)
			ret, err := h.Create(ctx)
			assert.True(t, getCalled)
			assert.Equal(t, tc.wantRet, ret)
			assert.Equal(t, tc.wantErr, err)
		})
	}
}

func TestUpstream_Update(t *testing.T) {
	tests := []struct {
		caseDesc     string
		getCalled    bool
		giveInput    *UpdateInput
		giveErr      error
		giveRet      interface{}
		wantInput    *entity.Upstream
		wantErr      error
		wantRet      interface{}
		nameExistRet []interface{}
	}{
		{
			caseDesc:  "update success",
			getCalled: true,
			giveInput: &UpdateInput{
				ID: "u1",
				Upstream: entity.Upstream{
					UpstreamDef: entity.UpstreamDef{
						Name: "upstream1",
						Timeout: &entity.Timeout{
							Connect: 15,
							Send:    15,
							Read:    15,
						},
						Checks: map[string]interface{}{
							"active": map[string]interface{}{
								"timeout":   float64(5),
								"http_path": "/status",
								"host":      "foo.com",
								"healthy": map[string]interface{}{
									"interval":  2,
									"successes": 1,
								},
								"unhealthy": map[string]interface{}{
									"interval":      1,
									"http_failures": 2,
								},
								"req_headers": []interface{}{"User-Agent: curl/7.29.0"},
							},
							"passive": map[string]interface{}{
								"healthy": map[string]interface{}{
									"http_statuses": []interface{}{float64(200), float64(201)},
									"successes":     float64(3),
								},
								"unhealthy": map[string]interface{}{
									"http_statuses": []interface{}{float64(500)},
									"http_failures": 3,
									"tcp_failures":  3,
								},
							},
						},
						Key: "server_addr",
						Nodes: []map[string]interface{}{
							{
								"host":   "39.97.63.215",
								"port":   float64(80),
								"weight": float64(1),
							},
						},
					},
				},
			},
			giveRet: &entity.Upstream{
				BaseInfo: entity.BaseInfo{
					ID: "u1",
				},
				UpstreamDef: entity.UpstreamDef{
					Name: "upstream1",
					Timeout: &entity.Timeout{
						Connect: 15,
						Send:    15,
						Read:    15,
					},
					Checks: map[string]interface{}{
						"active": map[string]interface{}{
							"timeout":   float64(5),
							"http_path": "/status",
							"host":      "foo.com",
							"healthy": map[string]interface{}{
								"interval":  2,
								"successes": 1,
							},
							"unhealthy": map[string]interface{}{
								"interval":      1,
								"http_failures": 2,
							},
							"req_headers": []interface{}{"User-Agent: curl/7.29.0"},
						},
						"passive": map[string]interface{}{
							"healthy": map[string]interface{}{
								"http_statuses": []interface{}{float64(200), float64(201)},
								"successes":     float64(3),
							},
							"unhealthy": map[string]interface{}{
								"http_statuses": []interface{}{float64(500)},
								"http_failures": 3,
								"tcp_failures":  3,
							},
						},
					},
					Key: "server_addr",
					Nodes: []map[string]interface{}{
						{
							"host":   "39.97.63.215",
							"port":   float64(80),
							"weight": float64(1),
						},
					},
				},
			},
			wantInput: &entity.Upstream{
				BaseInfo: entity.BaseInfo{
					ID: "u1",
				},
				UpstreamDef: entity.UpstreamDef{
					Name: "upstream1",
					Timeout: &entity.Timeout{
						Connect: 15,
						Send:    15,
						Read:    15,
					},
					Checks: map[string]interface{}{
						"active": map[string]interface{}{
							"timeout":   float64(5),
							"http_path": "/status",
							"host":      "foo.com",
							"healthy": map[string]interface{}{
								"interval":  2,
								"successes": 1,
							},
							"unhealthy": map[string]interface{}{
								"interval":      1,
								"http_failures": 2,
							},
							"req_headers": []interface{}{"User-Agent: curl/7.29.0"},
						},
						"passive": map[string]interface{}{
							"healthy": map[string]interface{}{
								"http_statuses": []interface{}{float64(200), float64(201)},
								"successes":     float64(3),
							},
							"unhealthy": map[string]interface{}{
								"http_statuses": []interface{}{float64(500)},
								"http_failures": 3,
								"tcp_failures":  3,
							},
						},
					},
					Key: "server_addr",
					Nodes: []map[string]interface{}{
						{
							"host":   "39.97.63.215",
							"port":   float64(80),
							"weight": float64(1),
						},
					},
				},
			},
			wantRet: &entity.Upstream{
				BaseInfo: entity.BaseInfo{
					ID: "u1",
				},
				UpstreamDef: entity.UpstreamDef{
					Name: "upstream1",
					Timeout: &entity.Timeout{
						Connect: 15,
						Send:    15,
						Read:    15,
					},
					Checks: map[string]interface{}{
						"active": map[string]interface{}{
							"timeout":   float64(5),
							"http_path": "/status",
							"host":      "foo.com",
							"healthy": map[string]interface{}{
								"interval":  2,
								"successes": 1,
							},
							"unhealthy": map[string]interface{}{
								"interval":      1,
								"http_failures": 2,
							},
							"req_headers": []interface{}{"User-Agent: curl/7.29.0"},
						},
						"passive": map[string]interface{}{
							"healthy": map[string]interface{}{
								"http_statuses": []interface{}{float64(200), float64(201)},
								"successes":     float64(3),
							},
							"unhealthy": map[string]interface{}{
								"http_statuses": []interface{}{float64(500)},
								"http_failures": 3,
								"tcp_failures":  3,
							},
						},
					},
					Key: "server_addr",
					Nodes: []map[string]interface{}{
						{
							"host":   "39.97.63.215",
							"port":   float64(80),
							"weight": float64(1),
						},
					},
				},
			},
		},
		{
			caseDesc: "update failed, different id",
			giveInput: &UpdateInput{
				ID: "u1",
				Upstream: entity.Upstream{
					BaseInfo: entity.BaseInfo{
						ID: "u2",
					},
					UpstreamDef: entity.UpstreamDef{
						Name: "upstream1",
						Timeout: &entity.Timeout{
							Connect: 15,
							Send:    15,
							Read:    15,
						},
						Checks: map[string]interface{}{
							"active": map[string]interface{}{
								"timeout":   float64(5),
								"http_path": "/status",
								"host":      "foo.com",
								"healthy": map[string]interface{}{
									"interval":  2,
									"successes": 1,
								},
								"unhealthy": map[string]interface{}{
									"interval":      1,
									"http_failures": 2,
								},
								"req_headers": []interface{}{"User-Agent: curl/7.29.0"},
							},
							"passive": map[string]interface{}{
								"healthy": map[string]interface{}{
									"http_statuses": []interface{}{float64(200), float64(201)},
									"successes":     float64(3),
								},
								"unhealthy": map[string]interface{}{
									"http_statuses": []interface{}{float64(500)},
									"http_failures": 3,
									"tcp_failures":  3,
								},
							},
						},
						Key: "server_addr",
						Nodes: []map[string]interface{}{
							{
								"host":   "39.97.63.215",
								"port":   float64(80),
								"weight": float64(1),
							},
						},
					},
				},
			},
			wantRet: &data.SpecCodeResponse{StatusCode: http.StatusBadRequest},
			wantErr: fmt.Errorf("ID on path (u1) doesn't match ID on body (u2)"),
		},
	}

	for _, tc := range tests {
		t.Run(tc.caseDesc, func(t *testing.T) {
			getCalled := false
			upstreamStore := &store.MockInterface{}
			upstreamStore.On("Update", mock.Anything, mock.Anything, mock.Anything).Run(func(args mock.Arguments) {
				getCalled = true
				input := args.Get(1).(*entity.Upstream)
				createIfNotExist := args.Get(2).(bool)
				assert.Equal(t, tc.wantInput, input)
				assert.True(t, createIfNotExist)
			}).Return(tc.giveRet, tc.giveErr)

			upstreamStore.On("List", mock.Anything, mock.Anything).Run(func(args mock.Arguments) {
			}).Return(func(input store.ListInput) *store.ListOutput {
				return &store.ListOutput{
					Rows:      tc.nameExistRet,
					TotalSize: len(tc.nameExistRet),
				}
			}, nil)

			h := Handler{upstreamStore: upstreamStore}
			ctx := droplet.NewContext()
			ctx.SetInput(tc.giveInput)
			ret, err := h.Update(ctx)
			assert.Equal(t, tc.getCalled, getCalled)
			assert.Equal(t, tc.wantRet, ret)
			assert.Equal(t, tc.wantErr, err)
		})
	}
}

func TestUpstream_Patch(t *testing.T) {
	existUpstream := &entity.Upstream{
		BaseInfo: entity.BaseInfo{
			ID: "u1",
		},
		UpstreamDef: entity.UpstreamDef{
			Name: "upstream1",
			Timeout: &entity.Timeout{
				Connect: 15,
				Send:    15,
				Read:    15,
			},
			Checks: map[string]interface{}{
				"active": map[string]interface{}{
					"timeout":   float64(5),
					"http_path": "/status",
					"host":      "foo.com",
					"healthy": map[string]interface{}{
						"interval":  float64(2),
						"successes": float64(1),
					},
					"unhealthy": map[string]interface{}{
						"interval":      float64(1),
						"http_failures": float64(2),
					},
					"req_headers": []interface{}{"User-Agent: curl/7.29.0"},
				},
				"passive": map[string]interface{}{
					"healthy": map[string]interface{}{
						"http_statuses": []interface{}{float64(200), float64(201)},
						"successes":     float64(3),
					},
					"unhealthy": map[string]interface{}{
						"http_statuses": []interface{}{float64(500)},
						"http_failures": 3,
						"tcp_failures":  3,
					},
				},
			},
			Key: "server_addr",
			Nodes: []interface{}{
				map[string]interface{}{
					"host":   "39.97.63.215",
					"port":   float64(80),
					"weight": float64(1),
				},
			},
		},
	}

	patchUpstream := &entity.Upstream{
		BaseInfo: entity.BaseInfo{
			ID: "u1",
		},
		UpstreamDef: entity.UpstreamDef{
			Name: "upstream2",
			Timeout: &entity.Timeout{
				Connect: 20,
				Send:    20,
				Read:    20,
			},
			Checks: map[string]interface{}{
				"active": map[string]interface{}{
					"timeout":   float64(5),
					"http_path": "/status",
					"host":      "foo.com",
					"healthy": map[string]interface{}{
						"interval":  float64(2),
						"successes": float64(1),
					},
					"unhealthy": map[string]interface{}{
						"interval":      float64(1),
						"http_failures": float64(2),
					},
					"req_headers": []interface{}{"User-Agent: curl/7.29.0"},
				},
				"passive": map[string]interface{}{
					"healthy": map[string]interface{}{
						"http_statuses": []interface{}{float64(200), float64(201)},
						"successes":     float64(3),
					},
					"unhealthy": map[string]interface{}{
						"http_statuses": []interface{}{float64(500)},
						"http_failures": 3,
						"tcp_failures":  3,
					},
				},
			},
			Key: "server_addr2",
			Nodes: []interface{}{
				map[string]interface{}{
					"host":   "39.97.63.215",
					"port":   float64(80),
					"weight": float64(1),
				},
			},
		},
	}
	patchUpstreamBytes, err := json.Marshal(patchUpstream)
	assert.Nil(t, err)

	tests := []struct {
		caseDesc  string
		getCalled bool
		giveInput *PatchInput
		giveErr   error
		giveRet   interface{}
		wantInput *entity.Upstream
		wantErr   error
		wantRet   interface{}
	}{
		{
			caseDesc: "patch success",
			giveRet: &entity.Upstream{
				BaseInfo: entity.BaseInfo{
					ID: "u1",
				},
				UpstreamDef: entity.UpstreamDef{
					Name: "upstream2",
					Timeout: &entity.Timeout{
						Connect: 20,
						Send:    20,
						Read:    20,
					},
					Checks: map[string]interface{}{
						"active": map[string]interface{}{
							"timeout":   float64(5),
							"http_path": "/status",
							"host":      "foo.com",
							"healthy": map[string]interface{}{
								"interval":  float64(2),
								"successes": float64(1),
							},
							"unhealthy": map[string]interface{}{
								"interval":      float64(1),
								"http_failures": float64(2),
							},
							"req_headers": []interface{}{"User-Agent: curl/7.29.0"},
						},
						"passive": map[string]interface{}{
							"healthy": map[string]interface{}{
								"http_statuses": []interface{}{float64(200), float64(201)},
								"successes":     float64(3),
							},
							"unhealthy": map[string]interface{}{
								"http_statuses": []interface{}{float64(500)},
								"http_failures": float64(3),
								"tcp_failures":  float64(3),
							},
						},
					},
					Key: "server_addr2",
					Nodes: []interface{}{
						map[string]interface{}{
							"host":   "39.97.63.215",
							"port":   float64(80),
							"weight": float64(1),
						},
					},
				},
			},
			giveInput: &PatchInput{
				ID:      "u1",
				SubPath: "",
				Body:    patchUpstreamBytes,
			},
			wantInput: &entity.Upstream{
				BaseInfo: entity.BaseInfo{
					ID: "u1",
				},
				UpstreamDef: entity.UpstreamDef{
					Name: "upstream2",
					Timeout: &entity.Timeout{
						Connect: 20,
						Send:    20,
						Read:    20,
					},
					Checks: map[string]interface{}{
						"active": map[string]interface{}{
							"timeout":   float64(5),
							"http_path": "/status",
							"host":      "foo.com",
							"healthy": map[string]interface{}{
								"interval":  float64(2),
								"successes": float64(1),
							},
							"unhealthy": map[string]interface{}{
								"interval":      float64(1),
								"http_failures": float64(2),
							},
							"req_headers": []interface{}{"User-Agent: curl/7.29.0"},
						},
						"passive": map[string]interface{}{
							"healthy": map[string]interface{}{
								"http_statuses": []interface{}{float64(200), float64(201)},
								"successes":     float64(3),
							},
							"unhealthy": map[string]interface{}{
								"http_statuses": []interface{}{float64(500)},
								"http_failures": float64(3),
								"tcp_failures":  float64(3),
							},
						},
					},
					Key: "server_addr2",
					Nodes: []interface{}{
						map[string]interface{}{
							"host":   "39.97.63.215",
							"port":   float64(80),
							"weight": float64(1),
						},
					},
				},
			},
			wantRet: &entity.Upstream{
				BaseInfo: entity.BaseInfo{
					ID: "u1",
				},
				UpstreamDef: entity.UpstreamDef{
					Name: "upstream2",
					Timeout: &entity.Timeout{
						Connect: 20,
						Send:    20,
						Read:    20,
					},
					Checks: map[string]interface{}{
						"active": map[string]interface{}{
							"timeout":   float64(5),
							"http_path": "/status",
							"host":      "foo.com",
							"healthy": map[string]interface{}{
								"interval":  float64(2),
								"successes": float64(1),
							},
							"unhealthy": map[string]interface{}{
								"interval":      float64(1),
								"http_failures": float64(2),
							},
							"req_headers": []interface{}{"User-Agent: curl/7.29.0"},
						},
						"passive": map[string]interface{}{
							"healthy": map[string]interface{}{
								"http_statuses": []interface{}{float64(200), float64(201)},
								"successes":     float64(3),
							},
							"unhealthy": map[string]interface{}{
								"http_statuses": []interface{}{float64(500)},
								"http_failures": float64(3),
								"tcp_failures":  float64(3),
							},
						},
					},
					Key: "server_addr2",
					Nodes: []interface{}{
						map[string]interface{}{
							"host":   "39.97.63.215",
							"port":   float64(80),
							"weight": float64(1),
						},
					},
				},
			},
			getCalled: true,
		},
		{
			caseDesc: "patch success by path",
			giveInput: &PatchInput{
				ID:      "u1",
				SubPath: "/nodes",
				Body:    []byte(`[{"host": "172.16.238.20","port": 1981,"weight": 1}]`),
			},
			giveRet: &entity.Upstream{
				BaseInfo: entity.BaseInfo{
					ID: "u1",
				},
				UpstreamDef: entity.UpstreamDef{
					Name: "upstream1",
					Timeout: &entity.Timeout{
						Connect: 20,
						Send:    20,
						Read:    20,
					},
					Checks: map[string]interface{}{
						"active": map[string]interface{}{
							"timeout":   float64(5),
							"http_path": "/status",
							"host":      "foo.com",
							"healthy": map[string]interface{}{
								"interval":  2,
								"successes": 1,
							},
							"unhealthy": map[string]interface{}{
								"interval":      1,
								"http_failures": 2,
							},
							"req_headers": []interface{}{"User-Agent: curl/7.29.0"},
						},
						"passive": map[string]interface{}{
							"healthy": map[string]interface{}{
								"http_statuses": []interface{}{float64(200), float64(201)},
								"successes":     float64(3),
							},
							"unhealthy": map[string]interface{}{
								"http_statuses": []interface{}{float64(500)},
								"http_failures": float64(3),
								"tcp_failures":  float64(3),
							},
						},
					},
					Key: "server_addr_patch",
					Nodes: []interface{}{
						map[string]interface{}{
							"host":   "172.16.238.20",
							"port":   float64(1981),
							"weight": float64(1),
						},
					},
				},
			},
			wantInput: &entity.Upstream{
				BaseInfo: entity.BaseInfo{
					ID: "u1",
				},
				UpstreamDef: entity.UpstreamDef{
					Name: "upstream1",
					Timeout: &entity.Timeout{
						Connect: 15,
						Send:    15,
						Read:    15,
					},
					Checks: map[string]interface{}{
						"active": map[string]interface{}{
							"timeout":   float64(5),
							"http_path": "/status",
							"host":      "foo.com",
							"healthy": map[string]interface{}{
								"interval":  float64(2),
								"successes": float64(1),
							},
							"unhealthy": map[string]interface{}{
								"interval":      float64(1),
								"http_failures": float64(2),
							},
							"req_headers": []interface{}{"User-Agent: curl/7.29.0"},
						},
						"passive": map[string]interface{}{
							"healthy": map[string]interface{}{
								"http_statuses": []interface{}{float64(200), float64(201)},
								"successes":     float64(3),
							},
							"unhealthy": map[string]interface{}{
								"http_statuses": []interface{}{float64(500)},
								"http_failures": float64(3),
								"tcp_failures":  float64(3),
							},
						},
					},
					Key: "server_addr",
					Nodes: []interface{}{
						map[string]interface{}{
							"host":   "172.16.238.20",
							"port":   float64(1981),
							"weight": float64(1),
						},
					},
				},
			},
			wantRet: &entity.Upstream{
				BaseInfo: entity.BaseInfo{
					ID: "u1",
				},
				UpstreamDef: entity.UpstreamDef{
					Name: "upstream1",
					Timeout: &entity.Timeout{
						Connect: 20,
						Send:    20,
						Read:    20,
					},
					Checks: map[string]interface{}{
						"active": map[string]interface{}{
							"timeout":   float64(5),
							"http_path": "/status",
							"host":      "foo.com",
							"healthy": map[string]interface{}{
								"interval":  2,
								"successes": 1,
							},
							"unhealthy": map[string]interface{}{
								"interval":      1,
								"http_failures": 2,
							},
							"req_headers": []interface{}{"User-Agent: curl/7.29.0"},
						},
						"passive": map[string]interface{}{
							"healthy": map[string]interface{}{
								"http_statuses": []interface{}{float64(200), float64(201)},
								"successes":     float64(3),
							},
							"unhealthy": map[string]interface{}{
								"http_statuses": []interface{}{float64(500)},
								"http_failures": float64(3),
								"tcp_failures":  float64(3),
							},
						},
					},
					Key: "server_addr_patch",
					Nodes: []interface{}{
						map[string]interface{}{
							"host":   "172.16.238.20",
							"port":   float64(1981),
							"weight": float64(1),
						},
					},
				},
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

			upstreamStore := &store.MockInterface{}
			upstreamStore.On("Get", mock.Anything, mock.Anything).Return(existUpstream, nil)
			upstreamStore.On("Update", mock.Anything, mock.Anything, mock.Anything).Run(func(args mock.Arguments) {
				getCalled = true
				input := args.Get(1).(*entity.Upstream)
				createIfNotExist := args.Get(2).(bool)
				assert.Equal(t, tc.wantInput, input)
				assert.False(t, createIfNotExist)
			}).Return(tc.giveRet, tc.giveErr)

			h := Handler{upstreamStore: upstreamStore}
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

func TestUpstreams_Delete(t *testing.T) {
	tests := []struct {
		caseDesc            string
		giveInput           *BatchDelete
		giveErr             error
		wantInput           []string
		wantErr             error
		wantRet             interface{}
		routeMockData       []*entity.Route
		routeMockErr        error
		serviceMockData     []*entity.Service
		serviceMockErr      error
		streamRouteMockData []*entity.Service
		streamRouteMockErr  error
		getCalled           bool
	}{
		{
			caseDesc: "delete success",
			giveInput: &BatchDelete{
				IDs: "u1",
			},
			wantInput: []string{"u1"},
			getCalled: true,
		},
		{
			caseDesc: "batch delete success",
			giveInput: &BatchDelete{
				IDs: "u1,u2",
			},
			wantInput: []string{"u1", "u2"},
			getCalled: true,
		},
		{
			caseDesc: "delete failed",
			giveInput: &BatchDelete{
				IDs: "u1",
			},
			giveErr:   fmt.Errorf("delete error"),
			wantInput: []string{"u1"},
			wantRet:   handler.SpecCodeResponse(fmt.Errorf("delete error")),
			wantErr:   fmt.Errorf("delete error"),
			getCalled: true,
		},
		{
			caseDesc: "delete failed, route is using",
			giveInput: &BatchDelete{
				IDs: "u1",
			},
			wantInput: []string{"s1"},
			routeMockData: []*entity.Route{
				&entity.Route{
					BaseInfo: entity.BaseInfo{
						ID:         "r1",
						CreateTime: 1609746531,
					},
					Name:       "route1",
					Desc:       "test_route",
					UpstreamID: "u1",
					ServiceID:  "s1",
					Labels: map[string]string{
						"version": "v1",
					},
				},
			},
			routeMockErr: nil,
			getCalled:    false,
			wantRet:      &data.SpecCodeResponse{StatusCode: 400},
			wantErr:      errors.New("route: route1 is using this upstream"),
		},
		{
			caseDesc: "delete failed, route list error",
			giveInput: &BatchDelete{
				IDs: "u1",
			},
			wantInput:     []string{"u1"},
			routeMockData: nil,
			routeMockErr:  errors.New("route list error"),
			wantRet:       handler.SpecCodeResponse(errors.New("route list error")),
			wantErr:       errors.New("route list error"),
			getCalled:     false,
		},
		{
			caseDesc: "delete failed, service is using",
			giveInput: &BatchDelete{
				IDs: "u1",
			},
			wantInput: []string{"s1"},
			serviceMockData: []*entity.Service{
				&entity.Service{
					BaseInfo: entity.BaseInfo{
						ID:         "s1",
						CreateTime: 1609746531,
					},
					Name:       "service1",
					UpstreamID: "u1",
				},
			},
			serviceMockErr: nil,
			getCalled:      false,
			wantRet:        &data.SpecCodeResponse{StatusCode: 400},
			wantErr:        errors.New("service: service1 is using this upstream"),
		},
		{
			caseDesc: "delete failed, service list error",
			giveInput: &BatchDelete{
				IDs: "u1",
			},
			wantInput:      []string{"u1"},
			serviceMockErr: errors.New("service list error"),
			wantRet:        handler.SpecCodeResponse(errors.New("service list error")),
			wantErr:        errors.New("service list error"),
			getCalled:      false,
		},
	}

	for _, tc := range tests {
		t.Run(tc.caseDesc, func(t *testing.T) {
			getCalled := false
			upstreamStore := &store.MockInterface{}
			upstreamStore.On("BatchDelete", mock.Anything, mock.Anything).Run(func(args mock.Arguments) {
				getCalled = true
				input := args.Get(1).([]string)
				assert.Equal(t, tc.wantInput, input)
			}).Return(tc.giveErr)

			routeStore := &store.MockInterface{}
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

			serviceStore := &store.MockInterface{}
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

			streamRouteStore := &store.MockInterface{}
			streamRouteStore.On("List", mock.Anything).Return(func(input store.ListInput) *store.ListOutput {
				var returnData []interface{}
				for _, c := range tc.streamRouteMockData {
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
			}, tc.streamRouteMockErr)

			h := Handler{upstreamStore: upstreamStore, routeStore: routeStore, serviceStore: serviceStore, streamRouteStore: streamRouteStore}
			ctx := droplet.NewContext()
			ctx.SetInput(tc.giveInput)
			ret, err := h.BatchDelete(ctx)
			assert.Equal(t, tc.getCalled, getCalled)
			assert.Equal(t, tc.wantRet, ret)
			assert.Equal(t, tc.wantErr, err)
		})
	}
}

func TestUpstream_Exist(t *testing.T) {
	mockData := []*entity.Upstream{
		{
			BaseInfo: entity.BaseInfo{ID: "001", CreateTime: 1609742634},
			UpstreamDef: entity.UpstreamDef{
				Name: "upstream1",
				Key:  "server_addr",
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
			BaseInfo: entity.BaseInfo{ID: "002", CreateTime: 1609742635},
			UpstreamDef: entity.UpstreamDef{
				Name: "upstream2",
				Key:  "server_addr2",
				Nodes: []interface{}{
					map[string]interface{}{
						"host":   "39.97.63.216",
						"port":   float64(80),
						"weight": float64(1),
					},
				},
			},
		},
		{
			BaseInfo: entity.BaseInfo{ID: "003", CreateTime: 1609742636},
			UpstreamDef: entity.UpstreamDef{
				Name: "upstream3",
				Key:  "server_addr3",
				Nodes: []interface{}{
					map[string]interface{}{
						"host":   "39.97.63.217",
						"port":   float64(80),
						"weight": float64(1),
					},
				},
			},
		},
	}

	tests := []struct {
		caseDesc  string
		giveInput *ExistCheckInput
		giveErr   error
		getCalled bool
		wantInput []string
		wantErr   error
		wantRet   interface{}
	}{
		{
			caseDesc: "check upstream exist, excluded",
			giveInput: &ExistCheckInput{
				Name:    "upstream1",
				Exclude: "001",
			},
			wantRet:   nil,
			getCalled: true,
		},
		{
			caseDesc: "check upstream exist, not excluded",
			giveInput: &ExistCheckInput{
				Name:    "upstream1",
				Exclude: "002",
			},
			wantRet:   &data.SpecCodeResponse{StatusCode: http.StatusBadRequest},
			wantErr:   consts.InvalidParam("Upstream name is reduplicate"),
			getCalled: true,
		},
		{
			caseDesc: "check upstream exist, not existed",
			giveInput: &ExistCheckInput{
				Name:    "upstream_test",
				Exclude: "001",
			},
			wantRet:   nil,
			wantErr:   nil,
			getCalled: true,
		},
	}

	for _, tc := range tests {
		t.Run(tc.caseDesc, func(t *testing.T) {
			getCalled := false
			upstreamStore := &store.MockInterface{}
			upstreamStore.On("List", mock.Anything, mock.Anything).Run(func(args mock.Arguments) {
				getCalled = true
			}).Return(func(input store.ListInput) *store.ListOutput {
				var res []interface{}
				for _, c := range mockData {
					if input.Predicate(c) {
						if input.Format != nil {
							res = append(res, input.Format(c))
						} else {
							res = append(res, c)
						}
					}
				}
				return &store.ListOutput{
					Rows:      res,
					TotalSize: len(res),
				}
			}, nil)

			h := Handler{upstreamStore: upstreamStore}
			ctx := droplet.NewContext()
			ctx.SetInput(tc.giveInput)
			ret, err := h.Exist(ctx)
			assert.True(t, getCalled)
			assert.Equal(t, tc.wantRet, ret)
			assert.Equal(t, tc.wantErr, err)
		})
	}
}

func TestUpstream_ListUpstreamNames(t *testing.T) {
	mockData := []*entity.Upstream{
		{
			BaseInfo: entity.BaseInfo{ID: "001", CreateTime: 1609742634},
			UpstreamDef: entity.UpstreamDef{
				Name: "upstream1",
				Key:  "server_addr",
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
			BaseInfo: entity.BaseInfo{ID: "002", CreateTime: 1609742635},
			UpstreamDef: entity.UpstreamDef{
				Name: "upstream2",
				Key:  "server_addr2",
				Nodes: []interface{}{
					map[string]interface{}{
						"host":   "39.97.63.216",
						"port":   float64(80),
						"weight": float64(1),
					},
				},
			},
		},
		{
			BaseInfo: entity.BaseInfo{ID: "003", CreateTime: 1609742636},
			UpstreamDef: entity.UpstreamDef{
				Name: "upstream3",
				Key:  "server_addr3",
				Nodes: []interface{}{
					map[string]interface{}{
						"host":   "39.97.63.217",
						"port":   float64(80),
						"weight": float64(1),
					},
				},
			},
		},
	}

	tests := []struct {
		caseDesc  string
		giveData  []*entity.Upstream
		giveErr   error
		wantErr   error
		wantInput store.ListInput
		wantRet   *store.ListOutput
		getCalled bool
	}{
		{
			caseDesc: "get upstream list names",
			wantRet: &store.ListOutput{
				Rows: []interface{}{
					&entity.UpstreamNameResponse{
						ID:   "001",
						Name: "upstream1",
					},
					&entity.UpstreamNameResponse{
						ID:   "002",
						Name: "upstream2",
					},
					&entity.UpstreamNameResponse{
						ID:   "003",
						Name: "upstream3",
					},
				},
				TotalSize: 3,
			},
			getCalled: true,
		},
	}

	for _, tc := range tests {
		t.Run(tc.caseDesc, func(t *testing.T) {
			getCalled := false
			upstreamStore := &store.MockInterface{}
			upstreamStore.On("List", mock.Anything, mock.Anything).Run(func(args mock.Arguments) {
				getCalled = true
			}).Return(func(input store.ListInput) *store.ListOutput {
				var res []interface{}
				for _, c := range mockData {
					res = append(res, c)
				}
				return &store.ListOutput{
					Rows:      res,
					TotalSize: len(res),
				}
			}, nil)

			h := Handler{upstreamStore: upstreamStore}
			ctx := droplet.NewContext()
			ret, err := h.listUpstreamNames(ctx)
			assert.True(t, getCalled)
			assert.Equal(t, tc.wantRet, ret)
			assert.Equal(t, tc.wantErr, err)
		})
	}

	mocknilData := []*entity.Upstream{}

	tests1 := []struct {
		caseDesc  string
		giveData  []*entity.Upstream
		giveErr   error
		wantErr   error
		wantInput store.ListInput
		wantRet   *store.ListOutput
		getCalled bool
	}{
		{
			caseDesc: "get upstream list names nil",
			wantRet: &store.ListOutput{
				Rows:      []interface{}{},
				TotalSize: 0,
			},
			getCalled: true,
		},
	}

	for _, tc := range tests1 {
		t.Run(tc.caseDesc, func(t *testing.T) {
			getCalled := false
			upstreamStore := &store.MockInterface{}
			upstreamStore.On("List", mock.Anything, mock.Anything).Run(func(args mock.Arguments) {
				getCalled = true
			}).Return(func(input store.ListInput) *store.ListOutput {
				var res []interface{}
				for _, c := range mocknilData {
					res = append(res, c)
				}
				return &store.ListOutput{
					Rows:      res,
					TotalSize: len(res),
				}
			}, nil)

			h := Handler{upstreamStore: upstreamStore}
			ctx := droplet.NewContext()
			ret, err := h.listUpstreamNames(ctx)
			assert.True(t, getCalled)
			assert.Equal(t, tc.wantRet, ret)
			assert.Equal(t, tc.wantErr, err)
		})
	}
}
