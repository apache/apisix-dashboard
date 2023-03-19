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
package entity

import (
	"encoding/json"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestNodesFormat(t *testing.T) {
	// route data saved in ETCD
	routeStr := `{
		"uris": ["/*"],
		"upstream": {
			"type": "roundrobin",
			"nodes": [{
				"host": "127.0.0.1",
				"port": 80,
				"weight": 0,
				"priority":10
			}]
		}
	}`

	// bind struct
	var route Route
	err := json.Unmarshal([]byte(routeStr), &route)
	assert.Nil(t, err)

	// nodes format
	nodes := NodesFormat(route.Upstream.Nodes)

	// json encode for client
	res, err := json.Marshal(nodes)
	assert.Nil(t, err)
	jsonStr := string(res)
	assert.Contains(t, jsonStr, `"weight":0`)
	assert.Contains(t, jsonStr, `"port":80`)
	assert.Contains(t, jsonStr, `"host":"127.0.0.1"`)
	assert.Contains(t, jsonStr, `"priority":10`)
}

func TestNodesFormat_ipv6(t *testing.T) {
	// route data saved in ETCD
	routeStr := `{
		"uris": ["/*"],
		"upstream": {
			"type": "roundrobin",
			"nodes": [{
				"host": "::1",
				"port": 80,
				"weight": 0,
				"priority":10
			}]
		}
	}`

	// bind struct
	var route Route
	err := json.Unmarshal([]byte(routeStr), &route)
	assert.Nil(t, err)

	// nodes format
	nodes := NodesFormat(route.Upstream.Nodes)

	// json encode for client
	res, err := json.Marshal(nodes)
	assert.Nil(t, err)
	jsonStr := string(res)
	assert.Contains(t, jsonStr, `"weight":0`)
	assert.Contains(t, jsonStr, `"port":80`)
	assert.Contains(t, jsonStr, `"host":"::1"`)
	assert.Contains(t, jsonStr, `"priority":10`)
}

func TestNodesFormat_struct(t *testing.T) {
	// route data saved in ETCD
	var route Route
	route.Uris = []string{"/*"}
	route.Upstream = &UpstreamDef{}
	route.Upstream.Type = "roundrobin"
	var nodes = []*Node{{Host: "127.0.0.1", Port: 80, Weight: 0}}
	route.Upstream.Nodes = nodes

	// nodes format
	formattedNodes := NodesFormat(route.Upstream.Nodes)

	// json encode for client
	res, err := json.Marshal(formattedNodes)
	assert.Nil(t, err)
	jsonStr := string(res)
	assert.Contains(t, jsonStr, `"weight":0`)
	assert.Contains(t, jsonStr, `"port":80`)
	assert.Contains(t, jsonStr, `"host":"127.0.0.1"`)
}

func TestNodesFormat_struct_ipv6(t *testing.T) {
	// route data saved in ETCD
	var route Route
	route.Uris = []string{"/*"}
	route.Upstream = &UpstreamDef{}
	route.Upstream.Type = "roundrobin"
	var nodes = []*Node{{Host: "::1", Port: 80, Weight: 0}}
	route.Upstream.Nodes = nodes

	// nodes format
	formattedNodes := NodesFormat(route.Upstream.Nodes)

	// json encode for client
	res, err := json.Marshal(formattedNodes)
	assert.Nil(t, err)
	jsonStr := string(res)
	assert.Contains(t, jsonStr, `"weight":0`)
	assert.Contains(t, jsonStr, `"port":80`)
	assert.Contains(t, jsonStr, `"host":"::1"`)
}

func TestNodesFormat_Map(t *testing.T) {
	// route data saved in ETCD
	routeStr := `{
		"uris": ["/*"],
		"upstream": {
			"type": "roundrobin",
			"nodes": {"127.0.0.1:8080": 0}
		}
	}`

	// bind struct
	var route Route
	err := json.Unmarshal([]byte(routeStr), &route)
	assert.Nil(t, err)

	// nodes format
	nodes := NodesFormat(route.Upstream.Nodes)

	// json encode for client
	res, err := json.Marshal(nodes)
	assert.Nil(t, err)
	jsonStr := string(res)
	assert.Contains(t, jsonStr, `"weight":0`)
	assert.Contains(t, jsonStr, `"port":8080`)
	assert.Contains(t, jsonStr, `"host":"127.0.0.1"`)
}

func TestNodesFormat_Map_ipv6(t *testing.T) {
	// route data saved in ETCD
	routeStr := `{
		"uris": ["/*"],
		"upstream": {
			"type": "roundrobin",
			"nodes": {"[::1]:8080": 0}
		}
	}`

	// bind struct
	var route Route
	err := json.Unmarshal([]byte(routeStr), &route)
	assert.Nil(t, err)

	// nodes format
	nodes := NodesFormat(route.Upstream.Nodes)

	// json encode for client
	res, err := json.Marshal(nodes)
	assert.Nil(t, err)
	jsonStr := string(res)
	assert.Contains(t, jsonStr, `"weight":0`)
	assert.Contains(t, jsonStr, `"port":8080`)
	assert.Contains(t, jsonStr, `"host":"[::1]"`)
}

func TestNodesFormat_empty_struct(t *testing.T) {
	// route data saved in ETCD
	routeStr := `{
		"uris": ["/*"],
		"upstream": {
			"type": "roundrobin",
			"nodes": []
		}
	}`

	// bind struct
	var route Route
	err := json.Unmarshal([]byte(routeStr), &route)
	assert.Nil(t, err)

	// nodes format
	nodes := NodesFormat(route.Upstream.Nodes)

	// json encode for client
	res, err := json.Marshal(nodes)
	assert.Nil(t, err)
	jsonStr := string(res)
	assert.Contains(t, jsonStr, `[]`)
}

func TestNodesFormat_empty_map(t *testing.T) {
	// route data saved in ETCD
	routeStr := `{
		"uris": ["/*"],
		"upstream": {
			"type": "roundrobin",
			"nodes": {}
		}
	}`

	// bind struct
	var route Route
	err := json.Unmarshal([]byte(routeStr), &route)
	assert.Nil(t, err)

	// nodes format
	nodes := NodesFormat(route.Upstream.Nodes)

	// json encode for client
	res, err := json.Marshal(nodes)
	assert.Nil(t, err)
	jsonStr := string(res)
	assert.Contains(t, jsonStr, `[]`)
}

func TestNodesFormat_no_nodes(t *testing.T) {
	// route data saved in ETCD
	routeStr := `{
		"uris": ["/*"],
		"upstream": {
			"type": "roundrobin",
			"service_name": "USER-SERVICE",
			"discovery_type": "eureka"
		}
	}`

	// bind struct
	var route Route
	err := json.Unmarshal([]byte(routeStr), &route)
	assert.Nil(t, err)

	// nodes format
	nodes := NodesFormat(route.Upstream.Nodes)

	// json encode for client
	res, err := json.Marshal(nodes)
	assert.Nil(t, err)
	jsonStr := string(res)
	assert.Contains(t, jsonStr, `null`)
}

func TestNodesFormat_nodes_without_port(t *testing.T) {
	nodes := map[string]float64{"127.0.0.1": 0}
	// nodes format
	formattedNodes := NodesFormat(nodes)

	// json encode for client
	res, err := json.Marshal(formattedNodes)
	assert.Nil(t, err)
	assert.Equal(t, res, []byte(`[{"host":"127.0.0.1","weight":0}]`))
}

func Test_Idle_Timeout_nil_and_zero(t *testing.T) {
	ukp0 := UpstreamKeepalivePool{}
	// Unmarshal from zero value
	err := json.Unmarshal([]byte(`{"idle_timeout":0}`), &ukp0)
	assert.Nil(t, err)
	assert.Equal(t, *ukp0.IdleTimeout, TimeoutValue(0))

	// Marshal with zero value
	marshaled, err := json.Marshal(ukp0)
	assert.Nil(t, err)
	assert.Contains(t, string(marshaled), `"idle_timeout":0`)

	ukpNil := UpstreamKeepalivePool{}

	// Unmarshal from nil value
	err = json.Unmarshal([]byte(`{}`), &ukpNil)
	assert.Nil(t, err)
	assert.Nil(t, ukpNil.IdleTimeout)

	// Marshal with nil value
	marshaledNil, err := json.Marshal(ukpNil)
	assert.Nil(t, err)
	assert.Equal(t, string(marshaledNil), `{"size":0}`)
}

func TestUpstream_nil_and_zero_retries(t *testing.T) {
	ud0 := UpstreamDef{}
	// Unmarshal from zero value
	err := json.Unmarshal([]byte(`{"retries":0}`), &ud0)
	assert.Nil(t, err)
	assert.Equal(t, *ud0.Retries, 0)

	// Marshal with zero value
	marshaled, err := json.Marshal(ud0)
	assert.Nil(t, err)
	assert.Contains(t, string(marshaled), `"retries":0`)

	udNull := UpstreamDef{}

	// Unmarshal from null value
	err = json.Unmarshal([]byte(`{}`), &udNull)
	assert.Nil(t, err)
	assert.Nil(t, udNull.Retries)

	// Marshal to null value
	marshaledNull, err := json.Marshal(udNull)
	assert.Nil(t, err)
	assert.Equal(t, string(marshaledNull), `{}`)
}

func TestMapKV2Node(t *testing.T) {
	testCases := []struct {
		name       string
		key        string
		value      float64
		wantErr    bool
		errMessage string
		wantRes    *Node
	}{
		{
			name:       "invalid upstream node",
			key:        "127.0.0.1:0:0",
			wantErr:    true,
			errMessage: "invalid upstream node",
		},
		{
			name:    "when address contains port convert should succeed",
			key:     "127.0.0.1:8080",
			value:   100,
			wantErr: false,
			wantRes: &Node{
				Host:   "127.0.0.1",
				Port:   8080,
				Weight: 100,
			},
		},
		{
			name:    "when address without port convert should succeed",
			key:     "127.0.0.1",
			wantErr: false,
			wantRes: &Node{
				Host:   "127.0.0.1",
				Port:   0,
				Weight: 0,
			},
		},
		{
			name:    "address with ipv6",
			key:     "[::1]:443",
			value:   100,
			wantErr: false,
			wantRes: &Node{
				Host:   "[::1]",
				Port:   443,
				Weight: 100,
			},
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			got, err := mapKV2Node(tc.key, tc.value)
			if tc.wantErr {
				assert.NotNil(t, err)
				assert.Contains(t, err.Error(), tc.errMessage)
				return
			}

			assert.Nil(t, err)
			assert.Equal(t, tc.wantRes, got)
		})
	}
}

func TestNodesFormatWithMetadata(t *testing.T) {
	// route data saved in ETCD
	routeStr := `{
		"uris": ["/*"],
		"upstream": {
			"type": "roundrobin",
			"nodes": [{
				"host": "127.0.0.1",
				"port": 80,
				"weight": 0,
				"priority":10,
				"metadata": {
					"name": "test"
				}
			}]
		}
	}`

	// bind struct
	var route Route
	err := json.Unmarshal([]byte(routeStr), &route)
	assert.Nil(t, err)

	// nodes format
	nodes := NodesFormat(route.Upstream.Nodes)

	// json encode for client
	res, err := json.Marshal(nodes)
	assert.Nil(t, err)
	jsonStr := string(res)
	assert.Contains(t, jsonStr, `"weight":0`)
	assert.Contains(t, jsonStr, `"port":80`)
	assert.Contains(t, jsonStr, `"host":"127.0.0.1"`)
	assert.Contains(t, jsonStr, `"priority":10`)
	assert.Contains(t, jsonStr, `"metadata":{"name":"test"}`)
}
