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

package misc

import (
	"github.com/gin-gonic/gin"

	"github.com/apache/apisix-dashboard/api/internal/config"
	"github.com/apache/apisix-dashboard/api/internal/handler"
	"github.com/apache/apisix-dashboard/api/internal/utils"
)

type Handler struct {
}

func NewHandler() (handler.RouteRegister, error) {
	return &Handler{}, nil
}

func (h *Handler) ApplyRoute(r *gin.Engine, _ config.Config) {
	r.GET("/api/version", h.Version)
	r.GET("/ping", h.Ping)
}

// Version will return current artifact's version and commit hash
func (h *Handler) Version(c *gin.Context) {
	hash, version := utils.GetHashAndVersion()

	c.JSON(200, map[string]interface{}{
		"commit_hash": hash,
		"version":     version,
	})
}

// Ping will return pong in text
func (h *Handler) Ping(c *gin.Context) {
	c.String(200, "pong")
}
