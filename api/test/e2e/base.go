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
	"bytes"
	"context"
	"crypto/tls"
	"github.com/stretchr/testify/assert"
	"io/ioutil"
	"net"
	"net/http"
	"testing"
	"time"

	"github.com/gavv/httpexpect/v2"
	"github.com/tidwall/gjson"
)

var token string
var APISIXInternalUrl = "http://172.16.238.30:9080"

func init() {
	//login to get auth token
	requestBody := []byte(`{
		"username": "admin",
		"password": "admin"
	}`)

	url := "http://127.0.0.1:9000/apisix/admin/user/login"
	req, err := http.NewRequest(http.MethodPost, url, bytes.NewBuffer(requestBody))
	if err != nil {
		panic(err)
	}

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	}

	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		panic(err)
	}

	respond := gjson.ParseBytes(body)
	token = respond.Get("data.token").String()
}

func httpGet(url string) ([]byte, int, error) {
	req, err := http.NewRequest(http.MethodGet, url, nil)
	if err != nil {
		return nil, 0, err
	}

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, 0, err
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, 0, err
	}

	return body, resp.StatusCode, nil
}

func ManagerApiExpect(t *testing.T) *httpexpect.Expect {
	return httpexpect.New(t, "http://127.0.0.1:9000")
}

func APISIXExpect(t *testing.T) *httpexpect.Expect {
	return httpexpect.New(t, "http://127.0.0.1:9080")
}

func APISIXHTTPSExpect(t *testing.T) *httpexpect.Expect {
	e := httpexpect.WithConfig(httpexpect.Config{
		BaseURL:  "https://www.test2.com:9443",
		Reporter: httpexpect.NewAssertReporter(t),
		Client: &http.Client{
			Transport: &http.Transport{
				TLSClientConfig: &tls.Config{
					// accept any certificate; for testing only!
					InsecureSkipVerify: true,
				},
				DialContext: func(ctx context.Context, network, addr string) (net.Conn, error) {
					if addr == "www.test2.com:9443" {
						addr = "127.0.0.1:9443"
					}
					dialer := &net.Dialer{}
					return dialer.DialContext(ctx, network, addr)
				},
			},
		},
	})

	return e
}

var singleWorkerAPISIXHost = "http://127.0.0.1:9081"

func BatchTestServerPort(t *testing.T, times int) map[string]int {
	url := singleWorkerAPISIXHost + "/server_port"
	req, err := http.NewRequest(http.MethodGet, url, nil)
	assert.Nil(t, err)

	res := map[string]int{}
	var resp *http.Response
	var client *http.Client
	var body string
	var bodyByte []byte

	for i := 0; i < times; i++ {
		client = &http.Client{}
		resp, err = client.Do(req)
		assert.Nil(t, err)

		bodyByte, err = ioutil.ReadAll(resp.Body)
		assert.Nil(t, err)
		body = string(bodyByte)

		if _, ok := res[body]; !ok {
			res[body] = 1
		} else {
			res[body] += 1
		}
	}

	defer resp.Body.Close()

	return res
}

var sleepTime = time.Duration(300) * time.Millisecond

type HttpTestCase struct {
	caseDesc      string
	Object        *httpexpect.Expect
	Method        string
	Path          string
	Query         string
	Body          string
	Headers       map[string]string
	Headers_test  map[string]interface{}
	ExpectStatus  int
	ExpectCode    int
	ExpectMessage string
	ExpectBody    string
	ExpectHeaders map[string]string
	Sleep         time.Duration //ms
}

func testCaseCheck(tc HttpTestCase) {
	//init
	expectObj := tc.Object
	var req *httpexpect.Request
	switch tc.Method {
	case http.MethodGet:
		req = expectObj.GET(tc.Path)
	case http.MethodPut:
		req = expectObj.PUT(tc.Path)
	case http.MethodPost:
		req = expectObj.POST(tc.Path)
	case http.MethodDelete:
		req = expectObj.DELETE(tc.Path)
	case http.MethodPatch:
		req = expectObj.PATCH(tc.Path)
	case http.MethodOptions:
		req = expectObj.OPTIONS(tc.Path)
	default:
	}

	if req == nil {
		panic("fail to init request")
	}

	if tc.Sleep != 0 {
		time.Sleep(tc.Sleep)
	}

	if tc.Query != "" {
		req.WithQueryString(tc.Query)
	}

	//set header
	for key, val := range tc.Headers {
		req.WithHeader(key, val)
	}

	//set body
	if tc.Body != "" {
		req.WithText(tc.Body)
	}

	//respond check
	resp := req.Expect()

	//match http status
	if tc.ExpectStatus != 0 {
		resp.Status(tc.ExpectStatus)
	}

	//match headers
	if tc.ExpectHeaders != nil {
		for key, val := range tc.ExpectHeaders {
			resp.Header(key).Equal(val)
		}
	}

	//match body
	if tc.ExpectBody != "" {
		resp.Body().Contains(tc.ExpectBody)
	}

}
