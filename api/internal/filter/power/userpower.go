/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package power

import (
	"errors"
	"github.com/apisix/manager-api/internal/log"
	"github.com/casbin/casbin/v2"
	"github.com/gin-gonic/gin"
	"net/http"
	"regexp"
	"strings"
)

type Authorization interface {
	Check(userId, resource, action string) error
}

type Identity struct {
}

func (Identity) Check(userId, resource, action string) error {
	enforce, err := casbin.NewEnforcer("./model.conf", "./policy.csv")
	enforce.AddFunction("my_func", keyMatchFunc)
	if err != nil {
		log.Warn("power fail to be checked:", err)
		return err
	}
	normal, _ := enforce.HasRoleForUser(userId, "role_admin")
	ok, _ := enforce.Enforce(userId, resource, action)
	if !normal || !ok {
		return errors.New("without permission")
	}
	return nil
}

type DashboardReplace struct {
	SelfAuthorization *Authorization
}

func (dr *DashboardReplace) ReplaceAuthorization(auth Authorization) {
	dr.SelfAuthorization = &auth
}

func (dr DashboardReplace) GetAuthorization() Authorization {
	return *dr.SelfAuthorization
}

func CheckForPower(auth Authorization) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Set("id", "admin")
		id, ok := c.MustGet("id").(string)
		if !ok {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"code":    010013,
				"message": "request unauthorized",
			})
			return
		}

		regexpAdmin, _ := regexp.Compile("(admin)")
		exist := regexpAdmin.MatchString(c.Request.URL.Path)
		if !exist || c.Request.Method == "GET" {
			c.Next()
			return
		}

		err := auth.Check("user_"+id, c.Request.URL.Path, c.Request.Method)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"code":    010013,
				"message": "request unauthorized",
			})
			return
		}
		c.Next()
	}
}

// 负责匹配*与:两种路由模式

func keyMatchFunc(args ...interface{}) (interface{}, error) {
	key1, key2 := args[0].(string), args[1].(string)
	return (bool)(keyMatch(key1, key2)), nil
}

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
