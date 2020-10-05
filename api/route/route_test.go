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
	"net/http"
	"testing"
)

func TestRoute(t *testing.T) {
	// create ok

	testHandler.
		Post(uriPrefix + "/routes").
		JSON(`{
      "id": "11",
			"name": "e2e-test-route1",
			"desc": "route created by java sdk",
			"priority": 0,
			"methods": [
				"GET"
			],
			"uris": [
				"/helloworld",
				"/hello2*"
			],
			"hosts": [
				"s.com"
			],
			"protocols": [
				"http",
				"https",
				"websocket"
			],
			"redirect":{
				"code": 302,
				"uri": "/hello"
			},
			"vars": [
				["arg_name", "==", "json"],
				["arg_age", ">", "18"],
				["arg_address", "~~", "China.*"]
			],
			"upstream": {
				"type": "roundrobin",
				"nodes": {
					"39.97.63.215:80": 100
				},
				"timeout": {
					"connect":15,
					"send":15,
					"read":15
				}
			},
			"upstream_protocol": "keep",
			"upstream_path": {
				"type" : "static",
				"from": "",
				"to": "/hello"
			},
			"upstream_header": {
				"header_name1": "header_value1",
				"header_name2": "header_value2"
			},
			"plugins": {
				"limit-count": {
					"count": 2,
					"time_window": 60,
					"rejected_code": 503,
					"key": "remote_addr"
				},
				"prometheus": {}
			}
		}`).
		Headers(map[string]string{"Authorization": token}).
		Expect(t).
		Status(http.StatusOK).
		End()

	//update ok
	testHandler.
		Put(uriPrefix + "/routes/11").
		JSON(`{
      "id": "11",
			"name": "e2e-test-route1",
			"desc": "route created by java sdk",
			"priority": 0,
			"methods": [
				"GET"
			],
			"uris": [
				"/helloworld",
				"/hello2*"
			],
			"hosts": [
				"s.com"
			],
			"protocols": [
				"http",
				"https",
				"websocket"
			],
			"redirect":{
				"code": 302,
				"uri": "/hello"
			},
			"vars": [
				["arg_name", "==", "json"],
				["arg_age", ">", "18"],
				["arg_address", "~~", "China.*"]
			],
			"upstream": {
				"type": "roundrobin",
				"nodes": {
					"39.97.63.215:80": 100
				},
				"timeout": {
					"connect":15,
					"send":15,
					"read":15
				}
			},
			"upstream_protocol": "keep",
			"upstream_path": {
				"type" : "static",
				"from": "",
				"to": "/hello"
			},
			"upstream_header": {
				"header_name1": "header_value1",
				"header_name2": "header_value2"
			},
			"plugins": {
				"limit-count": {
					"count": 2,
					"time_window": 60,
					"rejected_code": 503,
					"key": "remote_addr"
				},
				"prometheus": {}
			}
		}`).
		Expect(t).
		Status(http.StatusOK).
		End()

	//list
	testHandler.
		Get(uriPrefix + "/routes").
		Headers(map[string]string{"Authorization": token}).
		Expect(t).
		Status(http.StatusOK).
		End()

	//not exist
	testHandler.
		Get(uriPrefix + "/notexist/routes").
		//Query("name", "notexists").
		QueryCollection(map[string][]string{"name": {"notexists"}}).
		Headers(map[string]string{"Authorization": token}).
		Expect(t).
		Status(http.StatusOK).
		End()

	//existed todo: fix bug
	//testHandler.
	//	Get(uriPrefix + "/notexist/routes").
	//	QueryCollection(map[string][]string{"name": {""}}).
	//	Headers(map[string]string{"Authorization": token}).
	//	Expect(t).
	//	Status(http.StatusBadRequest).
	//	End()

	//delete
	testHandler.
		Delete(uriPrefix + "/routes/11").
		Expect(t).
		Status(http.StatusOK).
		End()

}
