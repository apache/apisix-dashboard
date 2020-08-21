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
  "github.com/gin-contrib/pprof"
  "github.com/gin-contrib/sessions"
  "github.com/gin-contrib/sessions/cookie"
  "github.com/gin-gonic/gin"

  "github.com/apisix/manager-api/conf"
  "github.com/apisix/manager-api/filter"
)

func SetUpRouter() *gin.Engine {
	if conf.ENV != conf.LOCAL && conf.ENV != conf.BETA {
		gin.SetMode(gin.DebugMode)
	} else {
		gin.SetMode(gin.ReleaseMode)
	}
	r := gin.New()
	store := cookie.NewStore([]byte("secret"))
	r.Use(sessions.Sessions("session", store))
	r.Use(filter.CORS(), filter.Authentication(),filter.RequestId(), filter.RequestLogHandler(), filter.RecoverHandler())

	AppendHealthCheck(r)
	AppendAuthentication(r)
	AppendRoute(r)
	AppendSsl(r)
	AppendPlugin(r)
	AppendUpstream(r)
	AppendConsumer(r)

	pprof.Register(r)

	return r
}
