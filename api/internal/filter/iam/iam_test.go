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

package iam

import (
	"errors"
	"github.com/apache/apisix-dashboard/api/internal/config"
	"github.com/apache/apisix-dashboard/api/pkg/iam"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"net/http"
	"net/http/httptest"
	"testing"
)

var cfg = config.NewDefaultConfig()

func performRequest(r http.Handler, method, path string) *httptest.ResponseRecorder {
	req := httptest.NewRequest(method, path, nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	return w
}

func TestFilter(t *testing.T) {
	r := gin.Default()
	r.Use(func(c *gin.Context) {
		c.Set("identity", "user")
	})
	r.Use(Filter(cfg))
	r.POST("/apisix/admin/user/login", func(ctx *gin.Context) {})
	r.PUT("/apisix/admin/global_rules/:id", func(ctx *gin.Context) {})
	r.DELETE("/apisix/admin/stream_routes/:ids", func(ctx *gin.Context) {})
	r.GET("/*path", func(ctx *gin.Context) {})
	r.POST("/success", func(ctx *gin.Context) {})
	
	w := performRequest(r, http.MethodPost, "/apisix/admin/user/login")
	assert.Equal(t, http.StatusOK, w.Code)
	
	w = performRequest(r, http.MethodDelete, "/apisix/admin/global_rules/12")
	assert.Equal(t, http.StatusForbidden, w.Code)
	
	w = performRequest(r, http.MethodDelete, "/apisix/admin/stream_routes/67")
	assert.Equal(t, http.StatusForbidden, w.Code)
	
	w = performRequest(r, http.MethodGet, "/apisix/admin/ssl/98")
	assert.Equal(t, http.StatusOK, w.Code)
	
	w = performRequest(r, http.MethodPost, "/success")
	assert.Equal(t, http.StatusOK, w.Code)
}

type test struct{}

var _ iam.Access = test{}

func (test) Check(identity, resource, action string) error {
	return errors.New("no permission")
}

func TestSetAccessImplementation(t *testing.T) {
	// close the default gate to use the customized one
	cfg.FeatureGate.DemoIAMAccess = false
	// because the last test. we should reset the value
	accessLock = false
	SetAccessImplementation(test{})
	r := gin.Default()
	r.Use(func(c *gin.Context) {
		c.Set("identity", "user")
	})
	r.Use(Filter(cfg))
	r.POST("/apisix/admin/user/login", func(ctx *gin.Context) {})
	r.PUT("/apisix/admin/route/:id", func(ctx *gin.Context) {})
	r.DELETE("/apisix/admin/upstream", func(ctx *gin.Context) {})
	
	w := performRequest(r, http.MethodPost, "/apisix/admin/user/login")
	assert.Equal(t, http.StatusOK, w.Code)
	
	w = performRequest(r, http.MethodPut, "/apisix/admin/route/2")
	assert.Equal(t, http.StatusForbidden, w.Code)
	
	w = performRequest(r, http.MethodDelete, "/apisix/admin/upstream")
	assert.Equal(t, http.StatusForbidden, w.Code)
}
