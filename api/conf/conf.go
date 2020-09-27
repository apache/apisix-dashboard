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
)

const ServerPort = 8080
const PROD = "prod"
const BETA = "beta"
const DEV = "dev"
const LOCAL = "local"
const confPath = "/go/manager-api/conf.json"
const RequestId = "requestId"

var (
	ENV      string
	basePath string
	ApiKey   = "edd1c9f034335f136f87ad84b625c8f1"
	BaseUrl  = "http://127.0.0.1:9080/apisix/admin"
	DebugUrl = "http://127.0.0.1:9080/"
)

func init() {
	setEnvironment()
	initMysql()
	initApisix()
	initAuthentication()
}

func setEnvironment() {
	if env := os.Getenv("ENV"); env == "" {
		ENV = LOCAL
	} else {
		ENV = env
	}
	_, basePath, _, _ = runtime.Caller(1)
}

func configurationPath() string {
	if ENV == LOCAL {
		return filepath.Join(filepath.Dir(basePath), "conf.json")
	} else {
		return confPath
	}
}

type mysqlConfig struct {
	Address  string
	User     string
	Password string

	MaxConns     int
	MaxIdleConns int
	MaxLifeTime  int
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

var MysqlConfig mysqlConfig
var AuthenticationConfig authenticationConfig

func initMysql() {
	filePath := configurationPath()
	if configurationContent, err := ioutil.ReadFile(filePath); err != nil {
		panic(fmt.Sprintf("fail to read configuration: %s", filePath))
	} else {
		configuration := gjson.ParseBytes(configurationContent)
		mysqlConf := configuration.Get("conf.mysql")
		MysqlConfig.Address = mysqlConf.Get("address").String()
		MysqlConfig.User = mysqlConf.Get("user").String()
		MysqlConfig.Password = mysqlConf.Get("password").String()
		MysqlConfig.MaxConns = int(mysqlConf.Get("maxConns").Int())
		MysqlConfig.MaxIdleConns = int(mysqlConf.Get("maxIdleConns").Int())
		MysqlConfig.MaxLifeTime = int(mysqlConf.Get("maxLifeTime").Int())
	}
}

func initApisix() {
	filePath := configurationPath()
	if configurationContent, err := ioutil.ReadFile(filePath); err != nil {
		panic(fmt.Sprintf("fail to read configuration: %s", filePath))
	} else {
		configuration := gjson.ParseBytes(configurationContent)
		apisixConf := configuration.Get("conf.apisix")
		BaseUrl = apisixConf.Get("base_url").String()
		ApiKey = apisixConf.Get("api_key").String()
		DebugUrl = apisixConf.Get("debug_url").String()
	}
}

func initAuthentication() {
	filePath := configurationPath()
	if configurationContent, err := ioutil.ReadFile(filePath); err != nil {
		panic(fmt.Sprintf("fail to read configuration: %s", filePath))
	} else {
		configuration := gjson.ParseBytes(configurationContent)
		userList := configuration.Get("authentication.user").Array()

		// create user list
		for _, item := range userList {
			username := item.Map()["username"].String()
			password := item.Map()["password"].String()
			UserList[item.Map()["username"].String()] = user{Username: username, Password: password}
		}
		AuthenticationConfig.Session.Secret = configuration.Get("authentication.session.secret").String()
		AuthenticationConfig.Session.ExpireTime = configuration.Get("authentication.session.expireTime").Uint()
	}
}
