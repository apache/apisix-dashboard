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

var (
	_key  string = "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDGO0J9xrOcmvgh\npkqHIYHCw35FTfIT5uXOSzdF49M2ZAKBQwFG0ovYT8bc0glNLB+hpDhJPL531qSP\nl1ZOe0W1ofP1u0T5Zzc9Rub/kn7RMPq0BsSC6J3rF+rQEwh1PM8qUuD8DxZ7jaOL\niMNL6SyuZIPsS1kPPBtsioukdo666tbjNMixhQbI9Wpg55abdXRFh3i7Zu/9siF1\njCGcsskjOaUOY4sYQ3i5WU/HIIRhA82XuIL+Sxd32P8bKi2UT1sqFXRjAVR7KRWo\nIVvkmSLoZb9ucV6MsccDrRYBf6rLbI1tFj9l2rY6GTFlT+6z7K/ZI60DGi/hsBfl\nDeEQ5WuxAgMBAAECggEAVHQQyucpxHGdfzCKlfGnh+Oj20Du/p2jkHUpEkSSypxn\nGM0EMTkoTTsHvTJath8zRrlhJYqUlxfCOk6+fWc1dsGN30Yuh5b6yMd5SK8QCm20\nkZhEhoU2Kl+hMY66TsBefmia46hF6tOYNq1IjwHDgHTgY35ibgQsptyLy8Ca5HTC\nrnoocP2AcKtM+qwOMGiNHpeh+/zfB91C9AszvS8H2ao5nq4u0/JavPO4A4WmVYol\n7Qv9ACY/8uaKC79syahutbkMjwGsQgYsq9G0QpcLSCuOb4vBbOb130mptSM9NzKg\nTjSxF2D8ob//roZMc1ueTpqAY6WedKV3y3BIBDKuAQKBgQDgGyEsxwR9QtA5EH/h\nJ4GiTQn0aep8G2LSlAtHGndL3sxaGGLt2pk3lNIeRAbOS3APmYskBN418JIF/Ren\nE0CYSrTaxpTs9UXXkgKNJ63Z6r+btswTAVVXG5Zoi/5JRSHRquEVmKccM4zg3v6R\ny/nVhwXigUaRuLx+wCtoaGsaUQKBgQDicXFZ0TvN8tohqc8dbmOu2A25+ifFKHUA\nn3yxZIJtbTC9bJeuwtkqIFol1DXHLqYvdD5jQT3c4z6HekcmI9sEy1YzO4a3WUTI\nP//ogjDLXj402k+WCx1Us2HASxwU5cRvOpMhfnppYPSDXqBoH196UCDmOQuS1+Q8\njyPsNQmDYQKBgQDcm5hCvf87V4QmSIm6GOvR20iLY6BCX6seZEHd0r3Q4BgGMK9i\nOahOQJ++z3Rrq3M6yAligbBFJPZ6ErUv8RHLWO9D1exQfvorxT3huke3lxDbtkya\nANwDjdK4Q+ckNXufLDm6yrTmXBC4ZIvw9fyQKASw/lV7qYFUvNN+Shv0oQKBgQC+\nraw3Z7smV0NbaXRgYh5KkuAsJPvsR38OwT3s2qgBoRqTx6eKn8Tidk+y3xlR2nRS\nLV6DkeKX6Ds1NcBH25WIWfkCNzPfnKoQveOuVELmXTugody2ijFuq4a6uASzjC93\nQim24JwPtHbxUHNeelyZ0HODqbGXO3iTji0/sAGMwQKBgQC8yDwapXgrCWK34qpN\nSdO9uA4VstI3Ovb+o3Evfp1CvJnfk56ypO2DaqbuvMJsInuWRFU40UWp7Vxyl/hP\nXvGgEI3dbBy9KWFjAKfI2Wv3i+zvJ1mAHM3u1jcX3zxOxSAN4LJVBudgkGpop1ps\nW5tWveXiXwxCUE/r9ax4mfJvXQ==\n-----END PRIVATE KEY-----"
	_cert string = "-----BEGIN CERTIFICATE-----\nMIIEVzCCAr+gAwIBAgIQITiNM7xmudhg3pK85KDwLDANBgkqhkiG9w0BAQsFADB/\nMR4wHAYDVQQKExVta2NlcnQgZGV2ZWxvcG1lbnQgQ0ExKjAoBgNVBAsMIWp1bnh1\nY2hlbkBqdW54dWRlQWlyIChqdW54dSBjaGVuKTExMC8GA1UEAwwobWtjZXJ0IGp1\nbnh1Y2hlbkBqdW54dWRlQWlyIChqdW54dSBjaGVuKTAeFw0xOTA2MDEwMDAwMDBa\nFw0zMDA3MDgwNzQ4MDJaMFUxJzAlBgNVBAoTHm1rY2VydCBkZXZlbG9wbWVudCBj\nZXJ0aWZpY2F0ZTEqMCgGA1UECwwhanVueHVjaGVuQGp1bnh1ZGVBaXIgKGp1bnh1\nIGNoZW4pMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAxjtCfcaznJr4\nIaZKhyGBwsN+RU3yE+blzks3RePTNmQCgUMBRtKL2E/G3NIJTSwfoaQ4STy+d9ak\nj5dWTntFtaHz9btE+Wc3PUbm/5J+0TD6tAbEguid6xfq0BMIdTzPKlLg/A8We42j\ni4jDS+ksrmSD7EtZDzwbbIqLpHaOuurW4zTIsYUGyPVqYOeWm3V0RYd4u2bv/bIh\ndYwhnLLJIzmlDmOLGEN4uVlPxyCEYQPNl7iC/ksXd9j/GyotlE9bKhV0YwFUeykV\nqCFb5Jki6GW/bnFejLHHA60WAX+qy2yNbRY/Zdq2OhkxZU/us+yv2SOtAxov4bAX\n5Q3hEOVrsQIDAQABo3kwdzAOBgNVHQ8BAf8EBAMCBaAwEwYDVR0lBAwwCgYIKwYB\nBQUHAwEwDAYDVR0TAQH/BAIwADAfBgNVHSMEGDAWgBRU+EbJj+Hp62gCrNvb3yQk\nYnPHXDAhBgNVHREEGjAYgglyb3V0ZS5jb22CCyoucm91dGUuY29tMA0GCSqGSIb3\nDQEBCwUAA4IBgQAvKN2GEorAlx5sfUU2uiL49iFmQSMDLZQminQl1RIHTI/h+jz8\nNluZSdxDFmNq8am6B2ofD3VLl6StC/G+G6YuekPz+QrUNK4UB+8ftRmY4YRFGTQ6\nRnFli1wOq2ES9vPjKlIj77cznr8uwVHPHq8JxGbn/rx3oVDVPndXFCkJJ1DDjRT+\n22atHNzHt5bc9ut8Fq5NW61P+nnMMFShKJaPBkmm9Pf2pEOd8Y7OU8Iy1Kj65fsE\nUshGF5+RWoxdv6/9f6/uOQhmq3MEKqneUC3pjVZ8TiBlRvADxxR5krvujQswms0D\nFGpRMtGpPGMWTuptSIMwNcar/luVig7wGIBeV5ZaOlSOx3911le9mlS7+2lLqf5H\n5dsMkP30Sjv/jfrIL+SE1qeK3kjL0iIwA/PPARvhctExs9y2llT9+drbJofZUi+I\nZdYfAfyJT4htbcl7jHN8oY7vzwgTyxCcBxkbqKfBqabneutj0jfX39zP0G696tiZ\ndQFXCS4wkvw0CG0=\n-----END CERTIFICATE-----"
)

func TestSSL_Get(t *testing.T) {
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
				Snis:          []string{"route.com", "*.route.com"},
				ValidityStart: 1559347200,
				ValidityEnd:   1909727282,
				Status:        1,
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
				Snis:          []string{"route.com", "*.route.com"},
				ValidityStart: 1559347200,
				ValidityEnd:   1909727282,
				Status:        1,
			},
			wantRet: &entity.SSL{
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
				Snis:          []string{"route.com", "*.route.com"},
				ValidityStart: 1559347200,
				ValidityEnd:   1909727282,
				Status:        1,
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
				Snis:          []string{"route.com", "*.route.com"},
				ValidityStart: 1559347200,
				ValidityEnd:   1909727282,
				Status:        1,
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
				Snis:          []string{"route.com", "*.route.com"},
				ValidityStart: 1559347200,
				ValidityEnd:   1909727282,
				Status:        1,
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
			giveInput: &PatchInput{
				ID:      "ssl1",
				SubPath: "",
				Body:    []byte("{\"status\":1}"),
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
			getCalled: true,
		},
		{
			caseDesc: "patch success by path",
			giveInput: &PatchInput{
				ID:      "ssl1",
				SubPath: "/status",
				Body:    []byte("1"),
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
				Body: []byte(`["www.route2.com"]`),
			},
			wantRet:   &data.SpecCodeResponse{StatusCode: http.StatusNotFound},
			wantErr:   consts.InvalidParam("SSL cert not exists for sni：www.route2.com"),
			getCalled: true,
		},
		{
			caseDesc: "check SSL cert exists for sni",
			giveInput: &ExistCheckInput{
				Body: []byte(`["www.route.com"]`),
			},
			wantRet:   nil,
			getCalled: true,
		},
		{
			caseDesc: "check SSL cert not exists for snis",
			giveInput: &ExistCheckInput{
				Body: []byte(`["test1.com","ssl_test2.com"]`),
			},
			wantRet:   &data.SpecCodeResponse{StatusCode: http.StatusNotFound},
			wantErr:   consts.InvalidParam("SSL cert not exists for sni：test1.com"),
			getCalled: true,
		},
		{
			caseDesc: "check SSL cert exists for snis",
			giveInput: &ExistCheckInput{
				Body: []byte(`["ssl_test.com"]`),
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
