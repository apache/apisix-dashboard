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
	"io/ioutil"
	"net/http"
	"net/url"
	"strings"

	"github.com/PuerkitoBio/goquery"
	"github.com/onsi/ginkgo"
	"github.com/onsi/gomega"

	"github.com/apisix/manager-api/test/e2e/base"
)

var _ = ginkgo.Describe("Oidc-Login", func() {
	ginkgo.Context("test apisix/admin/oidc/login", func() {
		ginkgo.It("should return status-code 302", func() {
			gomega.Expect(accessOidcLogin()).To(gomega.Equal(http.StatusFound))
		})
	})
	ginkgo.Context("test apisix/admin/oidc/callback", func() {
		ginkgo.It("should return status-code 200", func() {
			gomega.Expect(accessOidcCallback()).To(gomega.Equal(http.StatusOK))
		})
	})

	ginkgo.Context("access apisix/admin/routes with cookie", func() {
		ginkgo.It("should return status-code 200", func() {
			gomega.Expect(accessRoutesWithCookie(true)).To(gomega.Equal(http.StatusOK))
		})
	})

	ginkgo.Context("access apisix/admin/oidc/logout with cookie", func() {
		ginkgo.It("should return status-code 200", func() {
			gomega.Expect(accessOidcLogoutWithCookie(true)).To(gomega.Equal(http.StatusOK))
		})
	})

	ginkgo.Context("access apisix/admin/routes with invalid cookie", func() {
		ginkgo.It("should return status-code 401", func() {
			gomega.Expect(accessRoutesWithCookie(false)).To(gomega.Equal(http.StatusUnauthorized))
		})
	})

	ginkgo.Context("access apisix/admin/oidc/logout with invalid cookie", func() {
		ginkgo.It("should return status-code 403", func() {
			gomega.Expect(accessOidcLogoutWithCookie(false)).To(gomega.Equal(http.StatusForbidden))
		})
	})
})

func accessOidcLogin() int {
	var req *http.Request
	var resp *http.Response
	var Client = &http.Client{
		CheckRedirect: func(req *http.Request, via []*http.Request) error {
			return http.ErrUseLastResponse
		},
	}

	// access apisix/admin/oidc/login
	req, _ = http.NewRequest("GET", "http://127.0.0.1:9000/apisix/admin/oidc/login", nil)
	resp, _ = Client.Do(req)

	// return status-code
	return resp.StatusCode
}

func accessOidcCallback() int {
	var authenticationUrl string
	var loginUrl string
	var req *http.Request
	var resp *http.Response
	var Client = &http.Client{
		CheckRedirect: func(req *http.Request, via []*http.Request) error {
			return http.ErrUseLastResponse
		},
	}

	// access apisix/admin/oidc/login to get the authentication-url
	req, _ = http.NewRequest("GET", "http://127.0.0.1:9000/apisix/admin/oidc/login", nil)
	resp, _ = Client.Do(req)
	authenticationUrl = resp.Header.Get("Location")

	// access the authentication-url
	req, _ = http.NewRequest("GET", authenticationUrl, nil)
	resp, _ = Client.Do(req)

	// get the login-url from html
	body, _ := ioutil.ReadAll(resp.Body)
	dom, _ := goquery.NewDocumentFromReader(strings.NewReader(string(body)))
	dom.Find("#kc-form-login").Each(func(i int, selection *goquery.Selection) {
		loginUrl = selection.Get(0).Attr[2].Val
	})

	// set username & password
	formValues := url.Values{}
	formValues.Set("username", "wang")
	formValues.Set("password", "20030414")
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
	resp, _ = Client.Do(req)
	body, _ = ioutil.ReadAll(resp.Body)

	// access apisix/admin/oidc/login with code
	callbackUrl := resp.Header.Get("Location")
	req, _ = http.NewRequest("GET", callbackUrl, nil)
	resp, _ = Client.Do(req)

	// save cookie
	cookies = resp.Cookies()
	for _, cookie := range cookies {
		base.OidcCookie = append(base.OidcCookie, *cookie)
	}

	// return status-code
	return resp.StatusCode
}

func accessRoutesWithCookie(setCookie bool) int {
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
	resp, _ = client.Do(req)

	// return status-code
	return resp.StatusCode
}

func accessOidcLogoutWithCookie(setCookie bool) int {
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
	resp, _ = client.Do(req)

	// return status-code
	return resp.StatusCode
}
