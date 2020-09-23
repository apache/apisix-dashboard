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

	"github.com/apisix/manager-api/conf"
	"github.com/apisix/manager-api/service"
)
 
func TestCreateRouteForUngroup(t *testing.T) {
	// create route with no route group -- test ungroup
	handler.Post(uriPrefix+"/routes").
		Header("Authorization", token).
		JSON(`{
			"name":"api-test-no-group",
			"desc":"api-test-no-group",
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
			"route_group_id":"",
			"route_group_name":""
}`).Expect(t).
	Status(http.StatusOK).
	End()
}
 
func TestUpdateRouteWithCreateRouteGroup(t *testing.T) {
	route, _ := getRouteByName("api-test-no-group")

	// update route for create route group
	handler.Put(uriPrefix+"/routes/"+route.ID.String()).
		Header("Authorization", token).
		JSON(`{
			"name":"api-test-no-group",
			"desc":"api-test-no-group",
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
			"route_group_id":"",
			"route_group_name":"route-update-test-create-group"
}`).Expect(t).
	Status(http.StatusOK).
	End()
}
 
func TestCreateRouteWithCreateNewGroup(t *testing.T) {
	// create route with new route group
	handler.Post(uriPrefix+"/routes").
		Header("Authorization", token).
		JSON(`{
			"name":"api-test-new-group",
			"desc":"api-test-new-group",
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
			"route_group_id":"",
			"route_group_name":"route-create-test-create-group"
}`).Expect(t).
	Status(http.StatusOK).
	End()
}
 
func TestCreateRouteWithDuplicateGroupName(t *testing.T) {
	// create route with duplicate route group name
	handler.Post(uriPrefix+"/routes").
		Header("Authorization", token).
		JSON(`{
			"name":"api-test",
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
			"route_group_id":"",
			"route_group_name":"route-create-test-create-group"
}`).Expect(t).
	Status(http.StatusInternalServerError).
	End()
}

 func TestPublishRoute(t *testing.T) {
	// create route
	handler.Post(uriPrefix+"/routes").
		Header("Authorization", token).
		JSON(`{
      "name":"api-test",
      "desc":"",
      "priority":0,
      "protocols":["http"],
      "hosts":["test1.com"],
      "paths":["/*"],
      "methods":["GET","HEAD","POST","PUT","DELETE","OPTIONS","PATCH"],
      "status":false,
      "upstream_protocol":"keep",
      "plugins":{},
      "uris":["/*"],
      "vars":[],
      "upstream":{"type":"roundrobin","nodes":{"127.0.0.1:443":1},
      "timeout":{"connect":6000,"send":6000,"read":6000}},
      "upstream_header":{}
}`).Expect(t).
	Status(http.StatusOK).
	End()
	route, _ := getRouteByName("api-test")
	// publish route
	handler.Put(uriPrefix + "/routes/" + route.ID.String() + "/publish").Expect(t).Status(http.StatusOK).End()
}

func TestOfflineRoute(t *testing.T) {
	// create route
	handler.Post(uriPrefix+"/routes").
		Header("Authorization", token).
		JSON(`{
      "name":"api-test-published",
      "desc":"",
      "priority":0,
      "protocols":["http"],
      "hosts":["test1.com"],
      "paths":["/*"],
      "methods":["GET","HEAD","POST","PUT","DELETE","OPTIONS","PATCH"],
      "status":true,
      "upstream_protocol":"keep",
      "plugins":{},
      "uris":["/*"],
      "vars":[],
      "upstream":{"type":"roundrobin","nodes":{"127.0.0.1:443":1},
      "timeout":{"connect":6000,"send":6000,"read":6000}},
      "upstream_header":{}
}`).Expect(t).
	Status(http.StatusOK).
	End()
	routePublished, _ := getRouteByName("api-test-published")
	// offline route
	handler.Put(uriPrefix + "/routes/" + routePublished.ID.String() + "/offline").Expect(t).Status(http.StatusOK).End()
}

func TestGetRouteWithApisixUrl(t *testing.T) {
	// create route
	handler.Post(uriPrefix+"/routes").
		Header("Authorization", token).
		JSON(`{
      "name":"api-test-get-url",
      "desc":"",
      "priority":0,
      "protocols":["http"],
      "hosts":["test.com"],
      "paths":["/*"],
      "methods":["GET","HEAD","POST","PUT","DELETE","OPTIONS","PATCH"],
      "status":true,
      "upstream_protocol":"keep",
      "plugins":{},
      "uris":["/*"],
      "vars":[],
      "upstream":{"type":"roundrobin","nodes":{"127.0.0.1:443":1},
      "timeout":{"connect":6000,"send":6000,"read":6000}},
      "upstream_header":{}
}`).Expect(t).
	Status(http.StatusOK).
	End()
	//get route
	route, _ := getRouteByName("api-test-get-url")
	// get route with apisix url
	handler.Get(uriPrefix + "/routes/" + route.ID.String() + "/debuginfo").Expect(t).Status(http.StatusOK).End()
}

func getRouteByName(name string) (*service.Route, error) {
	db := conf.DB()
	route := &service.Route{}
	if err := db.Table("routes").Where("name = ?", name).First(&route).Error; err != nil {
		return nil, err
	}
	return route, nil
}
