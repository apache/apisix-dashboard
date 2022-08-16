package iam

import (
	"net/http"

	"github.com/gin-gonic/gin"

	iamDef "github.com/apache/apisix-dashboard/api/pkg/iam"
)

var (
	access iamDef.Access
)

func Filter() gin.HandlerFunc {
	return func(c *gin.Context) {
		if access != nil {
			identity := c.MustGet("identity").(string)
			err := access.Check(identity, c.Request.URL.Path, c.Request.Method)
			if err != nil {
				c.AbortWithStatus(http.StatusForbidden)
				return
			}
		}

		c.Next()
	}
}

// SetAccessImplementation provides a function that allows developers to replace the built-in access control implementation
func SetAccessImplementation(impl iamDef.Access) {
	access = impl
}
