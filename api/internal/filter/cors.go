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
	"strconv"

	"github.com/gin-gonic/gin"

	"github.com/apache/apisix-dashboard/api/internal/config"
)

func CORS(cfg config.Security) gin.HandlerFunc {
	return func(c *gin.Context) {
		if cfg.CORS.AllowOrigin != "" {
			c.Writer.Header().Set("Access-Control-Allow-Origin", cfg.CORS.AllowOrigin)
		}

		if cfg.CORS.AllowHeaders != "" {
			c.Writer.Header().Set("Access-Control-Allow-Headers", cfg.CORS.AllowHeaders)
		}

		if cfg.CORS.AllowMethods != "" {
			c.Writer.Header().Set("Access-Control-Allow-Methods", cfg.CORS.AllowMethods)
		}

		if cfg.CORS.AllowCredentials {
			c.Writer.Header().Set("Access-Control-Allow-Credentials", strconv.FormatBool(cfg.CORS.AllowCredentials))
		}

		if cfg.XFrameOptions != "" {
			c.Writer.Header().Set("X-Frame-Options", cfg.XFrameOptions)
		}

		if cfg.ContentSecurityPolicy != "" {
			c.Writer.Header().Set("Content-Security-Policy", cfg.ContentSecurityPolicy)
		}

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	}
}
