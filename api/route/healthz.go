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
	"github.com/apisix/manager-api/log"
	"github.com/gin-gonic/gin"
	"net/http"
)

var logger = log.GetLogger()

func healthzHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Copy()
		c.String(http.StatusOK, "pong")
	}
}

func AppendHealthCheck(r *gin.Engine) *gin.Engine {
	r.GET("/ping", healthzHandler())
	return r
}
