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

func TestRouteGroupCurd(t *testing.T) {
	// create ok
	handler.
		Post(uriPrefix+"/routegroups").
		Header("Authorization", token).
		JSON(`{
			"name": "routegroup_test",
			"description": "test description"
		}`).
		Expect(t).
		Status(http.StatusOK).
		End()

	//c1, _ := service.GetConsumerByUserName("e2e_test_consumer1")
	id := "8954a39b-330e-4b85-89f5-d1bbfd785b5b"
	//update ok
	handler.
		Put(uriPrefix+"/routegroups/"+id).
		Header("Authorization", token).
		JSON(`{
			"name": "routegroup_test2",
			"description": "test description"
		}`).
		Expect(t).
		Status(http.StatusOK).
		End()
	// duplicate username
	handler.
		Post(uriPrefix+"/routegroups").
		Header("Authorization", token).
		JSON(`{
			"name": "routegroup_test",
			"description": "test description"
		}`).
		Expect(t).
		Status(http.StatusInternalServerError).
		End()
}
