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

package config

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
	"strings"

	"github.com/pkg/errors"
	"github.com/spf13/viper"
	"github.com/tidwall/gjson"
)

func NewDefaultConfig() Config {
	return Config{
		Server: Server{
			HTTPListen:  ":9000",
			HTTPSListen: ":9001",
		},
		DataSource: []DataSource{
			{
				Name: "default",
				Type: DataSourceTypeETCD,
				ETCD: DataSourceETCD{
					Endpoints: []string{"127.0.0.1:2379"},
					Username:  "",
					Password:  "",
					MTLS:      DataSourceETCDMTLS{},
					Prefix:    "/apisix",
				},
			},
			/*{
				Name: "default",
				Type: DataSourceTypeAPISIX,
				APISIX: DataSourceAPISIX{
					Address: "http://127.0.0.1:9080",
					KeyFile:     "edd1c9f034335f136f87ad84b625c8f1",
				},
			},*/
		},
		Security: Security{
			AllowList: []string{"127.0.0.1", "::1"},
			CORS: SecurityCORS{
				AllowCredentials: true,
				AllowOrigin:      "http://dashboard.apisix.local",
				AllowMethods:     "*",
				AllowHeaders:     "Authorization",
			},
			XFrameOptions:         "deny",
			ContentSecurityPolicy: "default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline'",
		},
		Log: Log{
			ErrorLog: LogError{
				Level:    "warn",
				FilePath: "logs/error.log",
			},
			AccessLog: "logs/access.log",
		},
		Authentication: Authentication{
			ExpireTime: 3600,
			Users: []AuthenticationUser{
				{
					Username: "admin",
					Password: "admin",
				},
				{
					Username: "user",
					Password: "user",
				},
			},
		},
		FeatureGate: FeatureGate{},
	}
}

func SetupConfig(c *Config, file string) error {
	// setup config file path
	viper.SetConfigFile(file)

	// setup env config search
	viper.SetEnvPrefix("AD")
	viper.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))
	viper.AutomaticEnv()

	// load config
	if err := viper.ReadInConfig(); err != nil {
		return errors.Errorf("failed to read configuration: %v", err)
	}

	// unmarshal config
	err := viper.Unmarshal(c)
	if err != nil {
		return errors.Errorf("failed to unmarshal configuration: %s, err: %v", file, err)
	}

	return nil
}

// GetSchema was added to ensure that the PR passes the CI check and it will be removed in the future
func GetSchema() gjson.Result {
	var (
		apisixSchemaPath       = "./config/schema.json"
		customizeSchemaPath    = "./config/customize_schema.json"
		apisixSchemaContent    []byte
		customizeSchemaContent []byte
		err                    error
	)

	if os.Getenv("ENV") == "test" {
		apisixSchemaPath = os.Getenv("GITHUB_WORKSPACE") + "/api/config/schema.json"
		customizeSchemaPath = os.Getenv("GITHUB_WORKSPACE") + "/api/config/customize_schema.json"
	}

	if apisixSchemaContent, err = ioutil.ReadFile(apisixSchemaPath); err != nil {
		panic(fmt.Errorf("fail to read configuration: %s, error: %s", apisixSchemaPath, err.Error()))
	}

	if customizeSchemaContent, err = ioutil.ReadFile(customizeSchemaPath); err != nil {
		panic(fmt.Errorf("fail to read configuration: %s, error: %s", customizeSchemaPath, err.Error()))
	}

	content, err := mergeSchema(apisixSchemaContent, customizeSchemaContent)
	if err != nil {
		panic(err)
	}

	return gjson.ParseBytes(content)
}

// mergeSchema was added to ensure that the PR passes the CI check and it will be removed in the future
func mergeSchema(apisixSchema, customizeSchema []byte) ([]byte, error) {
	var (
		apisixSchemaMap    map[string]map[string]interface{}
		customizeSchemaMap map[string]map[string]interface{}
	)

	if err := json.Unmarshal(apisixSchema, &apisixSchemaMap); err != nil {
		return nil, err
	}
	if err := json.Unmarshal(customizeSchema, &customizeSchemaMap); err != nil {
		return nil, err
	}

	for key := range apisixSchemaMap["main"] {
		if _, ok := customizeSchemaMap["main"][key]; ok {
			return nil, fmt.Errorf("duplicates key: main.%s between schema.json and customize_schema.json", key)
		}
	}

	for k, v := range customizeSchemaMap["main"] {
		apisixSchemaMap["main"][k] = v
	}

	return json.Marshal(apisixSchemaMap)
}
