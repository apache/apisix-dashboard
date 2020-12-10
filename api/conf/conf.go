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
	"flag"
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"path/filepath"

	"github.com/tidwall/gjson"
	"gopkg.in/yaml.v2"

	"github.com/apisix/manager-api/internal/utils"
)

const (
	EnvPROD  = "prod"
	EnvBETA  = "beta"
	EnvDEV   = "dev"
	EnvLOCAL = "local"

	WebDir = "./html"
)

var (
	ENV              string
	Schema           gjson.Result
	WorkDir          = "."
	ServerHost       = "127.0.0.1"
	ServerPort       = 80
	ETCDConfig       *Etcd
	ErrorLogLevel    = "warn"
	ErrorLogPath     = "logs/error.log"
	AccessLogPath    = "logs/access.log"
	UserList         = make(map[string]User, 2)
	AuthConf         Authentication
	SSLDefaultStatus = 1 //enable ssl by default
)

type Etcd struct {
	Endpoints []string
	Username  string
	Password  string
}

type Listen struct {
	Host string
	Port int
}

type ErrorLog struct {
	Level    string
	FilePath string `yaml:"file_path"`
}

type AccessLog struct {
	FilePath string `yaml:"file_path"`
}

type Log struct {
	ErrorLog  ErrorLog  `yaml:"error_log"`
	AccessLog AccessLog `yaml:"access_log"`
}

type Conf struct {
	Etcd   Etcd
	Listen Listen
	Log    Log
}

type User struct {
	Username string
	Password string
}

type Authentication struct {
	Secret     string
	ExpireTime int `yaml:"expire_time"`
	Users      []User
}

type Config struct {
	Conf           Conf
	Authentication Authentication
}

func init() {
	//go test
	if workDir := os.Getenv("APISIX_API_WORKDIR"); workDir != "" {
		WorkDir = workDir
	} else {
		flag.StringVar(&WorkDir, "p", ".", "current work dir")
		flag.Parse()
	}

	setConf()
	setEnvironment()
	initSchema()
}

func setConf() {
	filePath := WorkDir + "/conf/conf.yaml"
	if configurationContent, err := ioutil.ReadFile(filePath); err != nil {
		panic(fmt.Sprintf("fail to read configuration: %s", filePath))
	} else {
		//configuration := gjson.ParseBytes(configurationContent)
		config := Config{}
		err := yaml.Unmarshal(configurationContent, &config)
		if err != nil {
			log.Printf("conf: %s, error: %v", configurationContent, err)
		}

		//listen
		if config.Conf.Listen.Port != 0 {
			ServerPort = config.Conf.Listen.Port
		}

		if config.Conf.Listen.Host != "" {
			ServerHost = config.Conf.Listen.Host
		}

		// for etcd
		if len(config.Conf.Etcd.Endpoints) > 0 {
			initEtcdConfig(config.Conf.Etcd)
		}

		//error log
		if config.Conf.Log.ErrorLog.Level != "" {
			ErrorLogLevel = config.Conf.Log.ErrorLog.Level
		}
		if config.Conf.Log.ErrorLog.FilePath != "" {
			ErrorLogPath = config.Conf.Log.ErrorLog.FilePath
		}
		if !filepath.IsAbs(ErrorLogPath) {
			ErrorLogPath, err = filepath.Abs(filepath.Join(WorkDir, ErrorLogPath))
			if err != nil {
				panic(err)
			}
		}

		// access log
		if config.Conf.Log.AccessLog.FilePath != "" {
			AccessLogPath = config.Conf.Log.AccessLog.FilePath
		}
		if !filepath.IsAbs(AccessLogPath) {
			AccessLogPath, err = filepath.Abs(filepath.Join(WorkDir, AccessLogPath))
			if err != nil {
				panic(err)
			}
		}

		//auth
		initAuthentication(config.Authentication)
	}
}

func setEnvironment() {
	ENV = EnvPROD
	if env := os.Getenv("ENV"); env != "" {
		ENV = env
	}
}

func initAuthentication(conf Authentication) {
	AuthConf = conf
	if AuthConf.Secret == "secret" {
		AuthConf.Secret = utils.GetFlakeUidStr()
	}

	userList := conf.Users
	// create user list
	for _, item := range userList {
		UserList[item.Username] = item
	}
}

func initSchema() {
	filePath := WorkDir + "/conf/schema.json"
	if schemaContent, err := ioutil.ReadFile(filePath); err != nil {
		panic(fmt.Sprintf("fail to read configuration: %s", filePath))
	} else {
		Schema = gjson.ParseBytes(schemaContent)
	}
}

// initialize etcd config
func initEtcdConfig(conf Etcd) {
	var endpoints = []string{"127.0.0.1:2379"}
	if len(conf.Endpoints) > 0 {
		endpoints = conf.Endpoints
	}

	ETCDConfig = &Etcd{
		Endpoints: endpoints,
		Username:  conf.Username,
		Password:  conf.Password,
	}
}
