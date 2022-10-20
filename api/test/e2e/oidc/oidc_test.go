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
package oidc_test

import (
	"bytes"
	"context"
	"io/ioutil"
	"math/rand"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/Nerzal/gocloak/v11"
	"github.com/PuerkitoBio/goquery"
	"github.com/onsi/ginkgo"
	"github.com/onsi/gomega"

	"github.com/apisix/manager-api/test/e2e/base"
)

var _ = ginkgo.Describe("Oidc-Login", func() {
	ginkgo.Context("test apisix/admin/oidc/login", func() {
		ginkgo.It("should return status-code 302", func() {
			statusCode, err := accessOidcLogin()
			gomega.Expect(err).ShouldNot(gomega.HaveOccurred(), "do request")
			gomega.Expect(statusCode).To(gomega.Equal(http.StatusFound))
		})
	})

	ginkgo.Context("test apisix/admin/oidc/callback", func() {
		ginkgo.It("should return status-code 200", func() {
			statusCode, err := accessOidcCallback()
			gomega.Expect(err).ShouldNot(gomega.HaveOccurred(), "do request")
			gomega.Expect(statusCode).To(gomega.Equal(http.StatusOK))
		})
	})

	ginkgo.Context("access apisix/admin/routes with cookie", func() {
		ginkgo.It("should return status-code 200", func() {
			statusCode, err := accessRoutesWithCookie(true)
			gomega.Expect(err).ShouldNot(gomega.HaveOccurred(), "do request")
			gomega.Expect(statusCode).To(gomega.Equal(http.StatusOK))
		})
	})

	ginkgo.Context("access apisix/admin/oidc/logout with cookie", func() {
		ginkgo.It("should return status-code 200", func() {
			statusCode, err := accessOidcLogoutWithCookie(true)
			gomega.Expect(err).ShouldNot(gomega.HaveOccurred(), "do request")
			gomega.Expect(statusCode).To(gomega.Equal(http.StatusOK))
		})
	})

	ginkgo.Context("access apisix/admin/routes with invalid cookie", func() {
		ginkgo.It("should return status-code 401", func() {
			statusCode, err := accessRoutesWithCookie(false)
			gomega.Expect(err).ShouldNot(gomega.HaveOccurred(), "do request")
			gomega.Expect(statusCode).To(gomega.Equal(http.StatusUnauthorized))
		})
	})

	ginkgo.Context("access apisix/admin/oidc/logout with invalid cookie", func() {
		ginkgo.It("should return status-code 403", func() {
			statusCode, err := accessOidcLogoutWithCookie(false)
			gomega.Expect(err).ShouldNot(gomega.HaveOccurred(), "do request")
			gomega.Expect(statusCode).To(gomega.Equal(http.StatusForbidden))
		})
	})
})

func accessOidcLogin() (int, error) {
	var err error
	var req *http.Request
	var resp *http.Response
	var Client = &http.Client{
		CheckRedirect: func(req *http.Request, via []*http.Request) error {
			return http.ErrUseLastResponse
		},
	}

	req, _ = http.NewRequest("GET", "http://127.0.0.1:9000/apisix/admin/oidc/login", nil)
	resp, err = Client.Do(req)
	if err != nil {
		return resp.StatusCode, err
	}

	// return status-code
	return resp.StatusCode, err
}

func createUser(authenticationUrl string) string {
	u, _ := url.Parse(authenticationUrl)
	client := gocloak.NewClient("http://" + u.Host)
	ctx := context.Background()
	token, _ := client.LoginAdmin(ctx, "admin", "admin", "master")

	username := GetRandomString(3)
	user := gocloak.User{
		FirstName: gocloak.StringP(GetRandomString(3)),
		LastName:  gocloak.StringP(GetRandomString(3)),
		Email:     gocloak.StringP(GetRandomString(3)),
		Enabled:   gocloak.BoolP(true),
		Username:  gocloak.StringP(username),
	}

	id, _ := client.CreateUser(ctx, token.AccessToken, "master", user)

	_ = client.SetPassword(ctx, token.AccessToken, id, "master", "123456", false)
	return username
}

func accessOidcCallback() (int, error) {
	var authenticationUrl string
	var loginUrl string
	var err error
	var req *http.Request
	var resp *http.Response
	var client = &http.Client{
		CheckRedirect: func(req *http.Request, via []*http.Request) error {
			return http.ErrUseLastResponse
		},
	}

	// access apisix/admin/oidc/login to get the authentication-url
	req, _ = http.NewRequest("GET", "http://127.0.0.1:9000/apisix/admin/oidc/login", nil)
	resp, err = client.Do(req)
	if err != nil {
		return resp.StatusCode, err
	}
	authenticationUrl = resp.Header.Get("Location")

	// create a user
	username := createUser(authenticationUrl)

	// access the authentication-url
	req, _ = http.NewRequest("GET", authenticationUrl, nil)
	resp, err = client.Do(req)
	if err != nil {
		return resp.StatusCode, err
	}

	// get the login-url from html
	body, _ := ioutil.ReadAll(resp.Body)
	dom, _ := goquery.NewDocumentFromReader(strings.NewReader(string(body)))
	dom.Find("#kc-form-login").Each(func(i int, selection *goquery.Selection) {
		loginUrl = selection.Get(0).Attr[2].Val
	})

	// set username & password
	formValues := url.Values{}
	formValues.Set("username", username)
	formValues.Set("password", "123456")
	formDataStr := formValues.Encode()
	formDataBytes := []byte(formDataStr)
	formBytesReader := bytes.NewReader(formDataBytes)
	req, _ = http.NewRequest("POST", loginUrl, formBytesReader)
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	// set cookies
	cookies := resp.Cookies()
	for _, cookie := range cookies {
		req.AddCookie(cookie)
	}

	// access the login-url to login
	resp, err = client.Do(req)
	if err != nil {
		return resp.StatusCode, err
	}

	// access apisix/admin/oidc/login with code
	callbackUrl := resp.Header.Get("Location")
	req, _ = http.NewRequest("GET", callbackUrl, nil)
	resp, err = client.Do(req)
	if err != nil {
		return resp.StatusCode, err
	}

	// save cookie
	cookies = resp.Cookies()
	for _, cookie := range cookies {
		base.OidcCookie = append(base.OidcCookie, *cookie)
	}

	// return status-code
	return resp.StatusCode, err
}

func accessRoutesWithCookie(setCookie bool) (int, error) {
	var err error
	var req *http.Request
	var resp *http.Response
	var client http.Client

	req, _ = http.NewRequest("GET", "http://127.0.0.1:9000/apisix/admin/routes", nil)

	// set cookie or not
	if setCookie {
		for _, cookie := range base.OidcCookie {
			req.AddCookie(&cookie)
		}
	}

	// access apisix/admin/routes
	resp, err = client.Do(req)
	if err != nil {
		return resp.StatusCode, err
	}

	// return status-code
	return resp.StatusCode, err
}

func accessOidcLogoutWithCookie(setCookie bool) (int, error) {
	var err error
	var req *http.Request
	var resp *http.Response
	var client http.Client

	req, _ = http.NewRequest("GET", "http://127.0.0.1:9000/apisix/admin/oidc/logout", nil)

	// set cookie or not
	if setCookie {
		for _, cookie := range base.OidcCookie {
			req.AddCookie(&cookie)
		}
	}

	// access apisix/admin/oidc/logout
	resp, err = client.Do(req)
	if err != nil {
		return resp.StatusCode, err
	}

	// return status-code
	return resp.StatusCode, err
}

func GetRandomString(l int) string {
	str := "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
	bytes := []byte(str)
	var result []byte
	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	for i := 0; i < l; i++ {
		result = append(result, bytes[r.Intn(len(bytes))])
	}
	return string(result)
}
