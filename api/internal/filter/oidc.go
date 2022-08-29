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
	"encoding/json"
	"fmt"
	"github.com/apisix/manager-api/internal/conf"
	"github.com/gin-gonic/gin"
	"net/http"
	"strings"
)

func Oidc() gin.HandlerFunc {
	return func(c *gin.Context) {
		if c.Request.URL.Path == "/apisix/admin/oidc/login" {
			cookie, _ := conf.CookieStore.Get(c.Request, "oidc")
			cookie.Save(c.Request, c.Writer)

			// 携带必要的参数，跳转到authing的登录页面
			redirectUrl := fmt.Sprintf("http://127.0.0.1:%d/apisix/admin/%s", conf.ServerPort, conf.OidcConf.RedirectUri)
			url := "https://kjoenlkbhfkg-demo.authing.cn/oidc/auth?" +
				fmt.Sprintf("client_id=%s&client_secret=%s&redirect_uri=%s",
					conf.OidcConf.ClientId, conf.OidcConf.ClientSecret, redirectUrl) +
				"&response_type=code&scope=openid&state=4756806&prompt=consent"
			c.Redirect(302, url)
			c.Abort()
			return
		}

		if c.Request.URL.Path == "/apisix/admin/oidc/callback" {
			// 获取cookie，如果没有从apisix/admin/oidc/login页面顺着过来，不会有这个cookie，于是cookie.IsNew就为true，会返回403状态码
			cookie, _ := conf.CookieStore.Get(c.Request, "oidc")
			if cookie.IsNew {
				c.AbortWithStatus(403)
			}

			//获取携带的授权码code
			code := c.Query("code")
			httpClient := new(http.Client)
			var req *http.Request
			var resp *http.Response
			var err error

			//访问authing指定api，用code换取access_token
			redirectUrl := fmt.Sprintf("http://127.0.0.1:%d/apisix/admin/%s", conf.ServerPort, conf.OidcConf.RedirectUri)
			payload := strings.NewReader(fmt.Sprintf("client_id=%s&client_secret=%s&code=%s&redirect_uri=%s&"+
				"grant_type=authorization_code", conf.OidcConf.ClientId, conf.OidcConf.ClientSecret, code, redirectUrl))
			uri := "https://kjoenlkbhfkg-demo.authing.cn/oidc/token"
			req, _ = http.NewRequest("POST", uri, payload)
			header := req.Header
			header.Add("Accept", "application/json")
			header.Add("Content-Type", "application/x-www-form-urlencoded")

			resp, err = httpClient.Do(req)
			if err != nil {
				c.AbortWithStatus(500)
			}

			tokenInfo := make(map[string]string)
			err = json.NewDecoder(resp.Body).Decode(&tokenInfo)
			if err != nil {
				c.AbortWithStatus(500)
			}

			//访问authing指定api，用access_token换取用户的id
			uri = "https://kjoenlkbhfkg-demo.authing.cn/oidc/me"
			req, err = http.NewRequest("GET", uri, nil)
			if err != nil {
				c.AbortWithStatus(500)
			}
			header = req.Header
			header.Add("Authorization", "Bearer "+tokenInfo["access_token"])

			resp, err = httpClient.Do(req)
			if err != nil {
				c.AbortWithStatus(500)
			}

			userInfo := make(map[string]string)
			_ = json.NewDecoder(resp.Body).Decode(&userInfo)

			//设置cookie的oidc_id参数和过期时间，并保存cookie
			cookie, _ = conf.CookieStore.Get(c.Request, "oidc")
			cookie.Options.MaxAge = conf.OidcConf.ExpireTime
			cookie.Values["oidc_id"] = userInfo["sub"]
			cookie.Save(c.Request, c.Writer)
			//设置全局变量OidcId和IfOidcLogin
			conf.OidcId = userInfo["sub"]
			conf.OidcLogin = true
			c.Abort()
			return
		}

		if c.Request.URL.Path == "/apisix/admin/oidc/logout" {
			// 如果获取不到cookie，就返回403并退出
			cookie, _ := conf.CookieStore.Get(c.Request, "oidc")
			if cookie.IsNew {
				c.AbortWithStatus(403)
				return
			}

			//设置cookie过期并且保存cookie
			cookie.Options.MaxAge = -1
			cookie.Save(c.Request, c.Writer)
			c.Abort()
			return
		}

		c.Next()
	}
}
