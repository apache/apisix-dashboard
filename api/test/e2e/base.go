package e2e

import (
	"github.com/apisix/manager-api/conf"
	"github.com/apisix/manager-api/internal"
	"github.com/apisix/manager-api/internal/core/storage"
	"github.com/apisix/manager-api/internal/core/store"
	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
	"os"
	"strings"
	"time"
)

var accessToken string
var handler *gin.Engine

func init() {
	//init auth token
	if err := storage.InitETCDClient(strings.Split(os.Getenv("APIX_ETCD_ENDPOINTS"), ",")); err != nil {
		panic(err)
	}
	if err := store.InitStores(); err != nil {
		panic(err)
	}

	claims := jwt.StandardClaims{
		Subject:   "admin",
		IssuedAt:  time.Now().Unix(),
		ExpiresAt: time.Now().Add(time.Second * time.Duration(conf.AuthenticationConfig.Session.ExpireTime)).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	accessToken, _ = token.SignedString([]byte(conf.AuthenticationConfig.Session.Secret))

	// init handler
	handler = internal.SetUpRouter()
}
