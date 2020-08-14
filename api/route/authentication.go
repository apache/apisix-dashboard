package route

import (
	"github.com/apisix/manager-api/conf"
	"github.com/apisix/manager-api/errno"
	jwt "github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
	"net/http"
	"time"
)

type UserSession struct {
	Token string `json:"token"`
}

func AppendAuthentication(r *gin.Engine) *gin.Engine {
	r.POST("/user/login", userLogin)
	return r
}

func userLogin(c *gin.Context) {
	username := c.PostForm("username")
	password := c.PostForm("password")

	if username == "" {
		c.AbortWithStatusJSON(http.StatusBadRequest, errno.FromMessage(errno.InvalidParamDetail, "username is needed").Response())
		return
	}
	if password == "" {
		c.AbortWithStatusJSON(http.StatusBadRequest, errno.FromMessage(errno.InvalidParamDetail, "password is needed").Response())
		return
	}

	user := conf.UserList[username]
	if username != user.Username || password != user.Password {
		c.AbortWithStatusJSON(http.StatusUnauthorized, errno.FromMessage(errno.AuthenticationUserError).Response())
		return
	} else {
		// create JWT for session
		claims := jwt.StandardClaims{
			Subject: username,
			IssuedAt: time.Now().Unix(),
			ExpiresAt: time.Now().Add(time.Second * time.Duration(conf.AuthenticationConfig.Session.ExpireTime)).Unix(),
		}
		token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
		signedToken, _ := token.SignedString([]byte(conf.AuthenticationConfig.Session.Secret))

		// output token
		c.AbortWithStatusJSON(http.StatusOK, errno.FromMessage(errno.SystemSuccess).ItemResponse(&UserSession {
			Token: signedToken,
		}))
		return
	}
}
