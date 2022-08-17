package iam

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/apache/apisix-dashboard/api/internal/config"
	iamDef "github.com/apache/apisix-dashboard/api/pkg/iam"
	"github.com/apache/apisix-dashboard/api/pkg/iam/demo"
)

var (
	access     iamDef.Access
	accessLock bool
)

func Filter(cfg config.Config) gin.HandlerFunc {
	// When feature gate demoIAMAccess is configured to be on,
	// set the access implementation to Demo
	if cfg.FeatureGate.DemoIAMAccess {
		access = demo.Access{}
	}

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
// This function is allowed to be called only once and returns true on success.
// After setting, the access implementation will be locked and another attempt to set it will return false.
func SetAccessImplementation(impl iamDef.Access) bool {
	if accessLock {
		return false
	}
	access = impl
	accessLock = true
	return true
}
