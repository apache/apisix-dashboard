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
package stream_route

import (
	"encoding/json"
	"testing"

	"github.com/shiningrush/droplet"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"

	"github.com/apisix/manager-api/internal/core/entity"
	"github.com/apisix/manager-api/internal/core/store"
)

func TestStructUnmarshal(t *testing.T) {
	// define and parse data
	jsonStr := `{
    "id": 1,
    "create_time": 1700000000,
    "update_time": 1700000000,
    "desc": "desc",
    "remote_addr": "1.1.1.1",
	"server_addr": "2.2.2.2",
	"server_port": 9080,
	"sni": "example.com",
	"upstream": {
		"nodes": [
			{
        		"host": "10.10.10.10",
        		"port": 8080,
        		"weight": 1
      		}
    	],
    	"type": "roundrobin",
    	"scheme": "http",
    	"pass_host": "pass"
	},
	"upstream_id": 1
}`
	streamRoute := entity.StreamRoute{}
	err := json.Unmarshal([]byte(jsonStr), &streamRoute)

	// asserts
	assert.Nil(t, err)
	assert.Equal(t, streamRoute.ID, float64(1))
	assert.Equal(t, streamRoute.CreateTime, int64(1700000000))
	assert.Equal(t, streamRoute.UpdateTime, int64(1700000000))
	assert.Equal(t, streamRoute.Desc, "desc")
	assert.Equal(t, streamRoute.RemoteAddr, "1.1.1.1")
	assert.Equal(t, streamRoute.ServerAddr, "2.2.2.2")
	assert.Equal(t, streamRoute.ServerPort, 9080)
	assert.Equal(t, streamRoute.SNI, "example.com")
	assert.Equal(t, streamRoute.UpstreamID, float64(1))
	assert.NotNil(t, streamRoute.Upstream)
}

func TestStreamRouteConditionList(t *testing.T) {
	giveData := []*entity.StreamRoute{
		{BaseInfo: entity.BaseInfo{CreateTime: 1609376663}, RemoteAddr: "127.0.0.1", ServerAddr: "127.0.0.1", ServerPort: 9090, Upstream: nil, UpstreamID: "u1"},
		{BaseInfo: entity.BaseInfo{CreateTime: 1609376664}, RemoteAddr: "127.0.0.2", ServerAddr: "127.0.0.1", ServerPort: 9091, Upstream: nil, UpstreamID: "u1"},
		{BaseInfo: entity.BaseInfo{CreateTime: 1609376665}, RemoteAddr: "127.0.0.3", ServerAddr: "127.0.0.1", ServerPort: 9092, Upstream: nil, UpstreamID: "u1"},
		{BaseInfo: entity.BaseInfo{CreateTime: 1609376666}, RemoteAddr: "127.0.0.4", ServerAddr: "127.0.0.1", ServerPort: 9093, Upstream: nil, UpstreamID: "u1"},
	}
	tests := []struct {
		desc      string
		giveInput *ListInput
		giveErr   error
		wantErr   error
		wantRet   interface{}
	}{
		{
			desc: "list all stream route",
			giveInput: &ListInput{
				Pagination: store.Pagination{
					PageSize:   10,
					PageNumber: 10,
				},
			},
			wantRet: &store.ListOutput{
				Rows: []interface{}{
					giveData[0], giveData[1], giveData[2], giveData[3],
				},
				TotalSize: 4,
			},
		},
		{
			desc: "list stream route with remote_addr",
			giveInput: &ListInput{
				RemoteAddr: "127.0.0.1",
				Pagination: store.Pagination{
					PageSize:   10,
					PageNumber: 10,
				},
			},
			wantRet: &store.ListOutput{
				Rows: []interface{}{
					&entity.StreamRoute{BaseInfo: entity.BaseInfo{CreateTime: 1609376663}, RemoteAddr: "127.0.0.1", ServerAddr: "127.0.0.1", ServerPort: 9090, Upstream: nil, UpstreamID: "u1"},
				},
				TotalSize: 1,
			},
		},
		{
			desc: "list stream route with server_addr",
			giveInput: &ListInput{
				ServerAddr: "127.0.0.1",
				Pagination: store.Pagination{
					PageSize:   10,
					PageNumber: 10,
				},
			},
			wantRet: &store.ListOutput{
				Rows: []interface{}{
					&entity.StreamRoute{BaseInfo: entity.BaseInfo{CreateTime: 1609376663}, RemoteAddr: "127.0.0.1", ServerAddr: "127.0.0.1", ServerPort: 9090, Upstream: nil, UpstreamID: "u1"},
					&entity.StreamRoute{BaseInfo: entity.BaseInfo{CreateTime: 1609376664}, RemoteAddr: "127.0.0.2", ServerAddr: "127.0.0.1", ServerPort: 9091, Upstream: nil, UpstreamID: "u1"},
					&entity.StreamRoute{BaseInfo: entity.BaseInfo{CreateTime: 1609376665}, RemoteAddr: "127.0.0.3", ServerAddr: "127.0.0.1", ServerPort: 9092, Upstream: nil, UpstreamID: "u1"},
					&entity.StreamRoute{BaseInfo: entity.BaseInfo{CreateTime: 1609376666}, RemoteAddr: "127.0.0.4", ServerAddr: "127.0.0.1", ServerPort: 9093, Upstream: nil, UpstreamID: "u1"},
				},
				TotalSize: 4,
			},
		},
		{
			desc: "list stream route with server_port",
			giveInput: &ListInput{
				ServerPort: 9092,
				Pagination: store.Pagination{
					PageSize:   10,
					PageNumber: 10,
				},
			},
			wantRet: &store.ListOutput{
				Rows: []interface{}{
					&entity.StreamRoute{BaseInfo: entity.BaseInfo{CreateTime: 1609376665}, RemoteAddr: "127.0.0.3", ServerAddr: "127.0.0.1", ServerPort: 9092, Upstream: nil, UpstreamID: "u1"},
				},
				TotalSize: 1,
			},
		},
	}

	for _, tc := range tests {
		t.Run(tc.desc, func(t *testing.T) {
			getCalled := true
			mStore := &store.MockInterface{}
			mStore.On("List", mock.Anything, mock.Anything).Run(func(args mock.Arguments) {
				getCalled = true
			}).Return(func(input store.ListInput) *store.ListOutput {
				var returnData []interface{}
				for _, c := range giveData {
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

			h := Handler{streamRouteStore: mStore}
			ctx := droplet.NewContext()
			ctx.SetInput(tc.giveInput)
			ret, err := h.List(ctx)
			assert.True(t, getCalled)
			assert.Equal(t, tc.wantRet, ret)
			assert.Equal(t, tc.wantErr, err)
		})
	}
}
