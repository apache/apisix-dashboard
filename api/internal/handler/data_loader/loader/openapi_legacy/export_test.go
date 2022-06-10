package openapi_legacy

import (
	"encoding/json"
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"

	"github.com/apisix/manager-api/internal/core/entity"
	"github.com/apisix/manager-api/internal/handler/data_loader/loader"
)

// 1.Export data as the route of URIs Hosts
func TestExportRoutes1(t *testing.T) {
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
					"operationId": "aaaaGET",
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
					"operationId": "aaaaPOST",
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

	l := &Loader{}
	exported, err := l.Export(loader.DataSets{Routes: []entity.Route{*route}})
	assert.NoError(t, err)

	ret, err := json.Marshal(exported)
	assert.Nil(t, err)
	assert.Equal(t, replaceStr(exportR1), string(ret))
	assert.NotNil(t, ret)
}

// 2.Export data as the route of URI host
func TestExportRoutes2(t *testing.T) {
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
					"operationId": "aaaa2GET",
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
					"operationId": "aaaa2POST",
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

	l := &Loader{}
	exported, err := l.Export(loader.DataSets{Routes: []entity.Route{*route}})
	assert.NoError(t, err)

	ret, err := json.Marshal(exported)
	assert.Nil(t, err)
	assert.Equal(t, replaceStr(exportR2), string(ret))
	assert.NotNil(t, ret)
}

// 3.Create a service that contains complete data and use the service_id create route
func TestExportRoutesCreateByServiceId(t *testing.T) {
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
					"operationId": "GET",
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
	assert.NoError(t, err)
	err = json.Unmarshal([]byte(s), &service)
	assert.NoError(t, err)

	l := &Loader{}
	exported, err := l.Export(loader.DataSets{
		Routes:   []entity.Route{*route},
		Services: []entity.Service{*service},
	})
	assert.NoError(t, err)

	ret, err := json.Marshal(exported)
	assert.Nil(t, err)
	assert.Equal(t, replaceStr(exportR), string(ret))
	assert.NotNil(t, ret)
}

// 4.Create a service containing plugin and a route containing plugin to test the fusion of exported data
func TestExportRoutesCreateByServiceId2(t *testing.T) {
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
					"operationId": "GET",
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

	l := &Loader{}
	exported, err := l.Export(loader.DataSets{
		Routes:   []entity.Route{*route},
		Services: []entity.Service{*service},
	})
	assert.NoError(t, err)

	ret, err := json.Marshal(exported)
	assert.Nil(t, err)
	assert.Equal(t, replaceStr(exportR), string(ret))
	assert.NotNil(t, ret)
}

// 5.Create a service according to the upstream ID and a route according to the service ID
func TestExportRoutesCreateByServiceId3(t *testing.T) {
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
					"operationId": "GET",
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

	l := &Loader{}
	exported, err := l.Export(loader.DataSets{
		Routes:    []entity.Route{*route},
		Services:  []entity.Service{*service},
		Upstreams: []entity.Upstream{*upstream},
	})
	assert.NoError(t, err)

	ret, err := json.Marshal(exported)
	assert.Nil(t, err)
	assert.Equal(t, replaceStr(exportR), string(ret))
	assert.NotNil(t, ret)
}

// 6.Create and export route according to upstream ID
func TestExportRoutesCreateByUpstreamId(t *testing.T) {
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
					"operationId": "GET",
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

	l := &Loader{}
	exported, err := l.Export(loader.DataSets{
		Routes:    []entity.Route{*route},
		Upstreams: []entity.Upstream{*upstream},
	})
	assert.NoError(t, err)

	ret, err := json.Marshal(exported)
	assert.Nil(t, err)
	assert.Equal(t, replaceStr(exportR), string(ret))
	assert.NotNil(t, ret)
}

// 7.Create route according to upstream ID and service ID
func TestExportRoutesCreateByUpstreamIdandServiceId(t *testing.T) {
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
					"operationId": "route_allGET",
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

	l := &Loader{}
	exported, err := l.Export(loader.DataSets{
		Routes:    []entity.Route{*route},
		Services:  []entity.Service{*service},
		Upstreams: []entity.Upstream{*upstream},
	})
	assert.NoError(t, err)

	ret, err := json.Marshal(exported)
	assert.Nil(t, err)
	assert.Equal(t, replaceStr(exportR), string(ret))
	assert.NotNil(t, ret)
}

// 8.Creating route using service ID does not contain upstream data
func TestExportRoutesCreateByServiceIdNoUpstream(t *testing.T) {
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
		"id": "s5",
		"name": "testservice",
		"desc": "testservice_desc",
		"enable_websocket":true,
		"upstream_id": "u1"
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
					"operationId": "route_allGET",
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

	l := &Loader{}
	exported, err := l.Export(loader.DataSets{
		Routes:    []entity.Route{*route},
		Services:  []entity.Service{*service},
		Upstreams: []entity.Upstream{*upstream},
	})
	assert.NoError(t, err)

	ret, err := json.Marshal(exported)
	assert.Nil(t, err)
	assert.Equal(t, replaceStr(exportR), string(ret))
	assert.NotNil(t, ret)
}

// 9.Create a service with label data and a route with label data, and export the route.
// Label is the original data of the route
func TestExportRoutesCreateByLabel(t *testing.T) {
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
					"operationId": "route_allGET",
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

	l := &Loader{}
	exported, err := l.Export(loader.DataSets{
		Routes:   []entity.Route{*route},
		Services: []entity.Service{*service},
	})
	assert.NoError(t, err)

	ret, err := json.Marshal(exported)
	assert.Nil(t, err)
	assert.Equal(t, replaceStr(exportR), string(ret))
	assert.NotNil(t, ret)
}

// 10.Create a service with label data and a route without label data, and export the route.
//  Label is the data of the service
func TestExportRoutesCreateByLabel2(t *testing.T) {
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
					"operationId": "route_allGET",
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

	l := &Loader{}
	exported, err := l.Export(loader.DataSets{
		Routes:   []entity.Route{*route},
		Services: []entity.Service{*service},
	})
	assert.NoError(t, err)

	ret, err := json.Marshal(exported)
	assert.Nil(t, err)
	assert.Equal(t, replaceStr(exportR), string(ret))
	assert.NotNil(t, ret)
}

// 11.Test export route request_ validation data correctness
func TestExportRoutesCreateByRequestValidation(t *testing.T) {
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
					"operationId": "route_allGET",
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
					"x-apisix-priority": 0,
					"x-apisix-status": 1
				}
			}
		}
	}`
	var route *entity.Route
	err := json.Unmarshal([]byte(r), &route)

	l := &Loader{}
	exported, err := l.Export(loader.DataSets{
		Routes: []entity.Route{*route},
	})
	assert.NoError(t, err)

	ret, err := json.Marshal(exported)
	assert.Nil(t, err)
	assert.Equal(t, replaceStr(exportR), string(ret))
	assert.NotNil(t, ret)
}

// 12.Export route create by jwt-auth plugin
func TestExportRoutesCreateByJWTAuth(t *testing.T) {
	r := `{
		"uri": "/hello",
		"methods": ["Get"],
		"plugins": {
			"jwt-auth": {}
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

	c := `{
		"username": "jack",
		"plugins": {
			"jwt-auth": {
				"key": "user-key",
				"secret": "my-secret-key",
				"algorithm": "HS256"
			}
		},
		"desc": "test description"
	}`

	exportR := `{
		"components": {
			"securitySchemes": {
				"bearerAuth": {
					"bearerFormat": "JWT",
					"scheme": "bearer",
					"type": "http"
				}
			}
		},
		"info": {
			"title": "RoutesExport",
			"version": "3.0.0"
		},
		"openapi": "3.0.0",
		"paths": {
			"/hello": {
				"get": {
					"operationId": "GET",
					"requestBody": {},
					"responses": {
						"default": {
							"description": ""
						}
					},
					"security": [{
						"bearerAuth": [""]
					}],
					"x-apisix-enable_websocket": false,
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
	var consumer *entity.Consumer
	err := json.Unmarshal([]byte(r), &route)
	err = json.Unmarshal([]byte(c), &consumer)

	l := &Loader{}
	exported, err := l.Export(loader.DataSets{
		Routes:    []entity.Route{*route},
		Consumers: []entity.Consumer{*consumer},
	})
	assert.NoError(t, err)

	ret, err := json.Marshal(exported)
	assert.Nil(t, err)
	assert.Equal(t, replaceStr(exportR), strings.Replace(string(ret), " ", "", -1))
	assert.NotNil(t, ret)
}

// 13.Export route create by apikey-auth plugin  basic-auth plugin
func TestExportRoutesCreateByKeyAuthAndBasicAuth(t *testing.T) {
	r := `{
		"uri": "/hello",
		"methods": ["Get"],
		"plugins": {
			"key-auth": {},
			"basic-auth": {}
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

	c := `{
		"username": "jack",
		"plugins": {
			"key-auth": {
				"key": "auth-one"
			},
			"basic-auth": {
				"username": "jack",
				"password": "123456"
			}
		},
		"desc": "test description"
	}`

	exportR := `{
		"components": {
			"securitySchemes": {
				"api_key": {
					"in": "header",
					"name": "X-XSRF-TOKEN",
					"type": "apiKey"
				},
				"basicAuth": {
					"in": "header",
					"name": "basicAuth",
					"type": "basicAuth"
				}
			}
		},
		"info": {
			"title": "RoutesExport",
			"version": "3.0.0"
		},
		"openapi": "3.0.0",
		"paths": {
			"/hello": {
				"get": {`

	var route *entity.Route
	var consumer *entity.Consumer
	err := json.Unmarshal([]byte(r), &route)
	err = json.Unmarshal([]byte(c), &consumer)

	l := &Loader{}
	exported, err := l.Export(loader.DataSets{
		Routes:    []entity.Route{*route},
		Consumers: []entity.Consumer{*consumer},
	})
	assert.NoError(t, err)

	ret, err := json.Marshal(exported)
	assert.Nil(t, err)
	assert.NotNil(t, ret)
	assert.Contains(t, strings.Replace(string(ret), " ", "", -1), replaceStr(exportR))
}

// 14.Export all routes
func TestExportRoutesAll(t *testing.T) {
	//*entity.Route
	r1 := `{
		"name": "aaaa",
		"status": 1,
		"uri": "/hello_",
		"host":  "*.bar.com",
		"methods": [ "POST"],
		"upstream": {
			"nodes": {
				"172.16.238.20:1980": 1
			},
			"type": "roundrobin"
		}
	}`

	r2 := `{
		"name": "aaaa2",
		"status": 1,
		"uris": ["/hello_2"],
		"hosts": ["foo.com", "*.bar.com"],
		"methods": ["GET"],
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
				"post": {
					"operationId": "aaaaPOST",
					"requestBody": {},
					"responses": {
						"default": {
							"description": ""
						}
					},
					"x-apisix-enable_websocket": false,
					"x-apisix-host": "*.bar.com",
					"x-apisix-priority": 0,
					"x-apisix-status": 1,
					"x-apisix-upstream": {
						"nodes": {
							"172.16.238.20:1980": 1
						},
						"type": "roundrobin"
					}
				}
			},
			"/hello_2": {
				"get": {
					"operationId": "aaaa2GET",
					"requestBody": {},
					"responses": {
						"default": {
							"description": ""
						}
					},
					"x-apisix-enable_websocket": false,
					"x-apisix-hosts": ["foo.com", "*.bar.com"],
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
	var route2 *entity.Route
	err := json.Unmarshal([]byte(r1), &route)
	assert.NoError(t, err)
	err = json.Unmarshal([]byte(r2), &route2)
	assert.NoError(t, err)

	l := &Loader{}
	exported, err := l.Export(loader.DataSets{
		Routes: []entity.Route{*route, *route2},
	})
	assert.NoError(t, err)

	ret, err := json.Marshal(exported)
	assert.Nil(t, err)
	assert.Equal(t, replaceStr(exportR1), strings.Replace(string(ret), " ", "", -1))
	assert.NotNil(t, ret)
}

//15.Create service according to upstream1 ID
// Create route according to upstream2 ID and service ID
func TestExportRoutesCreateByUpstreamIDAndServiceID2(t *testing.T) {
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

	us2 := `{
		"id": "u2",
		"nodes": [
			{
				"host": "172.16.238.20",
				"port": 1981,
				"weight": 1
			}
		],
		"type": "roundrobin"
	}`

	s := `{
		"id": "s1",
		"name": "testservice",
		"desc": "testservice_desc",
		"enable_websocket":true,
		"upstream_id": "u2"
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
					"operationId": "route_allGET",
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
	var upstream2 *entity.Upstream

	err := json.Unmarshal([]byte(r), &route)
	err = json.Unmarshal([]byte(s), &service)
	err = json.Unmarshal([]byte(us), &upstream)
	err = json.Unmarshal([]byte(us2), &upstream2)

	l := &Loader{}
	exported, err := l.Export(loader.DataSets{
		Routes:    []entity.Route{*route},
		Services:  []entity.Service{*service},
		Upstreams: []entity.Upstream{*upstream, *upstream2},
	})
	assert.NoError(t, err)

	ret, err := json.Marshal(exported)
	assert.Nil(t, err)
	assert.Equal(t, replaceStr(exportR), string(ret))
	assert.NotNil(t, ret)
}

// 16.Add suffix when testing the same URI export "APISIX-REPEAT-URI-" + Millisecond time stamp:  "APISIX-REPEAT-URI-1257894000000"
func TestExportRoutesSameURI(t *testing.T) {
	//*entity.Route
	r1 := `{
		"uris": ["/test-test"],
		"name": "route_all",
		"desc": "所有",
		"methods": ["GET"],
		"hosts": ["test.com"],
		"status": 1,
		"upstream": {
			"nodes": {
				"172.16.238.20:1980": 1
			},
			"type": "roundrobin"
		}
}`

	r2 := `{
		"uris": ["/test-test"],
		"name": "route_all",
		"desc": "所有1",
		"methods": ["GET"],
		"hosts": ["test.com"],
		"status": 1,
		"upstream": {
			"nodes": {
				"172.16.238.20:1980": 1
			},
			"type": "roundrobin"
		}
}`

	r3 := `{
	"uris": ["/test-test"],
	"name": "route_all",
	"desc": "所有2",
	"methods": ["GET"],
	"hosts": ["test.com"],
	"status": 1,
	"upstream": {
		"nodes": {
			"172.16.238.20:1981": 1
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
			"/test-test": {
				"get": {
					"operationId": "route_allGET",
					"requestBody": {},
					"responses": {
						"default": {
							"description": ""
						}
					},
					"summary": "所有",
					"x-apisix-enable_websocket": false,
					"x-apisix-hosts": ["test.com"],
					"x-apisix-priority": 0,
					"x-apisix-status": 1,
					"x-apisix-upstream": {
						"nodes": {
							"172.16.238.20:1980": 1
						},
						"type": "roundrobin"
					}
				}
			},
			"/test-test-APISIX-REPEAT-URI-2": {
				"get": {
					"operationId": "route_allGET",
					"requestBody": {},
					"responses": {
						"default": {
							"description": ""
						}
					},
					"summary": "所有1",
					"x-apisix-enable_websocket": false,
					"x-apisix-hosts": ["test.com"],
					"x-apisix-priority": 0,
					"x-apisix-status": 1,
					"x-apisix-upstream": {
						"nodes": {
							"172.16.238.20:1980": 1
						},
						"type": "roundrobin"
					}
				}
			},
			"/test-test-APISIX-REPEAT-URI-3": {
				"get": {
					"operationId": "route_allGET",
					"requestBody": {},
					"responses": {
						"default": {
							"description": ""
						}
					},
					"summary": "所有2",
					"x-apisix-enable_websocket": false,
					"x-apisix-hosts": ["test.com"],
					"x-apisix-priority": 0,
					"x-apisix-status": 1,
					"x-apisix-upstream": {
						"nodes": {
							"172.16.238.20:1981": 1
						},
						"type": "roundrobin"
					}
				}
			}
		}
	}`
	var route *entity.Route
	var route2 *entity.Route
	var route3 *entity.Route
	err := json.Unmarshal([]byte(r1), &route)
	err = json.Unmarshal([]byte(r2), &route2)
	err = json.Unmarshal([]byte(r3), &route3)

	l := &Loader{}
	exported, err := l.Export(loader.DataSets{
		Routes: []entity.Route{*route, *route2, *route3},
	})
	assert.NoError(t, err)

	ret, err := json.Marshal(exported)
	assert.Nil(t, err)
	assert.Equal(t, replaceStr(exportR1), string(ret))
	assert.NotNil(t, ret)
}

func TestExportRoutesMethodsFeildEmpty(t *testing.T) {
	//*entity.Route
	r1 := `{
		"uris": ["/test-test"],
		"name": "route",
		"methods": [],
		"hosts": ["test.com"],
		"status": 1,
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
			"/test-test": {
				"connect": {
					"operationId": "routeCONNECT",
					"requestBody": {},
					"responses": {
						"default": {
							"description": ""
						}
					},
					"x-apisix-enable_websocket": false,
					"x-apisix-hosts": ["test.com"],
					"x-apisix-priority": 0,
					"x-apisix-status": 1,
					"x-apisix-upstream": {
						"nodes": {
							"172.16.238.20:1980": 1
						},
						"type": "roundrobin"
					}
				},
				"delete": {
					"operationId": "routeDELETE",
					"requestBody": {},
					"responses": {
						"default": {
							"description": ""
						}
					},
					"x-apisix-enable_websocket": false,
					"x-apisix-hosts": ["test.com"],
					"x-apisix-priority": 0,
					"x-apisix-status": 1,
					"x-apisix-upstream": {
						"nodes": {
							"172.16.238.20:1980": 1
						},
						"type": "roundrobin"
					}
				},
				"get": {
					"operationId": "routeGET",
					"requestBody": {},
					"responses": {
						"default": {
							"description": ""
						}
					},
					"x-apisix-enable_websocket": false,
					"x-apisix-hosts": ["test.com"],
					"x-apisix-priority": 0,
					"x-apisix-status": 1,
					"x-apisix-upstream": {
						"nodes": {
							"172.16.238.20:1980": 1
						},
						"type": "roundrobin"
					}
				},
				"head": {
					"operationId": "routeHEAD",
					"requestBody": {},
					"responses": {
						"default": {
							"description": ""
						}
					},
					"x-apisix-enable_websocket": false,
					"x-apisix-hosts": ["test.com"],
					"x-apisix-priority": 0,
					"x-apisix-status": 1,
					"x-apisix-upstream": {
						"nodes": {
							"172.16.238.20:1980": 1
						},
						"type": "roundrobin"
					}
				},
				"options": {
					"operationId": "routeOPTIONS",
					"requestBody": {},
					"responses": {
						"default": {
							"description": ""
						}
					},
					"x-apisix-enable_websocket": false,
					"x-apisix-hosts": ["test.com"],
					"x-apisix-priority": 0,
					"x-apisix-status": 1,
					"x-apisix-upstream": {
						"nodes": {
							"172.16.238.20:1980": 1
						},
						"type": "roundrobin"
					}
				},
				"patch": {
					"operationId": "routePATCH",
					"requestBody": {},
					"responses": {
						"default": {
							"description": ""
						}
					},
					"x-apisix-enable_websocket": false,
					"x-apisix-hosts": ["test.com"],
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
					"operationId": "routePOST",
					"requestBody": {},
					"responses": {
						"default": {
							"description": ""
						}
					},
					"x-apisix-enable_websocket": false,
					"x-apisix-hosts": ["test.com"],
					"x-apisix-priority": 0,
					"x-apisix-status": 1,
					"x-apisix-upstream": {
						"nodes": {
							"172.16.238.20:1980": 1
						},
						"type": "roundrobin"
					}
				},
				"put": {
					"operationId": "routePUT",
					"requestBody": {},
					"responses": {
						"default": {
							"description": ""
						}
					},
					"x-apisix-enable_websocket": false,
					"x-apisix-hosts": ["test.com"],
					"x-apisix-priority": 0,
					"x-apisix-status": 1,
					"x-apisix-upstream": {
						"nodes": {
							"172.16.238.20:1980": 1
						},
						"type": "roundrobin"
					}
				},
				"trace": {
					"operationId": "routeTRACE",
					"requestBody": {},
					"responses": {
						"default": {
							"description": ""
						}
					},
					"x-apisix-enable_websocket": false,
					"x-apisix-hosts": ["test.com"],
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

	l := &Loader{}
	exported, err := l.Export(loader.DataSets{
		Routes: []entity.Route{*route},
	})
	assert.NoError(t, err)

	ret, err := json.Marshal(exported)
	assert.Nil(t, err)
	assert.Equal(t, replaceStr(exportR1), strings.Replace(string(ret), " ", "", -1))
	assert.NotNil(t, ret)
}

func TestExportRoutesMethodsFeildNil(t *testing.T) {
	//*entity.Route
	r1 := `{
		"uris": ["/test-test"],
		"name": "route",
		"hosts": ["test.com"],
		"status": 1,
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
			"/test-test": {
				"connect": {
					"operationId": "routeCONNECT",
					"requestBody": {},
					"responses": {
						"default": {
							"description": ""
						}
					},
					"x-apisix-enable_websocket": false,
					"x-apisix-hosts": ["test.com"],
					"x-apisix-priority": 0,
					"x-apisix-status": 1,
					"x-apisix-upstream": {
						"nodes": {
							"172.16.238.20:1980": 1
						},
						"type": "roundrobin"
					}
				},
				"delete": {
					"operationId": "routeDELETE",
					"requestBody": {},
					"responses": {
						"default": {
							"description": ""
						}
					},
					"x-apisix-enable_websocket": false,
					"x-apisix-hosts": ["test.com"],
					"x-apisix-priority": 0,
					"x-apisix-status": 1,
					"x-apisix-upstream": {
						"nodes": {
							"172.16.238.20:1980": 1
						},
						"type": "roundrobin"
					}
				},
				"get": {
					"operationId": "routeGET",
					"requestBody": {},
					"responses": {
						"default": {
							"description": ""
						}
					},
					"x-apisix-enable_websocket": false,
					"x-apisix-hosts": ["test.com"],
					"x-apisix-priority": 0,
					"x-apisix-status": 1,
					"x-apisix-upstream": {
						"nodes": {
							"172.16.238.20:1980": 1
						},
						"type": "roundrobin"
					}
				},
				"head": {
					"operationId": "routeHEAD",
					"requestBody": {},
					"responses": {
						"default": {
							"description": ""
						}
					},
					"x-apisix-enable_websocket": false,
					"x-apisix-hosts": ["test.com"],
					"x-apisix-priority": 0,
					"x-apisix-status": 1,
					"x-apisix-upstream": {
						"nodes": {
							"172.16.238.20:1980": 1
						},
						"type": "roundrobin"
					}
				},
				"options": {
					"operationId": "routeOPTIONS",
					"requestBody": {},
					"responses": {
						"default": {
							"description": ""
						}
					},
					"x-apisix-enable_websocket": false,
					"x-apisix-hosts": ["test.com"],
					"x-apisix-priority": 0,
					"x-apisix-status": 1,
					"x-apisix-upstream": {
						"nodes": {
							"172.16.238.20:1980": 1
						},
						"type": "roundrobin"
					}
				},
				"patch": {
					"operationId": "routePATCH",
					"requestBody": {},
					"responses": {
						"default": {
							"description": ""
						}
					},
					"x-apisix-enable_websocket": false,
					"x-apisix-hosts": ["test.com"],
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
					"operationId": "routePOST",
					"requestBody": {},
					"responses": {
						"default": {
							"description": ""
						}
					},
					"x-apisix-enable_websocket": false,
					"x-apisix-hosts": ["test.com"],
					"x-apisix-priority": 0,
					"x-apisix-status": 1,
					"x-apisix-upstream": {
						"nodes": {
							"172.16.238.20:1980": 1
						},
						"type": "roundrobin"
					}
				},
				"put": {
					"operationId": "routePUT",
					"requestBody": {},
					"responses": {
						"default": {
							"description": ""
						}
					},
					"x-apisix-enable_websocket": false,
					"x-apisix-hosts": ["test.com"],
					"x-apisix-priority": 0,
					"x-apisix-status": 1,
					"x-apisix-upstream": {
						"nodes": {
							"172.16.238.20:1980": 1
						},
						"type": "roundrobin"
					}
				},
				"trace": {
					"operationId": "routeTRACE",
					"requestBody": {},
					"responses": {
						"default": {
							"description": ""
						}
					},
					"x-apisix-enable_websocket": false,
					"x-apisix-hosts": ["test.com"],
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

	l := &Loader{}
	exported, err := l.Export(loader.DataSets{
		Routes: []entity.Route{*route},
	})
	assert.NoError(t, err)

	ret, err := json.Marshal(exported)
	assert.Nil(t, err)
	assert.Equal(t, replaceStr(exportR1), strings.Replace(string(ret), " ", "", -1))
	assert.NotNil(t, ret)
}

func replaceStr(str string) string {
	str = strings.Replace(str, "\n", "", -1)
	str = strings.Replace(str, "\t", "", -1)
	str = strings.Replace(str, " ", "", -1)
	return str
}
