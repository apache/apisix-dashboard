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
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"
	"runtime"
	"strings"

	"github.com/gorilla/sessions"
	"github.com/spf13/viper"
	"github.com/tidwall/gjson"
	"golang.org/x/oauth2"

	"github.com/apisix/manager-api/internal/utils"
)

const (
	EnvPROD  = "prod"
	EnvBETA  = "beta"
	EnvDEV   = "dev"
	EnvLOCAL = "local"
	EnvTEST  = "test"

	WebDir = "html/"

	DefaultCSP = "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:"
	State      = "123456"
)

var (
	ENV              string
	Schema           gjson.Result
	WorkDir          = "."
	ConfigFile       = ""
	ServerHost       = "0.0.0.0"
	ServerPort       = 80
	SSLHost          = "0.0.0.0"
	SSLPort          = 443
	SSLCert          string
	SSLKey           string
	ETCDConfig       *Etcd
	ErrorLogLevel    = "warn"
	ErrorLogPath     = "logs/error.log"
	AccessLogPath    = "logs/access.log"
	UserList         = make(map[string]User, 2)
	AuthConf         Authentication
	SSLDefaultStatus = 1 //enable ssl by default
	ImportSizeLimit  = 10 * 1024 * 1024
	AllowList        []string
	Plugins          = map[string]bool{}
	SecurityConf     Security
	CookieStore      = sessions.NewCookieStore([]byte("oidc"))
	OidcEnabled      = false
	OidcId           string
	OidcConfig       oauth2.Config
	OidcExpireTime   int
	OidcUserInfoURL  string
)

type MTLS struct {
	CaFile   string `mapstructure:"ca_file"`
	CertFile string `mapstructure:"cert_file"`
	KeyFile  string `mapstructure:"key_file"`
}

type Etcd struct {
	Endpoints []string
	Username  string
	Password  string
	MTLS      *MTLS
	Prefix    string
}

type SSL struct {
	Host string `mapstructure:"host"`
	Port int    `mapstructure:"port"`
	Cert string `mapstructure:"cert"`
	Key  string `mapstructure:"key"`
}

type Listen struct {
	Host string
	Port int
}

type ErrorLog struct {
	Level    string
	FilePath string `mapstructure:"file_path"`
}

type AccessLog struct {
	FilePath string `mapstructure:"file_path"`
}

type Log struct {
	ErrorLog  ErrorLog  `mapstructure:"error_log"`
	AccessLog AccessLog `mapstructure:"access_log"`
}

type Conf struct {
	Etcd      Etcd
	Listen    Listen
	SSL       SSL
	Log       Log
	AllowList []string `mapstructure:"allow_list"`
	MaxCpu    int      `mapstructure:"max_cpu"`
	Security  Security
}

type User struct {
	Username string
	Password string
}

type Authentication struct {
	Secret     string
	ExpireTime int `mapstructure:"expire_time"`
	Users      []User
}

type Oidc struct {
	Enabled      bool   `mapstructure:"enabled"`
	ExpireTime   int    `mapstructure:"expire_time" yaml:"expire_time"`
	ClientID     string `mapstructure:"client_id"`
	ClientSecret string `mapstructure:"client_secret"`
	AuthURL      string `mapstructure:"auth_url"`
	TokenURL     string `mapstructure:"token_url"`
	UserInfoURL  string `mapstructure:"user_info_url"`
	RedirectURL  string `mapstructure:"redirect_url"`
	Scope        string
}

type Config struct {
	Conf           Conf
	Authentication Authentication
	Plugins        []string
	Oidc           Oidc
}

type Security struct {
	AllowCredentials      string `mapstructure:"access_control_allow_credentials"`
	AllowOrigin           string `mapstructure:"access_control_allow_origin"`
	AllowMethods          string `mapstructure:"access_control-allow_methods"`
	AllowHeaders          string `mapstructure:"access_control_allow_headers"`
	XFrameOptions         string `mapstructure:"x_frame_options"`
	ContentSecurityPolicy string `mapstructure:"content_security_policy"`
}

// TODO: we should no longer use init() function after remove all handler's integration tests
// ENV=test is for integration tests only, other ENV should call "InitConf" explicitly
func init() {
	if env := os.Getenv("ENV"); env == EnvTEST {
		InitConf()
	}
}

func InitConf() {
	//go test
	if workDir := os.Getenv("APISIX_API_WORKDIR"); workDir != "" {
		WorkDir = workDir
	}

	setupConfig()
	setupEnv()
	initSchema()
}

func setupConfig() {
	// setup config file path
	if ConfigFile == "" {
		ConfigFile = "conf.yaml"
		if profile := os.Getenv("APISIX_PROFILE"); profile != "" {
			ConfigFile = "conf" + "-" + profile + ".yaml"
		}
		viper.SetConfigName(ConfigFile)
		viper.SetConfigType("yaml")
		viper.AddConfigPath(WorkDir + "/conf")
	} else {
		viper.SetConfigFile(ConfigFile)
	}

	// load config
	if err := viper.ReadInConfig(); err != nil {
		panic(fmt.Sprintf("fail to read configuration, err: %s", err.Error()))
	}

	// unmarshal config
	config := Config{}
	err := viper.Unmarshal(&config)
	if err != nil {
		panic(fmt.Sprintf("fail to unmarshal configuration: %s, err: %s", ConfigFile, err.Error()))
	}

	// listen
	if config.Conf.Listen.Port != 0 {
		ServerPort = config.Conf.Listen.Port
	}
	if config.Conf.Listen.Host != "" {
		ServerHost = config.Conf.Listen.Host
	}

	// SSL
	if config.Conf.SSL.Port != 0 {
		SSLPort = config.Conf.SSL.Port
	}
	if config.Conf.SSL.Cert != "" {
		SSLCert = config.Conf.SSL.Cert
	}
	if config.Conf.SSL.Key != "" {
		SSLKey = config.Conf.SSL.Key
	}

	// ETCD Storage
	if len(config.Conf.Etcd.Endpoints) > 0 {
		initEtcdConfig(config.Conf.Etcd)
	}

	// error log
	if config.Conf.Log.ErrorLog.Level != "" {
		ErrorLogLevel = config.Conf.Log.ErrorLog.Level
	}
	if config.Conf.Log.ErrorLog.FilePath != "" {
		ErrorLogPath = config.Conf.Log.ErrorLog.FilePath
	}

	// access log
	if config.Conf.Log.AccessLog.FilePath != "" {
		AccessLogPath = config.Conf.Log.AccessLog.FilePath
	}

	if !filepath.IsAbs(ErrorLogPath) {
		if strings.HasPrefix(ErrorLogPath, "winfile") {
			return
		}
		ErrorLogPath, err = filepath.Abs(filepath.Join(WorkDir, ErrorLogPath))
		if err != nil {
			panic(err)
		}
		if runtime.GOOS == "windows" {
			ErrorLogPath = `winfile:///` + ErrorLogPath
		}
	}
	if !filepath.IsAbs(AccessLogPath) {
		if strings.HasPrefix(AccessLogPath, "winfile") {
			return
		}
		AccessLogPath, err = filepath.Abs(filepath.Join(WorkDir, AccessLogPath))
		if err != nil {
			panic(err)
		}
		if runtime.GOOS == "windows" {
			AccessLogPath = `winfile:///` + AccessLogPath
		}
	}

	AllowList = config.Conf.AllowList

	// set degree of parallelism
	initParallelism(config.Conf.MaxCpu)

	// set authentication
	initAuthentication(config.Authentication)

	// set Oidc
	initOidc(config.Oidc)

	// set plugin
	initPlugins(config.Plugins)

	// security configuration
	initSecurity(config.Conf.Security)
}

func setupEnv() {
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

func initOidc(conf Oidc) {
	OidcEnabled = conf.Enabled
	OidcExpireTime = conf.ExpireTime
	OidcConfig.ClientID = conf.ClientID
	OidcConfig.ClientSecret = conf.ClientSecret
	OidcConfig.Endpoint = oauth2.Endpoint{AuthURL: conf.AuthURL, TokenURL: conf.TokenURL, AuthStyle: 1}
	OidcConfig.Scopes = append(OidcConfig.Scopes, conf.Scope)
	OidcConfig.RedirectURL = conf.RedirectURL
	OidcUserInfoURL = conf.UserInfoURL
}

func initPlugins(plugins []string) {
	for _, pluginName := range plugins {
		Plugins[pluginName] = true
	}
}

func initSchema() {
	var (
		apisixSchemaPath       = WorkDir + "/conf/schema.json"
		customizeSchemaPath    = WorkDir + "/conf/customize_schema.json"
		apisixSchemaContent    []byte
		customizeSchemaContent []byte
		err                    error
	)

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

	Schema = gjson.ParseBytes(content)
}

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

// initialize etcd config
func initEtcdConfig(conf Etcd) {
	var endpoints = []string{"127.0.0.1:2379"}
	if len(conf.Endpoints) > 0 {
		endpoints = conf.Endpoints
	}

	prefix := "/apisix"
	if len(conf.Prefix) > 0 {
		prefix = conf.Prefix
	}

	ETCDConfig = &Etcd{
		Endpoints: endpoints,
		Username:  conf.Username,
		Password:  conf.Password,
		MTLS:      conf.MTLS,
		Prefix:    prefix,
	}
}

// initialize parallelism settings
func initParallelism(choiceCores int) {
	if choiceCores < 1 {
		return
	}
	maxSupportedCores := runtime.NumCPU()

	if choiceCores > maxSupportedCores {
		choiceCores = maxSupportedCores
	}
	runtime.GOMAXPROCS(choiceCores)
}

// initialize security settings
func initSecurity(conf Security) {
	var se Security
	// if conf == se, then conf is empty, we should use default value
	if conf != se {
		SecurityConf = conf
		if conf.ContentSecurityPolicy == "" {
			SecurityConf.ContentSecurityPolicy = DefaultCSP
		}
		if conf.XFrameOptions == "" {
			SecurityConf.XFrameOptions = "deny"
		}
		return
	}

	SecurityConf = Security{
		XFrameOptions:         "deny",
		ContentSecurityPolicy: DefaultCSP,
	}
}
