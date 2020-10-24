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
package conf

import (
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"
	"runtime"

	"github.com/tidwall/gjson"

	"github.com/apisix/manager-api/internal/utils"
)

const (
	ServerPort = 8080
	WebDir     = "./dist"

	EnvPROD  = "prod"
	EnvBETA  = "beta"
	EnvDEV   = "dev"
	EnvLOCAL = "local"

	confPath   = "/go/manager-api/conf.json"
	schemaPath = "/go/manager-api/schema.json"
)

var (
	ENV        string
	basePath   string
	Schema     gjson.Result
	DagLibPath = "/go/manager-api/dag-to-lua/"
)

func init() {
	setEnvironment()
	initAuthentication()
	initSchema()
}

func setEnvironment() {
	if env := os.Getenv("ENV"); env == "" {
		ENV = EnvLOCAL
	} else {
		ENV = env
	}

	if env := os.Getenv("APIX_DAG_LIB_PATH"); env != "" {
		DagLibPath = env
	}

	_, basePath, _, _ = runtime.Caller(1)
}

func configurationPath() string {
	if ENV == EnvLOCAL {
		return filepath.Join(filepath.Dir(basePath), "conf.json")
	} else {
		return confPath
	}
}

func getSchemaPath() string {
	if ENV == EnvLOCAL {
		return filepath.Join(filepath.Dir(basePath), "schema.json")
	} else {
		return schemaPath
	}
}

type user struct {
	Username string
	Password string
}

type authenticationConfig struct {
	Session struct {
		Secret     string
		ExpireTime uint64
	}
}

var UserList = make(map[string]user, 1)

var AuthenticationConfig authenticationConfig

func initAuthentication() {
	filePath := configurationPath()
	configurationContent, err := ioutil.ReadFile(filePath)
	if err != nil {
		panic(fmt.Sprintf("fail to read configuration: %s", filePath))
	}

	configuration := gjson.ParseBytes(configurationContent)
	userList := configuration.Get("authentication.user").Array()
	// create user list
	for _, item := range userList {
		username := item.Map()["username"].String()
		password := item.Map()["password"].String()
		UserList[item.Map()["username"].String()] = user{Username: username, Password: password}
	}
	AuthenticationConfig.Session.Secret = configuration.Get("authentication.session.secret").String()
	if "secret" == AuthenticationConfig.Session.Secret {
		AuthenticationConfig.Session.Secret = utils.GetFlakeUidStr()
	}

	AuthenticationConfig.Session.ExpireTime = configuration.Get("authentication.session.expireTime").Uint()
}

func initSchema() {
	filePath := getSchemaPath()
	if schemaContent, err := ioutil.ReadFile(filePath); err != nil {
		panic(fmt.Sprintf("fail to read configuration: %s", filePath))
	} else {
		Schema = gjson.ParseBytes(schemaContent)
	}
}
