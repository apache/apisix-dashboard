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

package service

import (
	"testing"

	uuid "github.com/satori/go.uuid"
	"github.com/stretchr/testify/assert"
)

var gid = uuid.NewV4()
var gid2 = uuid.NewV4()

func TestCreateRouteGroup(t *testing.T) {
	routeGroup := &RouteGroupDao{
		Base:        Base{},
		Name:        "route_group_test",
		Description: "route_group_test",
	}
	routeGroup.ID = gid
	// create ok
	err := routeGroup.CreateRouteGroup()
	as := assert.New(t)
	as.Nil(err)
}

func TestGetRouteGroup(t *testing.T) {
	// get group ok
	as := assert.New(t)
	getGroup := &RouteGroupDao{}
	err, i := getGroup.FindRouteGroup(gid.String())
	as.Nil(err)
	as.Equal("route_group_test", getGroup.Name)
	as.Equal(1, i)
}

func TestRouteGroupNameDuplicate(t *testing.T) {
	// name duplicate
	as := assert.New(t)
	routeGroup2 := &RouteGroupDao{
		Base:        Base{},
		Name:        "route_group_test",
		Description: "route_group_test",
	}
	routeGroup2.ID = gid2
	err := routeGroup2.CreateRouteGroup()
	as.NotNil(err)
	// ok
	routeGroup2.Name = "route_group_test2"
	err = routeGroup2.CreateRouteGroup()
	as.Nil(err)
}

func TestGetRouteGupList(t *testing.T) {
	as := assert.New(t)
	// list ok
	routeGroups := []RouteGroupDao{}
	routeGroup := &RouteGroupDao{}
	err, i3 := routeGroup.GetRouteGroupList(&routeGroups, "", 1, 2)
	as.Nil(err)
	as.Equal(true, i3 >= 2)
	as.Equal(2, len(routeGroups))
}

func TestUpdateRouteGroup(t *testing.T) {
	as := assert.New(t)
	// update ok
	routeGroup := &RouteGroupDao{
		Base:        Base{},
		Name:        "route_group_test_update",
		Description: "route_group_test_update",
	}
	routeGroup.ID = gid
	err := routeGroup.UpdateRouteGroup()
	as.Nil(err)
}

func TestDeleteRouteGroup(t *testing.T) {
	as := assert.New(t)
	routeGroup := &RouteGroupDao{
		Base:        Base{},
		Name:        "route_group_test_update",
		Description: "route_group_test_update",
	}
	routeGroup.ID = gid
	// delete ok
	err := routeGroup.DeleteRouteGroup()
	as.Nil(err)

	deleteGroup := &RouteGroupDao{}
	err, i2 := deleteGroup.FindRouteGroup(gid.String())
	as.Nil(err)
	as.Equal("", deleteGroup.Name)
	as.Equal(0, i2)

	routeGroup2 := &RouteGroupDao{
		Base:        Base{},
		Name:        "route_group_test",
		Description: "route_group_test",
	}
	routeGroup2.ID = gid2
	err = routeGroup2.DeleteRouteGroup()
	as.Nil(err)
}
