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
	"github.com/apisix/manager-api/errno"
	"github.com/apisix/manager-api/service"
	"github.com/gin-gonic/gin"
	"net/http"
)

func AppendPlugin(r *gin.Engine) *gin.Engine {
	r.GET("/apisix/admin/plugins", listPlugin)
	r.GET("/apisix/admin/schema/plugins/:name", findSchema)
	return r
}

func findSchema(c *gin.Context) {
	name := c.Param("name")
	request := &service.ApisixPluginRequest{Name: name}
	if result, err := request.Schema(); err != nil {
		e := errno.FromMessage(errno.ApisixPluginSchemaError, err.Error())
		logger.Error(e.Msg)
		c.AbortWithStatusJSON(http.StatusBadRequest, e.Response())
		return
	} else {
		resp, _ := json.Marshal(result)
		c.Data(http.StatusOK, service.ContentType, resp)
	}
}

func listPlugin(c *gin.Context) {
	request := &service.ApisixPluginRequest{}
	if result, err := request.List(); err != nil {
		e := errno.FromMessage(errno.ApisixPluginListError, err.Error())
		logger.Error(e.Msg)
		c.AbortWithStatusJSON(http.StatusBadRequest, e.Response())
		return
	} else {
		resp, _ := json.Marshal(result)
		c.Data(http.StatusOK, service.ContentType, resp)
	}
}
