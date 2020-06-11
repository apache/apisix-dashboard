package route

import (
	"github.com/api7/api7-manager-api/log"
	"github.com/gin-gonic/gin"
	"net/http"
)

var logger = log.GetLogger()

func healthzHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Copy()
		c.String(http.StatusOK, "pong")
	}
}

func AppendHealthCheck(r *gin.Engine) *gin.Engine {
	r.GET("/ping", healthzHandler())
	return r
}
