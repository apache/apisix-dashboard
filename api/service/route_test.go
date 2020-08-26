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

	uuid "github.com/satori/go.uuid"
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

func TestToApisixRequest_proxyRewrite(t *testing.T) {
	nodes := make(map[string]int64)
	nodes["127.0.0.1:8080"] = 100
	upstream := &Upstream{
		UType:   "roundrobin",
		Nodes:   nodes,
		Timeout: UpstreamTimeout{15, 15, 15},
	}
	to := "/hello"
	upstreamPath := &UpstreamPath{To: to}
	rr := &RouteRequest{
		ID:           "u guess a uuid",
		Name:         "a special name",
		Desc:         "any description",
		Priority:     0,
		Methods:      []string{"GET"},
		Uris:         []string{},
		Hosts:        []string{"www.baidu.com"},
		Protocols:    []string{"http", "https", "websocket"},
		Redirect:     &Redirect{HttpToHttps: true, Code: 200, Uri: "/hello"},
		Vars:         [][]string{},
		Upstream:     upstream,
		UpstreamPath: upstreamPath,
	}
	ar := ToApisixRequest(rr)
	a := assert.New(t)
	var pr ProxyRewrite
	bytes, _ := json.Marshal(ar.Plugins["proxy-rewrite"])
	json.Unmarshal(bytes, &pr)

	a.Equal(2, len(ar.Plugins))
	a.NotEqual(nil, ar.Plugins["redirect"])
	a.Equal(to, pr.Uri)
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

// parse from params to RouteRequest
func TestRouteRequest_Parse(t *testing.T) {
	a := assert.New(t)
	param := []byte(`{
		 "name": "API 名称",
		 "protocols": [
			 "http",
			 "https"
		 ],
		 "hosts": [
			 "www.baidu.com"
		 ],
		 "methods": [
			 "GET",
			 "HEAD",
			 "POST",
			 "PUT",
			 "DELETE",
			 "OPTIONS",
			 "PATCH"
		 ],
		 "redirect": {
			 "code": 302,
			 "uri": "11111"
		 },
		 "vars": [],
		 "script": {
			 "rule": {},
			 "conf": {}
		 }
	 }`)
	routeRequest := &RouteRequest{}
	err := routeRequest.Parse(param)
	a.Nil(err)
	a.Equal("API 名称", routeRequest.Name)
	a.Equal(int64(0), routeRequest.Priority)
	a.Equal(2, len(routeRequest.Script))
	a.Equal("/*", routeRequest.Uris[0])
}

// parse from RouteRequest and ApisixRouteRequest to Route
func TestRoute_Parse(t *testing.T) {
	a := assert.New(t)
	rrb := []byte(`{"name":"API 名称2","methods":["GET","HEAD","POST","PUT","DELETE","OPTIONS","PATCH"],"uris":["/*"],"hosts":["www.baidu.com"],"protocols":["http","https"],"redirect":{"code":302,"uri":"11111"},"plugins":null}`)
	routeRequest := &RouteRequest{}
	json.Unmarshal(rrb, routeRequest)
	arrb := []byte(`{"priority":0,"methods":["GET","HEAD","POST","PUT","DELETE","OPTIONS","PATCH"],"uris":["/*"],"hosts":["www.baidu.com"],"plugins":{"redirect":{"code":302,"uri":"11111"}}, "script":{
    "rule":{
        "root": "11-22-33-44",
        "11-22-33-44":[
            [
                "code == 503",
                "yy-uu-ii-oo"
            ],
            [
                "",
                "vv-cc-xx-zz"
            ]
        ]
    },
    "conf":{
        "11-22-33-44":{
            "name": "limit-count",
            "conf": {
                "count":2,
                "time_window":60,
                "rejected_code":503,
                "key":"remote_addr"
            }
        },
        "yy-uu-ii-oo":{
            "name": "response-rewrite",
            "conf": {
                "body":{"code":"ok","message":"request has been limited."},
                "headers":{
                    "X-limit-status": "limited"
                }
            }
        },
        "vv-cc-xx-zz":{
            "name": "response-rewrite",
            "conf": {
                "body":{"code":"ok","message":"normal request"},
                "headers":{
                    "X-limit-status": "normal"
                }
            }
        }
    }
} }`)
	arr := &ApisixRouteRequest{}
	json.Unmarshal(arrb, arr)

	rd := &Route{}
	err := rd.Parse(routeRequest, arr)
	a.Nil(err)
}

// parse Route
func TestToRoute(t *testing.T) {
	a := assert.New(t)
	b1 := []byte(`{"name":"API 名称2","methods":["GET","HEAD","POST","PUT","DELETE","OPTIONS","PATCH"],"uris":["/*"],"hosts":["www.baidu.com"],"protocols":["http","https"],"redirect":{"code":302,"uri":"11111"},"plugins":null}`)
	rr := &RouteRequest{}
	err := json.Unmarshal(b1, &rr)
	a.Nil(err)

	b2 := []byte(`{"priority":0,"methods":["GET","HEAD","POST","PUT","DELETE","OPTIONS","PATCH"],"uris":["/*"],"hosts":["www.baidu.com"],"plugins":{"redirect":{"code":302,"uri":"11111"}},"script":"function(vars, opts) return vars[\"arg_key\"] == \"a\" or vars[\"arg_key\"] == \"b\" end"}`)
	arr := &ApisixRouteRequest{}
	err = json.Unmarshal(b2, &arr)
	a.Nil(err)

	b3 := []byte(`{"action":"set","node":{"value":{"id":"","name":"","priority":0,"methods":["GET","HEAD","POST","PUT","DELETE","OPTIONS","PATCH"],"uris":["/*"],"hosts":["www.baidu.com"],"vars":null,"plugins":{"redirect":{"code":302,"ret_code":302,"uri":"11111"}}},"modifiedIndex":75}}`)
	arp := &ApisixRouteResponse{}
	err = json.Unmarshal(b3, &arp)
	a.Nil(err)

	u4 := uuid.NewV4()
	route, err := ToRoute(rr, arr, u4, arp)
	a.Nil(err)
	t.Log(route.Uris)
	a.Equal("[\"/*\"]", route.Uris)
}
