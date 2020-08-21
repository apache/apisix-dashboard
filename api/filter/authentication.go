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

			if _, ok := conf.UserList[claims.Subject]; !ok {
        c.AbortWithStatusJSON(http.StatusUnauthorized, errno.FromMessage(errno.ForbiddenError).Response())
        return
      }
		}
		c.Next()
	}
}
