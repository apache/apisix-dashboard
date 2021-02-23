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

func TestVersion(t *testing.T) {
	tests := []HttpTestCase{
		{
			Desc:         "get version",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/tool/version",
			ExpectStatus: http.StatusOK,
			ExpectBody:   []string{"commit_hash", "\"version\""},
		},
	}

	for _, tc := range tests {
		testCaseCheck(tc, t)
	}
}

func TestVersionMatched(t *testing.T) {
	tests := []HttpTestCase{
		{
			Desc:         "check version matched (not matched)",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodGet,
			Path:         "/apisix/admin/tool/version_match",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			ExpectBody: []string{"\"code\":2000001",
				"\"message\":\"The manager-api and apache apisix are mismatched.\"",
				"\"matched\":false", "apisix_server1", "apisix_server2"},
		},
	}

	for _, tc := range tests {
		testCaseCheck(tc, t)
	}
}
