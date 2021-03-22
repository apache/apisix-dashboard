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

func TestRoute_with_methods(t *testing.T) {
	tests := []HttpTestCase{
		{
			Desc:   "add route with invalid method",
			Object: ManagerApiExpect(t),
			Method: http.MethodPut,
			Path:   "/apisix/admin/routes/r1",
			Body: `{
					 "name": "route1",
					 "uri": "/hello",
					 "methods": ["TEST"],
					 "upstream": {
						 "type": "roundrobin",
						 "nodes": [{
							 "host": "172.16.238.20",
							 "port": 1980,
							 "weight": 1
						 }]
					 }
				 }`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusBadRequest,
		},
		{
			Desc:         "verify route",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusNotFound,
			Sleep:        sleepTime,
		},
		{
			Desc:   "add route with valid method",
			Object: ManagerApiExpect(t),
			Method: http.MethodPut,
			Path:   "/apisix/admin/routes/r1",
			Body: `{
					 "name": "route1",
					 "uri": "/hello",
					 "methods": ["GET"],
					 "upstream": {
						 "type": "roundrobin",
						 "nodes": [{
							 "host": "172.16.238.20",
							 "port": 1980,
							 "weight": 1
						 }]
					 }
				 }`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:         "verify route",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "hello world",
			Sleep:        sleepTime,
		},
		{
			Desc:         "delete route",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/r1",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:   "add route with valid methods",
			Object: ManagerApiExpect(t),
			Method: http.MethodPut,
			Path:   "/apisix/admin/routes/r1",
			Body: `{
					 "name": "route1",
					 "uri": "/hello",
					 "methods": ["GET", "POST", "PUT", "DELETE", "PATCH"],
					 "upstream": {
						 "type": "roundrobin",
						 "nodes": [{
							 "host": "172.16.238.20",
							 "port": 1980,
							 "weight": 1
						 }]
					 }
				 }`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:         "verify route by post",
			Object:       APISIXExpect(t),
			Method:       http.MethodPost,
			Path:         "/hello",
			Body:         `test=test`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "hello world",
			Sleep:        sleepTime,
		},
		{
			Desc:         "verify route by put",
			Object:       APISIXExpect(t),
			Method:       http.MethodPut,
			Path:         "/hello",
			Body:         `test=test`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "hello world",
			Sleep:        sleepTime,
		},
		{
			Desc:         "verify route by get",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "hello world",
			Sleep:        sleepTime,
		},
		{
			Desc:         "verify route by delete",
			Object:       APISIXExpect(t),
			Method:       http.MethodDelete,
			Path:         "/hello",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "hello world",
			Sleep:        sleepTime,
		},
		{
			Desc:         "verify route by patch",
			Object:       APISIXExpect(t),
			Method:       http.MethodPatch,
			Path:         "/hello",
			Body:         `test=test`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "hello world",
			Sleep:        sleepTime,
		},
		{
			Desc:         "delete route",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/r1",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:   "add route with lower case methods",
			Object: ManagerApiExpect(t),
			Method: http.MethodPut,
			Path:   "/apisix/admin/routes/r1",
			Body: `{
					 "name": "route1",
					 "uri": "/hello",
					 "methods": ["GET", "post"],
					 "upstream": {
						 "type": "roundrobin",
						 "nodes": [{
							 "host": "172.16.238.20",
							 "port": 1980,
							 "weight": 1
						 }]
					 }
				}`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusBadRequest,
		},
		{
			Desc:         "verify route",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusNotFound,
			Sleep:        sleepTime,
		},
		{
			Desc:   "add route with methods GET",
			Object: ManagerApiExpect(t),
			Method: http.MethodPut,
			Path:   "/apisix/admin/routes/r1",
			Body: `{
					 "name": "route1",
					 "uri": "/hello",
					 "methods": ["GET"],
					 "upstream": {
						 "type": "roundrobin",
						 "nodes": [{
							 "host": "172.16.238.20",
							 "port": 1980,
							 "weight": 1
						 }]
					 }
				 }`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:         "verify route by get",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "hello world",
			Sleep:        sleepTime,
		},
		{
			Desc:         "verify route by post",
			Object:       APISIXExpect(t),
			Method:       http.MethodPost,
			Path:         "/hello",
			Body:         `test=test`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusNotFound,
			Sleep:        sleepTime,
		},
		{
			Desc:   "update route methods to POST",
			Object: ManagerApiExpect(t),
			Method: http.MethodPut,
			Path:   "/apisix/admin/routes/r1",
			Body: `{
					 "name": "route1",
					 "uri": "/hello",
					 "methods": ["POST"],
					 "upstream": {
						 "type": "roundrobin",
						 "nodes": [{
							 "host": "172.16.238.20",
							 "port": 1980,
							 "weight": 1
						 }]
					 }
				 }`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
		},
		{
			Desc:         "verify route by get",
			Object:       APISIXExpect(t),
			Method:       http.MethodGet,
			Path:         "/hello",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusNotFound,
			Sleep:        sleepTime,
		},
		{
			Desc:         "verify route by post",
			Object:       APISIXExpect(t),
			Method:       http.MethodPost,
			Path:         "/hello",
			Body:         `test=test`,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "hello world",
			Sleep:        sleepTime,
		},
		{
			Desc:         "delete route",
			Object:       ManagerApiExpect(t),
			Method:       http.MethodDelete,
			Path:         "/apisix/admin/routes/r1",
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			Sleep:        sleepTime,
		},
	}

	for _, tc := range tests {
		testCaseCheck(tc, t)
	}
}
