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
)

func TestAuthentication_token(t *testing.T) {
	tests := []HttpTestCase{
		{
			Desc:         "Access with valid authentication token",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/routes",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:         "Access with malformed authentication token",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/routes",
			Headers:      map[string]string{"Authorization": "Not-A-Valid-Token"},
			ExpectStatus: http.StatusUnauthorized,
			ExpectBody:   "\"message\":\"Request Unauthorized\"",
		},
		{
			Desc:         "Access without authentication token",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/routes",
			ExpectStatus: http.StatusUnauthorized,
			ExpectBody:   "\"message\":\"Request Unauthorized\"",
		},
	}

	for _, tc := range tests {
		testCaseCheck(tc, t)
	}
}
