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

func TestServerInfo_Get(t *testing.T) {
	// wait for apisix report
	time.Sleep(2 * time.Second)
	testCases := []HttpTestCase{
		{
			Desc:         "get server info",
			Object:       ManagerApiExpect(t),
			Path:         "/apisix/admin/server_info/apisix-server1",
			Method:       http.MethodGet,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "\"hostname\":\"apisix_server1\"",
		},
		{
			Desc:         "get server info",
			Object:       ManagerApiExpect(t),
			Path:         "/apisix/admin/server_info/apisix-server2",
			Method:       http.MethodGet,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "\"hostname\":\"apisix_server2\"",
		},
	}

	for _, tc := range testCases {
		testCaseCheck(tc, t)
	}
}

func TestServerInfo_List(t *testing.T) {
	testCases := []HttpTestCase{
		{
			Desc:         "list all server info",
			Object:       ManagerApiExpect(t),
			Path:         "/apisix/admin/server_info",
			Method:       http.MethodGet,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "\"total_size\":2",
		},
		{
			Desc:         "list server info with hostname",
			Object:       ManagerApiExpect(t),
			Path:         "/apisix/admin/server_info",
			Query:        "hostname=apisix_",
			Method:       http.MethodGet,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "\"total_size\":2",
		},
		{
			Desc:         "list server info with hostname",
			Object:       ManagerApiExpect(t),
			Path:         "/apisix/admin/server_info",
			Query:        "hostname=apisix_server2",
			Method:       http.MethodGet,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "\"total_size\":1",
		},
	}

	for _, tc := range testCases {
		testCaseCheck(tc, t)
	}
}

func TestServerInfo_Get_OmitEmptyValue(t *testing.T) {
	// wait for apisix report
	time.Sleep(2 * time.Second)
	testCases := []HttpTestCase{
		{
			Desc:           "get server info",
			Object:         ManagerApiExpect(t),
			Path:           "/apisix/admin/server_info/apisix-server1",
			Method:         http.MethodGet,
			Headers:        map[string]string{"Authorization": token},
			ExpectStatus:   http.StatusOK,
			UnexpectedBody: "\"create_time\":",
		},
		{
			Desc:           "get server info",
			Object:         ManagerApiExpect(t),
			Path:           "/apisix/admin/server_info/apisix-server1",
			Method:         http.MethodGet,
			Headers:        map[string]string{"Authorization": token},
			ExpectStatus:   http.StatusOK,
			UnexpectedBody: "\"update_time\":",
		},
	}

	for _, tc := range testCases {
		testCaseCheck(tc, t)
	}
}

func TestServerInfo_List_OmitEmptyValue(t *testing.T) {
	testCases := []HttpTestCase{
		{
			Desc:           "list all server info",
			Object:         ManagerApiExpect(t),
			Path:           "/apisix/admin/server_info",
			Method:         http.MethodGet,
			Headers:        map[string]string{"Authorization": token},
			ExpectStatus:   http.StatusOK,
			ExpectBody:     "\"total_size\":2",
			UnexpectedBody: "\"create_time\":",
		},
		{
			Desc:           "list server info with hostname",
			Object:         ManagerApiExpect(t),
			Path:           "/apisix/admin/server_info",
			Query:          "hostname=apisix_",
			Method:         http.MethodGet,
			Headers:        map[string]string{"Authorization": token},
			ExpectStatus:   http.StatusOK,
			ExpectBody:     "\"total_size\":2",
			UnexpectedBody: "\"update_time\":",
		},
	}

	for _, tc := range testCases {
		testCaseCheck(tc, t)
	}
}
