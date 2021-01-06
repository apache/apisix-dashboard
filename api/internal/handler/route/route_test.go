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
	"encoding/json"
	"net/http"
	"testing"
	"time"

	"github.com/shiningrush/droplet"
	"github.com/shiningrush/droplet/data"
	"github.com/stretchr/testify/assert"

	"github.com/apisix/manager-api/internal/conf"
	"github.com/apisix/manager-api/internal/core/entity"
	"github.com/apisix/manager-api/internal/core/storage"
	"github.com/apisix/manager-api/internal/core/store"
)

func TestRoute(t *testing.T) {
	// init
	err := storage.InitETCDClient(conf.ETCDConfig)
	assert.Nil(t, err)
	err = store.InitStores()
	assert.Nil(t, err)

	handler := &Handler{
		routeStore:    store.GetStore(store.HubKeyRoute),
		svcStore:      store.GetStore(store.HubKeyService),
		upstreamStore: store.GetStore(store.HubKeyUpstream),
		scriptStore:   store.GetStore(store.HubKeyScript),
	}
	assert.NotNil(t, handler)

	//create Note: depends on lib `dag-to-lua` if script exists
	ctx := droplet.NewContext()
	route := &entity.Route{}
	reqBody := `{
	  "id": "1",
	  "name": "aaaa",
	  "uri": "/index.html",
	  "hosts": ["foo.com", "*.bar.com"],
	  "vars": [],
	  "remote_addrs": ["127.0.0.0/8"],
	  "methods": ["PUT", "GET"],
	  "status": 1,
	  "upstream": {
	      "type": "roundrobin",
	      "nodes": [{
	          "host": "www.a.com",
	          "port": 80,
	          "weight": 1
	      }]
	  },
	  "script":{
	      "rule":{
	          "root":"451106f8-560c-43a4-acf2-2a6ed0ea57b8",
	          "451106f8-560c-43a4-acf2-2a6ed0ea57b8":[
	              [
	                  "code == 403",
	                  "b93d622c-92ef-48b4-b6bb-57e1ce893ee3"
	              ],
	              [
	                  "",
	                  "988ef5c2-c896-4606-a666-3d4cbe24a731"
	              ]
	          ]
	      },
	      "conf":{
	          "451106f8-560c-43a4-acf2-2a6ed0ea57b8":{
	              "name":"uri-blocker",
	              "conf":{
	                  "block_rules":[
	                      "root.exe",
	                      "root.m+"
	                  ],
	                  "rejected_code":403
	              }
	          },
	          "988ef5c2-c896-4606-a666-3d4cbe24a731":{
	              "name":"kafka-logger",
	              "conf":{
	                  "batch_max_size":1000,
	                  "broker_list":{
	
	                  },
	                  "buffer_duration":60,
	                  "inactive_timeout":5,
	                  "include_req_body":false,
	                  "kafka_topic":"1",
	                  "key":"2",
	                  "max_retry_count":0,
	                  "name":"kafka logger",
	                  "retry_delay":1,
	                  "timeout":3
	              }
	          },
	          "b93d622c-92ef-48b4-b6bb-57e1ce893ee3":{
	              "name":"fault-injection",
	              "conf":{
	                  "abort":{
	                      "body":"200",
	                      "http_status":300
	                  },
	                  "delay":{
	                      "duration":500
	                  }
	              }
	          }
	      },
	      "chart":{
	          "hovered":{
	
	          },
	          "links":{
	              "3a110c30-d6f3-40b1-a8ac-b828cfaa2489":{
	                  "from":{
	                      "nodeId":"3365eca3-4bc8-4769-bab3-1485dfd6a43c",
	                      "portId":"port3"
	                  },
	                  "id":"3a110c30-d6f3-40b1-a8ac-b828cfaa2489",
	                  "to":{
	                      "nodeId":"b93d622c-92ef-48b4-b6bb-57e1ce893ee3",
	                      "portId":"port1"
	                  }
	              },
	              "c1958993-c1ef-44b1-bb32-7fc6f34870c2":{
	                  "from":{
	                      "nodeId":"3365eca3-4bc8-4769-bab3-1485dfd6a43c",
	                      "portId":"port2"
	                  },
	                  "id":"c1958993-c1ef-44b1-bb32-7fc6f34870c2",
	                  "to":{
	                      "nodeId":"988ef5c2-c896-4606-a666-3d4cbe24a731",
	                      "portId":"port1"
	                  }
	              },
	              "f9c42bf6-c8aa-4e86-8498-8dfbc5c53c23":{
	                  "from":{
	                      "nodeId":"451106f8-560c-43a4-acf2-2a6ed0ea57b8",
	                      "portId":"port2"
	                  },
	                  "id":"f9c42bf6-c8aa-4e86-8498-8dfbc5c53c23",
	                  "to":{
	                      "nodeId":"3365eca3-4bc8-4769-bab3-1485dfd6a43c",
	                      "portId":"port1"
	                  }
	              }
	          },
	          "nodes":{
	              "3365eca3-4bc8-4769-bab3-1485dfd6a43c":{
	                  "id":"3365eca3-4bc8-4769-bab3-1485dfd6a43c",
	                  "orientation":0,
	                  "ports":{
	                      "port1":{
	                          "id":"port1",
	                          "position":{
	                              "x":107,
	                              "y":0
	                          },
	                          "type":"input"
	                      },
	                      "port2":{
	                          "id":"port2",
	                          "position":{
	                              "x":92,
	                              "y":96
	                          },
	                          "properties":{
	                              "value":"no"
	                          },
	                          "type":"output"
	                      },
	                      "port3":{
	                          "id":"port3",
	                          "position":{
	                              "x":122,
	                              "y":96
	                          },
	                          "properties":{
	                              "value":"yes"
	                          },
	                          "type":"output"
	                      }
	                  },
	                  "position":{
	                      "x":750.2627969928922,
	                      "y":301.0370335799397
	                  },
	                  "properties":{
	                      "customData":{
	                          "name":"code == 403",
	                          "type":1
	                      }
	                  },
	                  "size":{
	                      "height":96,
	                      "width":214
	                  },
	                  "type":"判断条件"
	              },
	              "451106f8-560c-43a4-acf2-2a6ed0ea57b8":{
	                  "id":"451106f8-560c-43a4-acf2-2a6ed0ea57b8",
	                  "orientation":0,
	                  "ports":{
	                      "port1":{
	                          "id":"port1",
	                          "position":{
	                              "x":100,
	                              "y":0
	                          },
	                          "properties":{
	                              "custom":"property"
	                          },
	                          "type":"input"
	                      },
	                      "port2":{
	                          "id":"port2",
	                          "position":{
	                              "x":100,
	                              "y":96
	                          },
	                          "properties":{
	                              "custom":"property"
	                          },
	                          "type":"output"
	                      }
	                  },
	                  "position":{
	                      "x":741.5684544145346,
	                      "y":126.75879247285502
	                  },
	                  "properties":{
	                      "customData":{
	                          "data":{
	                              "block_rules":[
	                                  "root.exe",
	                                  "root.m+"
	                              ],
	                              "rejected_code":403
	                          },
	                          "name":"uri-blocker",
	                          "type":0
	                      }
	                  },
	                  "size":{
	                      "height":96,
	                      "width":201
	                  },
	                  "type":"uri-blocker"
	              },
	              "988ef5c2-c896-4606-a666-3d4cbe24a731":{
	                  "id":"988ef5c2-c896-4606-a666-3d4cbe24a731",
	                  "orientation":0,
	                  "ports":{
	                      "port1":{
	                          "id":"port1",
	                          "position":{
	                              "x":106,
	                              "y":0
	                          },
	                          "properties":{
	                              "custom":"property"
	                          },
	                          "type":"input"
	                      },
	                      "port2":{
	                          "id":"port2",
	                          "position":{
	                              "x":106,
	                              "y":96
	                          },
	                          "properties":{
	                              "custom":"property"
	                          },
	                          "type":"output"
	                      }
	                  },
	                  "position":{
	                      "x":607.9687500000001,
	                      "y":471.17788461538447
	                  },
	                  "properties":{
	                      "customData":{
	                          "data":{
	                              "batch_max_size":1000,
	                              "broker_list":{
	
	                              },
	                              "buffer_duration":60,
	                              "inactive_timeout":5,
	                              "include_req_body":false,
	                              "kafka_topic":"1",
	                              "key":"2",
	                              "max_retry_count":0,
	                              "name":"kafka logger",
	                              "retry_delay":1,
	                              "timeout":3
	                          },
	                          "name":"kafka-logger",
	                          "type":0
	                      }
	                  },
	                  "size":{
	                      "height":96,
	                      "width":212
	                  },
	                  "type":"kafka-logger"
	              },
	              "b93d622c-92ef-48b4-b6bb-57e1ce893ee3":{
	                  "id":"b93d622c-92ef-48b4-b6bb-57e1ce893ee3",
	                  "orientation":0,
	                  "ports":{
	                      "port1":{
	                          "id":"port1",
	                          "position":{
	                              "x":110,
	                              "y":0
	                          },
	                          "properties":{
	                              "custom":"property"
	                          },
	                          "type":"input"
	                      },
	                      "port2":{
	                          "id":"port2",
	                          "position":{
	                              "x":110,
	                              "y":96
	                          },
	                          "properties":{
	                              "custom":"property"
	                          },
	                          "type":"output"
	                      }
	                  },
	                  "position":{
	                      "x":988.9074986362261,
	                      "y":478.62041800736495
	                  },
	                  "properties":{
	                      "customData":{
	                          "data":{
	                              "abort":{
	                                  "body":"200",
	                                  "http_status":300
	                              },
	                              "delay":{
	                                  "duration":500
	                              }
	                          },
	                          "name":"fault-injection",
	                          "type":0
	                      }
	                  },
	                  "size":{
	                      "height":96,
	                      "width":219
	                  },
	                  "type":"fault-injection"
	              }
	          },
	          "offset":{
	              "x":-376.83,
	              "y":87.98
	          },
	          "scale":0.832,
	          "selected":{
	              "id":"b93d622c-92ef-48b4-b6bb-57e1ce893ee3",
	              "type":"node"
	          }
	      }
	  }
	}`
	err = json.Unmarshal([]byte(reqBody), route)
	assert.Nil(t, err)
	ctx.SetInput(route)
	_, err = handler.Create(ctx)
	assert.Nil(t, err)

	//sleep
	time.Sleep(time.Duration(100) * time.Millisecond)

	//get
	input := &GetInput{}
	input.ID = "1"
	ctx.SetInput(input)
	ret, err := handler.Get(ctx)
	stored := ret.(*entity.Route)
	assert.Nil(t, err)
	assert.Equal(t, stored.ID, route.ID)

	//update
	route2 := &UpdateInput{}
	route2.ID = "1"
	reqBody = `{
	  "id": "1",
	  "name": "aaaa",
	  "uri": "/index.html",
	  "hosts": ["foo.com", "*.bar.com"],
	  "remote_addrs": ["127.0.0.0/8"],
	  "methods": ["PUT", "GET"],
	  "status": 1,
	  "labels": {
	      "l1": "v1",
	      "l2": "v2"
      },
	  "upstream": {
	      "type": "roundrobin",
	      "nodes": [{
	          "host": "www.a.com",
	          "port": 80,
	          "weight": 1
	      }]
	  },
	  "script":{
	      "rule":{
	          "root":"451106f8-560c-43a4-acf2-2a6ed0ea57b8",
	          "451106f8-560c-43a4-acf2-2a6ed0ea57b8":[
	              [
	                  "code == 403",
	                  "b93d622c-92ef-48b4-b6bb-57e1ce893ee3"
	              ],
	              [
	                  "",
	                  "988ef5c2-c896-4606-a666-3d4cbe24a731"
	              ]
	          ]
	      },
	      "conf":{
	          "451106f8-560c-43a4-acf2-2a6ed0ea57b8":{
	              "name":"uri-blocker",
	              "conf":{
	                  "block_rules":[
	                      "root.exe",
	                      "root.m+"
	                  ],
	                  "rejected_code":403
	              }
	          },
	          "988ef5c2-c896-4606-a666-3d4cbe24a731":{
	              "name":"kafka-logger",
	              "conf":{
	                  "batch_max_size":1000,
	                  "broker_list":{
	
	                  },
	                  "buffer_duration":60,
	                  "inactive_timeout":5,
	                  "include_req_body":false,
	                  "kafka_topic":"1",
	                  "key":"2",
	                  "max_retry_count":0,
	                  "name":"kafka logger",
	                  "retry_delay":1,
	                  "timeout":3
	              }
	          },
	          "b93d622c-92ef-48b4-b6bb-57e1ce893ee3":{
	              "name":"fault-injection",
	              "conf":{
	                  "abort":{
	                      "body":"200",
	                      "http_status":300
	                  },
	                  "delay":{
	                      "duration":500
	                  }
	              }
	          }
	      },
	      "chart":{
	          "hovered":{
	
	          },
	          "links":{
	              "3a110c30-d6f3-40b1-a8ac-b828cfaa2489":{
	                  "from":{
	                      "nodeId":"3365eca3-4bc8-4769-bab3-1485dfd6a43c",
	                      "portId":"port3"
	                  },
	                  "id":"3a110c30-d6f3-40b1-a8ac-b828cfaa2489",
	                  "to":{
	                      "nodeId":"b93d622c-92ef-48b4-b6bb-57e1ce893ee3",
	                      "portId":"port1"
	                  }
	              },
	              "c1958993-c1ef-44b1-bb32-7fc6f34870c2":{
	                  "from":{
	                      "nodeId":"3365eca3-4bc8-4769-bab3-1485dfd6a43c",
	                      "portId":"port2"
	                  },
	                  "id":"c1958993-c1ef-44b1-bb32-7fc6f34870c2",
	                  "to":{
	                      "nodeId":"988ef5c2-c896-4606-a666-3d4cbe24a731",
	                      "portId":"port1"
	                  }
	              },
	              "f9c42bf6-c8aa-4e86-8498-8dfbc5c53c23":{
	                  "from":{
	                      "nodeId":"451106f8-560c-43a4-acf2-2a6ed0ea57b8",
	                      "portId":"port2"
	                  },
	                  "id":"f9c42bf6-c8aa-4e86-8498-8dfbc5c53c23",
	                  "to":{
	                      "nodeId":"3365eca3-4bc8-4769-bab3-1485dfd6a43c",
	                      "portId":"port1"
	                  }
	              }
	          },
	          "nodes":{
	              "3365eca3-4bc8-4769-bab3-1485dfd6a43c":{
	                  "id":"3365eca3-4bc8-4769-bab3-1485dfd6a43c",
	                  "orientation":0,
	                  "ports":{
	                      "port1":{
	                          "id":"port1",
	                          "position":{
	                              "x":107,
	                              "y":0
	                          },
	                          "type":"input"
	                      },
	                      "port2":{
	                          "id":"port2",
	                          "position":{
	                              "x":92,
	                              "y":96
	                          },
	                          "properties":{
	                              "value":"no"
	                          },
	                          "type":"output"
	                      },
	                      "port3":{
	                          "id":"port3",
	                          "position":{
	                              "x":122,
	                              "y":96
	                          },
	                          "properties":{
	                              "value":"yes"
	                          },
	                          "type":"output"
	                      }
	                  },
	                  "position":{
	                      "x":750.2627969928922,
	                      "y":301.0370335799397
	                  },
	                  "properties":{
	                      "customData":{
	                          "name":"code == 403",
	                          "type":1
	                      }
	                  },
	                  "size":{
	                      "height":96,
	                      "width":214
	                  },
	                  "type":"判断条件"
	              },
	              "451106f8-560c-43a4-acf2-2a6ed0ea57b8":{
	                  "id":"451106f8-560c-43a4-acf2-2a6ed0ea57b8",
	                  "orientation":0,
	                  "ports":{
	                      "port1":{
	                          "id":"port1",
	                          "position":{
	                              "x":100,
	                              "y":0
	                          },
	                          "properties":{
	                              "custom":"property"
	                          },
	                          "type":"input"
	                      },
	                      "port2":{
	                          "id":"port2",
	                          "position":{
	                              "x":100,
	                              "y":96
	                          },
	                          "properties":{
	                              "custom":"property"
	                          },
	                          "type":"output"
	                      }
	                  },
	                  "position":{
	                      "x":741.5684544145346,
	                      "y":126.75879247285502
	                  },
	                  "properties":{
	                      "customData":{
	                          "data":{
	                              "block_rules":[
	                                  "root.exe",
	                                  "root.m+"
	                              ],
	                              "rejected_code":403
	                          },
	                          "name":"uri-blocker",
	                          "type":0
	                      }
	                  },
	                  "size":{
	                      "height":96,
	                      "width":201
	                  },
	                  "type":"uri-blocker"
	              },
	              "988ef5c2-c896-4606-a666-3d4cbe24a731":{
	                  "id":"988ef5c2-c896-4606-a666-3d4cbe24a731",
	                  "orientation":0,
	                  "ports":{
	                      "port1":{
	                          "id":"port1",
	                          "position":{
	                              "x":106,
	                              "y":0
	                          },
	                          "properties":{
	                              "custom":"property"
	                          },
	                          "type":"input"
	                      },
	                      "port2":{
	                          "id":"port2",
	                          "position":{
	                              "x":106,
	                              "y":96
	                          },
	                          "properties":{
	                              "custom":"property"
	                          },
	                          "type":"output"
	                      }
	                  },
	                  "position":{
	                      "x":607.9687500000001,
	                      "y":471.17788461538447
	                  },
	                  "properties":{
	                      "customData":{
	                          "data":{
	                              "batch_max_size":1000,
	                              "broker_list":{
	
	                              },
	                              "buffer_duration":60,
	                              "inactive_timeout":5,
	                              "include_req_body":false,
	                              "kafka_topic":"1",
	                              "key":"2",
	                              "max_retry_count":0,
	                              "name":"kafka logger",
	                              "retry_delay":1,
	                              "timeout":3
	                          },
	                          "name":"kafka-logger",
	                          "type":0
	                      }
	                  },
	                  "size":{
	                      "height":96,
	                      "width":212
	                  },
	                  "type":"kafka-logger"
	              },
	              "b93d622c-92ef-48b4-b6bb-57e1ce893ee3":{
	                  "id":"b93d622c-92ef-48b4-b6bb-57e1ce893ee3",
	                  "orientation":0,
	                  "ports":{
	                      "port1":{
	                          "id":"port1",
	                          "position":{
	                              "x":110,
	                              "y":0
	                          },
	                          "properties":{
	                              "custom":"property"
	                          },
	                          "type":"input"
	                      },
	                      "port2":{
	                          "id":"port2",
	                          "position":{
	                              "x":110,
	                              "y":96
	                          },
	                          "properties":{
	                              "custom":"property"
	                          },
	                          "type":"output"
	                      }
	                  },
	                  "position":{
	                      "x":988.9074986362261,
	                      "y":478.62041800736495
	                  },
	                  "properties":{
	                      "customData":{
	                          "data":{
	                              "abort":{
	                                  "body":"200",
	                                  "http_status":300
	                              },
	                              "delay":{
	                                  "duration":500
	                              }
	                          },
	                          "name":"fault-injection",
	                          "type":0
	                      }
	                  },
	                  "size":{
	                      "height":96,
	                      "width":219
	                  },
	                  "type":"fault-injection"
	              }
	          },
	          "offset":{
	              "x":-376.83,
	              "y":87.98
	          },
	          "scale":0.832,
	          "selected":{
	              "id":"b93d622c-92ef-48b4-b6bb-57e1ce893ee3",
	              "type":"node"
	          }
	      }
	  }
	}`

	err = json.Unmarshal([]byte(reqBody), route2)
	assert.Nil(t, err)
	ctx.SetInput(route2)
	_, err = handler.Update(ctx)
	assert.Nil(t, err)

	//sleep
	time.Sleep(time.Duration(100) * time.Millisecond)

	// check ID discrepancy on Update

	// Fail: test the string body id value != string route id value
	errRoute := &UpdateInput{}
	errRoute.ID = "2"
	err = json.Unmarshal([]byte(reqBody), errRoute)
	assert.Nil(t, err)
	ctx.SetInput(errRoute)
	ret, err = handler.Update(ctx)
	assert.NotNil(t, err)
	assert.EqualError(t, err, "ID on path (2) doesn't match ID on body (1)")
	assert.Equal(t, http.StatusBadRequest, ret.(*data.SpecCodeResponse).StatusCode)

	// Fail: tests the float body id value != string route id value
	reqBodyErr := `{
		"id": 1,
		"uri": "/index.html",
		"upstream": {
			"type": "roundrobin",
			"nodes": [{
				"host": "www.a.com",
				"port": 80,
				"weight": 1
			}]
		}
	}`
	errRoute = &UpdateInput{}
	errRoute.ID = "2"
	err = json.Unmarshal([]byte(reqBodyErr), errRoute)
	assert.Nil(t, err)
	ctx.SetInput(errRoute)
	ret, err = handler.Update(ctx)
	assert.NotNil(t, err)
	assert.EqualError(t, err, "ID on path (2) doesn't match ID on body (1)")
	assert.Equal(t, http.StatusBadRequest, ret.(*data.SpecCodeResponse).StatusCode)

	// Success: tests the float body id value is == string route id value
	reqBodyErr = `{
		"id": 10,
		"uri": "/index.html",
		"upstream": {
			"type": "roundrobin",
			"nodes": [{
				"host": "www.a.com",
				"port": 80,
				"weight": 1
			}]
		}
	}`
	errRoute = &UpdateInput{}
	errRoute.ID = "10"
	err = json.Unmarshal([]byte(reqBodyErr), errRoute)
	assert.Nil(t, err)
	ctx.SetInput(errRoute)
	ret, err = handler.Update(ctx)
	assert.Nil(t, err)

	// Success: tests the Body ID can be nil
	reqBodyErr = `{
		"uri": "/index.html",
		"upstream": {
			"type": "roundrobin",
			"nodes": [{
				"host": "www.a.com",
				"port": 80,
				"weight": 1
			}]
		}
	}`
	errRoute = &UpdateInput{}
	errRoute.ID = "r1"
	err = json.Unmarshal([]byte(reqBodyErr), errRoute)
	assert.Nil(t, err)
	ctx.SetInput(errRoute)
	ret, err = handler.Update(ctx)
	assert.Nil(t, err)

	//sleep
	time.Sleep(time.Duration(100) * time.Millisecond)

	//list
	listInput := &ListInput{}
	reqBody = `{"page_size": 1, "page": 1}`
	err = json.Unmarshal([]byte(reqBody), listInput)
	assert.Nil(t, err)
	ctx.SetInput(listInput)
	retPage, err := handler.List(ctx)
	assert.Nil(t, err)
	dataPage := retPage.(*store.ListOutput)
	assert.Equal(t, len(dataPage.Rows), 1)

	//list search match
	listInput = &ListInput{}
	reqBody = `{"page_size": 1, "page": 1, "name": "a", "uri": "index"}`
	err = json.Unmarshal([]byte(reqBody), listInput)
	assert.Nil(t, err)
	ctx.SetInput(listInput)
	retPage, err = handler.List(ctx)
	assert.Nil(t, err)
	dataPage = retPage.(*store.ListOutput)
	assert.Equal(t, len(dataPage.Rows), 1)

	//list search name not match
	listInput = &ListInput{}
	reqBody = `{"page_size": 1, "page": 1, "name": "not-exists", "uri": "index"}`
	err = json.Unmarshal([]byte(reqBody), listInput)
	assert.Nil(t, err)
	ctx.SetInput(listInput)
	retPage, err = handler.List(ctx)
	assert.Nil(t, err)
	dataPage = retPage.(*store.ListOutput)
	assert.Equal(t, len(dataPage.Rows), 0)

	//list search uri not match
	listInput = &ListInput{}
	reqBody = `{"page_size": 1, "page": 1, "name": "a", "uri": "not-exists"}`
	err = json.Unmarshal([]byte(reqBody), listInput)
	assert.Nil(t, err)
	ctx.SetInput(listInput)
	retPage, err = handler.List(ctx)
	assert.Nil(t, err)
	dataPage = retPage.(*store.ListOutput)
	assert.Equal(t, len(dataPage.Rows), 0)

	//list search label not match
	listInput = &ListInput{}
	reqBody = `{"page_size": 1, "page": 1, "label":"l3"}`
	err = json.Unmarshal([]byte(reqBody), listInput)
	assert.Nil(t, err)
	ctx.SetInput(listInput)
	retPage, err = handler.List(ctx)
	assert.Nil(t, err)
	dataPage = retPage.(*store.ListOutput)
	assert.Equal(t, len(dataPage.Rows), 0)

	//list search label match
	listInput = &ListInput{}
	reqBody = `{"page_size": 1, "page": 1, "label":"l1"}`
	err = json.Unmarshal([]byte(reqBody), listInput)
	assert.Nil(t, err)
	ctx.SetInput(listInput)
	retPage, err = handler.List(ctx)
	assert.Nil(t, err)
	dataPage = retPage.(*store.ListOutput)
	assert.Equal(t, len(dataPage.Rows), 1)

	//list search label match
	listInput = &ListInput{}
	reqBody = `{"page_size": 1, "page": 1, "label":"l1:v1"}`
	err = json.Unmarshal([]byte(reqBody), listInput)
	assert.Nil(t, err)
	ctx.SetInput(listInput)
	retPage, err = handler.List(ctx)
	assert.Nil(t, err)
	dataPage = retPage.(*store.ListOutput)
	assert.Equal(t, len(dataPage.Rows), 1)

	//list search and label not match
	listInput = &ListInput{}
	reqBody = `{"page_size": 1, "page": 1, "label":"l1:v2"}`
	err = json.Unmarshal([]byte(reqBody), listInput)
	assert.Nil(t, err)
	ctx.SetInput(listInput)
	retPage, err = handler.List(ctx)
	assert.Nil(t, err)
	dataPage = retPage.(*store.ListOutput)
	assert.Equal(t, len(dataPage.Rows), 0)

	// list search and status match
	listInput = &ListInput{}
	reqBody = `{"page_size": 1, "page": 1, "status": "1"}`
	err = json.Unmarshal([]byte(reqBody), listInput)
	assert.Nil(t, err)
	ctx.SetInput(listInput)
	retPage, err = handler.List(ctx)
	assert.Nil(t, err)
	dataPage = retPage.(*store.ListOutput)
	assert.Equal(t, len(dataPage.Rows), 1)

        //sleep
	time.Sleep(time.Duration(100) * time.Millisecond)

	// list search and status not match
	listInput = &ListInput{}
	reqBody = `{"page_size": 1, "page": 1, "name": "a", "status": "0"}`
	err = json.Unmarshal([]byte(reqBody), listInput)
	assert.Nil(t, err)
	ctx.SetInput(listInput)
	retPage, err = handler.List(ctx)
	assert.Nil(t, err)
	dataPage = retPage.(*store.ListOutput)
	assert.Equal(t, len(dataPage.Rows), 0)

	//list search with name and status
	listInput = &ListInput{}
	reqBody = `{"page_size": 1, "page": 1, "name": "a", "status": "1"}`
	err = json.Unmarshal([]byte(reqBody), listInput)
	assert.Nil(t, err)
	ctx.SetInput(listInput)
	retPage, err = handler.List(ctx)
	assert.Nil(t, err)
	dataPage = retPage.(*store.ListOutput)
	assert.Equal(t, len(dataPage.Rows), 1)

	//list search with name and label
	listInput = &ListInput{}
	reqBody = `{"page_size": 1, "page": 1, "name": "a", "label":"l1:v1"}`
	err = json.Unmarshal([]byte(reqBody), listInput)
	assert.Nil(t, err)
	ctx.SetInput(listInput)
	retPage, err = handler.List(ctx)
	assert.Nil(t, err)
	dataPage = retPage.(*store.ListOutput)
	assert.Equal(t, len(dataPage.Rows), 1)

	//list search with uri and label
	listInput = &ListInput{}
	reqBody = `{"page_size": 1, "page": 1, "uri": "index", "label":"l1:v1"}`
	err = json.Unmarshal([]byte(reqBody), listInput)
	assert.Nil(t, err)
	ctx.SetInput(listInput)
	retPage, err = handler.List(ctx)
	assert.Nil(t, err)
	dataPage = retPage.(*store.ListOutput)
	assert.Equal(t, len(dataPage.Rows), 1)

	//list search with uri,name and label
	listInput = &ListInput{}
	reqBody = `{"page_size": 1, "page": 1, "name": "a", "uri": "index", "label":"l1:v1"}`
	err = json.Unmarshal([]byte(reqBody), listInput)
	assert.Nil(t, err)
	ctx.SetInput(listInput)
	retPage, err = handler.List(ctx)
	assert.Nil(t, err)
	dataPage = retPage.(*store.ListOutput)
	assert.Equal(t, len(dataPage.Rows), 1)

	//list search with uri,name, status and label
	listInput = &ListInput{}
	reqBody = `{"page_size": 1, "page": 1, "name": "a", "status": "1", "uri": "index", "label":"l1:v1"}`
	err = json.Unmarshal([]byte(reqBody), listInput)
	assert.Nil(t, err)
	ctx.SetInput(listInput)
	retPage, err = handler.List(ctx)
	assert.Nil(t, err)
	dataPage = retPage.(*store.ListOutput)
	assert.Equal(t, len(dataPage.Rows), 1)

	//create route using uris
	route3 := &entity.Route{}
	reqBody = `{
	  "id": "2",
	  "name": "bbbbb",
	  "uris": ["/aa", "/bb"],
	  "hosts": ["foo.com", "*.bar.com"],
	  "remote_addrs": ["127.0.0.0/8"],
	  "methods": ["PUT", "GET"],
	  "upstream": {
	      "type": "roundrobin",
	      "nodes": {"www.a.com:80": 1}
	  }
	}`
	err = json.Unmarshal([]byte(reqBody), route3)
	assert.Nil(t, err)
	ctx.SetInput(route3)
	_, err = handler.Create(ctx)
	assert.Nil(t, err)

	//sleep
	time.Sleep(time.Duration(100) * time.Millisecond)

	//list search match uris
	listInput = &ListInput{}
	reqBody = `{"page_size": 1, "page": 1, "name": "bbb", "uri": "bb"}`
	err = json.Unmarshal([]byte(reqBody), listInput)
	assert.Nil(t, err)
	ctx.SetInput(listInput)
	retPage, err = handler.List(ctx)
	assert.Nil(t, err)
	dataPage = retPage.(*store.ListOutput)
	assert.Equal(t, len(dataPage.Rows), 1)

	//delete test data
	inputDel := &BatchDelete{}
	reqBody = `{"ids": "1,2"}`
	err = json.Unmarshal([]byte(reqBody), inputDel)
	assert.Nil(t, err)
	ctx.SetInput(inputDel)
	_, err = handler.BatchDelete(ctx)
	assert.Nil(t, err)

	//sleep
	time.Sleep(time.Duration(100) * time.Millisecond)

	//get route -- deleted, not found
	getInput := &GetInput{}
	reqBody = `{"id": "1"}`
	err = json.Unmarshal([]byte(reqBody), getInput)
	assert.Nil(t, err)
	ctx.SetInput(getInput)
	ret, err = handler.Get(ctx)
	assert.EqualError(t, err, "data not found")
	assert.Equal(t, http.StatusNotFound, ret.(*data.SpecCodeResponse).StatusCode)

	//delete test data
	reqBody = `{"ids": "not-exists"}`
	err = json.Unmarshal([]byte(reqBody), inputDel)
	assert.Nil(t, err)
	ctx.SetInput(inputDel)
	ret, err = handler.BatchDelete(ctx)
	assert.NotNil(t, err)
	assert.Equal(t, http.StatusNotFound, ret.(*data.SpecCodeResponse).StatusCode)

	//create route with not exist upstream id
	route4 := &entity.Route{}
	reqBody = `{
	  "id": "2222",
	  "name": "r222",
	  "uris": ["/aa", "/bb"],
	  "upstream_id": "not-exists"
	}`
	err = json.Unmarshal([]byte(reqBody), route4)
	assert.Nil(t, err)
	ctx.SetInput(route4)
	ret, err = handler.Create(ctx)
	assert.NotNil(t, err)
	assert.Equal(t, http.StatusBadRequest, ret.(*data.SpecCodeResponse).StatusCode)

	//type:chash, hash_on: vars, wrong key
	route5 := &entity.Route{}
	reqBody = `{
	  "id": "1",
	  "methods": ["GET"],
	  "upstream": {
	      "nodes": {
	          "127.0.0.1:8080": 1
	      },
	      "type": "chash",
	      "hash_on":"vars",
	      "key": "not_support"
	  },
	  "desc": "new route",
	  "uri": "/index.html"
	}`
	err = json.Unmarshal([]byte(reqBody), route5)
	assert.Nil(t, err)
	ctx.SetInput(route5)
	ret, err = handler.Create(ctx)
	assert.NotNil(t, err)
	assert.Equal(t, http.StatusBadRequest, ret.(*data.SpecCodeResponse).StatusCode)

	//type:chash, hash_on: cookie, missing key
	route6 := &entity.Route{}
	reqBody = `{
	  "id": "1",
	  "methods": ["GET"],
	  "upstream": {
	      "nodes": {
	          "127.0.0.1:8080": 1
	      },
	      "type": "chash",
	      "hash_on":"cookie"
	  },
	  "desc": "new route",
	  "uri": "/index.html"
	}`
	err = json.Unmarshal([]byte(reqBody), route6)
	assert.Nil(t, err)
	ctx.SetInput(route6)
	ret, err = handler.Create(ctx)
	assert.NotNil(t, err)
	assert.Equal(t, http.StatusBadRequest, ret.(*data.SpecCodeResponse).StatusCode)

	//create route with out upstream
	route11 := &entity.Route{}
	reqBody = `{
	  "id": "11",
	  "name": "bbbbb",
	  "uri": "/r11",
	  "hosts": ["foo.com", "*.bar.com"],
	  "remote_addrs": ["127.0.0.0/8"],
	  "methods": ["PUT", "GET"],
	  "plugins": {
	      "limit-count": {
	          "count": 2,
	          "time_window": 60,
	          "rejected_code": 503,
	          "key": "remote_addr"
	      }
	  }
	}`
	err = json.Unmarshal([]byte(reqBody), route11)
	assert.Nil(t, err)
	ctx.SetInput(route11)
	_, err = handler.Create(ctx)
	assert.Nil(t, err)

	//sleep
	time.Sleep(time.Duration(100) * time.Millisecond)

	//get
	input11 := &GetInput{}
	input11.ID = "11"
	ctx.SetInput(input11)
	ret, err = handler.Get(ctx)
	assert.Nil(t, err)
	stored = ret.(*entity.Route)
	assert.Equal(t, "11", stored.ID)

	//list
	listInput = &ListInput{}
	reqBody = `{"page_size": 10, "page": 1}`
	err = json.Unmarshal([]byte(reqBody), listInput)
	assert.Nil(t, err)
	ctx.SetInput(listInput)
	_, err = handler.List(ctx)
	assert.Nil(t, err)

	//list search match
	listInput = &ListInput{}
	reqBody = `{"page_size": 1, "page": 1,  "uri": "r11"}`
	err = json.Unmarshal([]byte(reqBody), listInput)
	assert.Nil(t, err)
	ctx.SetInput(listInput)
	retPage, err = handler.List(ctx)
	assert.Nil(t, err)
	dataPage = retPage.(*store.ListOutput)
	assert.Equal(t, len(dataPage.Rows), 1)

	//delete test data
	reqBody = `{"ids": "11"}`
	err = json.Unmarshal([]byte(reqBody), inputDel)
	assert.Nil(t, err)
	ctx.SetInput(inputDel)
	_, err = handler.BatchDelete(ctx)
	assert.Nil(t, err)
}

func Test_Route_With_Script(t *testing.T) {
	// init
	err := storage.InitETCDClient(conf.ETCDConfig)
	assert.Nil(t, err)
	err = store.InitStores()
	assert.Nil(t, err)

	handler := &Handler{
		routeStore:    store.GetStore(store.HubKeyRoute),
		svcStore:      store.GetStore(store.HubKeyService),
		upstreamStore: store.GetStore(store.HubKeyUpstream),
		scriptStore:   store.GetStore(store.HubKeyScript),
	}
	assert.NotNil(t, handler)

	//create Note: depends on lib `dag-to-lua` if script exists
	ctx := droplet.NewContext()
	route := &entity.Route{}
	reqBody := `{
		  "id": "1",
		  "uri": "/index.html",
		  "upstream": {
		      "type": "roundrobin",
		      "nodes": [{
		          "host": "www.a.com",
		          "port": 80,
		          "weight": 1
		      }]
		  },
		  "script":{
		      "rule":{
		          "root":"451106f8-560c-43a4-acf2-2a6ed0ea57b8",
		          "451106f8-560c-43a4-acf2-2a6ed0ea57b8":[
		              [
		                  "code == 403",
		                  "b93d622c-92ef-48b4-b6bb-57e1ce893ee3"
		              ],
		              [
		                  "",
		                  "988ef5c2-c896-4606-a666-3d4cbe24a731"
		              ]
		          ]
		      },
		      "conf":{
		          "451106f8-560c-43a4-acf2-2a6ed0ea57b8":{
		              "name":"uri-blocker",
		              "conf":{
		                  "block_rules":[
		                      "root.exe",
		                      "root.m+"
		                  ],
		                  "rejected_code":403
		              }
		          },
		          "988ef5c2-c896-4606-a666-3d4cbe24a731":{
		              "name":"kafka-logger",
		              "conf":{
		                  "batch_max_size":1000,
		                  "broker_list":{
		                  },
		                  "buffer_duration":60,
		                  "inactive_timeout":5,
		                  "include_req_body":false,
		                  "kafka_topic":"1",
		                  "key":"2",
		                  "max_retry_count":0,
		                  "name":"kafka logger",
		                  "retry_delay":1,
		                  "timeout":3
		              }
		          },
		          "b93d622c-92ef-48b4-b6bb-57e1ce893ee3":{
		              "name":"fault-injection",
		              "conf":{
		                  "abort":{
		                      "body":"200",
		                      "http_status":300
		                  },
		                  "delay":{
		                      "duration":500
		                  }
		              }
		          }
		      },
		      "chart":{
		      }
		  }
		}`
	err = json.Unmarshal([]byte(reqBody), route)
	assert.Nil(t, err)
	ctx.SetInput(route)
	_, err = handler.Create(ctx)
	assert.Nil(t, err)

	//sleep
	time.Sleep(time.Duration(20) * time.Millisecond)

	//get
	input := &GetInput{}
	input.ID = "1"
	ctx.SetInput(input)
	ret, err := handler.Get(ctx)
	stored := ret.(*entity.Route)
	assert.Nil(t, err)
	assert.Equal(t, stored.ID, route.ID)
	assert.NotNil(t, stored.Script)

	//update
	route2 := &UpdateInput{}
	route2.ID = "1"
	reqBody = `{
		"id": "1",
		"uri": "/index.html",
		"enable_websocket": true,
		"upstream": {
			"type": "roundrobin",
			"nodes": [{
				"host": "www.a.com",
				"port": 80,
				"weight": 1
			}]
		}
	}`

	err = json.Unmarshal([]byte(reqBody), route2)
	assert.Nil(t, err)
	ctx.SetInput(route2)
	_, err = handler.Update(ctx)
	assert.Nil(t, err)

	//sleep
	time.Sleep(time.Duration(100) * time.Millisecond)

	//get, script should be nil
	input = &GetInput{}
	input.ID = "1"
	ctx.SetInput(input)
	ret, err = handler.Get(ctx)
	stored = ret.(*entity.Route)
	assert.Nil(t, err)
	assert.Equal(t, stored.ID, route.ID)
	assert.Nil(t, stored.Script)

	//delete test data
	inputDel := &BatchDelete{}
	reqBody = `{"ids": "1"}`
	err = json.Unmarshal([]byte(reqBody), inputDel)
	assert.Nil(t, err)
	ctx.SetInput(inputDel)
	_, err = handler.BatchDelete(ctx)
	assert.Nil(t, err)
}
