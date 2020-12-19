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

package server_info

import (
	"errors"
	"testing"

	"github.com/shiningrush/droplet"
	"github.com/shiningrush/droplet/data"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"

	"github.com/apisix/manager-api/internal/core/entity"
	"github.com/apisix/manager-api/internal/core/store"
)

func TestHandler_Get(t *testing.T) {
	var (
		tests = []struct {
			caseDesc   string
			giveInput  *GetInput
			giveErr    error
			giveRet    interface{}
			wantErr    error
			wantGetKey string
			wantRet    interface{}
		}{
			{
				caseDesc:  "get server_info",
				giveInput: &GetInput{ID: "server_1"},
				giveRet: &entity.ServerInfo{
					BaseInfo:       entity.BaseInfo{ID: "server_1"},
					UpTime:         10,
					LastReportTime: 1608195454,
					BootTime:       1608195454,
					Hostname:       "gentoo",
					Version:        "v3",
				},
				wantGetKey: "server_1",
				wantRet: &entity.ServerInfo{
					BaseInfo:       entity.BaseInfo{ID: "server_1"},
					UpTime:         10,
					LastReportTime: 1608195454,
					BootTime:       1608195454,
					Hostname:       "gentoo",
					Version:        "v3",
				},
			},
			{
				caseDesc:   "get server_info not exist",
				giveInput:  &GetInput{ID: "server_3"},
				giveRet:    &data.SpecCodeResponse{Response: data.Response{Code: 0}, StatusCode: 404},
				giveErr:    errors.New("not found"),
				wantGetKey: "server_3",
				wantRet:    &data.SpecCodeResponse{Response: data.Response{Code: 0}, StatusCode: 404},
				wantErr:    errors.New("not found"),
			},
		}
	)

	for _, tc := range tests {
		t.Run(tc.caseDesc, func(t *testing.T) {
			getCalled := true
			mStore := &store.MockInterface{}
			mStore.On("Get", mock.Anything).Run(func(args mock.Arguments) {
				getCalled = true
				assert.Equal(t, tc.wantGetKey, args.Get(0))
			}).Return(tc.giveRet, tc.giveErr)

			h := Handler{serverInfoStore: mStore}
			ctx := droplet.NewContext()
			ctx.SetInput(tc.giveInput)
			ret, err := h.Get(ctx)
			assert.True(t, getCalled)
			assert.Equal(t, tc.wantErr, err)
			assert.Equal(t, tc.wantRet, ret)
		})
	}
}

func TestHandler_List(t *testing.T) {
	var (
		tests = []struct {
			caseDesc   string
			giveInput  *ListInput
			giveData   []interface{}
			giveErr    error
			wantErr    error
			wantGetKey *ListInput
			wantRet    interface{}
		}{
			{
				caseDesc:  "list server_info",
				giveInput: &ListInput{Hostname: ""},
				giveData: []interface{}{
					&entity.ServerInfo{
						BaseInfo:       entity.BaseInfo{ID: "server_1"},
						UpTime:         10,
						LastReportTime: 1608195454,
						BootTime:       1608195454,
						Hostname:       "gentoo",
						Version:        "v3",
					},
					&entity.ServerInfo{
						BaseInfo:       entity.BaseInfo{ID: "server_2"},
						UpTime:         10,
						LastReportTime: 1608195454,
						BootTime:       1608195454,
						Hostname:       "ubuntu",
						Version:        "v2",
					},
				},
				wantRet: &store.ListOutput{
					Rows: []interface{}{
						&entity.ServerInfo{
							BaseInfo:       entity.BaseInfo{ID: "server_1"},
							UpTime:         10,
							LastReportTime: 1608195454,
							BootTime:       1608195454,
							Hostname:       "gentoo",
							Version:        "v3",
						},
						&entity.ServerInfo{
							BaseInfo:       entity.BaseInfo{ID: "server_2"},
							UpTime:         10,
							LastReportTime: 1608195454,
							BootTime:       1608195454,
							Hostname:       "ubuntu",
							Version:        "v2",
						},
					},
					TotalSize: 2,
				},
			},
			{
				caseDesc:  "list server_info with hostname",
				giveInput: &ListInput{Hostname: "ubuntu"},
				giveData: []interface{}{
					&entity.ServerInfo{
						BaseInfo:       entity.BaseInfo{ID: "server_1"},
						UpTime:         10,
						LastReportTime: 1608195454,
						BootTime:       1608195454,
						Hostname:       "gentoo",
						Version:        "v3",
					},
					&entity.ServerInfo{
						BaseInfo:       entity.BaseInfo{ID: "server_2"},
						UpTime:         10,
						LastReportTime: 1608195454,
						BootTime:       1608195454,
						Hostname:       "ubuntu",
						Version:        "v2",
					},
				},
				wantRet: &store.ListOutput{
					Rows: []interface{}{
						&entity.ServerInfo{
							BaseInfo:       entity.BaseInfo{ID: "server_2"},
							UpTime:         10,
							LastReportTime: 1608195454,
							BootTime:       1608195454,
							Hostname:       "ubuntu",
							Version:        "v2",
						},
					},
					TotalSize: 1,
				},
			},
		}
	)

	for _, tc := range tests {
		t.Run(tc.caseDesc, func(t *testing.T) {
			getCalled := true
			mStore := &store.MockInterface{}
			mStore.On("List", mock.Anything).Run(func(args mock.Arguments) {
				getCalled = true
			}).Return(func(input store.ListInput) *store.ListOutput {
				var res []interface{}
				for _, c := range tc.giveData {
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
			}, tc.giveErr)

			h := Handler{serverInfoStore: mStore}
			ctx := droplet.NewContext()
			ctx.SetInput(tc.giveInput)
			ret, err := h.List(ctx)
			assert.True(t, getCalled)
			assert.Equal(t, tc.wantErr, err)
			assert.Equal(t, tc.wantRet, ret)
		})
	}
}
