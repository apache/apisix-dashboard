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
package main

import (
	"fmt"
	"github.com/spf13/viper"
	"net/http"
	"strings"
	"time"

	dlog "github.com/shiningrush/droplet/log"

	"github.com/apisix/manager-api/conf"
	"github.com/apisix/manager-api/internal/core/storage"
	"github.com/apisix/manager-api/internal/core/store"
	"github.com/apisix/manager-api/internal/utils"
	"github.com/apisix/manager-api/log"
	"github.com/apisix/manager-api/route"
)

var logger = log.GetLogger()

func main() {
	viper.SetEnvPrefix("APIX")
	viper.AutomaticEnv()
	dlog.DefLogger = log.DefLogger{}

	if err := storage.InitETCDClient(strings.Split(viper.GetString("etcd_endpoints"), ",")); err != nil {
		panic(err)
	}
	if err := store.InitStores(); err != nil {
		panic(err)
	}

	// init
	//conf.InitializeMysql()
	// routes
	r := route.SetUpRouter()
	addr := fmt.Sprintf(":%d", conf.ServerPort)
	s := &http.Server{
		Addr:         addr,
		Handler:      r,
		ReadTimeout:  time.Duration(1000) * time.Millisecond,
		WriteTimeout: time.Duration(5000) * time.Millisecond,
	}
	if err := s.ListenAndServe(); err != nil {
		logger.WithError(err)
	}

	utils.CloseAll()
}
