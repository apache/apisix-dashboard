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
package consts

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func performRequest(r http.Handler, method, path string) *httptest.ResponseRecorder {
	req := httptest.NewRequest(method, path, nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	return w
}

func TestRequestLogHandler(t *testing.T) {
	r := gin.New()
	r.GET("/", ErrorWrapper(func(c *gin.Context) (interface{}, error) {
		return nil, nil
	}))
	r.GET("/notfound", ErrorWrapper(func(c *gin.Context) (interface{}, error) {
		return nil, fmt.Errorf("data not found")
	}))
	r.GET("/invalid", ErrorWrapper(func(c *gin.Context) (interface{}, error) {
		return nil, fmt.Errorf("schema validate failed")
	}))
	r.GET("/error", ErrorWrapper(func(c *gin.Context) (interface{}, error) {
		return nil, fmt.Errorf("internal system error")
	}))

	w := performRequest(r, "GET", "/")
	assert.Equal(t, 200, w.Code)

	w = performRequest(r, "GET", "/notfound")
	assert.Equal(t, 404, w.Code)

	w = performRequest(r, "GET", "/invalid")
	assert.Equal(t, 400, w.Code)

	w = performRequest(r, "GET", "/error")
	assert.Equal(t, 500, w.Code)
}
