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
package ssl

import (
	"context"
	"crypto/tls"
	"encoding/json"
	"io/ioutil"
	"net"
	"net/http"
	"time"

	"github.com/onsi/ginkgo"
	"github.com/stretchr/testify/assert"

	"e2enew/base"
)

var _ = ginkgo.Describe("SSL Basic", func() {
	ginkgo.It("test ssl basic", func() {
		// build test body
		t := ginkgo.GinkgoT()
		testCert, err := ioutil.ReadFile("../../certs/test2.crt")
		assert.Nil(t, err)
		testKey, err := ioutil.ReadFile("../../certs/test2.key")
		assert.Nil(t, err)
		apisixKey, err := ioutil.ReadFile("../../certs/apisix.key")
		assert.Nil(t, err)
		body, err := json.Marshal(map[string]interface{}{
			"id":   "1",
			"cert": string(testCert),
			"key":  string(testKey),
			"labels": map[string]string{
				"build":   "16",
				"env":     "production",
				"version": "v3",
			},
		})
		assert.Nil(t, err)
		invalidBody, err := json.Marshal(map[string]string{
			"id":   "1",
			"cert": string(testCert),
			"key":  string(apisixKey),
		})
		assert.Nil(t, err)
		// Before configuring SSL, make a HTTPS request
		http.DefaultTransport.(*http.Transport).TLSClientConfig = &tls.Config{InsecureSkipVerify: true}
		http.DefaultTransport.(*http.Transport).DialContext = func(ctx context.Context, network, addr string) (net.Conn, error) {
			if addr == "www.test2.com:9443" {
				addr = "127.0.0.1:9443"
			}
			dialer := &net.Dialer{}
			return dialer.DialContext(ctx, network, addr)
		}
		_, err = http.Get("https://www.test2.com:9443")
		assert.NotNil(t, err)
		assert.EqualError(t, err, "Get https://www.test2.com:9443: remote error: tls: internal error")
		//create ssl fail - key and cert not match
		base.RunTestCase(base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodPost,
			Path:         "/apisix/admin/ssl",
			Body:         string(invalidBody),
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusBadRequest,
		})
		//create ssl successfully
		base.RunTestCase(base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodPost,
			Path:         "/apisix/admin/ssl",
			Body:         string(body),
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			Sleep:        base.SleepTime,
		})
	})
	ginkgo.It("check ssl labels", func() {
		base.RunTestCase(base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/ssl/1",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "\"labels\":{\"build\":\"16\",\"env\":\"production\",\"version\":\"v3\"",
		})
	})
	ginkgo.It("create route", func() {
		t := ginkgo.GinkgoT()
		var createRouteBody map[string]interface{} = map[string]interface{}{
			"uri":   "/hello_",
			"hosts": []string{"test2.com", "*.test2.com"},
			"upstream": map[string]interface{}{
				"nodes": []map[string]interface{}{
					{
						"host":   base.UpstreamIp,
						"port":   1980,
						"weight": 1,
					},
				},
				"type": "roundrobin",
			},
		}
		_createRouteBody, err := json.Marshal(createRouteBody)
		assert.Nil(t, err)
		base.RunTestCase(base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodPut,
			Path:         "/apisix/admin/routes/r1",
			Body:         string(_createRouteBody),
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		})
	})
	ginkgo.It("get the route just created to trigger removing `key`", func() {
		base.RunTestCase(base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/routes/r1",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			Sleep:        base.SleepTime,
		})
	})
	ginkgo.It("hit the route just created  using HTTPS", func() {
		base.RunTestCase(base.HttpTestCase{
			Object:       base.APISIXHTTPSExpect(),
			Method:       http.MethodGet,
			Path:         "/hello_",
			ExpectStatus: http.StatusOK,
			Headers:      map[string]string{"Host": "www.test2.com"},
			ExpectBody:   "hello world\n",
			Sleep:        base.SleepTime,
		})
	})
	ginkgo.It("disable SSL", func() {
		base.RunTestCase(base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Method: http.MethodPatch,
			Path:   "/apisix/admin/ssl/1",
			Body: `{
				"status": 0
			}`,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "\"status\":0",
		})
	})
	ginkgo.It("test disable SSL HTTPS request", func() {
		// try again after disable SSL, make a HTTPS request
		t := ginkgo.GinkgoT()
		time.Sleep(time.Duration(500) * time.Millisecond)
		_, err := http.Get("https://www.test2.com:9443")
		assert.NotNil(t, err)
		assert.EqualError(t, err, "Get https://www.test2.com:9443: remote error: tls: internal error")
	})
	ginkgo.It("enable SSL", func() {
		base.RunTestCase(base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Method: http.MethodPatch,
			Path:   "/apisix/admin/ssl/1/status",
			Body:   `1`,
			Headers: map[string]string{
				"Authorization": base.GetToken(),
				"Content-Type":  "text/plain",
			},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "\"status\":1",
		})
	})
	ginkgo.It("hit the route using HTTPS, make sure enable successful", func() {
		base.RunTestCase(base.HttpTestCase{
			Object:       base.APISIXHTTPSExpect(),
			Method:       http.MethodGet,
			Path:         "/hello_",
			Headers:      map[string]string{"Host": "www.test2.com"},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "hello world\n",
			Sleep:        base.SleepTime,
		})
	})
	ginkgo.It("delete SSL", func() {
		base.RunTestCase(base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/ssl/1",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		})
	})
	ginkgo.It("delete route", func() {
		base.RunTestCase(base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/r1",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		})
	})
	ginkgo.It("hit the route just deleted", func() {
		base.RunTestCase(base.HttpTestCase{
			Object:       base.APISIXExpect(),
			Method:       http.MethodGet,
			Path:         "/hello_",
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   "{\"error_msg\":\"404 Route Not Found\"}\n",
			Sleep:        base.SleepTime,
		})
	})
})
