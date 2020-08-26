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
package route

import (
  "bytes"
  "net/http"
  "strings"
  "testing"
)

var token string

func TestUserLogin(t *testing.T) {
  // password error
  handler.
    Post("/apisix/admin/user/login").
    Header("Content-Type", "application/x-www-form-urlencoded").
    Body("username=admin&password=admin1").
    Expect(t).
    Status(http.StatusUnauthorized).
    End()

  // login success
  sessionResponse := handler.
    Post("/apisix/admin/user/login").
    Header("Content-Type", "application/x-www-form-urlencoded").
    Body("username=admin&password=admin").
    Expect(t).
    Status(http.StatusOK).
    End().Response.Body

  buf := new(bytes.Buffer)
  buf.ReadFrom(sessionResponse)
  data := buf.String()
  tokenArr := strings.Split(data, "\"token\":\"")
  token = strings.Split(tokenArr[1], "\"}")[0]
}
