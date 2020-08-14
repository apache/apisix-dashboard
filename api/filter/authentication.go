package filter

import (
	"github.com/apisix/manager-api/conf"
	"github.com/apisix/manager-api/errno"
	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
	"net/http"
	"strings"
)

func Authentication() gin.HandlerFunc {
	return func(c *gin.Context) {
		if c.Request.URL.Path != "/user/login" && strings.HasPrefix(c.Request.URL.Path,"/apisix") {
			tokenStr := c.GetHeader("Authorization")

			// verify token
			token, err := jwt.ParseWithClaims(tokenStr, &jwt.StandardClaims{}, func(token *jwt.Token) (interface{}, error) {
				return []byte(conf.AuthenticationConfig.Session.Secret), nil
			})

			if err != nil {
				c.AbortWithStatusJSON(http.StatusUnauthorized, errno.FromMessage(errno.ForbiddenError).Response())
				return
			}

			claims, ok := token.Claims.(*jwt.StandardClaims)
			if !ok {
				c.AbortWithStatusJSON(http.StatusUnauthorized, errno.FromMessage(errno.ForbiddenError).Response())
				return
			}

			if err := token.Claims.Valid(); err != nil {
				c.AbortWithStatusJSON(http.StatusUnauthorized, errno.FromMessage(errno.ForbiddenError).Response())
				return
			}

			if claims.Subject == "" {
				c.AbortWithStatusJSON(http.StatusUnauthorized, errno.FromMessage(errno.ForbiddenError).Response())
				return
			}
		}
		c.Next()
	}
}
