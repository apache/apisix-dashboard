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
	"github.com/api7/apitest"
	"github.com/gin-gonic/gin"

	"github.com/apisix/manager-api/conf"
	"github.com/apisix/manager-api/filter"
)

var handler *apitest.APITest

var (
	r         = gin.New()
	uriPrefix = "/apisix/admin"
)

func init() {
	//init mysql connect
	conf.InitializeMysql()

	//filters
	r.Use(
		filter.CORS(),
		filter.RequestId(),
		filter.RequestLogHandler(),
		filter.RecoverHandler())

	handler = apitest.New().
		Handler(AppendHealthCheck(r)).
		Handler(AppendRoute(r)).
		Handler(AppendSsl(r)).
		Handler(AppendPlugin(r)).
		Handler(AppendConsumer(r)).
		Handler(AppendUpstream(r))
}
