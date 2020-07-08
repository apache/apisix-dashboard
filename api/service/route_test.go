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
	"encoding/json"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestRedirectMarshal(t *testing.T) {
	a := assert.New(t)
	r := &Redirect{
		HttpToHttps: true,
		Code:        302,
		Uri:         "/hello",
	}
	if result, err := json.Marshal(r); err != nil {
		t.Error(err.Error())
	} else {
		h := make(map[string]interface{})
		json.Unmarshal(result, &h)
		a.Equal(1, len(h))
		a.Equal(nil, h["code"])
		a.Equal(true, h["http_to_https"])
	}
}

func TestToApisixRequest_RediretPlugins(t *testing.T) {
	rr := &RouteRequest{
		ID:        "u guess a uuid",
		Name:      "a special name",
		Desc:      "any description",
		Priority:  0,
		Methods:   []string{"GET"},
		Uris:      []string{},
		Hosts:     []string{"www.baidu.com"},
		Protocols: []string{"http", "https", "websocket"},
		Redirect:  &Redirect{HttpToHttps: true, Code: 200, Uri: "/hello"},
		Vars:      [][]string{},
	}
	ar := ToApisixRequest(rr)
	a := assert.New(t)
	a.Equal(1, len(ar.Plugins))
	a.NotEqual(nil, ar.Plugins["redirect"])
}

func TestToApisixRequest_Vars(t *testing.T) {
	rr := &RouteRequest{
		ID:        "u guess a uuid",
		Name:      "a special name",
		Desc:      "any description",
		Priority:  0,
		Methods:   []string{"GET"},
		Uris:      []string{},
		Hosts:     []string{"www.baidu.com"},
		Protocols: []string{"http", "https", "websocket"},
		Redirect:  &Redirect{HttpToHttps: true, Code: 200, Uri: "/hello"},
		Vars:      [][]string{},
	}
	ar := ToApisixRequest(rr)
	a := assert.New(t)
	b, err := json.Marshal(ar)
	a.Equal(nil, err)

	m := make(map[string]interface{})
	err = json.Unmarshal(b, &m)
	a.Equal(nil, err)
	t.Log(m["vars"])
	a.Equal(nil, m["vars"])
}

func TestToApisixRequest_Upstream(t *testing.T) {
	nodes := make(map[string]int64)
	nodes["127.0.0.1:8080"] = 100
	upstream := &Upstream{
		UType:   "roundrobin",
		Nodes:   nodes,
		Timeout: UpstreamTimeout{15, 15, 15},
	}
	rr := &RouteRequest{
		ID:        "u guess a uuid",
		Name:      "a special name",
		Desc:      "any description",
		Priority:  0,
		Methods:   []string{"GET"},
		Uris:      []string{},
		Hosts:     []string{"www.baidu.com"},
		Protocols: []string{"http", "https", "websocket"},
		Redirect:  &Redirect{HttpToHttps: true, Code: 200, Uri: "/hello"},
		Vars:      [][]string{},
		Upstream:  upstream,
	}
	ar := ToApisixRequest(rr)
	a := assert.New(t)
	a.Equal("roundrobin", ar.Upstream.UType)
	a.Equal(true, ar.Upstream.EnableWebsocket)
}

func TestToApisixRequest_UpstreamUnable(t *testing.T) {
	nodes := make(map[string]int64)
	nodes["127.0.0.1:8080"] = 100
	upstream := &Upstream{
		UType:   "roundrobin",
		Nodes:   nodes,
		Timeout: UpstreamTimeout{15, 15, 15},
	}
	rr := &RouteRequest{
		ID:        "u guess a uuid",
		Name:      "a special name",
		Desc:      "any description",
		Priority:  0,
		Methods:   []string{"GET"},
		Uris:      []string{},
		Hosts:     []string{"www.baidu.com"},
		Protocols: []string{"http", "https"},
		Redirect:  &Redirect{HttpToHttps: true, Code: 200, Uri: "/hello"},
		Vars:      [][]string{},
		Upstream:  upstream,
	}
	ar := ToApisixRequest(rr)
	a := assert.New(t)
	a.Equal("roundrobin", ar.Upstream.UType)
	a.Equal(false, ar.Upstream.EnableWebsocket)
}

// no upstream
func TestApisixRouteResponse_Parse(t *testing.T) {
	a := assert.New(t)
	plugins := make(map[string]interface{})
	redirect := &Redirect{
		Code: 302,
		Uri:  "/foo",
	}
	plugins["redirect"] = redirect
	arr := &ApisixRouteResponse{
		Action: "get",
		Node: &Node{
			Value: Value{
				Id:       "",
				Name:     "",
				Desc:     "",
				Priority: 0,
				Methods:  []string{"GET"},
				Uris:     []string{"/*"},
				Hosts:    []string{"www.baidu.com"},
				Vars:     [][]string{},
				Upstream: nil,
				Plugins:  plugins,
			},
		},
	}
	_, err := arr.Parse()
	a.Equal(nil, err)
}
