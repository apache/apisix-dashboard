package identity

import (
	"encoding/csv"
	"errors"
	"github.com/apache/apisix-dashboard/api/internal/log"
	"github.com/casbin/casbin/v2"
	"github.com/gin-gonic/gin"
	"io"
	"net/http"
	"os"
	"strings"
)

type DefaultIdentifier struct{}

func (DefaultIdentifier) Check(userId, resource, action string) error {
	enforce, err := casbin.NewEnforcer("./model.conf", "./policy.csv")
	enforce.AddFunction("identify", keyMatchFunc)
	if err != nil {
		return err
	}
	userId = "user_" + userId
	normal, _ := enforce.HasRoleForUser(userId, "role_admin")
	ok, _ := enforce.Enforce(userId, resource, action)
	if !normal || !ok {
		return errors.New("without permission")
	}
	return nil
}

func CheckForPower(i Identifier) gin.HandlerFunc {
	return func(c *gin.Context) {
		// judge whether the route is under the control of admin
		f, err := os.Open("./policy.csv")
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
			if keyMatch(row[2], c.Request.URL.Path) {
				break
			}
		}

		// get the identity of user
		username := c.MustGet("Username").(string)

		if err := i.Check(username, c.Request.URL.Path, c.Request.Method); err != nil {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
				"code":    010013,
				"message": "not enough power to this route",
			})
			return
		}
		c.Next()
	}
}

// KeyMatchFunc wrap KeyMatch to meet with casbin's need of custom functions
func keyMatchFunc(args ...interface{}) (interface{}, error) {
	key1, key2 := args[0].(string), args[1].(string)
	return (bool)(keyMatch(key1, key2)), nil
}

// KeyMatch can match three patterns of route /* && /:id && /:id/*
func keyMatch(key1 string, key2 string) bool {
	var k int
	var p int
	i := strings.Index(key2, "*")
	j := strings.Index(key2, ":")
	if j != -1 {
		p = strings.Index(key1[j:], "/")
		k = strings.Index(key2[j:], "/")
	}

	if i == -1 && j == -1 {
		return key1 == key2
	}

	if i == -1 && j != -1 {
		if p == -1 && k == -1 && len(key1) >= len(key2) {
			return key1[:j] == key2[:j]
		} else if p == -1 && k != -1 || p != -1 && k == -1 {
			return false
		}
		return key1[:j] == key2[:j] && key1[j+p:] == key2[j+k:]
	}

	if i < j {
		return key1[:i] == key2[:i]
	}

	if i > j {
		if p == -1 && k == -1 && len(key1) >= len(key2) {
			return key1[:j] == key2[:j]
		} else if p == -1 && k != -1 || p != -1 && k == -1 {
			return false
		}
		return key1[:j] == key2[:j] && key1[j+p:i+p-k] == key2[j+k:i]
	}
	return false
}
