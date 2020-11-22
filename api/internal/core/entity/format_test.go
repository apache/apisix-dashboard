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

func TestFormat(t *testing.T) {

	// map value for nodes
	str := `{
		"id": "1",
		"nodes": {"host:80": 100},
		"type":"roundrobin"
	}`
	var upstream Upstream
	err := json.Unmarshal([]byte(str), &upstream)
	assert.Nil(t, err)

	res := NodesFormat(upstream.Nodes)
	nodes := res.([]*Node)
	assert.Equal(t, 1, len(nodes))
	assert.Equal(t, "host", nodes[0].Host)
	assert.Equal(t, 80, nodes[0].Port)
	assert.Equal(t, 100, nodes[0].Weight)

	// map value for nodes on route
	str = `{
		"uri": "/index.html",
		"upstream": {
			"type": "roundrobin",
			"nodes": {
				"39.97.63.215:8080": 1
			}
		}
	}`
	var route Route
	err = json.Unmarshal([]byte(str), &route)
	assert.Nil(t, err)

	res = NodesFormat(route.Upstream.Nodes)
	nodes = res.([]*Node)
	assert.Equal(t, 1, len(nodes))
	assert.Equal(t, "39.97.63.215", nodes[0].Host)
	assert.Equal(t, 8080, nodes[0].Port)
	assert.Equal(t, 1, nodes[0].Weight)

	// array value for nodes
	str = `{
		"uri": "/index.html",
		"upstream": {
			"type": "roundrobin",
			"nodes": [{
				"host": "10.1.1.1",
				"port": 8888,
				"weight": 1
			}]
		}
	}`
	err = json.Unmarshal([]byte(str), &route)
	assert.Nil(t, err)

	res = NodesFormat(route.Upstream.Nodes)
	nodes = res.([]*Node)
	assert.Equal(t, 1, len(nodes))
	assert.Equal(t, "10.1.1.1", nodes[0].Host)
	assert.Equal(t, 8888, nodes[0].Port)
	assert.Equal(t, 1, nodes[0].Weight)

	// empty value for nodes
	str = `{
		"uri": "/index.html",
		"upstream": {
			"type": "roundrobin",
			"nodes": ""
		}
	}`
	err = json.Unmarshal([]byte(str), &route)
	assert.Nil(t, err)

	res = NodesFormat(route.Upstream.Nodes)
	nodes, ok := res.([]*Node)
	assert.Equal(t, false, ok)

}
