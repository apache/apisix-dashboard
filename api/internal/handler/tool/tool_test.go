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
package tool

import (
	"net/http"
	"testing"

	"github.com/shiningrush/droplet"
	"github.com/shiningrush/droplet/data"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"

	"github.com/apisix/manager-api/internal/core/entity"
	"github.com/apisix/manager-api/internal/core/store"
	"github.com/apisix/manager-api/internal/utils"
)

func TestTool_Version(t *testing.T) {
	h := Handler{}
	ctx := droplet.NewContext()

	hash, version := utils.GetHashAndVersion()

	ret, err := h.Version(ctx)
	assert.Nil(t, err)
	assert.Equal(t, &InfoOutput{
		Hash:    hash,
		Version: version,
	}, ret)
}

func TestTool_VersionMatch(t *testing.T) {
	var (
		tests = []struct {
			caseDesc string
			giveData []interface{}
			giveErr  error
			wantErr  error
			wantRet  interface{}
		}{
			{
				caseDesc: "version matched",
				giveData: []interface{}{
					&entity.ServerInfo{
						BaseInfo:       entity.BaseInfo{ID: "server_1"},
						UpTime:         10,
						LastReportTime: 1608195454,
						BootTime:       1608195454,
						Hostname:       "gentoo",
						Version:        "",
					},
					&entity.ServerInfo{
						BaseInfo:       entity.BaseInfo{ID: "server_2"},
						UpTime:         10,
						LastReportTime: 1608195454,
						BootTime:       1608195454,
						Hostname:       "ubuntu",
						Version:        "",
					},
				},
				wantRet: &VersionMatchOutput{
					Matched:          true,
					DashboardVersion: "",
					MismatchedNodes:  make([]nodes, 0),
				},
			},
			{
				caseDesc: "version not matched",
				giveData: []interface{}{
					&entity.ServerInfo{
						BaseInfo:       entity.BaseInfo{ID: "server_1"},
						UpTime:         10,
						LastReportTime: 1608195454,
						BootTime:       1608195454,
						Hostname:       "gentoo",
						Version:        "2.2",
					},
					&entity.ServerInfo{
						BaseInfo:       entity.BaseInfo{ID: "server_2"},
						UpTime:         10,
						LastReportTime: 1608195454,
						BootTime:       1608195454,
						Hostname:       "ubuntu",
						Version:        "2.2",
					},
				},
				wantRet: &data.SpecCodeResponse{StatusCode: http.StatusOK, Response: data.Response{
					Data: &VersionMatchOutput{
						Matched:          false,
						DashboardVersion: "",
						MismatchedNodes: []nodes{
							{
								Hostname: "gentoo",
								Version:  "2.2",
							},
							{
								Hostname: "ubuntu",
								Version:  "2.2",
							},
						},
					},
					Code:    2000001,
					Message: "The Manager API and Apache APISIX are mismatched. The version of Manager API is , and should be used with Apache APISIX .",
				}},
			},
		}
	)

	for _, tc := range tests {
		t.Run(tc.caseDesc, func(t *testing.T) {
			getCalled := false
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
			ret, err := h.VersionMatch(ctx)
			assert.True(t, getCalled)
			assert.Equal(t, tc.wantErr, err)
			assert.Equal(t, tc.wantRet, ret)
		})
	}
}
