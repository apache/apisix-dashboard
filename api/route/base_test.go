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
	"strings"

	"github.com/api7/apitest"
	dlog "github.com/shiningrush/droplet/log"
	"github.com/spf13/viper"

	"github.com/apisix/manager-api/internal/core/storage"
	"github.com/apisix/manager-api/log"
)

var testHandler *apitest.APITest

var (
	uriPrefix = "/apisix/admin"
)

func init() {
	//init etcd
	viper.SetEnvPrefix("APIX")
	viper.AutomaticEnv()
	dlog.DefLogger = log.DefLogger{}

	if err := storage.InitETCDClient(strings.Split(viper.GetString("etcd_endpoints"), ",")); err != nil {
		panic(err)
	}
	r := SetUpRouter()

	testHandler = apitest.
		New().
		Handler(r)
}
