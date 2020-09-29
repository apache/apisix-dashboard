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

func TestConsumer(t *testing.T) {
	// create ok
	username1 := "e2e_test_consumer1"
	testHandler.
		Post(uriPrefix+"/consumers").
		Header("Authorization", token).
		JSON(`{
			"username": "` + username1 + `",
			"plugins": {
				"limit-count": {
					"count": 2,
					"time_window": 60,
					"rejected_code": 503,
					"key": "remote_addr"
				},
				"basic-auth": {
					"username": "foo",
					"password": "bar"
				}
			},
			"desc": "test description"
		}`).
		Expect(t).
		Status(http.StatusOK).
		End()

	//update ok
	testHandler.
		Put(uriPrefix + "/consumers/" + username1).
		JSON(`{
			"username": "e2e_test_consumer1",
			"plugins": {
				"limit-count": {
					"count": 2,
					"time_window": 60,
					"rejected_code": 503,
					"key": "remote_addr"
				},
				"basic-auth": {
					"username": "foo",
					"password": "bar"
				}
			},
			"desc": "test desc"
		}`).
		Expect(t).
		Status(http.StatusOK).
		End()

	//list
	testHandler.
		Get(uriPrefix + "/consumers").
		Headers(map[string]string{"Authorization": token}).
		Expect(t).
		Status(http.StatusOK).
		End()

	//delete
	testHandler.
		Delete(uriPrefix + "/consumers/" + username1).
		Expect(t).
		Status(http.StatusOK).
		End()

}
