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
	"github.com/apisix/manager-api/conf"
	"github.com/apisix/manager-api/service"
	"net/http"
	"testing"
)

func TestCreateRouteGroup(t *testing.T) {
	// create ok
	handler.
		Post(uriPrefix+"/routegroups").
		Header("Authorization", token).
		JSON(`{
			"name": "create_route_group_test",
			"description": "test description"
		}`).
		Expect(t).
		Status(http.StatusOK).
		End()
}

func TestDuplicateGroupName(t *testing.T) {
	 // duplicate name
	handler.
		Post(uriPrefix+"/routegroups").
		Header("Authorization", token).
		JSON(`{
			"name": "create_route_group_test",
			"description": "test description"
		}`).
		Expect(t).
		Status(http.StatusInternalServerError).
		End()
}

func TestUpdateRouteGroup(t *testing.T) {
	routeGroup, _ := getRouteGroupByName("create_route_group_test")
	//update ok
	handler.
		Put(uriPrefix+"/routegroups/"+routeGroup.ID.String()).
		Header("Authorization", token).
		JSON(`{
			"name": "update_route_group_test",
			"description": "test description"
		}`).
		Expect(t).
		Status(http.StatusOK).
		End()
}

func TestDeleteRouteGroupHasRoutes(t *testing.T) {
	routeGroup, _ := getRouteGroupByName("update_route_group_test")
	// create route
	handler.Post(uriPrefix+"/routes").
		Header("Authorization", token).
		JSON(`{
			"name":"api-test-for-delete-group",
			"desc":"api-test",
			"priority":0,
			"protocols":["http"],
			"hosts":["test.com"],
			"paths":["/*"],
			"methods":["GET","HEAD","POST","PUT","DELETE","OPTIONS","PATCH"],
			"status":false,
			"upstream_protocol":"keep",
			"plugins":{},
			"uris":["/*"],
			"vars":[],
			"upstream":{"type":"roundrobin","nodes":{"127.0.0.1:443":1},
			"timeout":{"connect":6000,"send":6000,"read":6000}},
			"upstream_header":{},
			"route_group_id":"` + routeGroup.ID.String() + `",
			"route_group_name":"` + routeGroup.Name + `"
}`).Expect(t).
		Status(http.StatusOK).
		End()
	// delete fail
	handler.
		Delete(uriPrefix+"/routegroups/"+routeGroup.ID.String()).
		Header("Authorization", token).
		Expect(t).
		Status(http.StatusInternalServerError).
		End()
	// get api-test-for-group
	route, _ := getRouteByName("api-test-for-delete-group")
	// delete route
	handler.
		Delete(uriPrefix+"/routes/"+route.ID.String()).
		Header("Authorization", token).
		Expect(t).
		Status(http.StatusOK).
		End()
}

func TestDeleteRouteGroup(t *testing.T) {
	routeGroup, _ := getRouteGroupByName("update_route_group_test")
	// delete ok
	handler.
		Delete(uriPrefix+"/routegroups/"+routeGroup.ID.String()).
		Header("Authorization", token).
		Expect(t).
		Status(http.StatusOK).
		End()
}

func getRouteGroupByName(name string) (*service.RouteGroupDao, error) {
	db := conf.DB()
	routeGroup := &service.RouteGroupDao{}
	if err := db.Table("route_group").Where("name = ?", name).First(&routeGroup).Error; err != nil {
		return nil, err
	}
	return routeGroup, nil
}
