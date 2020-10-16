module github.com/apisix/manager-api

go 1.13

require (
	github.com/api7/apitest v1.4.9
	github.com/api7/go-jsonpatch v0.0.0-20180223123257-a8710867776e
	github.com/coreos/etcd v3.3.25+incompatible // indirect
	github.com/coreos/go-systemd v0.0.0-20191104093116-d3cd4ed1dbcf // indirect
	github.com/dgrijalva/jwt-go v3.2.0+incompatible
	github.com/dustin/go-humanize v1.0.0 // indirect
	github.com/gin-contrib/pprof v1.3.0
	github.com/gin-contrib/sessions v0.0.3
	github.com/gin-gonic/gin v1.6.3
	github.com/go-sql-driver/mysql v1.5.0 // indirect
	github.com/gogo/protobuf v1.3.1 // indirect
	github.com/google/uuid v1.1.2 // indirect
	github.com/jinzhu/gorm v1.9.12
	github.com/magiconair/properties v1.8.1
	github.com/satori/go.uuid v1.2.0
	github.com/shiningrush/droplet v0.1.2
	github.com/shiningrush/droplet/wrapper/gin v0.1.0
	github.com/sirupsen/logrus v1.6.0
	github.com/sony/sonyflake v1.0.0
	github.com/spf13/viper v1.7.1
	github.com/steinfletcher/apitest v1.4.10 // indirect
	github.com/stretchr/testify v1.6.1
	github.com/tidwall/gjson v1.6.0
	github.com/xeipuuv/gojsonschema v1.2.0
	go.etcd.io/etcd v3.3.25+incompatible
	go.uber.org/zap v1.16.0
	golang.org/x/net v0.0.0-20200904194848-62affa334b73 // indirect
	golang.org/x/sys v0.0.0-20200915084602-288bc346aa39 // indirect
	golang.org/x/text v0.3.3 // indirect
	gopkg.in/resty.v1 v1.12.0
	sigs.k8s.io/yaml v1.2.0 // indirect
)

replace google.golang.org/grpc => google.golang.org/grpc v1.26.0
