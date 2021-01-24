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

package data_loader

import (
	"encoding/json"
	"strings"
	"testing"

	"github.com/apisix/manager-api/internal/core/entity"
	"github.com/apisix/manager-api/internal/core/store"
	"github.com/shiningrush/droplet"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

func TestExportRoutes1(t *testing.T) {
	input := &ExportInput{IDs: "1"}
	//*entity.Route
	r1 := `{
		"name": "aaaa",
		"labels": {
			"build":"16",
			"env":"production",
			"version":"v2"
		},
		"plugins": {
			"limit-count": {
				"count": 2,
				"time_window": 60,
				"rejected_code": 503,
				"key": "remote_addr"
			}
		},
		"status": 1,
		"uris": ["/hello_"],
		"hosts": ["foo.com", "*.bar.com"],
		"methods": ["GET", "POST"],
		"upstream": {
			"nodes": {
				"172.16.238.20:1980": 1
			},
			"type": "roundrobin"
		}
	}`

	exportR1 := `{
		"components": {},
		"info": {
			"title": "RoutesExport",
			"version": "3.0.0"
		},
		"openapi": "3.0.0",
		"paths": {
			"/hello_": {
				"get": {
					"operationId": "aaaaGet",
					"requestBody": {},
					"responses": {
						"default": {
							"description": ""
						}
					},
					"security": [],
					"x-apisix-enable_websocket": false,
					"x-apisix-hosts": ["foo.com", "*.bar.com"],
					"x-apisix-labels": {
						"build": "16",
						"env": "production",
						"version": "v2"
					},
					"x-apisix-plugins": {
						"limit-count": {
							"count": 2,
							"key": "remote_addr",
							"rejected_code": 503,
							"time_window": 60
						}
					},
					"x-apisix-priority": 0,
					"x-apisix-status": 1,
					"x-apisix-upstream": {
						"nodes": {
							"172.16.238.20:1980": 1
						},
						"type": "roundrobin"
					}
				},
				"post": {
					"operationId": "aaaaPost",
					"requestBody": {},
					"responses": {
						"default": {
							"description": ""
						}
					},
					"security": [],
					"x-apisix-enable_websocket": false,
					"x-apisix-hosts": ["foo.com", "*.bar.com"],
					"x-apisix-labels": {
						"build": "16",
						"env": "production",
						"version": "v2"
					},
					"x-apisix-plugins": {
						"limit-count": {
							"count": 2,
							"key": "remote_addr",
							"rejected_code": 503,
							"time_window": 60
						}
					},
					"x-apisix-priority": 0,
					"x-apisix-status": 1,
					"x-apisix-upstream": {
						"nodes": {
							"172.16.238.20:1980": 1
						},
						"type": "roundrobin"
					}
				}
			}
		}
	}`
	var route *entity.Route
	err := json.Unmarshal([]byte(r1), &route)
	mStore := &store.MockInterface{}
	mStore.On("Get", mock.Anything).Run(func(args mock.Arguments) {
	}).Return(route, nil)

	h := Handler{routeStore: mStore}
	ctx := droplet.NewContext()
	ctx.SetInput(input)

	ret, err := h.ExportRoutes(ctx)
	assert.Nil(t, err)
	ret1, err := json.Marshal(ret)
	if err != nil {
	}
	assert.Equal(t, replaceStr(exportR1), string(ret1))
	assert.NotNil(t, ret1)
}

func TestExportRoutes2(t *testing.T) {
	input := &ExportInput{IDs: "1"}
	//*entity.Route
	r2 := `{
		"name": "aaaa2",
		"labels": {
			"build":"16",
			"env":"production",
			"version":"v2"
		},
		"plugins": {
			"limit-count": {
				"count": 2,
				"time_window": 60,
				"rejected_code": 503,
				"key": "remote_addr"
			}
		},
		"status": 1,
		"uri": "/hello2",
		"host": "*.bar.com",
		"methods": ["GET", "POST"],
		"upstream": {
			"nodes": {
				"172.16.238.20:1980": 1
			},
			"type": "roundrobin"
		}
	}`

	exportR2 := `{
		"components": {},
		"info": {
			"title": "RoutesExport",
			"version": "3.0.0"
		},
		"openapi": "3.0.0",
		"paths": {
			"/hello2": {
				"get": {
					"operationId": "aaaa2Get",
					"requestBody": {},
					"responses": {
						"default": {
							"description": ""
						}
					},
					"security": [],
					"x-apisix-enable_websocket": false,
					"x-apisix-host": "*.bar.com",
					"x-apisix-labels": {
						"build": "16",
						"env": "production",
						"version": "v2"
					},
					"x-apisix-plugins": {
						"limit-count": {
							"count": 2,
							"key": "remote_addr",
							"rejected_code": 503,
							"time_window": 60
						}
					},
					"x-apisix-priority": 0,
					"x-apisix-status": 1,
					"x-apisix-upstream": {
						"nodes": {
							"172.16.238.20:1980": 1
						},
						"type": "roundrobin"
					}
				},
				"post": {
					"operationId": "aaaa2Post",
					"requestBody": {},
					"responses": {
						"default": {
							"description": ""
						}
					},
					"security": [],
					"x-apisix-enable_websocket": false,
					"x-apisix-host": "*.bar.com",
					"x-apisix-labels": {
						"build": "16",
						"env": "production",
						"version": "v2"
					},
					"x-apisix-plugins": {
						"limit-count": {
							"count": 2,
							"key": "remote_addr",
							"rejected_code": 503,
							"time_window": 60
						}
					},
					"x-apisix-priority": 0,
					"x-apisix-status": 1,
					"x-apisix-upstream": {
						"nodes": {
							"172.16.238.20:1980": 1
						},
						"type": "roundrobin"
					}
				}
			}
		}
	}`
	var route *entity.Route
	err := json.Unmarshal([]byte(r2), &route)
	mStore := &store.MockInterface{}
	mStore.On("Get", mock.Anything).Run(func(args mock.Arguments) {
	}).Return(route, nil)

	h := Handler{routeStore: mStore}
	ctx := droplet.NewContext()
	ctx.SetInput(input)

	ret, err := h.ExportRoutes(ctx)
	assert.Nil(t, err)
	ret1, err := json.Marshal(ret)
	if err != nil {
	}
	assert.Equal(t, replaceStr(exportR2), string(ret1))
	assert.NotNil(t, ret1)
}

func TestExportRoutesCreateByServiceId(t *testing.T) {
	input := &ExportInput{IDs: "1"}
	//*entity.Route
	r := `{
				"methods": ["GET"],
				"uri": "/hello",
				"service_id": "s1"
			}`

	s := `{
		"id": "s1",
		"name": "testservice",
		"desc": "testservice_desc",
		"labels": {
			"build":"16",
			"env":"production",
			"version":"v2"
		},
		"enable_websocket":true,
		"plugins": { 
			"limit-count": { 
				"count": 100, 
				"time_window": 60, 
				"rejected_code": 503, 
				"key": "remote_addr" 
			} 
		},
		"upstream": {
			"type": "roundrobin",
			"nodes": [{
				"host": "172.16.238.20",
				"port": 1980,
				"weight": 1
			}]
		}
	}`

	exportR := `{
		"components": {},
		"info": {
			"title": "RoutesExport",
			"version": "3.0.0"
		},
		"openapi": "3.0.0",
		"paths": {
			"/hello": {
				"get": {
					"operationId": "Get",
					"requestBody": {},
					"responses": {
						"default": {
							"description": ""
						}
					},
					"x-apisix-enable_websocket": false,
					"x-apisix-labels": {
						"build": "16",
						"env": "production",
						"version": "v2"
					},
					"x-apisix-plugins": {
						"limit-count": {
							"count": 100,
							"key": "remote_addr",
							"rejected_code": 503,
							"time_window": 60
						}
					},
					"x-apisix-priority": 0,
					"x-apisix-status": 0,
					"x-apisix-upstream": {
						"nodes": [{
							"host": "172.16.238.20",
							"port": 1980,
							"weight": 1
						}],
						"type": "roundrobin"
					}
				}
			}
		}
	}`
	var route *entity.Route
	var service *entity.Service
	err := json.Unmarshal([]byte(r), &route)
	err = json.Unmarshal([]byte(s), &service)
	mStore := &store.MockInterface{}
	mStore.On("Get", mock.Anything).Run(func(args mock.Arguments) {
	}).Return(route, nil)
	mStoreService := &store.MockInterface{}
	mStoreService.On("Get", mock.Anything).Run(func(args mock.Arguments) {
	}).Return(service, nil)

	h := Handler{routeStore: mStore, serviceStore: mStoreService}
	ctx := droplet.NewContext()
	ctx.SetInput(input)

	ret, err := h.ExportRoutes(ctx)
	assert.Nil(t, err)
	_ret, err := json.Marshal(ret)
	if err != nil {
	}
	assert.Equal(t, replaceStr(exportR), string(_ret))
	assert.NotNil(t, _ret)
}

func TestExportRoutesCreateByServiceId2(t *testing.T) {
	input := &ExportInput{IDs: "1"}
	//*entity.Route
	r := `{
		"methods": ["GET"],
		"uri": "/hello",
		"service_id": "s1",
		"enable_websocket":false,
		"plugins": { 
			"prometheus": {
				"disable": false
			}
		},
		"upstream": {
			"type": "roundrobin",
			"nodes": [{
				"host": "172.16.238.20",
				"port": 1980,
				"weight": 1
			}]
		}
	}`

	s := `{
		"id": "s1",
		"name": "testservice",
		"desc": "testservice_desc",
		"labels": {
			"build":"16",
			"env":"production",
			"version":"v2"
		},
		"enable_websocket":true,
		"plugins": { 
			"limit-count": { 
				"count": 100, 
				"time_window": 60, 
				"rejected_code": 503, 
				"key": "remote_addr" 
			} 
		},
		"upstream": {
			"type": "roundrobin",
			"nodes": [{
				"host": "172.16.238.20",
				"port": 1980,
				"weight": 1
			}]
		}
	}`

	exportR := `{
		"components": {},
		"info": {
			"title": "RoutesExport",
			"version": "3.0.0"
		},
		"openapi": "3.0.0",
		"paths": {
			"/hello": {
				"get": {
					"operationId": "Get",
					"requestBody": {},
					"responses": {
						"default": {
							"description": ""
						}
					},
					"security": [],
					"x-apisix-enable_websocket": false,
					"x-apisix-labels": {
						"build": "16",
						"env": "production",
						"version": "v2"
					},
					"x-apisix-plugins": {
						"limit-count": {
							"count": 100,
							"key": "remote_addr",
							"rejected_code": 503,
							"time_window": 60
						},
						"prometheus": {
							"disable": false
						}
					},
					"x-apisix-priority": 0,
					"x-apisix-status": 0,
					"x-apisix-upstream": {
						"nodes": [{
							"host": "172.16.238.20",
							"port": 1980,
							"weight": 1
						}],
						"type": "roundrobin"
					}
				}
			}
		}
	}`
	var route *entity.Route
	var service *entity.Service
	err := json.Unmarshal([]byte(r), &route)
	err = json.Unmarshal([]byte(s), &service)
	mStore := &store.MockInterface{}
	mStore.On("Get", mock.Anything).Run(func(args mock.Arguments) {
	}).Return(route, nil)
	mStoreService := &store.MockInterface{}
	mStoreService.On("Get", mock.Anything).Run(func(args mock.Arguments) {
	}).Return(service, nil)

	h := Handler{routeStore: mStore, serviceStore: mStoreService}
	ctx := droplet.NewContext()
	ctx.SetInput(input)

	ret, err := h.ExportRoutes(ctx)
	assert.Nil(t, err)
	_ret, err := json.Marshal(ret)
	if err != nil {
	}
	assert.Equal(t, replaceStr(exportR), string(_ret))
	assert.NotNil(t, _ret)
}

func TestExportRoutesCreateByServiceId3(t *testing.T) {
	input := &ExportInput{IDs: "1"}
	us := `{
		"id": "u1",
		"nodes": [
			{
				"host": "172.16.238.20",
				"port": 1980,
				"weight": 1
			}
		],
		"type": "roundrobin"
	}`

	s := `{
		"id": "s1",
		"name": "testservice",
		"desc": "testservice_desc",
		"labels": {
			"build":"16",
			"env":"production",
			"version":"v2"
		},
		"enable_websocket":true,
		"plugins": { 
			"limit-count": { 
				"count": 100, 
				"time_window": 60, 
				"rejected_code": 503, 
				"key": "remote_addr" 
			} 
		},
		"upstream_id": "u1"
	}`

	r := `{
		"methods": ["GET"],
		"uri": "/hello",
		"service_id": "s1",
		"enable_websocket":false,
		"plugins": { 
			"prometheus": {
				"disable": false
			}
		},
		"upstream": {
			"type": "roundrobin",
			"nodes": [{
				"host": "172.16.238.20",
				"port": 1981,
				"weight": 1
			}]
		}
	}`

	exportR := `{
		"components": {},
		"info": {
			"title": "RoutesExport",
			"version": "3.0.0"
		},
		"openapi": "3.0.0",
		"paths": {
			"/hello": {
				"get": {
					"operationId": "Get",
					"requestBody": {},
					"responses": {
						"default": {
							"description": ""
						}
					},
					"security": [],
					"x-apisix-enable_websocket": false,
					"x-apisix-labels": {
						"build": "16",
						"env": "production",
						"version": "v2"
					},
					"x-apisix-plugins": {
						"limit-count": {
							"count": 100,
							"key": "remote_addr",
							"rejected_code": 503,
							"time_window": 60
						},
						"prometheus": {
							"disable": false
						}
					},
					"x-apisix-priority": 0,
					"x-apisix-status": 0,
					"x-apisix-upstream": {
						"nodes": [{
							"host": "172.16.238.20",
							"port": 1981,
							"weight": 1
						}],
						"type": "roundrobin"
					}
				}
			}
		}
	}`
	var route *entity.Route
	var service *entity.Service
	var upstream *entity.Upstream
	err := json.Unmarshal([]byte(r), &route)
	err = json.Unmarshal([]byte(s), &service)
	err = json.Unmarshal([]byte(us), &upstream)

	mStore := &store.MockInterface{}
	mStore.On("Get", mock.Anything).Run(func(args mock.Arguments) {
	}).Return(route, nil)

	mStoreService := &store.MockInterface{}
	mStoreService.On("Get", mock.Anything).Run(func(args mock.Arguments) {
	}).Return(service, nil)

	mStoreUpstream := &store.MockInterface{}
	mStoreUpstream.On("Get", mock.Anything).Run(func(args mock.Arguments) {
	}).Return(upstream, nil)

	h := Handler{routeStore: mStore, serviceStore: mStoreService, upstreamStore: mStoreUpstream}
	ctx := droplet.NewContext()
	ctx.SetInput(input)

	ret, err := h.ExportRoutes(ctx)
	assert.Nil(t, err)
	_ret, err := json.Marshal(ret)
	if err != nil {
	}
	assert.Equal(t, replaceStr(exportR), string(_ret))
	assert.NotNil(t, _ret)
}

func TestExportRoutesCreateByUpstreamId(t *testing.T) {
	input := &ExportInput{IDs: "1"}
	us := `{
		"id": "u1",
		"nodes": [
			{
				"host": "172.16.238.20",
				"port": 1980,
				"weight": 1
			}
		],
		"type": "roundrobin"
	}`

	r := `{
		"methods": ["GET"],
		"uri": "/hello",
		"enable_websocket":false,
		"plugins": { 
			"prometheus": {
				"disable": false
			}
		},
		"upstream_id": "u1"
	}`

	exportR := `{
		"components": {},
		"info": {
			"title": "RoutesExport",
			"version": "3.0.0"
		},
		"openapi": "3.0.0",
		"paths": {
			"/hello": {
				"get": {
					"operationId": "Get",
					"requestBody": {},
					"responses": {
						"default": {
							"description": ""
						}
					},
					"security": [],
					"x-apisix-enable_websocket": false,
					"x-apisix-plugins": {
						"prometheus": {
							"disable": false
						}
					},
					"x-apisix-priority": 0,
					"x-apisix-status": 0,
					"x-apisix-upstream": {
						"id": "u1",
						"nodes": [{
							"host": "172.16.238.20",
							"port": 1980,
							"weight": 1
						}],
						"type": "roundrobin"
					}
				}
			}
		}
	}`
	var route *entity.Route
	var upstream *entity.Upstream
	err := json.Unmarshal([]byte(r), &route)
	err = json.Unmarshal([]byte(us), &upstream)

	mStore := &store.MockInterface{}
	mStore.On("Get", mock.Anything).Run(func(args mock.Arguments) {
	}).Return(route, nil)

	mStoreUpstream := &store.MockInterface{}
	mStoreUpstream.On("Get", mock.Anything).Run(func(args mock.Arguments) {
	}).Return(upstream, nil)

	h := Handler{routeStore: mStore, upstreamStore: mStoreUpstream}
	ctx := droplet.NewContext()
	ctx.SetInput(input)

	ret, err := h.ExportRoutes(ctx)
	assert.Nil(t, err)
	_ret, err := json.Marshal(ret)
	if err != nil {
	}
	assert.Equal(t, replaceStr(exportR), string(_ret))
	assert.NotNil(t, _ret)
}

func TestExportRoutesCreateByUpstreamIdandServiceId(t *testing.T) {
	input := &ExportInput{IDs: "1"}
	us := `{
		"id": "u1",
		"nodes": [
			{
				"host": "172.16.238.20",
				"port": 1980,
				"weight": 1
			}
		],
		"type": "roundrobin"
	}`

	s := `{
		"id": "s1",
		"name": "testservice",
		"desc": "testservice_desc",
		"labels": {
			"build":"16",
			"env":"production",
			"version":"v2"
		},
		"enable_websocket":true,
		"plugins": { 
			"limit-count": { 
				"count": 100, 
				"time_window": 60, 
				"rejected_code": 503, 
				"key": "remote_addr" 
			} 
		},
		"upstream_id": "u1"
	}`

	r := `{
		"name": "route_all",
		"desc": "所有",
		"status": 1,
		"methods": ["GET"],
		"priority": 0,
		"service_id": "s1",
		"labels": {
			"test": "1",
			"API_VERSION": "v1"
		},
		"vars": [
			["arg_name", "==", "test"]
		],
		"uri": "/hello",
		"enable_websocket":false,
		"plugins": { 
			"prometheus": {
				"disable": false
			}
		},
		"upstream_id": "u1"
	}`

	exportR := `{
		"components": {},
		"info": {
			"title": "RoutesExport",
			"version": "3.0.0"
		},
		"openapi": "3.0.0",
		"paths": {
			"/hello": {
				"get": {
					"operationId": "route_allGet",
					"requestBody": {},
					"responses": {
						"default": {
							"description": ""
						}
					},
					"security": [],
					"summary": "所有",
					"x-apisix-enable_websocket": false,
					"x-apisix-labels": {
						"API_VERSION": "v1",
						"test": "1"
					},
					"x-apisix-plugins": {
						"limit-count": {
							"count": 100,
							"key": "remote_addr",
							"rejected_code": 503,
							"time_window": 60
						},
						"prometheus": {
							"disable": false
						}
					},
					"x-apisix-priority": 0,
					"x-apisix-status": 1,
					"x-apisix-upstream": {
						"id": "u1",
						"nodes": [{
							"host": "172.16.238.20",
							"port": 1980,
							"weight": 1
						}],
						"type": "roundrobin"
					},
					"x-apisix-vars": [
						["arg_name", "==", "test"]
					]
				}
			}
		}
	}`
	var route *entity.Route
	var service *entity.Service
	var upstream *entity.Upstream
	err := json.Unmarshal([]byte(r), &route)
	err = json.Unmarshal([]byte(s), &service)
	err = json.Unmarshal([]byte(us), &upstream)

	mStore := &store.MockInterface{}
	mStore.On("Get", mock.Anything).Run(func(args mock.Arguments) {
	}).Return(route, nil)

	mStoreUpstream := &store.MockInterface{}
	mStoreUpstream.On("Get", mock.Anything).Run(func(args mock.Arguments) {
	}).Return(upstream, nil)

	mStoreService := &store.MockInterface{}
	mStoreService.On("Get", mock.Anything).Run(func(args mock.Arguments) {
	}).Return(service, nil)

	h := Handler{routeStore: mStore, upstreamStore: mStoreUpstream, serviceStore: mStoreService}
	ctx := droplet.NewContext()
	ctx.SetInput(input)

	ret, err := h.ExportRoutes(ctx)
	assert.Nil(t, err)
	_ret, err := json.Marshal(ret)
	if err != nil {
	}
	assert.Equal(t, replaceStr(exportR), string(_ret))
	assert.NotNil(t, _ret)
}

func TestExportRoutesCreateByServiceIdNoUpstream(t *testing.T) {
	input := &ExportInput{IDs: "1"}
	us := `{
		"id": "u1",
		"nodes": [
			{
				"host": "172.16.238.20",
				"port": 1980,
				"weight": 1
			}
		],
		"type": "roundrobin"
	}`

	s := `{
		"name": "testservice",
		"desc": "testservice_desc",
		"enable_websocket":true,
		"upstream_id": "6"
	}`

	r := `{
		"name": "route_all",
		"desc": "所有",
		"status": 1,
		"methods": ["GET"],
		"priority": 0,
		"service_id": "s5",
		"labels": {
			"test": "1",
			"API_VERSION": "v1"
		},
		"vars": [
			["arg_name", "==", "test"]
		],
		"uri": "/hello",
		"enable_websocket":false,
		"plugins": { 
			"prometheus": {
				"disable": false
			}
		}
	}`

	exportR := `{
		"components": {},
		"info": {
			"title": "RoutesExport",
			"version": "3.0.0"
		},
		"openapi": "3.0.0",
		"paths": {
			"/hello": {
				"get": {
					"operationId": "route_allGet",
					"requestBody": {},
					"responses": {
						"default": {
							"description": ""
						}
					},
					"security": [],
					"summary": "所有",
					"x-apisix-enable_websocket": false,
					"x-apisix-labels": {
						"API_VERSION": "v1",
						"test": "1"
					},
					"x-apisix-plugins": {
						"prometheus": {
							"disable": false
						}
					},
					"x-apisix-priority": 0,
					"x-apisix-status": 1,
					"x-apisix-upstream": {
						"id": "u1",
						"nodes": [{
							"host": "172.16.238.20",
							"port": 1980,
							"weight": 1
						}],
						"type": "roundrobin"
					},
					"x-apisix-vars": [
						["arg_name", "==", "test"]
					]
				}
			}
		}
	}`
	var route *entity.Route
	var service *entity.Service
	var upstream *entity.Upstream
	err := json.Unmarshal([]byte(r), &route)
	err = json.Unmarshal([]byte(s), &service)
	err = json.Unmarshal([]byte(us), &upstream)

	mStore := &store.MockInterface{}
	mStore.On("Get", mock.Anything).Run(func(args mock.Arguments) {
	}).Return(route, nil)

	mStoreUpstream := &store.MockInterface{}
	mStoreUpstream.On("Get", mock.Anything).Run(func(args mock.Arguments) {
	}).Return(upstream, nil)

	mStoreService := &store.MockInterface{}
	mStoreService.On("Get", mock.Anything).Run(func(args mock.Arguments) {
	}).Return(service, nil)

	h := Handler{routeStore: mStore, upstreamStore: mStoreUpstream, serviceStore: mStoreService}
	ctx := droplet.NewContext()
	ctx.SetInput(input)

	ret, err := h.ExportRoutes(ctx)
	assert.Nil(t, err)
	_ret, err := json.Marshal(ret)
	if err != nil {
	}
	assert.Equal(t, replaceStr(exportR), string(_ret))
	assert.NotNil(t, _ret)
}

func TestExportRoutesCreateByLabel(t *testing.T) {
	input := &ExportInput{IDs: "1"}
	s := `{
		"name": "testservice",
		"desc": "testservice_desc",
		"enable_websocket":true,
		"labels": {
			"build": "10"
		}
	}`

	r := `{
		"name": "route_all",
		"desc": "所有",
		"status": 1,
		"methods": ["GET"],
		"service_id": "s1",
		"labels": {
			"test": "1",
			"API_VERSION": "v1"
		},
		"uri": "/hello",
		"enable_websocket":false,
		"upstream": {
			"nodes": {
				"172.16.238.20:1980": 1
			},
			"type": "roundrobin"
		}
	}`

	exportR := `{
		"components": {},
		"info": {
			"title": "RoutesExport",
			"version": "3.0.0"
		},
		"openapi": "3.0.0",
		"paths": {
			"/hello": {
				"get": {
					"operationId": "route_allGet",
					"requestBody": {},
					"responses": {
						"default": {
							"description": ""
						}
					},
					"summary": "所有",
					"x-apisix-enable_websocket": false,
					"x-apisix-labels": {
						"API_VERSION": "v1",
						"test": "1"
					},
					"x-apisix-priority": 0,
					"x-apisix-status": 1,
					"x-apisix-upstream": {
						"nodes": {
							"172.16.238.20:1980": 1
						},
						"type": "roundrobin"
					}
				}
			}
		}
	}`
	var route *entity.Route
	var service *entity.Service
	err := json.Unmarshal([]byte(r), &route)
	err = json.Unmarshal([]byte(s), &service)

	mStore := &store.MockInterface{}
	mStore.On("Get", mock.Anything).Run(func(args mock.Arguments) {
	}).Return(route, nil)

	mStoreService := &store.MockInterface{}
	mStoreService.On("Get", mock.Anything).Run(func(args mock.Arguments) {
	}).Return(service, nil)

	h := Handler{routeStore: mStore, serviceStore: mStoreService}
	ctx := droplet.NewContext()
	ctx.SetInput(input)

	ret, err := h.ExportRoutes(ctx)
	assert.Nil(t, err)
	_ret, err := json.Marshal(ret)
	if err != nil {
	}
	assert.Equal(t, replaceStr(exportR), string(_ret))
	assert.NotNil(t, _ret)
}

func TestExportRoutesCreateByLabel2(t *testing.T) {
	input := &ExportInput{IDs: "1"}
	s := `{
		"name": "testservice",
		"desc": "testservice_desc",
		"enable_websocket":true,
		"labels": {
			"build": "16", 
			"env": "production", 
			"version": "v2"
		}
	}`

	r := `{
		"name": "route_all",
		"desc": "所有",
		"status": 1,
		"methods": ["GET"],
		"service_id": "s2",
		"vars": [
			["arg_name", "==", "test"]
		],
		"uri": "/hello"
	}`

	exportR := `{
		"components": {},
		"info": {
			"title": "RoutesExport",
			"version": "3.0.0"
		},
		"openapi": "3.0.0",
		"paths": {
			"/hello": {
				"get": {
					"operationId": "route_allGet",
					"requestBody": {},
					"responses": {
						"default": {
							"description": ""
						}
					},
					"summary": "所有",
					"x-apisix-enable_websocket": false,
					"x-apisix-labels": {
						"build": "16",
						"env": "production",
						"version": "v2"
					},
					"x-apisix-priority": 0,
					"x-apisix-status": 1,
					"x-apisix-vars": [
						["arg_name", "==", "test"]
					]
				}
			}
		}
	}`
	var route *entity.Route
	var service *entity.Service
	err := json.Unmarshal([]byte(r), &route)
	err = json.Unmarshal([]byte(s), &service)

	mStore := &store.MockInterface{}
	mStore.On("Get", mock.Anything).Run(func(args mock.Arguments) {
	}).Return(route, nil)

	mStoreService := &store.MockInterface{}
	mStoreService.On("Get", mock.Anything).Run(func(args mock.Arguments) {
	}).Return(service, nil)

	h := Handler{routeStore: mStore, serviceStore: mStoreService}
	ctx := droplet.NewContext()
	ctx.SetInput(input)

	ret, err := h.ExportRoutes(ctx)
	assert.Nil(t, err)
	_ret, err := json.Marshal(ret)
	if err != nil {
	}
	assert.Equal(t, replaceStr(exportR), string(_ret))
	assert.NotNil(t, _ret)
}

func TestExportRoutesCreateByRequestValidation(t *testing.T) {
	input := &ExportInput{IDs: "1"}
	r := `{
		"uris": ["/test-test"],
		"name": "route_all",
		"desc": "所有",
		"methods": ["GET"],
		"hosts": ["test.com"],
		"plugins": {
			"request-validation": {
				"body_schema": {
					"properties": {
						"boolean_payload": {
							"type": "boolean"
						},
						"required_payload": {
							"type": "string"
						}
					},
					"required": ["required_payload"],
					"type": "object"
				},
				"disable": false,
				"header_schema": {
					"properties": {
						"test": {
							"enum": "test-enum",
							"type": "string"
						}
					},
					"type": "string"
				}
			}
		},
		"status": 1
	}`

	exportR := `{
		"components": {},
		"info": {
			"title": "RoutesExport",
			"version": "3.0.0"
		},
		"openapi": "3.0.0",
		"paths": {
			"/test-test": {
				"get": {
					"operationId": "route_allGet",
					"parameters": [{
						"in": "header",
						"name": "test",
						"schema": {
							"type": "string"
						}
					}],
					"requestBody": {
						"content": {
							"*/*": {
								"schema": {
									"properties": {
										"boolean_payload": {
											"type": "boolean"
										},
										"required_payload": {
											"type": "string"
										}
									},
									"required": ["required_payload"],
									"type": "object"
								}
							}
						}
					},
					"responses": {
						"default": {
							"description": ""
						}
					},
					"security": [],
					"summary": "所有",
					"x-apisix-enable_websocket": false,
					"x-apisix-hosts": ["test.com"],
					"x-apisix-plugins": {},
					"x-apisix-priority": 0,
					"x-apisix-status": 1
				}
			}
		}
	}`
	var route *entity.Route
	err := json.Unmarshal([]byte(r), &route)

	mStore := &store.MockInterface{}
	mStore.On("Get", mock.Anything).Run(func(args mock.Arguments) {
	}).Return(route, nil)

	h := Handler{routeStore: mStore}
	ctx := droplet.NewContext()
	ctx.SetInput(input)

	ret, err := h.ExportRoutes(ctx)
	assert.Nil(t, err)
	_ret, err := json.Marshal(ret)
	if err != nil {
	}
	assert.Equal(t, replaceStr(exportR), string(_ret))
	assert.NotNil(t, _ret)
}

func replaceStr(str string) string {
	str = strings.Replace(str, "\n", "", -1)
	str = strings.Replace(str, "\t", "", -1)
	str = strings.Replace(str, " ", "", -1)
	return str
}

