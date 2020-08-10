package filter

import (
  "github.com/apisix/manager-api/errno"
  "github.com/gin-contrib/sessions"
  "github.com/gin-gonic/gin"
  "net/http"
  "strings"
)

func Authentication() gin.HandlerFunc {
  return func(c *gin.Context) {
    if c.Request.URL.Path != "/user/login" && strings.HasPrefix(c.Request.URL.Path,"/apisix") {
      session := sessions.Default(c)
      username := session.Get("username")
      if username == nil {
        c.AbortWithStatusJSON(http.StatusForbidden, errno.FromMessage(errno.ForbiddenError).Response())
        return
      }
    }
    c.Next()
  }
}
