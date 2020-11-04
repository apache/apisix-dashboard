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
	"github.com/tidwall/gjson"
	"gopkg.in/yaml.v2"
	"io/ioutil"
	"log"
	"os"
)

const (
	EnvPROD  = "prod"
	EnvBETA  = "beta"
	EnvDEV   = "dev"
	EnvLOCAL = "local"

	WebDir  = "./html/"
)

var (
	ENV           string
	Schema        gjson.Result
	confDir       = "./conf/"
	DagLibPath    = "./dag-to-lua/"
	ServerHost    = "127.0.0.1"
	ServerPort    = 80
	ETCDEndpoints = []string{"127.0.0.1:2379"}
	UserList      = make(map[string]User, 2)
	AuthConf   Authentication
)

type Etcd struct {
	Endpoints []string
}

type Listen struct {
	Host string
	Port int
}

type Conf struct {
	DagLib string `yaml:"dag_lib_path"`
	Etcd   Etcd
	Listen Listen
}

type User struct {
	Username string
	Password string
}

type Authentication struct {
	Secret     string
	ExpireTime int
	Users   []User
}

type Config struct {
	Conf           Conf
	Authentication Authentication
}

func init() {
	flag.StringVar(&confDir, "c", "./conf/", "conf dir")
	flag.Parse()

	setEnvironment()
	initSchema()
	setConf()
}

func setConf() {
	filePath := confDir + "conf.yaml"
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

		//dag lib path
		if config.Conf.DagLib != "" {
			DagLibPath = config.Conf.DagLib
		}
		//etcd
		if len(config.Conf.Etcd.Endpoints) > 0 {
			ETCDEndpoints = config.Conf.Etcd.Endpoints
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
	userList := conf.Users
	// create user list
	for _, item := range userList {
		UserList[item.Username] = item
	}
}

func initSchema() {
	filePath := confDir + "schema.json"
	if schemaContent, err := ioutil.ReadFile(filePath); err != nil {
		panic(fmt.Sprintf("fail to read configuration: %s", filePath))
	} else {
		Schema = gjson.ParseBytes(schemaContent)
	}
}
