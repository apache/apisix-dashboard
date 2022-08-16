package iam

import (
	"encoding/csv"
	"errors"
<<<<<<< HEAD:api/pkg/iam/default.go
	"fmt"
=======
	"github.com/apache/apisix-dashboard/api/internal/conf"
	"github.com/casbin/casbin/v2"
	"github.com/gin-gonic/gin"
>>>>>>> e80fcffa (chore:optimize the default strategy):api/pkg/identity/default.go
	"io"
	"net/http"
	"os"
	"strings"

	"github.com/apache/apisix-dashboard/api/internal/conf"
	"github.com/casbin/casbin/v2"
	"github.com/gin-gonic/gin"

	"github.com/apache/apisix-dashboard/api/internal/log"
)

type defaultIdentifier struct{}

func (defaultIdentifier) Check(userId, method, path string) error {
	// judge whether the route is under the control of admin
	f, err := os.Open(conf.PolicyPath)
	if err != nil {
		return err
	}
	reader := csv.NewReader(f)
	for {
		row, err := reader.Read()
		if err == io.EOF {
			return err
		}
		if KeyMatch(path, row[2]) && row[3] == method {
			break
		}
	}
	
	enforce, err := casbin.NewEnforcer(conf.ModelPath, conf.PolicyPath)
	if err != nil {
		return err
	}
	enforce.AddFunction("identify", KeyMatchFunc)
	normal, err := enforce.HasRoleForUser("user_"+userId, "role_admin")
	if err != nil {
		return err
	}
	if !normal {
		return errors.New("without permission")
	}
	return nil
}

func CheckForPower(i Identifier) gin.HandlerFunc {
	return func(c *gin.Context) {
<<<<<<< HEAD:api/pkg/iam/default.go
		// judge whether the route is under the control of admin
		f, err := os.Open(conf.PolicyPath)
		if err != nil {
			log.Warn("fail to read route")
			return
		}
		reader := csv.NewReader(f)
		for {
			row, err := reader.Read()
			if err == io.EOF {
				c.Next()
				return
			}
			if KeyMatch(c.Request.URL.Path, row[2]) && row[3] == c.Request.Method {
				break
			}
		}

		// get the identity of user
		username := c.MustGet("Username").(string)

		if err := i.Check(username, c.Request.URL.Path, c.Request.Method); err != nil {
=======
		// get the identity of user
		username := c.MustGet("Username").(string)
		err := i.Check(username, c.Request.Method, c.Request.URL.Path)
		if err != nil && err != io.EOF {
>>>>>>> e80fcffa (chore:optimize the default strategy):api/pkg/identity/default.go
			c.AbortWithStatus(http.StatusForbidden)
			return
		}
		c.Next()
	}
}

// KeyMatchFunc wrap KeyMatch to meet with casbin's need of custom functions
func KeyMatchFunc(args ...interface{}) (interface{}, error) {
	key1, key2 := args[0].(string), args[1].(string)
	return (bool)(KeyMatch(key1, key2)), nil
}

// KeyMatch can match three patterns of route /* && /:id && /:id/*
func KeyMatch(key1 string, key2 string) bool {
	i, j := strings.Index(key2, ":"), strings.Index(key2, "*")
	if len(key1) < i+1 {
		return false
	}
	if i != -1 {
		ok := key1[:i-1] == key2[:i-1]
		if j != -1 && ok {
			k, p := strings.Index(key2[i:], "/"), strings.Index(key1[i:], "/")
			if key2[i+k+1] == '*' {
				return true
			}
			return key2[i+k:j] == key1[i+p:i+p+k+1]
		}
		return ok
	} else if j != -1 {
		ok := key1[:j-1] == key2[:j-1]
		if i != -1 && ok {
			k, p := strings.Index(key2[i:], "/"), strings.Index(key1[i:], "/")
			if key2[i+k+1] == '*' {
				return true
			}
			return key2[i+k:j] == key1[i+p:i+p+k+1]
		}
		return ok
	}
	return key1 == key2
}
