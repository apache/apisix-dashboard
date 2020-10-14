package internal

import (
	"github.com/gin-contrib/pprof"
	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/cookie"
	"github.com/gin-gonic/gin"

	"github.com/apisix/manager-api/conf"
	"github.com/apisix/manager-api/filter"
	"github.com/apisix/manager-api/internal/handler"
	"github.com/apisix/manager-api/internal/handler/authentication"
	"github.com/apisix/manager-api/internal/handler/consumer"
	"github.com/apisix/manager-api/internal/handler/healthz"
	"github.com/apisix/manager-api/internal/handler/plugin"
	"github.com/apisix/manager-api/internal/handler/route"
	"github.com/apisix/manager-api/internal/handler/service"
	"github.com/apisix/manager-api/internal/handler/ssl"
	"github.com/apisix/manager-api/internal/handler/upstream"
)

func SetUpRouter() *gin.Engine {
	if conf.ENV != conf.LOCAL && conf.ENV != conf.BETA {
		gin.SetMode(gin.DebugMode)
	} else {
		gin.SetMode(gin.ReleaseMode)
	}
	r := gin.New()
	store := cookie.NewStore([]byte("secret"))
	r.Use(sessions.Sessions("session", store))
	r.Use(filter.CORS(), filter.Authentication(), filter.RequestId(), filter.RecoverHandler())

	factories := []handler.RegisterFactory{
		route.NewHandler,
		ssl.NewHandler,
		consumer.NewHandler,
		upstream.NewHandler,
		service.NewHandler,
		plugin.NewHandler,
		healthz.NewHandler,
		authentication.NewHandler,
	}

	for i := range factories {
		h, err := factories[i]()
		if err != nil {
			panic(err)
		}
		h.ApplyRoute(r)
	}

	pprof.Register(r)

	return r
}
