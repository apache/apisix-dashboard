package filter

import (
	"net/url"
	"strings"

	"github.com/gin-gonic/gin"
)

// InvalidRequest provides a filtering mechanism for illegitimate requests
func InvalidRequest() gin.HandlerFunc {
	return func(c *gin.Context) {
		if !checkURL(c.Request.URL) {
			c.AbortWithStatus(403)
		}
		c.Next()
	}
}

func checkURL(url *url.URL) bool {
	if strings.Contains(url.Path, "..") {
		return false
	}
	return true
}
