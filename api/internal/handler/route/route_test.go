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

type testCase struct {
	caseDesc     string
	giveInput    interface{}
	mockInput    interface{}
	mockRet      interface{}
	mockErr      interface{}
	wantRet      interface{}
	wantErr      interface{}
	called       bool
	serviceInput string
	scriptRet    interface{}
	scriptErr    error
	serviceRet   interface{}
	serviceErr   error
	upstreamRet  interface{}
	upstreamErr  error
}

var DagScript = `
{
    "rule":{
        "root":"451106f8-560c-43a4-acf2-2a6ed0ea57b8",
        "451106f8-560c-43a4-acf2-2a6ed0ea57b8":[
            [
                "code == 403",
                "b93d622c-92ef-48b4-b6bb-57e1ce893ee3"
            ],
            [
                "",
                "988ef5c2-c896-4606-a666-3d4cbe24a731"
            ]
        ]
    },
    "conf":{
        "451106f8-560c-43a4-acf2-2a6ed0ea57b8":{
            "name":"uri-blocker",
            "conf":{
                "block_rules":[
                    "root.exe",
                    "root.m+"
                ],
                "rejected_code":403
            }
        },
        "988ef5c2-c896-4606-a666-3d4cbe24a731":{
            "name":"kafka-logger",
            "conf":{
                "batch_max_size":1000,
                "broker_list":{

                },
                "buffer_duration":60,
                "inactive_timeout":5,
                "include_req_body":false,
                "kafka_topic":"1",
                "key":"2",
                "max_retry_count":0,
                "name":"kafka logger",
                "retry_delay":1,
                "timeout":3
            }
        },
        "b93d622c-92ef-48b4-b6bb-57e1ce893ee3":{
            "name":"fault-injection",
            "conf":{
                "abort":{
                    "body":"200",
                    "http_status":300
                },
                "delay":{
                    "duration":500
                }
            }
        }
    },
    "chart":{
        "hovered":{

        },
        "links":{
            "3a110c30-d6f3-40b1-a8ac-b828cfaa2489":{
                "from":{
                    "nodeId":"3365eca3-4bc8-4769-bab3-1485dfd6a43c",
                    "portId":"port3"
                },
                "id":"3a110c30-d6f3-40b1-a8ac-b828cfaa2489",
                "to":{
                    "nodeId":"b93d622c-92ef-48b4-b6bb-57e1ce893ee3",
                    "portId":"port1"
                }
            },
            "c1958993-c1ef-44b1-bb32-7fc6f34870c2":{
                "from":{
                    "nodeId":"3365eca3-4bc8-4769-bab3-1485dfd6a43c",
                    "portId":"port2"
                },
                "id":"c1958993-c1ef-44b1-bb32-7fc6f34870c2",
                "to":{
                    "nodeId":"988ef5c2-c896-4606-a666-3d4cbe24a731",
                    "portId":"port1"
                }
            },
            "f9c42bf6-c8aa-4e86-8498-8dfbc5c53c23":{
                "from":{
                    "nodeId":"451106f8-560c-43a4-acf2-2a6ed0ea57b8",
                    "portId":"port2"
                },
                "id":"f9c42bf6-c8aa-4e86-8498-8dfbc5c53c23",
                "to":{
                    "nodeId":"3365eca3-4bc8-4769-bab3-1485dfd6a43c",
                    "portId":"port1"
                }
            }
        },
        "nodes":{
            "3365eca3-4bc8-4769-bab3-1485dfd6a43c":{
                "id":"3365eca3-4bc8-4769-bab3-1485dfd6a43c",
                "orientation":0,
                "ports":{
                    "port1":{
                        "id":"port1",
                        "position":{
                            "x":107,
                            "y":0
                        },
                        "type":"input"
                    },
                    "port2":{
                        "id":"port2",
                        "position":{
                            "x":92,
                            "y":96
                        },
                        "properties":{
                            "value":"no"
                        },
                        "type":"output"
                    },
                    "port3":{
                        "id":"port3",
                        "position":{
                            "x":122,
                            "y":96
                        },
                        "properties":{
                            "value":"yes"
                        },
                        "type":"output"
                    }
                },
                "position":{
                    "x":750.2627969928922,
                    "y":301.0370335799397
                },
                "properties":{
                    "customData":{
                        "name":"code == 403",
                        "type":1
                    }
                },
                "size":{
                    "height":96,
                    "width":214
                },
                "type":"判断条件"
            },
            "451106f8-560c-43a4-acf2-2a6ed0ea57b8":{
                "id":"451106f8-560c-43a4-acf2-2a6ed0ea57b8",
                "orientation":0,
                "ports":{
                    "port1":{
                        "id":"port1",
                        "position":{
                            "x":100,
                            "y":0
                        },
                        "properties":{
                            "custom":"property"
                        },
                        "type":"input"
                    },
                    "port2":{
                        "id":"port2",
                        "position":{
                            "x":100,
                            "y":96
                        },
                        "properties":{
                            "custom":"property"
                        },
                        "type":"output"
                    }
                },
                "position":{
                    "x":741.5684544145346,
                    "y":126.75879247285502
                },
                "properties":{
                    "customData":{
                        "data":{
                            "block_rules":[
                                "root.exe",
                                "root.m+"
                            ],
                            "rejected_code":403
                        },
                        "name":"uri-blocker",
                        "type":0
                    }
                },
                "size":{
                    "height":96,
                    "width":201
                },
                "type":"uri-blocker"
            },
            "988ef5c2-c896-4606-a666-3d4cbe24a731":{
                "id":"988ef5c2-c896-4606-a666-3d4cbe24a731",
                "orientation":0,
                "ports":{
                    "port1":{
                        "id":"port1",
                        "position":{
                            "x":106,
                            "y":0
                        },
                        "properties":{
                            "custom":"property"
                        },
                        "type":"input"
                    },
                    "port2":{
                        "id":"port2",
                        "position":{
                            "x":106,
                            "y":96
                        },
                        "properties":{
                            "custom":"property"
                        },
                        "type":"output"
                    }
                },
                "position":{
                    "x":607.9687500000001,
                    "y":471.17788461538447
                },
                "properties":{
                    "customData":{
                        "data":{
                            "batch_max_size":1000,
                            "broker_list":{

                            },
                            "buffer_duration":60,
                            "inactive_timeout":5,
                            "include_req_body":false,
                            "kafka_topic":"1",
                            "key":"2",
                            "max_retry_count":0,
                            "name":"kafka logger",
                            "retry_delay":1,
                            "timeout":3
                        },
                        "name":"kafka-logger",
                        "type":0
                    }
                },
                "size":{
                    "height":96,
                    "width":212
                },
                "type":"kafka-logger"
            },
            "b93d622c-92ef-48b4-b6bb-57e1ce893ee3":{
                "id":"b93d622c-92ef-48b4-b6bb-57e1ce893ee3",
                "orientation":0,
                "ports":{
                    "port1":{
                        "id":"port1",
                        "position":{
                            "x":110,
                            "y":0
                        },
                        "properties":{
                            "custom":"property"
                        },
                        "type":"input"
                    },
                    "port2":{
                        "id":"port2",
                        "position":{
                            "x":110,
                            "y":96
                        },
                        "properties":{
                            "custom":"property"
                        },
                        "type":"output"
                    }
                },
                "position":{
                    "x":988.9074986362261,
                    "y":478.62041800736495
                },
                "properties":{
                    "customData":{
                        "data":{
                            "abort":{
                                "body":"200",
                                "http_status":300
                            },
                            "delay":{
                                "duration":500
                            }
                        },
                        "name":"fault-injection",
                        "type":0
                    }
                },
                "size":{
                    "height":96,
                    "width":219
                },
                "type":"fault-injection"
            }
        },
        "offset":{
            "x":-376.83,
            "y":87.98
        },
        "scale":0.832,
        "selected":{
            "id":"b93d622c-92ef-48b4-b6bb-57e1ce893ee3",
            "type":"node"
        }
    }
}`

func TestRoute_Get(t *testing.T) {
	tests := []testCase{
		{
			caseDesc:  "route: get success",
			giveInput: &GetInput{ID: "r1"},
			mockInput: "r1",
			mockRet: &entity.Route{
				BaseInfo: entity.BaseInfo{
					ID: "r1",
				},
				URI: "/test",
			},
			mockErr: nil,
			wantRet: &entity.Route{
				BaseInfo: entity.BaseInfo{
					ID: "r1",
				},
				Script: "script",
				URI:    "/test",
			},
			wantErr:   nil,
			called:    true,
			scriptRet: &entity.Script{ID: "r1", Script: "script"},
			scriptErr: nil,
		},
		{
			caseDesc:  "route: store get failed",
			giveInput: &GetInput{ID: "failed_key"},
			mockInput: "failed_key",
			mockRet:   nil,
			mockErr:   fmt.Errorf("get failed"),
			wantRet: &data.SpecCodeResponse{
				StatusCode: http.StatusNotFound,
			},
			wantErr: fmt.Errorf("get failed"),
			called:  true,
		},
		{
			caseDesc:  "script: store get failed",
			giveInput: &GetInput{ID: "failed_key"},
			mockInput: "failed_key",
			mockRet:   nil,
			mockErr:   fmt.Errorf("get failed"),
			wantRet: &data.SpecCodeResponse{
				StatusCode: http.StatusNotFound,
			},
			wantErr:   fmt.Errorf("get failed"),
			scriptErr: errors.New("get failed"),
			called:    true,
		},
	}

	for _, tc := range tests {
		getCalled := false
		mStore := &store.MockInterface{}

		mStore.On("Get", mock.Anything, mock.Anything).Run(func(args mock.Arguments) {
			getCalled = true
			assert.Equal(t, tc.mockInput, args.Get(0))
		}).Return(tc.mockRet, tc.mockErr)

		sStore := &store.MockInterface{}
		sStore.On("Get", mock.Anything, mock.Anything).Return(tc.scriptRet, tc.scriptErr)

		h := Handler{routeStore: mStore, scriptStore: sStore}
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
			BaseInfo: entity.BaseInfo{CreateTime: 1609742634},
			Name:     "r1",
			URI:      "/test_r1",
			Labels: map[string]string{
				"version": "v1",
				"build":   "16",
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
			BaseInfo: entity.BaseInfo{CreateTime: 1609742635},
			Name:     "r2",
			URI:      "/test_r2",
			Labels: map[string]string{
				"version": "v1",
				"build":   "16",
			},
		},
		{
			BaseInfo: entity.BaseInfo{CreateTime: 1609742636},
			Name:     "route_test",
			URI:      "/test_route_test",
			Labels: map[string]string{
				"version": "v2",
				"build":   "17",
			},
		},
		{
			BaseInfo: entity.BaseInfo{CreateTime: 1609742636},
			Name:     "test_route",
			URI:      "/test_test_route",
			Labels: map[string]string{
				"version": "v2",
				"build":   "17",
				"extra":   "test",
			},
		},
	}

	tests := []testCase{
		{
			caseDesc: "list all route",
			giveInput: &ListInput{
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
					mockData[0],
					mockData[1],
					mockData[2],
					mockData[3],
				},
				TotalSize: 4,
			},
			scriptRet: &entity.Script{ID: "r1", Script: "script"},
			called:    true,
		},
		{
			caseDesc: "list routes with name",
			giveInput: &ListInput{
				Name: "route",
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
			scriptRet: &entity.Script{ID: "r1", Script: "script"},
			called:    true,
		},
		{
			caseDesc: "list routes with uri",
			giveInput: &ListInput{
				URI: "test_r2",
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
					mockData[1],
				},
				TotalSize: 1,
			},
			scriptRet: &entity.Script{ID: "r1", Script: "script"},
			called:    true,
		},
		{
			caseDesc: "list routes with label",
			giveInput: &ListInput{
				Label: "version:v1",
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
					mockData[0],
					mockData[1],
				},
				TotalSize: 2,
			},
			scriptRet: &entity.Script{ID: "s1", Script: "script"},
			called:    true,
		},
		{
			caseDesc: "list routes with label",
			giveInput: &ListInput{
				Label: "extra",
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
					mockData[3],
				},
				TotalSize: 1,
			},
			scriptRet: &entity.Script{ID: "s1", Script: "script"},
			called:    true,
		},
		{
			caseDesc: "list routes and test format",
			giveInput: &ListInput{
				Name: "r1",
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
					&entity.Route{
						BaseInfo: entity.BaseInfo{CreateTime: 1609742634},
						Name:     "r1",
						URI:      "/test_r1",
						Labels: map[string]string{
							"version": "v1",
							"build":   "16",
						},
						Script: "script",
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
		t.Run(tc.caseDesc, func(t *testing.T) {
			getCalled := false
			mStore := &store.MockInterface{}
			mStore.On("List", mock.Anything).Run(func(args mock.Arguments) {
				getCalled = true
				input := args.Get(0).(store.ListInput)
				mockInput := tc.mockInput.(store.ListInput)
				assert.Equal(t, mockInput.PageSize, input.PageSize)
				assert.Equal(t, mockInput.PageNumber, input.PageNumber)
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
			}, tc.mockErr)

			sStore := &store.MockInterface{}
			sStore.On("Get", mock.Anything, mock.Anything).Return(tc.scriptRet, tc.scriptErr)

			h := Handler{routeStore: mStore, scriptStore: sStore}
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
	scriptMap := make(map[string]interface{})

	err := json.Unmarshal([]byte(DagScript), &scriptMap)
	assert.Nil(t, err)

	luaCode, err := generateLuaCode(scriptMap)
	assert.Nil(t, err)

	tests := []testCase{
		{
			caseDesc: "create route success",
			giveInput: &entity.Route{
				BaseInfo: entity.BaseInfo{
					ID:         "s1",
					CreateTime: 1609746531,
				},
				Name:       "s1",
				Desc:       "test_route",
				UpstreamID: "u1",
				ServiceID:  "s1",
				Script:     "",
				Labels: map[string]string{
					"version": "v1",
				},
			},
			mockInput: &entity.Route{
				BaseInfo: entity.BaseInfo{
					ID:         "s1",
					CreateTime: 1609746531,
				},
				Name:       "s1",
				Desc:       "test_route",
				UpstreamID: "u1",
				ServiceID:  "s1",
				ScriptID:   "s1",
				Script:     "",
				Labels: map[string]string{
					"version": "v1",
				},
			},
			mockRet: &entity.Route{
				BaseInfo: entity.BaseInfo{
					ID:         "s1",
					CreateTime: 1609746531,
				},
				Name:       "s1",
				Desc:       "test_route",
				UpstreamID: "u1",
				ServiceID:  "s1",
				ScriptID:   "s1",
				Script:     "",
				Labels: map[string]string{
					"version": "v1",
				},
			},
			serviceRet:  "service",
			serviceErr:  nil,
			upstreamRet: "upstream",
			upstreamErr: nil,
			scriptRet:   "script",
			scriptErr:   nil,
			wantRet: &entity.Route{
				BaseInfo: entity.BaseInfo{
					ID:         "s1",
					CreateTime: 1609746531,
				},
				Name:       "s1",
				Desc:       "test_route",
				UpstreamID: "u1",
				ServiceID:  "s1",
				ScriptID:   "s1",
				Script:     "",
				Labels: map[string]string{
					"version": "v1",
				},
			},
			wantErr: nil,
			called:  true,
		},
		{
			caseDesc: "create route failed, service not found",
			giveInput: &entity.Route{
				BaseInfo: entity.BaseInfo{
					ID:         "s2",
					CreateTime: 1609746531,
				},
				Name:       "s1",
				Desc:       "test_route",
				UpstreamID: "u1",
				ServiceID:  "not_found",
				Script:     "",
				Labels: map[string]string{
					"version": "v1",
				},
			},
			wantRet:    &data.SpecCodeResponse{StatusCode: http.StatusBadRequest},
			wantErr:    fmt.Errorf("service id: not_found not found"),
			serviceRet: nil,
			serviceErr: data.ErrNotFound,
		},
		{
			caseDesc: "create route failed, service store get error",
			giveInput: &entity.Route{
				BaseInfo: entity.BaseInfo{
					ID:         "r1",
					CreateTime: 1609746531,
				},
				Name:       "r1",
				Desc:       "test route",
				UpstreamID: "r1",
				// mock store will return err if service is s3
				ServiceID: "error",
				Script:    "",
				Labels: map[string]string{
					"version": "v1",
				},
			},
			wantRet:    &data.SpecCodeResponse{StatusCode: http.StatusBadRequest},
			wantErr:    errors.New("service error"),
			serviceRet: nil,
			serviceErr: errors.New("service error"),
			called:     false,
		},
		{
			caseDesc: "create route failed, upstream not found",
			giveInput: &entity.Route{
				BaseInfo: entity.BaseInfo{
					ID:         "s2",
					CreateTime: 1609746531,
				},
				Name:       "s1",
				Desc:       "test_route",
				UpstreamID: "not_found",
				ServiceID:  "s2",
				Script:     "",
				Labels: map[string]string{
					"version": "v1",
				},
			},
			wantRet:     &data.SpecCodeResponse{StatusCode: http.StatusBadRequest},
			wantErr:     fmt.Errorf("upstream id: not_found not found"),
			upstreamErr: data.ErrNotFound,
			called:      false,
		},
		{
			caseDesc: "create route failed, upstream store get error",
			giveInput: &entity.Route{
				BaseInfo: entity.BaseInfo{
					ID:         "s2",
					CreateTime: 1609746531,
				},
				Name:       "s1",
				Desc:       "test_route",
				UpstreamID: "error",
				ServiceID:  "s2",
				Script:     "",
				Labels: map[string]string{
					"version": "v1",
				},
			},
			wantRet:     &data.SpecCodeResponse{StatusCode: http.StatusBadRequest},
			wantErr:     errors.New("upstream error"),
			upstreamErr: errors.New("upstream error"),
			called:      false,
		},
		{
			caseDesc: "create route failed, script create error",
			giveInput: &entity.Route{
				BaseInfo: entity.BaseInfo{
					ID:         "s2",
					CreateTime: 1609746531,
				},
				Name:       "s1",
				Desc:       "test_route",
				UpstreamID: "u1",
				ServiceID:  "s2",
				Script:     "",
				Labels: map[string]string{
					"version": "v1",
				},
			},
			wantRet:    &data.SpecCodeResponse{StatusCode: http.StatusBadRequest},
			wantErr:    fmt.Errorf("upstream error"),
			serviceErr: fmt.Errorf("upstream error"),
			called:     false,
		},
		{
			caseDesc: "create route success with script",
			giveInput: &entity.Route{
				BaseInfo: entity.BaseInfo{
					ID:         "s1",
					CreateTime: 1609746531,
				},
				Name:       "s1",
				Desc:       "test_route",
				UpstreamID: "u1",
				ServiceID:  "s1",
				Script:     scriptMap,
				Labels: map[string]string{
					"version": "v1",
				},
			},
			mockInput: &entity.Route{
				BaseInfo: entity.BaseInfo{
					ID:         "s1",
					CreateTime: 1609746531,
				},
				Name:       "s1",
				Desc:       "test_route",
				UpstreamID: "u1",
				ServiceID:  "s1",
				Script:     luaCode,
				ScriptID:   "s1",
				Labels: map[string]string{
					"version": "v1",
				},
			},
			mockRet: &entity.Route{
				BaseInfo: entity.BaseInfo{
					ID:         "s1",
					CreateTime: 1609746531,
				},
				Name:       "s1",
				Desc:       "test_route",
				UpstreamID: "u1",
				ServiceID:  "s1",
				Script:     luaCode,
				ScriptID:   "s1",
				Labels: map[string]string{
					"version": "v1",
				},
			},
			serviceRet:  "service",
			serviceErr:  nil,
			upstreamRet: "upstream",
			upstreamErr: nil,
			scriptRet:   "script",
			scriptErr:   nil,
			wantRet: &entity.Route{
				BaseInfo: entity.BaseInfo{
					ID:         "s1",
					CreateTime: 1609746531,
				},
				Name:       "s1",
				Desc:       "test_route",
				UpstreamID: "u1",
				ServiceID:  "s1",
				Script:     luaCode,
				ScriptID:   "s1",
				Labels: map[string]string{
					"version": "v1",
				},
			},
			wantErr: nil,
			called:  true,
		},
	}

	for _, tc := range tests {
		t.Run(tc.caseDesc, func(t *testing.T) {
			getCalled := false

			mStore := &store.MockInterface{}
			mStore.On("Create", mock.Anything, mock.Anything).Run(func(args mock.Arguments) {
				getCalled = true
				route := args.Get(1).(*entity.Route)
				assert.Equal(t, tc.mockInput, route)
			}).Return(tc.mockRet, tc.mockErr)

			svcStore := &store.MockInterface{}
			svcStore.On("Get", mock.Anything, mock.Anything).Return(tc.serviceRet, tc.serviceErr)

			uStore := &store.MockInterface{}
			uStore.On("Get", mock.Anything, mock.Anything).Return(tc.upstreamRet, tc.upstreamErr)

			scriptStore := &store.MockInterface{}
			scriptStore.On("Create", mock.Anything, mock.Anything).Return(tc.scriptRet, tc.serviceErr)

			h := Handler{routeStore: mStore, svcStore: svcStore, upstreamStore: uStore, scriptStore: scriptStore}

			ctx := droplet.NewContext()
			ctx.SetInput(tc.giveInput)
			ret, err := h.Create(ctx)
			assert.Equal(t, tc.called, getCalled)
			assert.Equal(t, tc.wantRet, ret)
			assert.Equal(t, tc.wantErr, err)
		})
	}
}

func TestRoute_Update(t *testing.T) {
	luaScript := "local _M = {} \n function _M.access(api_ctx) \n ngx.log(ngx.WARN,\"hit access phase\") \n end \nreturn _M"
	scriptMap := make(map[string]interface{})
	err := json.Unmarshal([]byte(DagScript), &scriptMap)
	assert.Nil(t, err)

	luaCode, err := generateLuaCode(scriptMap)
	assert.Nil(t, err)
	tests := []testCase{
		{
			caseDesc: "update success with script",
			giveInput: &UpdateInput{
				ID: "r1",
				Route: entity.Route{
					Name:       "r1",
					Desc:       "updated route",
					UpstreamID: "u2",
					Script:     luaScript,
					ServiceID:  "s1",
					Labels: map[string]string{
						"version": "v2",
					},
				},
			},
			mockInput: &entity.Route{
				BaseInfo: entity.BaseInfo{
					ID: "r1",
				},
				Name:       "r1",
				Desc:       "updated route",
				UpstreamID: "u2",
				Script:     luaScript,
				ScriptID:   "r1",
				ServiceID:  "s1",
				Labels: map[string]string{
					"version": "v2",
				},
			},
			mockRet: &entity.Route{
				BaseInfo: entity.BaseInfo{
					ID: "r1",
				},
				Name:       "r1",
				Desc:       "updated route",
				UpstreamID: "u2",
				Script:     luaScript,
				ScriptID:   "r1",
				ServiceID:  "s1",
				Labels: map[string]string{
					"version": "v2",
				},
			},
			wantRet: &entity.Route{
				BaseInfo: entity.BaseInfo{
					ID: "r1",
				},
				Name:       "r1",
				Desc:       "updated route",
				UpstreamID: "u2",
				Script:     luaScript,
				ScriptID:   "r1",
				ServiceID:  "s1",
				Labels: map[string]string{
					"version": "v2",
				},
			},
			mockErr:      nil,
			serviceInput: "s2",
			called:       true,
		},
		{
			caseDesc: "update success with script map",
			giveInput: &UpdateInput{
				ID: "r1",
				Route: entity.Route{
					Name:       "r1",
					Desc:       "updated route",
					UpstreamID: "u2",
					Script:     scriptMap,
					ServiceID:  "s1",
					Labels: map[string]string{
						"version": "v2",
					},
				},
			},
			mockInput: &entity.Route{
				BaseInfo: entity.BaseInfo{
					ID: "r1",
				},
				Name:       "r1",
				Desc:       "updated route",
				UpstreamID: "u2",
				Script:     luaCode,
				ScriptID:   "r1",
				ServiceID:  "s1",
				Labels: map[string]string{
					"version": "v2",
				},
			},
			mockRet: &entity.Route{
				BaseInfo: entity.BaseInfo{
					ID: "r1",
				},
				Name:       "r1",
				Desc:       "updated route",
				UpstreamID: "u2",
				Script:     luaCode,
				ScriptID:   "r1",
				ServiceID:  "s1",
				Labels: map[string]string{
					"version": "v2",
				},
			},
			mockErr: nil,
			wantRet: &entity.Route{
				BaseInfo: entity.BaseInfo{
					ID: "r1",
				},
				Name:       "r1",
				Desc:       "updated route",
				UpstreamID: "u2",
				Script:     luaCode,
				ScriptID:   "r1",
				ServiceID:  "s1",
				Labels: map[string]string{
					"version": "v2",
				},
			},
			serviceInput: "s2",
			called:       true,
		},
		{
			caseDesc: "update failed, different id",
			giveInput: &UpdateInput{
				ID: "r1",
				Route: entity.Route{
					BaseInfo: entity.BaseInfo{
						ID: "r2",
					},
					Name:       "test_route",
					UpstreamID: "u1",
					Desc:       "test service",
				},
			},
			wantRet: &data.SpecCodeResponse{StatusCode: http.StatusBadRequest},
			wantErr: fmt.Errorf("ID on path (r1) doesn't match ID on body (r2)"),
			called:  false,
		},
		{
			caseDesc: "update failed, service not found",
			giveInput: &UpdateInput{
				ID: "r1",
				Route: entity.Route{
					BaseInfo: entity.BaseInfo{
						ID: "r1",
					},
					Name:       "test route",
					ServiceID:  "not_found",
					UpstreamID: "u1",
				},
			},
			wantRet:    &data.SpecCodeResponse{StatusCode: http.StatusBadRequest},
			wantErr:    fmt.Errorf("service id: not_found not found"),
			serviceErr: data.ErrNotFound,
			called:     false,
		},
		{
			caseDesc: "update failed, upstream not found",
			giveInput: &UpdateInput{
				ID: "r1",
				Route: entity.Route{
					Name:       "test_route",
					UpstreamID: "not_found",
					ServiceID:  "s1",
					Desc:       "test route",
				},
			},
			wantRet:     &data.SpecCodeResponse{StatusCode: http.StatusBadRequest},
			wantErr:     fmt.Errorf("upstream id: not_found not found"),
			serviceRet:  "service",
			upstreamErr: data.ErrNotFound,
			called:      false,
		},
		{
			caseDesc: "update failed, route return error",
			giveInput: &UpdateInput{
				ID: "r1",
				Route: entity.Route{
					Name: "r1",
					Desc: "test route",
				},
			},
			mockInput: &entity.Route{
				BaseInfo: entity.BaseInfo{
					ID: "r1",
				},
				Name: "r1",
				Desc: "test route",
			},
			mockErr:      fmt.Errorf("route update error"),
			wantErr:      fmt.Errorf("route update error"),
			wantRet:      &data.SpecCodeResponse{StatusCode: http.StatusInternalServerError},
			serviceRet:   "service",
			upstreamRet:  "upstream",
			serviceInput: "s1",
			called:       true,
		},
	}

	for _, tc := range tests {
		t.Run(tc.caseDesc, func(t *testing.T) {
			getCalled := false
			routeStore := &store.MockInterface{}

			routeStore.On("Update", mock.Anything, mock.Anything, mock.Anything).Run(func(args mock.Arguments) {
				getCalled = true
				input := args.Get(1).(*entity.Route)
				createIfNotExist := args.Get(2).(bool)
				assert.Equal(t, tc.mockInput, input)
				assert.True(t, createIfNotExist)
			}).Return(tc.mockRet, tc.mockErr)

			serviceStore := &store.MockInterface{}
			serviceStore.On("Get", mock.Anything, mock.Anything).Return(tc.serviceRet, tc.serviceErr)

			upstreamStore := &store.MockInterface{}
			upstreamStore.On("Get", mock.Anything, mock.Anything).Return(tc.upstreamRet, tc.upstreamErr)

			scriptStore := &store.MockInterface{}
			scriptStore.On("Get", mock.Anything, mock.Anything).Return(tc.scriptRet, tc.scriptErr)
			scriptStore.On("Update", mock.Anything, mock.Anything, mock.Anything).Return(luaScript, nil)

			h := Handler{svcStore: serviceStore, upstreamStore: upstreamStore, scriptStore: scriptStore,
				routeStore: routeStore}

			ctx := droplet.NewContext()
			ctx.SetInput(tc.giveInput)
			ret, err := h.Update(ctx)
			assert.Equal(t, tc.called, getCalled)
			assert.Equal(t, tc.wantRet, ret)
			assert.Equal(t, tc.wantErr, err)
		})
	}
}

func TestRoute_Patch(t *testing.T) {
	existRoute := &entity.Route{
		BaseInfo: entity.BaseInfo{
			ID:         "r1",
			CreateTime: 1609340491,
			UpdateTime: 1609340491,
		},
		Name:       "exist_service",
		UpstreamID: "u1",
		Upstream: &entity.UpstreamDef{
			Key: "key",
		},
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
		Status: 1,
	}

	tests := []testCase{
		{
			caseDesc: "patch success",
			giveInput: &PatchInput{
				ID:      "r1",
				SubPath: "",
				Body:    []byte("{\"status\":0}"),
			},
			mockInput: &entity.Route{
				BaseInfo: entity.BaseInfo{
					ID:         "r1",
					CreateTime: 1609340491,
					UpdateTime: 1609340491,
				},
				Name:       "exist_service",
				UpstreamID: "u1",
				Upstream: &entity.UpstreamDef{
					Key: "key",
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
				Status: 0,
			},
			mockRet: &entity.Route{
				BaseInfo: entity.BaseInfo{
					ID:         "r1",
					CreateTime: 1609340491,
					UpdateTime: 1609340491,
				},
				Name:       "exist_service",
				UpstreamID: "u1",
				Upstream: &entity.UpstreamDef{
					Key: "key",
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
				Status: 0,
			},
			wantRet: &entity.Route{
				BaseInfo: entity.BaseInfo{
					ID:         "r1",
					CreateTime: 1609340491,
					UpdateTime: 1609340491,
				},
				Name:       "exist_service",
				UpstreamID: "u1",
				Upstream: &entity.UpstreamDef{
					Key: "key",
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
				Status: 0,
			},
			called: true,
		},
		{
			caseDesc: "patch success by path",
			giveInput: &PatchInput{
				ID:      "r1",
				SubPath: "/status",
				Body:    []byte("0"),
			},
			mockInput: &entity.Route{
				BaseInfo: entity.BaseInfo{
					ID:         "r1",
					CreateTime: 1609340491,
					UpdateTime: 1609340491,
				},
				Name:       "exist_service",
				UpstreamID: "u1",
				Upstream: &entity.UpstreamDef{
					Key: "key",
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
				Status: 0,
			},
			mockRet: &entity.Route{
				BaseInfo: entity.BaseInfo{
					ID:         "r1",
					CreateTime: 1609340491,
					UpdateTime: 1609340491,
				},
				Name:       "exist_service",
				UpstreamID: "u1",
				Upstream: &entity.UpstreamDef{
					Key: "key",
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
				Status: 0,
			},
			wantRet: &entity.Route{
				BaseInfo: entity.BaseInfo{
					ID:         "r1",
					CreateTime: 1609340491,
					UpdateTime: 1609340491,
				},
				Name:       "exist_service",
				UpstreamID: "u1",
				Upstream: &entity.UpstreamDef{
					Key: "key",
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
				Status: 0,
			},
			called: true,
		},
		{
			caseDesc: "patch failed, path error",
			giveInput: &PatchInput{
				ID:      "r1",
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

			routeStore := &store.MockInterface{}
			routeStore.On("Get", mock.Anything, mock.Anything).Return(existRoute, nil)
			routeStore.On("Update", mock.Anything, mock.Anything, mock.Anything).Run(func(args mock.Arguments) {
				getCalled = true
				input := args.Get(1).(*entity.Route)
				createIfNotExist := args.Get(2).(bool)
				assert.Equal(t, tc.mockInput, input)
				assert.False(t, createIfNotExist)
			}).Return(tc.mockRet, tc.mockErr)
			h := Handler{routeStore: routeStore}
			ctx := droplet.NewContext()
			ctx.SetInput(tc.giveInput)
			ret, err := h.Patch(ctx)
			assert.Equal(t, tc.called, getCalled)
			assert.Equal(t, tc.wantRet, ret)
			if tc.wantErr != nil && err != nil {
				assert.Error(t, tc.wantErr.(error), err.Error())
			} else {
				assert.Equal(t, tc.wantErr, err)
			}
		})
	}
}

func TestRoute_Delete(t *testing.T) {
	tests := []testCase{
		{
			caseDesc: "delete success",
			giveInput: &BatchDelete{
				IDs: "r1",
			},
			mockInput: []string{"r1"},
			called:    true,
		},
		{
			caseDesc: "batch delete success",
			giveInput: &BatchDelete{
				IDs: "r1,r2",
			},
			mockInput: []string{"r1", "r2"},
			called:    true,
		},
		{
			caseDesc: "delete failed, route delete error",
			giveInput: &BatchDelete{
				IDs: "r1",
			},
			mockInput: []string{"r1"},
			mockErr:   fmt.Errorf("delete error"),
			wantRet:   handler.SpecCodeResponse(fmt.Errorf("delete error")),
			wantErr:   fmt.Errorf("delete error"),
			called:    true,
		},
		{
			caseDesc: "delete failed, script delete error",
			giveInput: &BatchDelete{
				IDs: "r1",
			},
			mockInput: []string{"r1"},
			scriptErr: fmt.Errorf("delete error"),
			wantRet:   nil,
			wantErr:   nil,
			called:    true,
		},
	}

	for _, tc := range tests {
		t.Run(tc.caseDesc, func(t *testing.T) {
			getCalled := false
			routeStore := &store.MockInterface{}
			routeStore.On("BatchDelete", mock.Anything, mock.Anything).Run(func(args mock.Arguments) {
				getCalled = true
				input := args.Get(1).([]string)
				assert.Equal(t, tc.mockInput, input)
			}).Return(tc.mockErr)

			scriptStore := &store.MockInterface{}
			scriptStore.On("BatchDelete", mock.Anything, mock.Anything).Return(tc.serviceRet, tc.scriptErr)

			h := Handler{routeStore: routeStore, scriptStore: scriptStore}
			ctx := droplet.NewContext()
			ctx.SetInput(tc.giveInput)
			ret, err := h.BatchDelete(ctx)
			assert.True(t, getCalled)
			assert.Equal(t, tc.wantRet, ret)
			if tc.wantErr != nil && err != nil {
				assert.Error(t, tc.wantErr.(error), err.Error())
			} else {
				assert.Equal(t, tc.wantErr, err)
			}
		})
	}
}

func TestRoute_Exist(t *testing.T) {
	mockData := []*entity.Route{
		{
			BaseInfo: entity.BaseInfo{ID: "001", CreateTime: 1609742634},
			Name:     "r1",
			URI:      "/test_r1",
			Labels: map[string]string{
				"version": "v1",
				"build":   "16",
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
			BaseInfo: entity.BaseInfo{ID: "002", CreateTime: 1609742635},
			Name:     "r2",
			URI:      "/test_r2",
			Labels: map[string]string{
				"version": "v1",
				"build":   "16",
			},
		},
		{
			BaseInfo: entity.BaseInfo{ID: "003", CreateTime: 1609742636},
			Name:     "route_test",
			URI:      "/test_route_test",
			Labels: map[string]string{
				"version": "v2",
				"build":   "17",
			},
		},
	}

	tests := []testCase{
		{
			caseDesc: "check route exist, excluded",
			giveInput: &ExistCheckInput{
				Name:    "r1",
				Exclude: "001",
			},
			wantRet: nil,
			called:  true,
		},
		{
			caseDesc: "check route exist, not excluded",
			giveInput: &ExistCheckInput{
				Name:    "r1",
				Exclude: "002",
			},
			wantRet: &data.SpecCodeResponse{StatusCode: http.StatusBadRequest},
			wantErr: consts.InvalidParam("Route name is reduplicate"),
			called:  true,
		},
		{
			caseDesc: "check route exist, not existed",
			giveInput: &ExistCheckInput{
				Name:    "r3",
				Exclude: "001",
			},
			wantRet: nil,
			wantErr: nil,
			called:  true,
		},
	}

	for _, tc := range tests {
		t.Run(tc.caseDesc, func(t *testing.T) {
			getCalled := false
			routeStore := &store.MockInterface{}
			routeStore.On("List", mock.Anything, mock.Anything).Run(func(args mock.Arguments) {
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

			h := Handler{routeStore: routeStore}
			ctx := droplet.NewContext()
			ctx.SetInput(tc.giveInput)
			ret, err := h.Exist(ctx)
			assert.True(t, getCalled)
			assert.Equal(t, tc.wantRet, ret)
			assert.Equal(t, tc.wantErr, err)
		})
	}
}
