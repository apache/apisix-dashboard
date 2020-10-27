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
package e2e

import (
	"net/http"
	"os"
	"strings"
	"testing"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/gavv/httpexpect/v2"

	"github.com/apisix/manager-api/conf"
	"github.com/apisix/manager-api/internal"
	"github.com/apisix/manager-api/internal/core/storage"
	"github.com/apisix/manager-api/internal/core/store"
)

var accessToken string

func init() {
	if err := storage.InitETCDClient(strings.Split(os.Getenv("APIX_ETCD_ENDPOINTS"), ",")); err != nil {
		panic(err)
	}
	if err := store.InitStores(); err != nil {
		panic(err)
	}

	claims := jwt.StandardClaims{
		Subject:   "admin",
		IssuedAt:  time.Now().Unix(),
		ExpiresAt: time.Now().Add(time.Second * time.Duration(conf.AuthenticationConfig.Session.ExpireTime)).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	accessToken, _ = token.SignedString([]byte(conf.AuthenticationConfig.Session.Secret))
}

func TestBalancer(t *testing.T) {

	handler := internal.SetUpRouter()

	e := httpexpect.WithConfig(httpexpect.Config{
		Client: &http.Client{
			Transport: httpexpect.NewBinder(handler),
			Jar:       httpexpect.NewJar(),
		},
		Reporter: httpexpect.NewAssertReporter(t),
		Printers: []httpexpect.Printer{
			httpexpect.NewDebugPrinter(t, true),
		},
	})

	e.PUT("/apisix/admin/routes/1").WithText(`{
        "uri": "/server_port",
        "upstream": {
            "key": "remote_addr",
            "type": "chash",
            "nodes": {
                "127.0.0.1:1980": 1,
                "127.0.0.1:1981": 1
            }
        }
    }`).
		WithHeader("Authorization", accessToken).
		Expect().
		Status(http.StatusOK)

	e2 := httpexpect.New(t, "http://127.0.0.1:9080")
	e2.GET("/bad-path").
		Expect().
		Status(http.StatusNotFound)

}
