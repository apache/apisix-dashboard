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
	"testing"

	"github.com/gavv/httpexpect/v2"

	"github.com/apisix/manager-api/internal"
)

func TestConsumer(t *testing.T) {

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

	//create consumer
	e.PUT("/apisix/admin/consumers").WithText(`{
        "username": "jack",
        "plugins": {
            "limit-count": {
                "count": 2,
                "time_window": 60,
                "rejected_code": 503,
                "key": "remote_addr"
            },
            "key-auth": {
                "key": "auth-one"
            }
        }
    }`).
		WithHeader("Authorization", accessToken).
		Expect().
		Status(http.StatusOK)

	//create route
	e.PUT("/apisix/admin/routes/c1").WithText(`{
        "plugins": {
            "key-auth": {}
        },
        "upstream": {
            "nodes": {
                "172.16.238.120:1980": 1
            },
            "type": "roundrobin"
        },
        "uri": "/hello"
    }`).
		WithHeader("Authorization", accessToken).
		Expect().
		Status(http.StatusOK)

	//invalid consumer
	e2 := httpexpect.New(t, "http://127.0.0.1:9080")
	e2.GET("/hello").
		WithHeader("apikey", "123").
		Expect().
		Status(http.StatusUnauthorized)

	//hit route
	e3 := httpexpect.New(t, "http://127.0.0.1:9080")
	e3.GET("/hello").
		WithHeader("apikey", "auth-one").
		Expect().
		Status(http.StatusOK)

	//TODO -- TEST 5: up the limit at consumer-plugin.t

	////create consumer with two auth plugins - fail
	//e.PUT("/apisix/admin/consumers").WithText(`{
	//      "username": "jack",
	//      "plugins": {
	//          "limit-count": {
	//              "count": 2,
	//              "time_window": 60,
	//              "rejected_code": 503,
	//              "key": "remote_addr"
	//          },
	//          "key-auth": {
	//              "key": "auth-one"
	//          },
	//          "jwt-auth": {
	//              "key": "auth-one"
	//          }
	//      }
	//  }`).
	//	WithHeader("Authorization", accessToken).
	//	Expect().
	//	Status(http.StatusBadRequest)

	//missing auth plugins - fail
	//e.PUT("/apisix/admin/consumers").WithText(`{
	//      "username": "jack",
	//      "plugins": {
	//          "limit-count": {
	//              "count": 2,
	//              "time_window": 60,
	//              "rejected_code": 503,
	//              "key": "remote_addr"
	//          }
	//      }
	//  }`).
	//	WithHeader("Authorization", accessToken).
	//	Expect().
	//	Status(http.StatusBadRequest)

	//TODO -- TEST 8: use the new configuration after the consumer's configuration is updated

}
