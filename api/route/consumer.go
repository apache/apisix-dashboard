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

	"github.com/apisix/manager-api/conf"
	"github.com/apisix/manager-api/errno"
	"github.com/apisix/manager-api/service"
)

func AppendConsumer(r *gin.Engine) *gin.Engine {

	r.GET("/apisix/admin/consumers", consumerList)
	r.POST("/apisix/admin/consumers", consumerCreate)
	r.GET("/apisix/admin/consumers/:id", consumerItem)
	r.PUT("/apisix/admin/consumers/:id", consumerUpdate)
	r.DELETE("/apisix/admin/consumers/:id", consumerDelete)

	return r
}

func consumerList(c *gin.Context) {
	requestId, _ := c.Get("X-Request-Id")
	size, _ := strconv.Atoi(c.DefaultQuery("size", "10"))
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))

	search := c.DefaultQuery("search", "")

	count, list, err := service.ConsumerList(page, size, search)

	if err != nil {
		logger.WithField(conf.RequestId, requestId).Error(err.(*errno.ManagerError).ErrorDetail())
		c.AbortWithStatusJSON(http.StatusInternalServerError, err.(*errno.ManagerError).Response())
		return
	}

	resp := errno.FromMessage(errno.SystemSuccess).ListResponse(count, list)

	c.JSON(http.StatusOK, resp)
}

func consumerItem(c *gin.Context) {
	requestId, _ := c.Get("X-Request-Id")
	id := c.Param("id")

	consumer, err := service.ConsumerItem(id)

	if err != nil {
		logger.WithField(conf.RequestId, requestId).Error(err.(*errno.ManagerError).ErrorDetail())
		c.AbortWithStatusJSON(http.StatusInternalServerError, err.(*errno.ManagerError).Response())
		return
	}

	c.JSON(http.StatusOK, errno.FromMessage(errno.SystemSuccess).ItemResponse(consumer))
}

func consumerCreate(c *gin.Context) {
	requestId, _ := c.Get("X-Request-Id")
	param, exist := c.Get("requestBody")

	u4 := uuid.NewV4()

	if !exist || len(param.([]byte)) < 1 {
		err := errno.New(errno.InvalidParam)
		logger.WithField(conf.RequestId, requestId).Error(err.ErrorDetail())
		c.AbortWithStatusJSON(http.StatusBadRequest, err.Response())
		return
	}

	if err := service.ConsumerCreate(param, u4.String()); err != nil {
		if httpError, ok := err.(*errno.HttpError); ok {
			logger.WithField(conf.RequestId, requestId).Error(err)
			c.AbortWithStatusJSON(httpError.Code, httpError.Msg)
			return
		}
		logger.WithField(conf.RequestId, requestId).Error(err.(*errno.ManagerError).ErrorDetail())
		c.AbortWithStatusJSON(http.StatusInternalServerError, err.(*errno.ManagerError).Response())
		return
	}

	c.JSON(http.StatusOK, errno.Succeed())
}

func consumerUpdate(c *gin.Context) {
	requestId, _ := c.Get("X-Request-Id")
	param, exist := c.Get("requestBody")

	id := c.Param("id")

	if !exist || len(param.([]byte)) < 1 {
		err := errno.New(errno.InvalidParam)
		logger.WithField(conf.RequestId, requestId).Error(err.ErrorDetail())
		c.AbortWithStatusJSON(http.StatusBadRequest, err.Response())
		return
	}

	if err := service.ConsumerUpdate(param, id); err != nil {
		if httpError, ok := err.(*errno.HttpError); ok {
			logger.WithField(conf.RequestId, requestId).Error(err)
			c.AbortWithStatusJSON(httpError.Code, httpError.Msg)
			return
		}
		logger.WithField(conf.RequestId, requestId).Error(err.(*errno.ManagerError).ErrorDetail())
		c.AbortWithStatusJSON(http.StatusInternalServerError, err.(*errno.ManagerError).Response())
		return
	}

	c.JSON(http.StatusOK, errno.Succeed())
}

func consumerDelete(c *gin.Context) {
	requestId, _ := c.Get("X-Request-Id")
	id := c.Param("id")

	if err := service.ConsumerDelete(id); err != nil {
		if httpError, ok := err.(*errno.HttpError); ok {
			logger.WithField(conf.RequestId, requestId).Error(err)
			c.AbortWithStatusJSON(httpError.Code, httpError.Msg)
			return
		}

		logger.WithField(conf.RequestId, requestId).Error(err.(*errno.ManagerError).ErrorDetail())
		c.AbortWithStatusJSON(http.StatusInternalServerError, err.(*errno.ManagerError).Response())
		return
	}

	c.JSON(http.StatusOK, errno.Succeed())
}
