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
package filter

import (
	"bytes"
	"fmt"
	"io/ioutil"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"

	"github.com/apisix/manager-api/internal/core/store"
	"github.com/apisix/manager-api/internal/utils/consts"
	"github.com/apisix/manager-api/log"
)

var resources = map[string]string{
	"routes":    "route",
	"upstreams": "upstream",
	"services":  "service",
	"consumers": "consumer",
	"ssl":       "ssl",
}

func SchemaCheck() gin.HandlerFunc {
	return func(c *gin.Context) {
		pathPrefix := "/apisix/admin/"
		resource := strings.Replace(c.Request.URL.Path, pathPrefix, "", 1)

		idx := strings.LastIndex(resource, "/")
		if idx > 1 {
			resource = resource[:idx]
		}
		method := strings.ToUpper(c.Request.Method)

		if method != "PUT" && method != "POST" {
			c.Next()
			return
		}
		schemaKey, ok := resources[resource]
		if !ok {
			c.Next()
			return
		}

		reqBody, err := c.GetRawData()
		if err != nil {
			log.Errorf("read request body failed: %s", err)
			c.AbortWithStatusJSON(http.StatusBadRequest, consts.ErrInvalidRequest)
			return
		}

		// other filter need it
		c.Request.Body = ioutil.NopCloser(bytes.NewBuffer(reqBody))

		validator, err := store.NewAPISIXSchemaValidator("main." + schemaKey)
		if err != nil {
			errMsg := fmt.Sprintf("init validator failed: %s", err)
			c.AbortWithStatusJSON(http.StatusBadRequest, consts.InvalidParam(errMsg))
			log.Errorf(errMsg)
			return
		}

		if err := validator.Validate(reqBody); err != nil {
			errMsg := fmt.Sprintf("schema validate failed: %s", err)
			c.AbortWithStatusJSON(http.StatusBadRequest, consts.InvalidParam(errMsg))
			log.Warn(errMsg)
			return
		}

		c.Next()
	}
}
