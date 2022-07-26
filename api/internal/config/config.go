package config

import (
	"strings"

	"github.com/pkg/errors"
	"github.com/spf13/viper"
)

func NewDefaultConfig() *Config {
	return &Config{
		Server: Server{
			HTTPListen:  ":9000",
			HTTPSListen: ":9001",
		},
		DataSource: []DataSource{
			{
				Name: "default",
				Type: DataSourceTypeAPISIX,
				APISIX: DataSourceAPISIX{
					Address: "http://127.0.0.1:9080",
					Key:     "edd1c9f034335f136f87ad84b625c8f1",
				},
			},
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
