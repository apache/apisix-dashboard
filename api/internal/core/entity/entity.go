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

type BaseInfo struct {
	ID         string `json:"id"`
	CreateTime int64  `json:"create_time"`
	UpdateTime int64  `json:"update_time"`
}

func (info *BaseInfo) GetBaseInfo() *BaseInfo {
	return info
}

type BaseInfoGetter interface {
	GetBaseInfo() *BaseInfo
}

type Route struct {
	BaseInfo
	URI             string      `json:"uri,omitempty" validate:"uri"`
	Uris            []string    `json:"uris,omitempty"`
	Name            string      `json:"name,omitempty" validate:"max=50"`
	Desc            string      `json:"desc,omitempty" validate:"max=256"`
	Priority        int         `json:"priority,omitempty"`
	Methods         []string    `json:"methods,omitempty"`
	Host            string      `json:"host,omitempty"`
	Hosts           []string    `json:"hosts,omitempty"`
	RemoteAddr      string      `json:"remote_addr,omitempty"`
	RemoteAddrs     []string    `json:"remote_addrs,omitempty"`
	Vars            string      `json:"vars,omitempty"`
	FilterFunc      string      `json:"filter_func,omitempty"`
	Script          interface{} `json:"script,omitempty"`
	Plugins         interface{} `json:"plugins,omitempty"`
	Upstream        Upstream    `json:"upstream,omitempty"`
	ServiceID       string      `json:"service_id,omitempty"`
	UpstreamID      string      `json:"upstream_id,omitempty"`
	ServiceProtocol string      `json:"service_protocol,omitempty"`
}

// --- structures for upstream start  ---
type Timeout struct {
	Connect int `json:"connect,omitempty"`
	Send    int `json:"send,omitempty"`
	Read    int `json:"read,omitempty"`
}

type Node struct {
	Host     string      `json:"host,omitempty"`
	Port     int         `json:"port,omitempty"`
	Weight   int         `json:"weight,omitempty"`
	Metadata interface{} `json:"metadata,omitempty"`
}

type K8sInfo struct {
	Namespace   string `json:"namespace,omitempty"`
	DeployName  string `json:"deploy_name,omitempty"`
	ServiceName string `json:"service_name,omitempty"`
	Port        int    `json:"port,omitempty"`
	BackendType string `json:"backend_type,omitempty"`
}

type Healthy struct {
	Interval     int   `json:"interval,omitempty"`
	HttpStatuses []int `json:"http_statuses,omitempty"`
	Successes    int   `json:"successes,omitempty"`
}

type UnHealthy struct {
	Interval     int   `json:"interval,omitempty"`
	HTTPStatuses []int `json:"http_statuses,omitempty"`
	TCPFailures  int   `json:"tcp_failures,omitempty"`
	Timeouts     int   `json:"timeouts,omitempty"`
	HTTPFailures int   `json:"http_failures,omitempty"`
}

type Active struct {
	Type                   string    `json:"type,omitempty"`
	Timeout                int       `json:"timeout,omitempty"`
	Concurrency            int       `json:"concurrency,omitempty"`
	Host                   string    `json:"host,omitempty"`
	Port                   int       `json:"port,omitempty"`
	HTTPPath               string    `json:"http_path,omitempty"`
	HTTPSVerifyCertificate string    `json:"https_verify_certificate,omitempty"`
	Healthy                Healthy   `json:"healthy,omitempty"`
	UnHealthy              UnHealthy `json:"unhealthy,omitempty"`
	ReqHeaders             []string  `json:"req_headers,omitempty"`
}

type Passive struct {
	Type      string    `json:"type,omitempty"`
	Healthy   Healthy   `json:"healthy,omitempty"`
	UnHealthy UnHealthy `json:"unhealthy,omitempty"`
}

type HealthChecker struct {
	Active  Active  `json:"active,omitempty"`
	Passive Passive `json:"passive,omitempty"`
}

type Upstream struct {
	BaseInfo
	Nodes           []Node        `json:"nodes,omitempty"`
	Retries         int           `json:"retries,omitempty"`
	Timeout         Timeout       `json:"timeout,omitempty"`
	K8sInfo         K8sInfo       `json:"k8s_deployment_info,omitempty"`
	Type            string        `json:"type,omitempty"`
	Checks          HealthChecker `json:"checks,omitempty"`
	HashOn          string        `json:"hash_on,omitempty"`
	Key             string        `json:"key,omitempty"`
	EnableWebsocket bool          `json:"enable_websocket,omitempty"`
	PassHost        string        `json:"pass_host,omitempty"`
	UpstreamHost    string        `json:"upstream_host,omitempty"`
	Name            string        `json:"name,omitempty"`
	Desc            string        `json:"desc,omitempty"`
	ServiceName     string        `json:"service_name,omitempty"`
}

type UpstreamNameResponse struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

func (upstream *Upstream) Parse2NameResponse() (*UpstreamNameResponse, error) {
	nameResp := &UpstreamNameResponse{
		ID:   upstream.ID,
		Name: upstream.Name,
	}
	return nameResp, nil
}

// --- structures for upstream end  ---

type Consumer struct {
	BaseInfo
	Username string      `json:"username"`
	Desc     string      `json:"desc,omitempty"`
	Plugins  interface{} `json:"plugins,omitempty"`
}

type SSL struct {
	BaseInfo
	Cert          string   `json:"cert"`
	Key           string   `json:"key,omitempty"`
	Sni           string   `json:"sni"`
	Snis          []string `json:"snis"`
	Certs         []string `json:"certs"`
	Keys          []string `json:"keys,omitempty"`
	ExpTime       int64    `json:"exptime"`
	Status        int      `json:"status"`
	ValidityStart int64    `json:"validity_start"`
	ValidityEnd   int64    `json:"validity_end"`
}

type Service struct {
	BaseInfo
	Name       string      `json:"name,omitempty"`
	Desc       string      `json:"desc,omitempty"`
	Upstream   Upstream    `json:"upstream,omitempty"`
	UpstreamID string      `json:"upstream_id,omitempty"`
	Plugins    interface{} `json:"plugins,omitempty"`
	Script     string      `json:"script,omitempty"`
}

type Script struct {
	ID     string      `json:"id"`
	Script interface{} `json:"script,omitempty"`
}
