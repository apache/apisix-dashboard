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
	"time"
)

func TestRoute_Host(t *testing.T) {

	//create route use hosts
    MangerApiExpect(t).PUT("/apisix/admin/routes/r1").WithText(`{
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

	//sleep
	time.Sleep(time.Duration(100) * time.Millisecond)

	//hit route -- not found
	APISIXExpect(t).GET("/not_found").
		Expect().
		Status(http.StatusNotFound)

	//hit route -- not found, wrong host
	APISIXExpect(t).GET("/hello_").
		WithHeader("Host", "not_found.com").
		Expect().
		Status(http.StatusNotFound)

	//hit route - ok
	APISIXExpect(t).GET("/hello_").
		WithHeader("Host", "foo.com").
		Expect().
		Status(http.StatusOK)

	//create route  -- invalid hosts
	MangerApiExpect(t).PUT("/apisix/admin/routes/r2").WithText(`{
        "uri": "/hello_",
        "hosts": ["$%$foo.com", "*.bar.com"],
        "upstream": {
            "nodes": {
                "172.16.238.120:1980": 1
            },
            "type": "roundrobin"
        }
    }`).
		WithHeader("Authorization", accessToken).
		Expect().
		Status(http.StatusBadRequest)

	//create route  -- invalid type for hosts
	MangerApiExpect(t).PUT("/apisix/admin/routes/r2").WithText(`{
        "uri": "/hello_",
        "hosts": [1, "*.bar.com"],
        "upstream": {
        "nodes": {
            "172.16.238.120:1980": 1
        },
        "type": "roundrobin"
        }
    }`).
		WithHeader("Authorization", accessToken).
		Expect().
		//Status(http.StatusBadRequest)
		JSON().Object().ValueNotEqual("code", 0)

	//create route  -- fail - config host and hosts at the same time
	MangerApiExpect(t).PUT("/apisix/admin/routes/r2").WithText(`{
        "uri": "/hello_",
        "host": "github.com",
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
		Status(http.StatusBadRequest)

	//create route  -- invalid host
	MangerApiExpect(t).PUT("/apisix/admin/routes/r2").WithText(`{
        "uri": "/hello_",
        "host": "$%$foo.com",
        "upstream": {
            "nodes": {
                "172.16.238.120:1980": 1
            },
            "type": "roundrobin"
        }
    }`).
		WithHeader("Authorization", accessToken).
		Expect().
		Status(http.StatusBadRequest)

	//create route  -- invalid type for host
	MangerApiExpect(t).PUT("/apisix/admin/routes/r2").WithText(`{
        "uri": "/hello_",
        "host": 1,
        "upstream": {
        "nodes": {
            "172.16.238.120:1980": 1
        },
        "type": "roundrobin"
        }
    }`).
		WithHeader("Authorization", accessToken).
		Expect().
		//Status(http.StatusBadRequest)
		JSON().Object().ValueNotEqual("code", 0)

	//create route use host
    MangerApiExpect(t).PUT("/apisix/admin/routes/r2").WithText(`{
        "uri": "/hello_",
        "host": "test.com",
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

	//sleep
	time.Sleep(time.Duration(100) * time.Millisecond)

	//hit route - ok
	APISIXExpect(t).GET("/hello_").
		WithHeader("Host", "test.com").
		Expect().
		Status(http.StatusOK)

}
