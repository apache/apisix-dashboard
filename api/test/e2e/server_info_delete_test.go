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

func TestServerInfo_delete_node_data(t *testing.T) {
	tests := []HttpTestCase{
		{
			Desc:          "delete node data for apisix-server1",
			Object:        ManagerApiExpect(t),
			Method:        http.MethodDelete,
			Path:          "/apisix/admin/server_info/apisix-server1",
			Headers:       map[string]string{"Authorization": token},
			ExpectStatus:  http.StatusOK,
			ExpectCode:    0,
			ExpectMessage: "Successful",
		},
		{
			Desc:         "Re requesting deleting node data for apisix-server1",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/server_info/apisix-server1",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusNotFound,
		},
		{
			Desc:         "deleting arbitrary random node data",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/server_info/apisix-server3",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusNotFound,
		},
	}

	for _, tc := range tests {
		testCaseCheck(tc, t)
	}
}
