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
	"fmt"
	"github.com/apisix/manager-api/conf"
	"github.com/apisix/manager-api/errno"
	"github.com/apisix/manager-api/log"
	"github.com/apisix/manager-api/utils"
	"github.com/satori/go.uuid"
	"time"
)

const (
	ContentType      = "application/json"
	HTTP             = "http"
	HTTPS            = "https"
	SCHEME           = "scheme"
	WEBSOCKET        = "websocket"
	REDIRECT         = "redirect"
	PROXY_REWRIETE   = "proxy-rewrite"
	UPATHTYPE_STATIC = "static"
	UPATHTYPE_REGX   = "regx"
	UPATHTYPE_KEEP   = "keep"
)

var logger = log.GetLogger()

func (r *RouteRequest) Parse(body interface{}) error {
	if err := json.Unmarshal(body.([]byte), r); err != nil {
		r = nil
		return err
	} else {
		if r.Uris == nil || len(r.Uris) < 1 {
			r.Uris = []string{"/*"}
		}
	}
	return nil
}

func (arr *ApisixRouteRequest) Parse(r *RouteRequest) {
	arr.Desc = r.Desc
	arr.Priority = r.Priority
	arr.Methods = r.Methods
	arr.Uris = r.Uris
	arr.Hosts = r.Hosts
	arr.Vars = r.Vars
	arr.Upstream = r.Upstream
	arr.Plugins = r.Plugins
}

func (rd *Route) Parse(r *RouteRequest, arr *ApisixRouteRequest) error {
	//rd.Name = arr.Name
	rd.Description = arr.Desc
	// todo transfer
	rd.Hosts = ""
	rd.Uris = ""
	rd.UpstreamNodes = ""
	rd.UpstreamId = ""
	if content, err := json.Marshal(r); err != nil {
		return err
	} else {
		rd.Content = string(content)
	}
	timestamp := time.Now().Unix()
	rd.CreateTime = timestamp
	return nil
}

func (arr *ApisixRouteRequest) FindById(rid string) (*ApisixRouteResponse, error) {
	url := fmt.Sprintf("%s/routes/%s", conf.BaseUrl, rid)
	if resp, err := utils.Get(url); err != nil {
		logger.Error(err.Error())
		return nil, err
	} else {
		var arresp ApisixRouteResponse
		if err := json.Unmarshal(resp, &arresp); err != nil {
			logger.Error(err.Error())
			return nil, err
		} else {
			return &arresp, nil
		}
	}
}

func (arr *ApisixRouteRequest) Update(rid string) (*ApisixRouteResponse, error) {
	url := fmt.Sprintf("%s/routes/%s", conf.BaseUrl, rid)
	if b, err := json.Marshal(arr); err != nil {
		return nil, err
	} else {
    fmt.Println(string(b))
		if resp, err := utils.Patch(url, b); err != nil {
			logger.Error(err.Error())
			return nil, err
		} else {
			var arresp ApisixRouteResponse
			if err := json.Unmarshal(resp, &arresp); err != nil {
				logger.Error(err.Error())
				return nil, err
			} else {
				return &arresp, nil
			}
		}
	}
}

func (arr *ApisixRouteRequest) Create(rid string) (*ApisixRouteResponse, error) {
	url := fmt.Sprintf("%s/routes/%s", conf.BaseUrl, rid)
	if b, err := json.Marshal(arr); err != nil {
		return nil, err
	} else {
		fmt.Println(string(b))
		if resp, err := utils.Put(url, b); err != nil {
			logger.Error(err.Error())
			return nil, err
		} else {
			var arresp ApisixRouteResponse
			if err := json.Unmarshal(resp, &arresp); err != nil {
				logger.Error(err.Error())
				return nil, err
			} else {
				return &arresp, nil
			}
		}
	}
}

func (arr *ApisixRouteRequest) Delete(rid string) (*ApisixRouteResponse, error) {
	url := fmt.Sprintf("%s/routes/%s", conf.BaseUrl, rid)
	if resp, err := utils.Delete(url); err != nil {
		logger.Error(err.Error())
		return nil, err
	} else {
		var arresp ApisixRouteResponse
		if err := json.Unmarshal(resp, &arresp); err != nil {
			logger.Error(err.Error())
			return nil, err
		} else {
			return &arresp, nil
		}
	}
}

type RouteRequest struct {
	ID               string                 `json:"id,omitempty"`
	Name             string                 `json:"name"`
	Desc             string                 `json:"desc,omitempty"`
	Priority         int64                  `json:"priority,omitempty"`
	Methods          []string               `json:"methods,omitempty"`
	Uris             []string               `json:"uris"`
	Hosts            []string               `json:"hosts,omitempty"`
	Protocols        []string               `json:"protocols,omitempty"`
	Redirect         *Redirect              `json:"redirect,omitempty"`
	Vars             [][]string             `json:"vars,omitempty"`
	Upstream         *Upstream              `json:"upstream,omitempty"`
	UpstreamProtocol string                 `json:"upstream_protocol,omitempty"`
	UpstreamPath     *UpstreamPath          `json:"upstream_path,omitempty"`
	UpstreamHeader   map[string]string      `json:"upstream_header,omitempty"`
	Plugins          map[string]interface{} `json:"plugins"`
}

func (r *ApisixRouteResponse) Parse() (*RouteRequest, error) {
	o := r.Node.Value

	//Protocols from vars and upstream
	protocols := make([]string, 0)
	if o.Upstream != nil && o.Upstream.EnableWebsocket {
		protocols = append(protocols, WEBSOCKET)
	}
	flag := true
	for _, t := range o.Vars {
		if t[0] == SCHEME {
			flag = false
			protocols = append(protocols, t[2])
		}
	}
	if flag {
		protocols = append(protocols, HTTP)
		protocols = append(protocols, HTTPS)
	}
	//Redirect from plugins
	redirect := &Redirect{}
	upstreamProtocol := UPATHTYPE_KEEP
	upstreamHeader := make(map[string]string)
	upstreamPath := &UpstreamPath{}
	for k, v := range o.Plugins {
		if k == REDIRECT {
			if bytes, err := json.Marshal(v); err != nil {
				return nil, err
			} else {
				if err := json.Unmarshal(bytes, redirect); err != nil {
					return nil, err
				}
			}

		}
		if k == PROXY_REWRIETE {
			pr := &ProxyRewrite{}
			if bytes, err := json.Marshal(v); err != nil {
				return nil, err
			} else {
				if err := json.Unmarshal(bytes, pr); err != nil {
					return nil, err
				} else {
					if pr.Scheme != "" {
						upstreamProtocol = pr.Scheme
					}
					upstreamHeader = pr.Headers
					if pr.RegexUri == nil || len(pr.RegexUri) < 2 {
						upstreamPath.UPathType = UPATHTYPE_STATIC
						upstreamPath.To = pr.Uri
					} else {
						upstreamPath.UPathType = UPATHTYPE_REGX
						upstreamPath.From = pr.RegexUri[0]
						upstreamPath.To = pr.RegexUri[1]
					}
				}
			}
		}
	}
	//Vars
	requestVars := make([][]string, 0)
	for _, t := range o.Vars {
		if t[0] != SCHEME {
			requestVars = append(requestVars, t)
		}
	}
	//Plugins
	requestPlugins := utils.CopyMap(o.Plugins)
	delete(requestPlugins, REDIRECT)

	// check if upstream is not exist
	if o.Upstream == nil {
		upstreamProtocol = ""
		upstreamHeader = nil
		upstreamPath = nil
	}
  if upstreamPath != nil && upstreamPath.UPathType == "" {
		upstreamPath = nil
	}
	result := &RouteRequest{
		ID:               o.Id,
		Desc:             o.Desc,
		Priority:         o.Priority,
		Methods:          o.Methods,
		Uris:             o.Uris,
		Hosts:            o.Hosts,
		Redirect:         redirect,
		Upstream:         o.Upstream,
		UpstreamProtocol: upstreamProtocol,
		UpstreamPath:     upstreamPath,
		UpstreamHeader:   upstreamHeader,
		Protocols:        protocols,
		Vars:             requestVars,
		Plugins:          requestPlugins,
	}
	return result, nil
}

type Redirect struct {
	HttpToHttps bool   `json:"http_to_https,omitempty"`
	Code        int64  `json:"code,omitempty"`
	Uri         string `json:"uri,omitempty"`
}

type ProxyRewrite struct {
	Uri      string            `json:"uri"`
	RegexUri []string          `json:"regex_uri"`
	Scheme   string            `json:"scheme"`
	Host     string            `json:"host"`
	Headers  map[string]string `json:"headers"`
}

func (r ProxyRewrite) MarshalJSON() ([]byte, error) {
	m := make(map[string]interface{})
	if r.RegexUri != nil {
		m["regex_uri"] = r.RegexUri
	}
	if r.Uri != "" {
		m["uri"] = r.Uri
	}
	if r.Scheme != UPATHTYPE_KEEP && r.Scheme != "" {
		m["scheme"] = r.Scheme
	}
	if r.Host != "" {
		m["host"] = r.Host
	}
	if r.Headers != nil && len(r.Headers) > 0 {
		m["headers"] = r.Headers
	}
	if result, err := json.Marshal(m); err != nil {
		return nil, err
	} else {
		return result, nil
	}
}

func (r Redirect) MarshalJSON() ([]byte, error) {
	m := make(map[string]interface{})
	if r.HttpToHttps {
		m["http_to_https"] = true
	} else {
		m["code"] = r.Code
		m["uri"] = r.Uri
	}
	if result, err := json.Marshal(m); err != nil {
		return nil, err
	} else {
		return result, nil
	}
}

type Upstream struct {
	UType           string           `json:"type"`
	Nodes           map[string]int64 `json:"nodes"`
	Timeout         UpstreamTimeout  `json:"timeout"`
	EnableWebsocket bool             `json:"enable_websocket"`
}

type UpstreamTimeout struct {
	Connect int64 `json:"connect"`
	Send    int64 `json:"send"`
	Read    int64 `json:"read"`
}

type UpstreamPath struct {
	UPathType string `json:"type"`
	From      string `json:"from"`
	To        string `json:"to"`
}

type ApisixRouteRequest struct {
	Desc     string                 `json:"desc,omitempty"`
	Priority int64                  `json:"priority"`
	Methods  []string               `json:"methods,omitempty"`
	Uris     []string               `json:"uris,omitempty"`
	Hosts    []string               `json:"hosts,omitempty"`
	Vars     [][]string             `json:"vars,omitempty"`
	Upstream *Upstream              `json:"upstream,omitempty"`
	Plugins  map[string]interface{} `json:"plugins,omitempty"`
	//Name     string                 `json:"name"`
}

// ApisixRouteResponse is response from apisix admin api
type ApisixRouteResponse struct {
	Action string `json:"action"`
	Node   *Node  `json:"node"`
}

type Node struct {
	Value         Value  `json:"value"`
	ModifiedIndex uint64 `json:"modifiedIndex"`
}

type Value struct {
	Id         string                 `json:"id"`
	Name       string                 `json:"name"`
	Desc       string                 `json:"desc,omitempty"`
	Priority   int64                  `json:"priority"`
	Methods    []string               `json:"methods"`
	Uris       []string               `json:"uris"`
	Hosts      []string               `json:"hosts"`
	Vars       [][]string             `json:"vars"`
	Upstream   *Upstream              `json:"upstream,omitempty"`
	UpstreamId string                 `json:"upstream_id,omitempty"`
	Plugins    map[string]interface{} `json:"plugins"`
}

type Route struct {
	Base
	Name            string `json:"name"`
	Description     string `json:"description,omitempty"`
	Hosts           string `json:"hosts"`
	Uris            string `json:"uris"`
	UpstreamNodes   string `json:"upstream_nodes"`
	UpstreamId      string `json:"upstream_id"`
	Priority        int64  `json:"priority"`
	Content         string `json:"content"`
	ContentAdminApi string `json:"content_admin_api"`
}

type RouteResponse struct {
	Base
	Name        string    `json:"name"`
	Description string    `json:"description,omitempty"`
	Hosts       []string  `json:"hosts,omitempty"`
	Uris        []string  `json:"uris,omitempty"`
	Upstream    *Upstream `json:"upstream,omitempty"`
	UpstreamId  string    `json:"upstream_id,omitempty"`
	Priority    int64     `json:"priority"`
}

type ListResponse struct {
	Count int         `json:"count"`
	Data  interface{} `json:"data"`
}

func (rr *RouteResponse) Parse(r *Route) {
	rr.Base = r.Base
	rr.Name = r.Name
	rr.Description = r.Description
	rr.UpstreamId = r.UpstreamId
	rr.Priority = r.Priority
	// hosts
	if len(r.Hosts) > 0 {
		var hosts []string
		if err := json.Unmarshal([]byte(r.Hosts), &hosts); err == nil {
			rr.Hosts = hosts
		} else {
			logger.Error(err.Error())
		}
	}

	// uris
	if len(r.Uris) > 0 {
		var uris []string
		if err := json.Unmarshal([]byte(r.Uris), &uris); err == nil {
			rr.Uris = uris
		}
	}

	// uris
	var resp ApisixRouteResponse
	if err := json.Unmarshal([]byte(r.ContentAdminApi), &resp); err == nil {
		rr.Upstream = resp.Node.Value.Upstream
	}
}

// RouteRequest -> ApisixRouteRequest
func ToApisixRequest(routeRequest *RouteRequest) *ApisixRouteRequest {
	// redirect -> plugins
	plugins := utils.CopyMap(routeRequest.Plugins)
	redirect := routeRequest.Redirect
	if redirect != nil {
		plugins["redirect"] = redirect
	}

	logger.Info(routeRequest.Plugins)

	// scheme https and not http -> vars ['scheme', '==', 'https']
	pMap := utils.Set2Map(routeRequest.Protocols)

	arr := &ApisixRouteRequest{}
	arr.Parse(routeRequest)

	// protocols[websokect] -> upstream
	if pMap[WEBSOCKET] == 1 && arr.Upstream != nil {
		arr.Upstream.EnableWebsocket = true
	}
	vars := utils.CopyStrings(routeRequest.Vars)
	if pMap[HTTP] != 1 || pMap[HTTPS] != 1 {
		if pMap[HTTP] == 1 {
			vars = append(vars, []string{SCHEME, "==", HTTP})
		}
		if pMap[HTTPS] == 1 {
			vars = append(vars, []string{SCHEME, "==", HTTPS})
		}
	}
	if len(vars) > 0 {
		arr.Vars = vars
	} else {
		arr.Vars = nil
	}

	// upstream protocol
	if arr.Upstream != nil {
		pr := &ProxyRewrite{}
		pr.Scheme = routeRequest.UpstreamProtocol
		// upstream path
		proxyPath := routeRequest.UpstreamPath
		if proxyPath != nil {
			if proxyPath.UPathType == UPATHTYPE_STATIC {
				pr.Uri = proxyPath.To
				pr.RegexUri = nil
			} else {
				pr.RegexUri = []string{proxyPath.From, proxyPath.To}
			}
		}
		// upstream headers
		pr.Headers = routeRequest.UpstreamHeader
		if proxyPath != nil {
			plugins[PROXY_REWRIETE] = pr
		}
	}

	if plugins != nil && len(plugins) > 0 {
		arr.Plugins = plugins
	} else {
		arr.Plugins = nil
	}
	return arr
}

func ToRoute(routeRequest *RouteRequest,
	arr *ApisixRouteRequest,
	u4 uuid.UUID,
	resp *ApisixRouteResponse) (*Route, *errno.ManagerError) {
	rd := &Route{}
	if err := rd.Parse(routeRequest, arr); err != nil {
		e := errno.FromMessage(errno.DBRouteCreateError, err.Error())
		return nil, e
	}
	if rd.Name == "" {
		rd.Name = routeRequest.Name
	}
	rd.ID = u4
	// content_admin_api
	if respStr, err := json.Marshal(resp); err != nil {
		e := errno.FromMessage(errno.DBRouteCreateError, err.Error())
		return nil, e
	} else {
		rd.ContentAdminApi = string(respStr)
	}
	// hosts
	hosts := resp.Node.Value.Hosts
	if hb, err := json.Marshal(hosts); err != nil {
		e := errno.FromMessage(errno.DBRouteCreateError, err.Error())
		logger.Warn(e.Msg)
	} else {
		rd.Hosts = string(hb)
	}
	// uris
	uris := resp.Node.Value.Uris
	if ub, err := json.Marshal(uris); err != nil {
		e := errno.FromMessage(errno.DBRouteCreateError, err.Error())
		logger.Warn(e.Msg)
	} else {
		rd.Uris = string(ub)
	}
	// upstreamNodes
	if resp.Node.Value.Upstream != nil {
		nodes := resp.Node.Value.Upstream.Nodes
		ips := make([]string, 0)
		for k, _ := range nodes {
			ips = append(ips, k)
		}
		if nb, err := json.Marshal(ips); err != nil {
			e := errno.FromMessage(errno.DBRouteCreateError, err.Error())
			logger.Warn(e.Msg)
		} else {
			rd.UpstreamNodes = string(nb)
		}
	}
	return rd, nil
}
