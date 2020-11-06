module github.com/apisix/manager-api

go 1.13

replace google.golang.org/grpc => google.golang.org/grpc v1.26.0

require (
	github.com/api7/go-jsonpatch v0.0.0-20180223123257-a8710867776e
	github.com/coreos/etcd v3.3.25+incompatible // indirect
	github.com/coreos/go-semver v0.3.0 // indirect
	github.com/coreos/go-systemd v0.0.0-20191104093116-d3cd4ed1dbcf // indirect
	github.com/coreos/pkg v0.0.0-20180928190104-399ea9e2e55f // indirect
	github.com/dgrijalva/jwt-go v3.2.0+incompatible
	github.com/gin-contrib/pprof v1.3.0
	github.com/gin-contrib/sessions v0.0.3
	github.com/gin-contrib/static v0.0.0-20200916080430-d45d9a37d28e
	github.com/gin-gonic/gin v1.6.3
	github.com/gogo/protobuf v1.3.1 // indirect
	github.com/google/uuid v1.1.2 // indirect
	github.com/lestrrat-go/file-rotatelogs v2.4.0+incompatible
	github.com/lestrrat-go/strftime v1.0.3 // indirect
	github.com/natefinch/lumberjack v2.0.0+incompatible
	github.com/satori/go.uuid v1.2.0
	github.com/shiningrush/droplet v0.2.1
	github.com/shiningrush/droplet/wrapper/gin v0.2.0
	github.com/sirupsen/logrus v1.7.0
	github.com/sony/sonyflake v1.0.0
	github.com/stretchr/testify v1.6.1
	github.com/tidwall/gjson v1.6.1
	github.com/xeipuuv/gojsonschema v1.2.0
	go.etcd.io/etcd v3.3.25+incompatible
	go.uber.org/zap v1.16.0
	gopkg.in/yaml.v2 v2.3.0
)
