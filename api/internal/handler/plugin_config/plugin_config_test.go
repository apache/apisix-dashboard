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

package plugin_config

import (
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

func TestPluginConfig_Get(t *testing.T) {
	tests := []struct {
		caseDesc   string
		giveInput  *GetInput
		giveRet    *entity.PluginConfig
		giveErr    error
		wantErr    error
		wantGetKey string
		wantRet    interface{}
	}{
		{
			caseDesc:   "normal",
			giveInput:  &GetInput{ID: "1"},
			wantGetKey: "1",
			giveRet: &entity.PluginConfig{
				BaseInfo: entity.BaseInfo{
					ID: "1",
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
			wantRet: &entity.PluginConfig{
				BaseInfo: entity.BaseInfo{
					ID: "1",
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

			h := Handler{pluginConfigStore: mStore}
			ctx := droplet.NewContext()
			ctx.SetInput(tc.giveInput)
			ret, err := h.Get(ctx)
			assert.True(t, getCalled)
			assert.Equal(t, tc.wantRet, ret)
			assert.Equal(t, tc.wantErr, err)
		})
	}
}

func TestPluginConfig_List(t *testing.T) {
	tests := []struct {
		caseDesc  string
		giveInput *ListInput
		giveData  []*entity.PluginConfig
		giveErr   error
		wantErr   error
		wantInput store.ListInput
		wantRet   interface{}
	}{
		{
			caseDesc: "list all plugin config",
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
			giveData: []*entity.PluginConfig{
				{Desc: "1"},
				{Desc: "s2"},
				{Desc: "test_plugin_config"},
				{Desc: "plugin_config_test"},
			},
			wantRet: &store.ListOutput{
				Rows: []interface{}{
					&entity.PluginConfig{Desc: "1"},
					&entity.PluginConfig{Desc: "s2"},
					&entity.PluginConfig{Desc: "test_plugin_config"},
					&entity.PluginConfig{Desc: "plugin_config_test"},
				},
				TotalSize: 4,
			},
		},
		{
			caseDesc: "list plugin config with 'plugin_config'",
			giveInput: &ListInput{
				Search: "plugin_config",
				Pagination: store.Pagination{
					PageSize:   10,
					PageNumber: 10,
				},
			},
			wantInput: store.ListInput{
				PageSize:   10,
				PageNumber: 10,
			},
			giveData: []*entity.PluginConfig{
				{BaseInfo: entity.BaseInfo{CreateTime: 1609376661}, Desc: "1"},
				{BaseInfo: entity.BaseInfo{CreateTime: 1609376662}, Desc: "s2"},
				{BaseInfo: entity.BaseInfo{CreateTime: 1609376663}, Desc: "test_plugin_config"},
				{BaseInfo: entity.BaseInfo{CreateTime: 1609376664}, Desc: "plugin_config_test"},
			},
			wantRet: &store.ListOutput{
				Rows: []interface{}{
					&entity.PluginConfig{BaseInfo: entity.BaseInfo{CreateTime: 1609376663}, Desc: "test_plugin_config"},
					&entity.PluginConfig{BaseInfo: entity.BaseInfo{CreateTime: 1609376664}, Desc: "plugin_config_test"},
				},
				TotalSize: 2,
			},
		},
		{
			caseDesc: "list plugin config with label",
			giveInput: &ListInput{
				Label: "extra",
				Pagination: store.Pagination{
					PageSize:   10,
					PageNumber: 10,
				},
			},
			wantInput: store.ListInput{
				PageSize:   10,
				PageNumber: 10,
			},
			giveData: []*entity.PluginConfig{
				{
					Desc: "1",
					Labels: map[string]string{
						"version": "v1",
						"extra":   "t",
					},
				},
				{Desc: "s2"},
				{Desc: "test_plugin_config"},
				{Desc: "plugin_config_test"},
			},
			wantRet: &store.ListOutput{
				Rows: []interface{}{
					&entity.PluginConfig{
						Desc: "1",
						Labels: map[string]string{
							"version": "v1",
							"extra":   "t",
						},
					},
				},
				TotalSize: 1,
			},
		},
		{
			caseDesc: "list plugin config with label (k:v)",
			giveInput: &ListInput{
				Label: "version:v1",
				Pagination: store.Pagination{
					PageSize:   10,
					PageNumber: 10,
				},
			},
			wantInput: store.ListInput{
				PageSize:   10,
				PageNumber: 10,
			},
			giveData: []*entity.PluginConfig{
				{
					Desc: "1",
					Labels: map[string]string{
						"version": "v1",
						"build":   "16",
					},
				},
				{Desc: "s2"},
				{Desc: "test_plugin_config"},
				{Desc: "plugin_config_test"},
			},
			wantRet: &store.ListOutput{
				Rows: []interface{}{
					&entity.PluginConfig{
						Desc: "1",
						Labels: map[string]string{
							"version": "v1",
							"build":   "16",
						},
					},
				},
				TotalSize: 1,
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

			h := Handler{pluginConfigStore: mStore}
			ctx := droplet.NewContext()
			ctx.SetInput(tc.giveInput)
			ret, err := h.List(ctx)
			assert.True(t, getCalled)
			assert.Equal(t, tc.wantRet, ret)
			assert.Equal(t, tc.wantErr, err)
		})
	}
}

func TestPluginConfig_Create(t *testing.T) {
	tests := []struct {
		caseDesc  string
		getCalled bool
		giveInput *entity.PluginConfig
		giveRet   interface{}
		giveErr   error
		wantInput *entity.PluginConfig
		wantErr   error
		wantRet   interface{}
	}{
		{
			caseDesc:  "create success",
			getCalled: true,
			giveInput: &entity.PluginConfig{
				Desc: "test plugin config",
			},
			wantInput: &entity.PluginConfig{
				Desc: "test plugin config",
			},
		},
		{
			caseDesc:  "create failed, create return error",
			getCalled: true,
			giveInput: &entity.PluginConfig{
				Desc: "test plugin config",
			},
			giveErr: fmt.Errorf("create failed"),
			wantInput: &entity.PluginConfig{
				Desc: "test plugin config",
			},
			wantErr: fmt.Errorf("create failed"),
			wantRet: handler.SpecCodeResponse(fmt.Errorf("create failed")),
		},
	}

	for _, tc := range tests {
		t.Run(tc.caseDesc, func(t *testing.T) {
			getCalled := false
			pluginConfigStore := &store.MockInterface{}
			pluginConfigStore.On("Create", mock.Anything, mock.Anything).Run(func(args mock.Arguments) {
				getCalled = true
				input := args.Get(1).(*entity.PluginConfig)
				assert.Equal(t, tc.wantInput, input)
			}).Return(tc.giveRet, tc.giveErr)

			h := Handler{pluginConfigStore: pluginConfigStore}
			ctx := droplet.NewContext()
			ctx.SetInput(tc.giveInput)
			ret, err := h.Create(ctx)
			assert.Equal(t, tc.getCalled, getCalled)
			assert.Equal(t, tc.wantRet, ret)
			assert.Equal(t, tc.wantErr, err)
		})
	}
}

func TestPluginConfig_Update(t *testing.T) {
	tests := []struct {
		caseDesc  string
		getCalled bool
		giveInput *UpdateInput
		giveErr   error
		giveRet   interface{}
		wantInput *entity.PluginConfig
		wantErr   error
		wantRet   interface{}
	}{
		{
			caseDesc:  "create success",
			getCalled: true,
			giveInput: &UpdateInput{
				ID: "1",
				PluginConfig: entity.PluginConfig{
					Desc: "test plugin config",
				},
			},
			wantInput: &entity.PluginConfig{
				BaseInfo: entity.BaseInfo{
					ID: "1",
				},
				Desc: "test plugin config",
			},
		},
		{
			caseDesc: "create failed, different id",
			giveInput: &UpdateInput{
				ID: "1",
				PluginConfig: entity.PluginConfig{
					BaseInfo: entity.BaseInfo{
						ID: "s2",
					},
					Desc: "test plugin config",
				},
			},
			wantRet: &data.SpecCodeResponse{StatusCode: http.StatusBadRequest},
			wantErr: fmt.Errorf("ID on path (1) doesn't match ID on body (s2)"),
		},
		{
			caseDesc:  "update failed, update return error",
			getCalled: true,
			giveInput: &UpdateInput{
				ID: "1",
				PluginConfig: entity.PluginConfig{
					Desc: "test plugin config",
				},
			},
			giveErr: fmt.Errorf("update failed"),
			wantInput: &entity.PluginConfig{
				BaseInfo: entity.BaseInfo{ID: "1"},
				Desc:     "test plugin config",
			},
			wantErr: fmt.Errorf("update failed"),
			wantRet: handler.SpecCodeResponse(fmt.Errorf("update failed")),
		},
	}

	for _, tc := range tests {
		t.Run(tc.caseDesc, func(t *testing.T) {
			getCalled := false
			pluginConfigStore := &store.MockInterface{}
			pluginConfigStore.On("Update", mock.Anything, mock.Anything, mock.Anything).Run(func(args mock.Arguments) {
				getCalled = true
				input := args.Get(1).(*entity.PluginConfig)
				createIfNotExist := args.Get(2).(bool)
				assert.Equal(t, tc.wantInput, input)
				assert.True(t, createIfNotExist)
			}).Return(tc.giveRet, tc.giveErr)

			h := Handler{pluginConfigStore: pluginConfigStore}
			ctx := droplet.NewContext()
			ctx.SetInput(tc.giveInput)
			ret, err := h.Update(ctx)
			assert.Equal(t, tc.getCalled, getCalled)
			assert.Equal(t, tc.wantRet, ret)
			assert.Equal(t, tc.wantErr, err)
		})
	}
}

func TestPluginConfig_Patch(t *testing.T) {
	existPluginConfig := &entity.PluginConfig{
		BaseInfo: entity.BaseInfo{
			ID:         "1",
			CreateTime: 1609340491,
			UpdateTime: 1609340491,
		},
		Plugins: map[string]interface{}{
			"limit-count": map[string]interface{}{
				"count":         2,
				"time_window":   60,
				"rejected_code": 503,
				"key":           "remote_addr",
			},
		},
		Labels: map[string]string{
			"version": "v1",
		},
		Desc: "desc",
	}

	tests := []struct {
		caseDesc          string
		giveInput         *PatchInput
		giveErr           error
		giveRet           interface{}
		wantInput         *entity.PluginConfig
		wantErr           error
		wantRet           interface{}
		pluginConfigInput string
		pluginConfigRet   *entity.PluginConfig
		pluginConfigErr   error
		called            bool
	}{
		{
			caseDesc: "patch all success",
			giveInput: &PatchInput{
				ID:      "1",
				SubPath: "",
				Body: []byte(`{
						"desc":"patched",
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
						},
						"labels":{
							"version":"v1",
							"build":"16"
						}
					}`),
			},
			wantInput: &entity.PluginConfig{
				BaseInfo: entity.BaseInfo{
					ID:         "1",
					CreateTime: 1609340491,
					UpdateTime: 1609340491,
				},
				Desc: "patched",
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
				Labels: map[string]string{
					"version": "v1",
					"build":   "16",
				},
			},
			pluginConfigInput: "1",
			pluginConfigRet:   existPluginConfig,
			called:            true,
		},
		{
			caseDesc: "patch part of plugin config success",
			giveInput: &PatchInput{
				ID:      "1",
				SubPath: "",
				Body: []byte(`{
						"desc":"patched"
					}`),
			},
			wantInput: &entity.PluginConfig{
				BaseInfo: entity.BaseInfo{
					ID:         "1",
					CreateTime: 1609340491,
					UpdateTime: 1609340491,
				},
				Desc: "patched",
				Plugins: map[string]interface{}{
					"limit-count": map[string]interface{}{
						"count":         float64(2),
						"time_window":   float64(60),
						"rejected_code": float64(503),
						"key":           "remote_addr",
					},
				},
				Labels: map[string]string{
					"version": "v1",
				},
			},
			pluginConfigInput: "1",
			pluginConfigRet:   existPluginConfig,
			called:            true,
		},
		{
			caseDesc: "patch desc success with sub path",
			giveInput: &PatchInput{
				ID:      "1",
				SubPath: "/desc",
				Body:    []byte(`"desc_patched"`),
			},
			wantInput: &entity.PluginConfig{
				BaseInfo: entity.BaseInfo{
					ID:         "1",
					CreateTime: 1609340491,
					UpdateTime: 1609340491,
				},
				Desc: "desc_patched",
				Plugins: map[string]interface{}{
					"limit-count": map[string]interface{}{
						"count":         float64(2),
						"time_window":   float64(60),
						"rejected_code": float64(503),
						"key":           "remote_addr",
					},
				},
				Labels: map[string]string{
					"version": "v1",
				},
			},
			pluginConfigInput: "1",
			pluginConfigRet:   existPluginConfig,
			called:            true,
		},
		{
			caseDesc: "patch failed, plugin config store get error",
			giveInput: &PatchInput{
				ID:   "1",
				Body: []byte{},
			},
			pluginConfigInput: "1",
			pluginConfigErr:   fmt.Errorf("get error"),
			wantRet:           handler.SpecCodeResponse(fmt.Errorf("get error")),
			wantErr:           fmt.Errorf("get error"),
			called:            false,
		},
	}

	for _, tc := range tests {
		t.Run(tc.caseDesc, func(t *testing.T) {
			getCalled := false
			pluginConfigStore := &store.MockInterface{}
			pluginConfigStore.On("Update", mock.Anything, mock.Anything, mock.Anything).Run(func(args mock.Arguments) {
				getCalled = true
				input := args.Get(1).(*entity.PluginConfig)
				createIfNotExist := args.Get(2).(bool)
				assert.Equal(t, tc.wantInput, input)
				assert.False(t, createIfNotExist)
			}).Return(tc.giveRet, tc.giveErr)

			pluginConfigStore.On("Get", mock.Anything, mock.Anything).Run(func(args mock.Arguments) {
				input := args.Get(0).(string)
				assert.Equal(t, tc.pluginConfigInput, input)
			}).Return(tc.pluginConfigRet, tc.pluginConfigErr)

			h := Handler{pluginConfigStore: pluginConfigStore}
			ctx := droplet.NewContext()
			ctx.SetInput(tc.giveInput)
			ret, err := h.Patch(ctx)
			assert.Equal(t, tc.called, getCalled)
			assert.Equal(t, tc.wantRet, ret)
			assert.Equal(t, tc.wantErr, err)
		})
	}
}

func TestPluginConfigs_Delete(t *testing.T) {
	tests := []struct {
		caseDesc  string
		giveInput *BatchDelete
		giveErr   error
		listRet   *store.ListOutput
		wantInput []string
		wantErr   error
		wantRet   interface{}
	}{
		{
			caseDesc: "delete success",
			giveInput: &BatchDelete{
				IDs: "1",
			},
			listRet: &store.ListOutput{
				Rows:      []interface{}{},
				TotalSize: 0,
			},
			wantInput: []string{"1"},
		},
		{
			caseDesc: "batch delete success",
			giveInput: &BatchDelete{
				IDs: "1,s2",
			},
			listRet: &store.ListOutput{
				Rows:      []interface{}{},
				TotalSize: 0,
			},
			wantInput: []string{"1", "s2"},
		},

		{
			caseDesc: "delete failed - being used by user",
			giveInput: &BatchDelete{
				IDs: "001,002",
			},
			giveErr: fmt.Errorf("delete failed"),
			wantInput: []string{
				"001",
				"002",
			},
			listRet: &store.ListOutput{
				Rows: []interface{}{
					&entity.Route{BaseInfo: entity.BaseInfo{ID: "a"}},
					&entity.Route{BaseInfo: entity.BaseInfo{ID: "b"}},
				},
				TotalSize: 2,
			},
			wantErr: errors.New("please disconnect the route (ID: a) with this plugin config first"),
			wantRet: &data.SpecCodeResponse{
				StatusCode: http.StatusBadRequest,
			},
		},

		{
			caseDesc: "delete failed",
			giveInput: &BatchDelete{
				IDs: "1",
			},
			listRet: &store.ListOutput{
				Rows:      []interface{}{},
				TotalSize: 0,
			},
			giveErr:   fmt.Errorf("delete error"),
			wantInput: []string{"1"},
			wantRet:   handler.SpecCodeResponse(fmt.Errorf("delete error")),
			wantErr:   fmt.Errorf("delete error"),
		},
	}

	for _, tc := range tests {
		t.Run(tc.caseDesc, func(t *testing.T) {
			getCalled := false
			pluginConfigStore := &store.MockInterface{}
			pluginConfigStore.On("BatchDelete", mock.Anything, mock.Anything).Run(func(args mock.Arguments) {
				getCalled = true
				input := args.Get(1).([]string)
				assert.Equal(t, tc.wantInput, input)
			}).Return(tc.giveErr)

			mockRouteStore := &store.MockInterface{}
			mockRouteStore.On("List", mock.Anything).Run(func(args mock.Arguments) {
				getCalled = true
			}).Return(tc.listRet, nil)

			h := Handler{pluginConfigStore: pluginConfigStore, routeStore: mockRouteStore}
			ctx := droplet.NewContext()
			ctx.SetInput(tc.giveInput)
			ret, err := h.BatchDelete(ctx)
			assert.True(t, getCalled)
			assert.Equal(t, tc.wantRet, ret)
			assert.Equal(t, tc.wantErr, err)
		})
	}
}
