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

	"github.com/apisix/manager-api/service"
)

func TestConsumer(t *testing.T) {
	// create ok
	handler.
		Post(uriPrefix + "/consumers").
    Header("Authorization", token).
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
			"desc": "test description"
		}`).
		Expect(t).
		Status(http.StatusOK).
		End()

	c1, _ := service.GetConsumerByUserName("e2e_test_consumer1")

	//update ok
	handler.
		Put(uriPrefix + "/consumers/" + c1.ID.String()).
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

	// duplicate username
	handler.
		Post(uriPrefix + "/consumers").
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
			"desc": "test description"
		}`).
		Expect(t).
		Status(http.StatusBadRequest).
		End()
}
