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
package stream_route

import (
	"encoding/json"
	"testing"

	"github.com/stretchr/testify/assert"

	"github.com/apisix/manager-api/internal/core/entity"
)

func TestStructUnmarshal(t *testing.T) {
	// define and parse data
	jsonStr := `{
    "id": 1,
    "create_time": 1700000000,
    "update_time": 1700000000,
    "desc": "desc",
    "remote_addr": "1.1.1.1",
	"server_addr": "2.2.2.2",
	"server_port": 9080,
	"sni": "example.com",
	"upstream": {
		"nodes": [
			{
        		"host": "10.10.10.10",
        		"port": 8080,
        		"weight": 1
      		}
    	],
    	"type": "roundrobin",
    	"scheme": "http",
    	"pass_host": "pass"
	},
	"upstream_id": 1
}`
	streamRoute := entity.StreamRoute{}
	err := json.Unmarshal([]byte(jsonStr), &streamRoute)

	// asserts
	assert.Nil(t, err)
	assert.Equal(t, streamRoute.ID, float64(1))
	assert.Equal(t, streamRoute.CreateTime, int64(1700000000))
	assert.Equal(t, streamRoute.UpdateTime, int64(1700000000))
	assert.Equal(t, streamRoute.Desc, "desc")
	assert.Equal(t, streamRoute.RemoteAddr, "1.1.1.1")
	assert.Equal(t, streamRoute.ServerAddr, "2.2.2.2")
	assert.Equal(t, streamRoute.ServerPort, 9080)
	assert.Equal(t, streamRoute.Sni, "example.com")
	assert.Equal(t, streamRoute.UpstreamID, float64(1))
	assert.NotNil(t, streamRoute.Upstream)
}
