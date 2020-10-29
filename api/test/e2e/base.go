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
	"fmt"
	"io/ioutil"
	"net/http"
	"testing"

	"github.com/gavv/httpexpect/v2"
	"github.com/gin-gonic/gin"
	"github.com/tidwall/gjson"
)

var accessToken string
var handler *gin.Engine

func init() {
	//login to get auth token
	requestBody := []byte(`{
    "username": "admin",
    "password": "admin"
  }`)
	url := "http://127.0.0.1:8080/apisix/admin/user/login"
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(requestBody))

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	}

	defer resp.Body.Close()
	body, _ := ioutil.ReadAll(resp.Body)

	respond := gjson.ParseBytes(body)
	accessToken = respond.Get("data.token").String()

	fmt.Println("response Body:", string(body), " resp end. ")

}

func MangerApiExpect(t *testing.T) *httpexpect.Expect {
	return httpexpect.New(t, "http://127.0.0.1:8080")
}

func APISIXExpect(t *testing.T) *httpexpect.Expect {
	return httpexpect.New(t, "http://127.0.0.1:9080")
}
