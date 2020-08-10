package route

import (
	"github.com/apisix/manager-api/conf"
	"github.com/apisix/manager-api/errno"
	"github.com/gin-gonic/gin"
	"net/http"
)

type userTokenData struct {
	Token  string `json:"token"`
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
		c.AbortWithStatusJSON(http.StatusOK, errno.FromMessage(errno.SystemSuccess).ItemResponse(userTokenData{Token: "admin"}))
		return
	}
}
