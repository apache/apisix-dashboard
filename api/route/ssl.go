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
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/satori/go.uuid"

	"github.com/apisix/manager-api/errno"
	"github.com/apisix/manager-api/service"
)

const contentType = "application/json"

func AppendSsl(r *gin.Engine) *gin.Engine {
	r.POST("/apisix/admin/check_ssl_cert", sslCheck)
	r.GET("/apisix/admin/ssls", sslList)
	r.POST("/apisix/admin/ssls", sslCreate)
	r.GET("/apisix/admin/ssls/:id", sslItem)
	r.PUT("/apisix/admin/ssls/:id", sslUpdate)
	r.DELETE("/apisix/admin/ssls/:id", sslDelete)
	return r
}

func sslList(c *gin.Context) {
	size, _ := strconv.Atoi(c.DefaultQuery("size", "10"))
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	// todo params check
	resp, err := service.SslList(page, size)

	if err != nil {
		e := errno.FromMessage(errno.RouteRequestError, err.Error())
		logger.Error(e.Msg)
		c.AbortWithStatusJSON(http.StatusBadRequest, e.Response())
		return
	}

	c.Data(http.StatusOK, service.ContentType, resp)
}

func sslItem(c *gin.Context) {
	id := c.Param("id")

	// todo params check
	resp, err := service.SslItem(id)

	if err != nil {
		e := errno.FromMessage(errno.RouteRequestError, err.Error())
		logger.Error(e.Msg)
		c.AbortWithStatusJSON(http.StatusBadRequest, e.Response())
		return
	}

	c.Data(http.StatusOK, service.ContentType, resp)
}

func sslCheck(c *gin.Context) {
	// todo params check
	param, exist := c.Get("requestBody")

	if !exist || len(param.([]byte)) < 1 {
		e := errno.FromMessage(errno.RouteRequestError, "route create with no post data")
		logger.Error(e.Msg)
		c.AbortWithStatusJSON(http.StatusBadRequest, e.Response())
		return
	}

	resp, err := service.SslCheck(param)
	if err != nil {
		e := errno.FromMessage(errno.RouteRequestError, err.Error())
		logger.Error(e.Msg)
		c.AbortWithStatusJSON(http.StatusBadRequest, e.Response())
		return
	}

	c.Data(http.StatusOK, contentType, resp)
}

func sslCreate(c *gin.Context) {
	// todo params check
	param, exist := c.Get("requestBody")

	u4 := uuid.NewV4()

	if !exist || len(param.([]byte)) < 1 {
		e := errno.FromMessage(errno.RouteRequestError, "route create with no post data")
		logger.Error(e.Msg)
		c.AbortWithStatusJSON(http.StatusBadRequest, e.Response())
		return
	}

	if err := service.SslCreate(param, u4.String()); err != nil {
		e := errno.FromMessage(errno.ApisixRouteCreateError, err.Error())
		logger.Error(e.Msg)
		c.AbortWithStatusJSON(http.StatusInternalServerError, e.Response())
		return
	}

	c.Data(http.StatusOK, contentType, errno.Success())
}

func sslUpdate(c *gin.Context) {
	// todo params check
	param, exist := c.Get("requestBody")

	id := c.Param("id")

	if !exist || len(param.([]byte)) < 1 {
		e := errno.FromMessage(errno.RouteRequestError, "route create with no post data")
		logger.Error(e.Msg)
		c.AbortWithStatusJSON(http.StatusBadRequest, e.Response())
		return
	}

	if err := service.SslUpdate(param, id); err != nil {
		e := errno.FromMessage(errno.ApisixRouteCreateError, err.Error())
		logger.Error(e.Msg)
		c.AbortWithStatusJSON(http.StatusInternalServerError, e.Response())
		return
	}

	c.Data(http.StatusOK, contentType, errno.Success())
}

func sslDelete(c *gin.Context) {
	id := c.Param("id")
	// todo params check
	if err := service.SslDelete(id); err != nil {
		e := errno.FromMessage(errno.RouteRequestError, err.Error())
		logger.Error(e.Msg)
		c.AbortWithStatusJSON(http.StatusBadRequest, e.Response())
		return
	}

	c.Data(http.StatusOK, service.ContentType, errno.Success())
}
