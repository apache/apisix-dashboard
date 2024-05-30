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

package ssl

import (
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
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

func getTestKeyCert(t *testing.T) (string, string) {
	testCert, err := ioutil.ReadFile("../../../test/certs/test2.crt")
	assert.Nil(t, err)
	testKey, err := ioutil.ReadFile("../../../test/certs/test2.key")
	assert.Nil(t, err)
	return string(testCert), string(testKey)
}

func TestSSL_Get(t *testing.T) {
	_cert, _key := getTestKeyCert(t)
	tests := []struct {
		caseDesc   string
		giveInput  *GetInput
		giveRet    *entity.SSL
		giveErr    error
		wantErr    error
		wantGetKey string
		wantRet    interface{}
	}{
		{
			caseDesc:   "normal",
			giveInput:  &GetInput{ID: "ssl1"},
			wantGetKey: "ssl1",
			giveRet: &entity.SSL{
				BaseInfo: entity.BaseInfo{
					ID: "ssl1",
				},
				Key:  _key,
				Cert: _cert,
				Labels: map[string]string{
					"build":   "16",
					"env":     "production",
					"version": "v2",
				},
			},
			wantRet: &entity.SSL{
				BaseInfo: entity.BaseInfo{
					ID: "ssl1",
				},
				Key:  "",
				Cert: _cert,
				Labels: map[string]string{
					"build":   "16",
					"env":     "production",
					"version": "v2",
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

			h := Handler{sslStore: mStore}
			ctx := droplet.NewContext()
			ctx.SetInput(tc.giveInput)
			ret, err := h.Get(ctx)
			assert.True(t, getCalled)
			assert.Equal(t, tc.wantRet, ret)
			assert.Equal(t, tc.wantErr, err)
		})
	}
}

func TestSSLs_List(t *testing.T) {
	mockData := []*entity.SSL{
		{
			BaseInfo: entity.BaseInfo{
				ID:         "ssl1",
				CreateTime: 1609340491,
				UpdateTime: 1609340491,
			},
			Status: 0,
			Labels: map[string]string{
				"build":   "16",
				"env":     "production",
				"version": "v2",
			},
		},
		{
			BaseInfo: entity.BaseInfo{
				ID:         "ssl2",
				CreateTime: 1609340492,
				UpdateTime: 1609340492,
			},
			Sni:    "route",
			Status: 1,
			Labels: map[string]string{
				"build":   "17",
				"env":     "production",
				"version": "v2",
			},
		},
		{
			BaseInfo: entity.BaseInfo{
				ID:         "ssl3",
				CreateTime: 1609340493,
				UpdateTime: 1609340493,
			},
			Status: 0,
			Labels: map[string]string{
				"build":   "18",
				"env":     "production",
				"version": "v2",
			},
		},
	}

	tests := []struct {
		caseDesc  string
		giveInput *ListInput
		giveData  []*entity.SSL
		giveErr   error
		wantErr   error
		wantInput store.ListInput
		wantRet   interface{}
	}{
		{
			caseDesc: "list all ssl",
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
			caseDesc: "list ssl with 'SNI'",
			giveInput: &ListInput{
				SNI: "route",
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
					mockData[1],
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

			h := Handler{sslStore: mStore}
			ctx := droplet.NewContext()
			ctx.SetInput(tc.giveInput)
			ret, err := h.List(ctx)
			assert.True(t, getCalled)
			assert.Equal(t, tc.wantRet, ret)
			assert.Equal(t, tc.wantErr, err)
		})
	}
}

func TestSSL_Create(t *testing.T) {
	_cert, _key := getTestKeyCert(t)
	tests := []struct {
		caseDesc  string
		getCalled bool
		giveInput *entity.SSL
		giveRet   interface{}
		giveErr   error
		wantInput *entity.SSL
		wantErr   error
		wantRet   interface{}
	}{
		{
			caseDesc:  "create success",
			getCalled: true,
			giveInput: &entity.SSL{
				BaseInfo: entity.BaseInfo{
					ID: "ssl1",
				},
				Key:  _key,
				Cert: _cert,
				Labels: map[string]string{
					"build":   "16",
					"env":     "production",
					"version": "v2",
				},
			},
			giveRet: &entity.SSL{
				BaseInfo: entity.BaseInfo{
					ID: "ssl1",
				},
				Key:  _key,
				Cert: _cert,
				Labels: map[string]string{
					"build":   "16",
					"env":     "production",
					"version": "v2",
				},
				Snis:   []string{"test2.com", "*.test2.com"},
				Status: 1,
			},
			wantInput: &entity.SSL{
				BaseInfo: entity.BaseInfo{
					ID: "ssl1",
				},
				Key:  _key,
				Cert: _cert,
				Labels: map[string]string{
					"build":   "16",
					"env":     "production",
					"version": "v2",
				},
				Snis:   []string{"test2.com", "*.test2.com"},
				Status: 1,
			},
			wantRet: &entity.SSL{
				BaseInfo: entity.BaseInfo{
					ID: "ssl1",
				},
				Key:  "",
				Cert: _cert,
				Labels: map[string]string{
					"build":   "16",
					"env":     "production",
					"version": "v2",
				},
				Snis:   []string{"test2.com", "*.test2.com"},
				Status: 1,
			},
			wantErr: nil,
		},
		{
			caseDesc:  "create failed, create return error",
			getCalled: true,
			giveInput: &entity.SSL{
				Key:  _key,
				Cert: _cert,
				Labels: map[string]string{
					"build":   "16",
					"env":     "production",
					"version": "v2",
				},
			},
			giveErr: fmt.Errorf("create failed"),
			wantInput: &entity.SSL{
				Key:  _key,
				Cert: _cert,
				Labels: map[string]string{
					"build":   "16",
					"env":     "production",
					"version": "v2",
				},
				Snis:   []string{"test2.com", "*.test2.com"},
				Status: 1,
			},
			wantErr: fmt.Errorf("create failed"),
			wantRet: handler.SpecCodeResponse(fmt.Errorf("create failed")),
		},
	}

	for _, tc := range tests {
		t.Run(tc.caseDesc, func(t *testing.T) {
			getCalled := false

			sslStore := &store.MockInterface{}
			sslStore.On("Create", mock.Anything, mock.Anything).Run(func(args mock.Arguments) {
				getCalled = true
				input := args.Get(1).(*entity.SSL)
				assert.Equal(t, tc.wantInput, input)
			}).Return(tc.giveRet, tc.giveErr)

			h := Handler{sslStore: sslStore}

			ctx := droplet.NewContext()
			ctx.SetInput(tc.giveInput)
			ret, err := h.Create(ctx)
			assert.True(t, getCalled)
			assert.Equal(t, tc.wantRet, ret)
			assert.Equal(t, tc.wantErr, err)
		})
	}
}

func TestSSL_Update(t *testing.T) {
	_cert, _key := getTestKeyCert(t)
	tests := []struct {
		caseDesc  string
		getCalled bool
		giveInput *UpdateInput
		giveErr   error
		giveRet   interface{}
		wantInput *entity.SSL
		wantErr   error
		wantRet   interface{}
	}{
		{
			caseDesc:  "create success",
			getCalled: true,
			giveInput: &UpdateInput{
				ID: "ssl1",
				SSL: entity.SSL{
					Key:  _key,
					Cert: _cert,
					Labels: map[string]string{
						"build":   "16",
						"env":     "production",
						"version": "v2",
					},
				},
			},
			giveRet: &entity.SSL{
				BaseInfo: entity.BaseInfo{
					ID: "ssl1",
				},
				Key:  _key,
				Cert: _cert,
				Labels: map[string]string{
					"build":   "16",
					"env":     "production",
					"version": "v2",
				},
				Snis:   []string{"test2.com", "*.test2.com"},
				Status: 1,
			},
			wantInput: &entity.SSL{
				BaseInfo: entity.BaseInfo{
					ID: "ssl1",
				},
				Key:  _key,
				Cert: _cert,
				Labels: map[string]string{
					"build":   "16",
					"env":     "production",
					"version": "v2",
				},
				Snis:   []string{"test2.com", "*.test2.com"},
				Status: 1,
			},
			wantRet: &entity.SSL{
				BaseInfo: entity.BaseInfo{
					ID: "ssl1",
				},
				Key:  "",
				Cert: _cert,
				Labels: map[string]string{
					"build":   "16",
					"env":     "production",
					"version": "v2",
				},
				Snis:   []string{"test2.com", "*.test2.com"},
				Status: 1,
			},
		},
		{
			caseDesc: "create failed, different id",
			giveInput: &UpdateInput{
				ID: "ssl1",
				SSL: entity.SSL{
					BaseInfo: entity.BaseInfo{
						ID: "ssl2",
					},
					Key:  _key,
					Cert: _cert,
					Labels: map[string]string{
						"build":   "16",
						"env":     "production",
						"version": "v2",
					},
				},
			},
			wantRet: &data.SpecCodeResponse{StatusCode: http.StatusBadRequest},
			wantErr: fmt.Errorf("ID on path (ssl1) doesn't match ID on body (ssl2)"),
		},
	}

	for _, tc := range tests {
		t.Run(tc.caseDesc, func(t *testing.T) {
			getCalled := false
			sslStore := &store.MockInterface{}
			sslStore.On("Update", mock.Anything, mock.Anything, mock.Anything).Run(func(args mock.Arguments) {
				getCalled = true
				input := args.Get(1).(*entity.SSL)
				createIfNotExist := args.Get(2).(bool)
				assert.Equal(t, tc.wantInput, input)
				assert.True(t, createIfNotExist)
			}).Return(tc.giveRet, tc.giveErr)

			h := Handler{sslStore: sslStore}
			ctx := droplet.NewContext()
			ctx.SetInput(tc.giveInput)
			ret, err := h.Update(ctx)
			assert.Equal(t, tc.getCalled, getCalled)
			assert.Equal(t, tc.wantRet, ret)
			assert.Equal(t, tc.wantErr, err)
		})
	}
}

func TestSSL_Patch(t *testing.T) {
	_cert, _key := getTestKeyCert(t)
	existSSL := &entity.SSL{
		BaseInfo: entity.BaseInfo{
			ID:         "ssl1",
			CreateTime: 1609340491,
			UpdateTime: 1609340491,
		},
		Status: 0,
		Key:    _key,
		Cert:   _cert,
		Labels: map[string]string{
			"build":   "16",
			"env":     "production",
			"version": "v2",
		},
	}

	patchSSL := &entity.SSL{
		BaseInfo: entity.BaseInfo{
			ID:         "ssl1",
			CreateTime: 1609340491,
			UpdateTime: 1609340491,
		},
		Status: 1,
		Key:    _key,
		Cert:   _cert,
		Labels: map[string]string{
			"build":   "16",
			"env":     "production",
			"version": "v2",
		},
	}
	patchSSLBytes, err := json.Marshal(patchSSL)
	assert.Nil(t, err)

	tests := []struct {
		caseDesc  string
		getCalled bool
		giveInput *PatchInput
		giveErr   error
		giveRet   interface{}
		wantInput *entity.SSL
		wantErr   error
		wantRet   interface{}
	}{
		{
			caseDesc: "patch success",
			giveRet: &entity.SSL{
				BaseInfo: entity.BaseInfo{
					ID: "ssl1",
				},
				Key:  _key,
				Cert: _cert,
				Labels: map[string]string{
					"build":   "16",
					"env":     "production",
					"version": "v2",
				},
				Snis:   []string{"test2.com", "*.test2.com"},
				Status: 1,
			},
			giveInput: &PatchInput{
				ID:      "ssl1",
				SubPath: "",
				Body:    patchSSLBytes,
			},
			wantInput: &entity.SSL{
				BaseInfo: entity.BaseInfo{
					ID:         "ssl1",
					CreateTime: 1609340491,
					UpdateTime: 1609340491,
				},
				Status: 1,
				Key:    _key,
				Cert:   _cert,
				Labels: map[string]string{
					"build":   "16",
					"env":     "production",
					"version": "v2",
				},
			},
			wantRet: &entity.SSL{
				BaseInfo: entity.BaseInfo{
					ID: "ssl1",
				},
				Key:  "",
				Cert: _cert,
				Labels: map[string]string{
					"build":   "16",
					"env":     "production",
					"version": "v2",
				},
				Snis:   []string{"test2.com", "*.test2.com"},
				Status: 1,
			},
			getCalled: true,
		},
		{
			caseDesc: "patch success by path",
			giveInput: &PatchInput{
				ID:      "ssl1",
				SubPath: "/status",
				Body:    []byte("1"),
			},
			giveRet: &entity.SSL{
				BaseInfo: entity.BaseInfo{
					ID: "ssl1",
				},
				Key:  _key,
				Cert: _cert,
				Labels: map[string]string{
					"build":   "16",
					"env":     "production",
					"version": "v2",
				},
				Snis:   []string{"test2.com", "*.test2.com"},
				Status: 1,
			},
			wantInput: &entity.SSL{
				BaseInfo: entity.BaseInfo{
					ID:         "ssl1",
					CreateTime: 1609340491,
					UpdateTime: 1609340491,
				},
				Status: 1,
				Key:    _key,
				Cert:   _cert,
				Labels: map[string]string{
					"build":   "16",
					"env":     "production",
					"version": "v2",
				},
			},
			wantRet: &entity.SSL{
				BaseInfo: entity.BaseInfo{
					ID: "ssl1",
				},
				Key:  "",
				Cert: _cert,
				Labels: map[string]string{
					"build":   "16",
					"env":     "production",
					"version": "v2",
				},
				Snis:   []string{"test2.com", "*.test2.com"},
				Status: 1,
			},
			getCalled: true,
		},
		{
			caseDesc: "patch failed, path error",
			giveInput: &PatchInput{
				ID:      "ssl",
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

			sslStore := &store.MockInterface{}
			sslStore.On("Get", mock.Anything, mock.Anything).Return(existSSL, nil)
			sslStore.On("Update", mock.Anything, mock.Anything, mock.Anything).Run(func(args mock.Arguments) {
				getCalled = true
				input := args.Get(1).(*entity.SSL)
				createIfNotExist := args.Get(2).(bool)
				assert.Equal(t, tc.wantInput, input)
				assert.False(t, createIfNotExist)
			}).Return(tc.giveRet, tc.giveErr)
			h := Handler{sslStore: sslStore}
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

func TestSSLs_Delete(t *testing.T) {
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
				Ids: "ssl1",
			},
			wantInput: []string{"ssl1"},
		},
		{
			caseDesc: "batch delete success",
			giveInput: &BatchDelete{
				Ids: "ssl1,ssl2",
			},
			wantInput: []string{"ssl1", "ssl2"},
		},
		{
			caseDesc: "delete failed",
			giveInput: &BatchDelete{
				Ids: "ssl1",
			},
			giveErr:   fmt.Errorf("delete error"),
			wantInput: []string{"ssl1"},
			wantRet:   handler.SpecCodeResponse(fmt.Errorf("delete error")),
			wantErr:   fmt.Errorf("delete error"),
		},
	}

	for _, tc := range tests {
		t.Run(tc.caseDesc, func(t *testing.T) {
			getCalled := false
			sslStore := &store.MockInterface{}
			sslStore.On("BatchDelete", mock.Anything, mock.Anything).Run(func(args mock.Arguments) {
				getCalled = true
				input := args.Get(1).([]string)
				assert.Equal(t, tc.wantInput, input)
			}).Return(tc.giveErr)

			h := Handler{sslStore: sslStore}
			ctx := droplet.NewContext()
			ctx.SetInput(tc.giveInput)
			ret, err := h.BatchDelete(ctx)
			assert.True(t, getCalled)
			assert.Equal(t, tc.wantRet, ret)
			assert.Equal(t, tc.wantErr, err)
		})
	}
}

func TestSSL_Exist(t *testing.T) {
	mockData := []*entity.SSL{
		{
			BaseInfo: entity.BaseInfo{
				ID:         "ssl1",
				CreateTime: 1609340491,
				UpdateTime: 1609340491,
			},
			Sni:    "route",
			Status: 0,
			Labels: map[string]string{
				"build":   "16",
				"env":     "production",
				"version": "v2",
			},
		},
		{
			BaseInfo: entity.BaseInfo{
				ID:         "ssl2",
				CreateTime: 1609340492,
				UpdateTime: 1609340492,
			},
			Sni:    "www.route.com",
			Status: 1,
			Labels: map[string]string{
				"build":   "17",
				"env":     "production",
				"version": "v2",
			},
		},
		{
			BaseInfo: entity.BaseInfo{
				ID:         "ssl3",
				CreateTime: 1609340493,
				UpdateTime: 1609340493,
			},
			Snis:   []string{"test.com", "ssl_test.com"},
			Status: 0,
			Labels: map[string]string{
				"build":   "18",
				"env":     "production",
				"version": "v2",
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
			caseDesc: "check SSL cert not exists for sni",
			giveInput: &ExistCheckInput{
				Hosts: []string{"www.route2.com"},
			},
			wantRet:   &data.SpecCodeResponse{StatusCode: http.StatusNotFound},
			wantErr:   consts.InvalidParam("SSL cert not exists for sni：www.route2.com"),
			getCalled: true,
		},
		{
			caseDesc: "check SSL cert exists for sni",
			giveInput: &ExistCheckInput{
				Hosts: []string{"www.route.com"},
			},
			wantRet:   nil,
			getCalled: true,
		},
		{
			caseDesc: "check SSL cert not exists for snis",
			giveInput: &ExistCheckInput{
				Hosts: []string{"test1.com", "ssl_test2.com"},
			},
			wantRet:   &data.SpecCodeResponse{StatusCode: http.StatusNotFound},
			wantErr:   consts.InvalidParam("SSL cert not exists for sni：test1.com"),
			getCalled: true,
		},
		{
			caseDesc: "check SSL cert exists for snis",
			giveInput: &ExistCheckInput{
				Hosts: []string{"ssl_test.com"},
			},
			wantRet:   nil,
			getCalled: true,
		},
	}

	for _, tc := range tests {
		t.Run(tc.caseDesc, func(t *testing.T) {
			getCalled := false
			sslStore := &store.MockInterface{}
			sslStore.On("List", mock.Anything, mock.Anything).Run(func(args mock.Arguments) {
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

			h := Handler{sslStore: sslStore}
			ctx := droplet.NewContext()
			ctx.SetInput(tc.giveInput)
			ret, err := h.Exist(ctx)
			assert.True(t, getCalled)
			assert.Equal(t, tc.wantRet, ret)
			assert.Equal(t, tc.wantErr, err)
		})
	}
}
