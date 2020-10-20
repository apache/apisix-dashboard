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

func TestConsumer(t *testing.T) {
	nodesStr := `{
    "127.0.0.1:8080": 1
  }`
	nodesMap := map[string]float64{}
	json.Unmarshal([]byte(nodesStr), &nodesMap)
	res := NodesFormat(nodesMap)
	nodes := res.([]*Node)

	assert.Equal(t, 1, len(nodes))
	assert.Equal(t, "127.0.0.1", nodes[0].Host)
	assert.Equal(t, 8080, nodes[0].Port)
	assert.Equal(t, 1, nodes[0].Weight)
}
