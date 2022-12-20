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
package ssl_test

import (
	"context"
	"crypto/tls"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net"
	"net/http"
	"time"

	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"

	"github.com/apisix/manager-api/test/e2e/base"
)

var _ = Describe("SSL Basic", func() {
	var (
		testCert        []byte
		testKey         []byte
		apisixKey       []byte
		validBody       []byte
		validBody2      []byte
		invalidBody     []byte
		createRouteBody []byte
	)

	var err error
	testCert, err = ioutil.ReadFile("../../certs/test2.crt")
	Expect(err).To(BeNil())
	testKey, err = ioutil.ReadFile("../../certs/test2.key")
	Expect(err).To(BeNil())
	apisixKey, err = ioutil.ReadFile("../../certs/apisix.key")
	Expect(err).To(BeNil())

	validBody, err = json.Marshal(map[string]interface{}{
		"id":   "1",
		"cert": string(testCert),
		"key":  string(testKey),
		"labels": map[string]string{
			"build":   "16",
			"env":     "production",
			"version": "v3",
		},
	})
	Expect(err).To(BeNil())
	validBody2, err = json.Marshal(map[string]interface{}{
		"id":   "1",
		"cert": string(testCert),
		"key":  string(testKey),
		"labels": map[string]string{
			"build":   "16",
			"env":     "production",
			"version": "v2",
		},
	})
	Expect(err).To(BeNil())

	invalidBody, err = json.Marshal(map[string]string{
		"id":   "1",
		"cert": string(testCert),
		"key":  string(apisixKey),
	})
	Expect(err).To(BeNil())

	tempBody := map[string]interface{}{
		"name":  "route1",
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
	createRouteBody, err = json.Marshal(tempBody)
	Expect(err).To(BeNil())

	It("without certificate", func() {
		// Before configuring SSL, make a HTTPS request
		http.DefaultTransport.(*http.Transport).TLSClientConfig = &tls.Config{InsecureSkipVerify: true}
		http.DefaultTransport.(*http.Transport).DialContext = func(ctx context.Context, network, addr string) (net.Conn, error) {
			if addr == "www.test2.com:9443" {
				addr = "127.0.0.1:9443"
			}
			dialer := &net.Dialer{}
			return dialer.DialContext(ctx, network, addr)
		}

		_, err := http.Get("https://www.test2.com:9443")
		Expect(fmt.Sprintf("%s", err)).Should(Equal("Get \"https://www.test2.com:9443\": remote error: tls: internal error"))
	})

	DescribeTable("test ssl basic", func(testCase base.HttpTestCase) {
		base.RunTestCase(testCase)
	},
		Entry("create ssl failed", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodPost,
			Path:         "/apisix/admin/ssl",
			Body:         string(invalidBody),
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusBadRequest,
			ExpectBody:   "SSL parse failed: key and cert don't match",
			Sleep:        base.SleepTime,
		}),
		Entry("create ssl successfully", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodPost,
			Path:         "/apisix/admin/ssl",
			Body:         string(validBody),
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			Sleep:        base.SleepTime,
		}),
		Entry("validate ssl cert and key (valid)", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodPost,
			Path:         "/apisix/admin/check_ssl_cert",
			Body:         string(validBody),
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectBody:   "\"code\":0,\"message\":\"\"",
			ExpectStatus: http.StatusOK,
		}),
		Entry("validate ssl cert and key (valid)", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodPost,
			Path:         "/apisix/admin/check_ssl_cert",
			Body:         string(invalidBody),
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectBody:   "key and cert don't match",
			ExpectStatus: http.StatusOK,
		}),
		Entry("check ssl labels", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/ssl/1",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "\"labels\":{\"build\":\"16\",\"env\":\"production\",\"version\":\"v3\"",
		}),
		Entry("update ssl", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodPut,
			Path:         "/apisix/admin/ssl/1",
			Body:         string(validBody2),
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			Sleep:        base.SleepTime,
		}),
		Entry("check ssl labels", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/ssl/1",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "\"labels\":{\"build\":\"16\",\"env\":\"production\",\"version\":\"v2\"",
			Sleep:        base.SleepTime,
		}),
		Entry("check host exist", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodPost,
			Path:         "/apisix/admin/check_ssl_exists",
			Body:         `{"hosts": ["www.test2.com"]}`,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		}),
		Entry("check host not exist", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodPost,
			Path:         "/apisix/admin/check_ssl_exists",
			Body:         `{"hosts": ["www.test3.com"]}`,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   "SSL cert not exists for sni：www.test3.com",
		}),
		Entry("create route", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodPut,
			Path:         "/apisix/admin/routes/r1",
			Body:         string(createRouteBody),
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		}),
		Entry("get the route just created to trigger removing `key`", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/routes/r1",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			Sleep:        base.SleepTime,
		}),
		Entry("hit the route just created using HTTPS", base.HttpTestCase{
			Object:       base.APISIXHTTPSExpect(),
			Method:       http.MethodGet,
			Path:         "/hello_",
			ExpectStatus: http.StatusOK,
			Headers:      map[string]string{"Host": "www.test2.com"},
			ExpectBody:   "hello world\n",
			Sleep:        base.SleepTime,
		}),
		Entry("disable SSL", base.HttpTestCase{
			Object: base.ManagerApiExpect(),
			Method: http.MethodPatch,
			Path:   "/apisix/admin/ssl/1",
			Body: `{
				"status": 0
			}`,
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "\"status\":0",
		}),
	)

	It("test disable SSL HTTPS request", func() {
		// try again after disable SSL, make a HTTPS request
		time.Sleep(time.Duration(500) * time.Millisecond)
		_, err := http.Get("https://www.test2.com:9443")
		Expect(fmt.Sprintf("%s", err)).Should(Equal("Get \"https://www.test2.com:9443\": remote error: tls: internal error"))
	})

	DescribeTable("test ssl basic", func(testCase base.HttpTestCase) {
		base.RunTestCase(testCase)
	},
		Entry("enable SSL", base.HttpTestCase{
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
		}),
		Entry("hit the route using HTTPS, make sure enable successful", base.HttpTestCase{
			Object:       base.APISIXHTTPSExpect(),
			Method:       http.MethodGet,
			Path:         "/hello_",
			Headers:      map[string]string{"Host": "www.test2.com"},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "hello world\n",
			Sleep:        base.SleepTime,
		}),
		Entry("delete SSL", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/ssl/1",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		}),
		Entry("delete route", base.HttpTestCase{
			Object:       base.ManagerApiExpect(),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/r1",
			Headers:      map[string]string{"Authorization": base.GetToken()},
			ExpectStatus: http.StatusOK,
		}),
		Entry("hit the route just deleted", base.HttpTestCase{
			Object:       base.APISIXExpect(),
			Method:       http.MethodGet,
			Path:         "/hello_",
			ExpectStatus: http.StatusNotFound,
			ExpectBody:   "{\"error_msg\":\"404 Route Not Found\"}\n",
			Sleep:        base.SleepTime,
		}))
})
