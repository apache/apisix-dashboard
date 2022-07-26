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

const (
	DataSourceTypeAPISIX DataSourceType = "apisix"
)

type Config struct {
	Server         Server         `mapstructure:"server"`
	DataSource     []DataSource   `mapstructure:"data_source"`
	Security       Security       `mapstructure:"security"`
	Log            Log            `mapstructure:"log"`
	Authentication Authentication `mapstructure:"authentication"`
	Plugins        []string       `mapstructure:"plugins"`
}

type Server struct {
	HTTPListen  string    `mapstructure:"http_listen"`
	HTTPSListen string    `mapstructure:"https_listen"`
	TLS         ServerTLS `mapstructure:"tls"`
}

type ServerTLS struct {
	CertFile string `mapstructure:"cert_file"`
	KeyFile  string `mapstructure:"key_file"`
}

type DataSource struct {
	Name   string           `mapstructure:"name"`
	Type   DataSourceType   `mapstructure:"type"`
	APISIX DataSourceAPISIX `mapstructure:"apisix"`
}

type DataSourceType string

type DataSourceAPISIX struct {
	Address string `mapstructure:"address"`
	Key     string `mapstructure:"key"`
}

type Security struct {
	AllowList             []string     `mapstructure:"allow_list"`
	CORS                  SecurityCORS `mapstructure:"cors"`
	XFrameOptions         string       `mapstructure:"x_frame_options"`
	ContentSecurityPolicy string       `mapstructure:"content_security_policy"`
}

type SecurityCORS struct {
	AllowCredentials bool   `mapstructure:"access_control_allow_credentials"`
	AllowOrigin      string `mapstructure:"access_control_allow_origin"`
	AllowMethods     string `mapstructure:"access_control-allow_methods"`
	AllowHeaders     string `mapstructure:"access_control_allow_headers"`
}

type Log struct {
	ErrorLog  LogError `mapstructure:"error_log"`
	AccessLog string   `mapstructure:"access_log"`
}

type LogError struct {
	Level    string `mapstructure:"level"`
	FilePath string `mapstructure:"file_path"`
}

type Authentication struct {
	Secret     string               `mapstructure:"secret"`
	ExpireTime int                  `mapstructure:"expire_time"`
	Users      []AuthenticationUser `mapstructure:"users"`
}

type AuthenticationUser struct {
	Username string `mapstructure:"username"`
	Password string `mapstructure:"password"`
}
