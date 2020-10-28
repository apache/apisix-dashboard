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
)

func TestRouteHost(t *testing.T) {
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

	//create route
	e.PUT("/apisix/admin/routes/r1").WithText(`{
        "uri": "/hello_",
        "hosts": ["foo.com", "*.bar.com"],
        "upstream": {
            "nodes": {
                "172.16.238.120:1980": 1
            },
            "type": "roundrobin"
        }
    }`).
		WithHeader("Authorization", accessToken).
		Expect().
		Status(http.StatusOK)

	//access to APISIX
	e2 := httpexpect.New(t, "http://127.0.0.1:9080")

	//hit route -- not found
	e2.GET("/not_found").
		Expect().
		Status(http.StatusNotFound)

	//hit route -- not found
	e2.GET("/not_found").
		WithHeader("Host", "not_found.com").
		Expect().
		Status(http.StatusNotFound)

	//hit route - ok
	e2.GET("/hello_").
		WithHeader("Host", "foo.com").
		Expect().
		Status(http.StatusOK)

}
