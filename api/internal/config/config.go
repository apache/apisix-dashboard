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
	"strings"

	"github.com/pkg/errors"
	"github.com/spf13/viper"
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
		FeatureGate: FeatureGate{
			DemoIAMAccess: true,
		},
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
