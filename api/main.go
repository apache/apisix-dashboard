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
	"net/http"
	"time"

	"github.com/apisix/manager-api/conf"
	"github.com/apisix/manager-api/internal"
	"github.com/apisix/manager-api/internal/core/storage"
	"github.com/apisix/manager-api/internal/core/store"
	"github.com/apisix/manager-api/internal/utils"
	"github.com/apisix/manager-api/log"
)

func main() {

	if err := storage.InitETCDClient(conf.ETCDEndpoints, conf.ETCDUsername, conf.ETCDPassword); err != nil {
		log.Error("init etcd client fail: %w", err)
		panic(err)
	}
	if err := store.InitStores(); err != nil {
		log.Error("init stores fail: %w", err)
		panic(err)
	}
	// routes
	r := internal.SetUpRouter()
	addr := fmt.Sprintf("%s:%d", conf.ServerHost, conf.ServerPort)
	s := &http.Server{
		Addr:         addr,
		Handler:      r,
		ReadTimeout:  time.Duration(1000) * time.Millisecond,
		WriteTimeout: time.Duration(5000) * time.Millisecond,
	}

	log.Infof("The Manager API is listening on %s ", addr)

	if err := s.ListenAndServe(); err != nil {
		log.Errorf("listen and serv fail: %w", err)
	}

	utils.CloseAll()
}
