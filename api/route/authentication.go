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
	}
}
