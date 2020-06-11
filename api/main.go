package main

import (
	"fmt"
	"github.com/api7/api7-manager-api/conf"
	"github.com/api7/api7-manager-api/filter"
	"github.com/api7/api7-manager-api/log"
	"github.com/api7/api7-manager-api/route"
	"github.com/gin-contrib/pprof"
	"github.com/gin-gonic/gin"
	"net/http"
	"time"
)

var logger = log.GetLogger()

func setUpRouter() *gin.Engine {
	if conf.ENV != conf.LOCAL && conf.ENV != conf.BETA {
		gin.SetMode(gin.DebugMode)
	} else {
		gin.SetMode(gin.ReleaseMode)
	}
	r := gin.New()

	r.Use(filter.CORS(), filter.RequestId(), filter.RequestLogHandler(), filter.RecoverHandler())
	route.AppendHealthCheck(r)
	route.AppendRoute(r)
	route.AppendSsl(r)
	route.AppendPlugin(r)

	pprof.Register(r)

	return r
}

func main() {
	// init
	conf.InitializeMysql()
	// 路由
	r := setUpRouter()
	addr := fmt.Sprintf(":%d", conf.ServerPort)
	s := &http.Server{
		Addr:         addr,
		Handler:      r,
		ReadTimeout:  time.Duration(1000) * time.Millisecond,
		WriteTimeout: time.Duration(5000) * time.Millisecond,
	}
	s.ListenAndServe()
}
