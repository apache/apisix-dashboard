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
	"reflect"
	"time"

	"github.com/apisix/manager-api/internal/utils"
)

type BaseInfo struct {
	ID         interface{} `json:"id"`
	CreateTime int64       `json:"create_time,omitempty"`
	UpdateTime int64       `json:"update_time,omitempty"`
}

func (info *BaseInfo) GetBaseInfo() *BaseInfo {
	return info
}

func (info *BaseInfo) Creating() {
	if info.ID == nil {
		info.ID = utils.GetFlakeUidStr()
	} else {
		// convert to string if it's not
		if reflect.TypeOf(info.ID).String() != "string" {
			info.ID = utils.InterfaceToString(info.ID)
		}
	}
	info.CreateTime = time.Now().Unix()
	info.UpdateTime = time.Now().Unix()
}

func (info *BaseInfo) Updating(storedInfo *BaseInfo) {
	info.ID = storedInfo.ID
	info.CreateTime = storedInfo.CreateTime
	info.UpdateTime = time.Now().Unix()
}

func (info *BaseInfo) KeyCompat(key string) {
	if info.ID == nil && key != "" {
		info.ID = key
	}
}

type BaseInfoSetter interface {
	GetBaseInfo() *BaseInfo
}

type BaseInfoGetter interface {
	GetBaseInfo() *BaseInfo
}

type Status uint8

// swagger:model Route
type Route struct {
	BaseInfo
	URI             string                 `json:"uri,omitempty" version:">=0.8.0"`
	Uris            []string               `json:"uris,omitempty" version:">=0.9.0"`
	Name            string                 `json:"name" validate:"max=50" version:">=1.4.0"`
	Desc            string                 `json:"desc,omitempty" validate:"max=256" version:">=0.8.0"`
	Priority        int                    `json:"priority,omitempty" version:">=1.0.0"`
	Methods         []string               `json:"methods,omitempty" version:">=0.8.0"`
	Host            string                 `json:"host,omitempty" version:">=0.8.0"`
	Hosts           []string               `json:"hosts,omitempty" version:">=0.8.0"`
	RemoteAddr      string                 `json:"remote_addr,omitempty" version:">=0.8.0"`
	RemoteAddrs     []string               `json:"remote_addrs,omitempty" version:">=0.8.0"`
	Vars            []interface{}          `json:"vars,omitempty" version:">=0.8.0"`
	FilterFunc      string                 `json:"filter_func,omitempty" version:">=0.9.0"`
	Script          interface{}            `json:"script,omitempty" version:">=1.5.0"`
	ScriptID        interface{}            `json:"script_id,omitempty" version:">=2.2.0"` // For debug and optimization(cache), currently same as Route's ID
	Plugins         map[string]interface{} `json:"plugins,omitempty" version:">=0.8.0"`
	PluginConfigID  interface{}            `json:"plugin_config_id,omitempty" version:">=2.4.0"`
	Upstream        *UpstreamDef           `json:"upstream,omitempty" version:">=0.8.0"`
	ServiceID       interface{}            `json:"service_id,omitempty" version:">=0.8.0"`
	UpstreamID      interface{}            `json:"upstream_id,omitempty" version:">=0.8.0"`
	ServiceProtocol string                 `json:"service_protocol,omitempty" version:">=0.8.0"`
	Labels          map[string]string      `json:"labels,omitempty" version:">=2.1.0"`
	EnableWebsocket bool                   `json:"enable_websocket,omitempty" version:">=2.1.0"`
	Timeout         *Timeout               `json:"timeout,omitempty" version:">=2.7.0"`
	Status          Status                 `json:"status" version:">=2.2.0"`
}

// --- structures for upstream start  ---
type TimeoutValue float32
type Timeout struct {
	Connect TimeoutValue `json:"connect,omitempty" version:">=0.8.0"`
	Send    TimeoutValue `json:"send,omitempty" version:">=0.8.0"`
	Read    TimeoutValue `json:"read,omitempty" version:">=0.8.0"`
}

type Node struct {
	Host     string      `json:"host,omitempty" version:">=0.8.0"`
	Port     int         `json:"port,omitempty" version:">=0.8.0"`
	Weight   int         `json:"weight" version:">=0.8.0"`
	Metadata interface{} `json:"metadata,omitempty" version:">=0.8.0"`

	Priority int `json:"priority,omitempty" version:">=2.5.0"`
}

type K8sInfo struct {
	Namespace   string `json:"namespace,omitempty" version:">=1.3.0 <2.2.0"`
	DeployName  string `json:"deploy_name,omitempty" version:">=1.3.0 <2.2.0"`
	ServiceName string `json:"service_name,omitempty" version:">=1.3.0 <2.2.0"`
	Port        int    `json:"port,omitempty" version:">=1.3.0 <2.2.0"`
	BackendType string `json:"backend_type,omitempty" version:">=1.3.0 <2.2.0"`
}

type Healthy struct {
	Interval     int   `json:"interval,omitempty" version:">=0.8.0"`
	HttpStatuses []int `json:"http_statuses,omitempty" version:">=0.8.0"`
	Successes    int   `json:"successes,omitempty" version:">=0.8.0"`
}

type UnHealthy struct {
	Interval     int   `json:"interval,omitempty" version:">=0.8.0"`
	HTTPStatuses []int `json:"http_statuses,omitempty" version:">=0.8.0"`
	TCPFailures  int   `json:"tcp_failures,omitempty" version:">=0.8.0"`
	Timeouts     int   `json:"timeouts,omitempty" version:">=0.8.0"`
	HTTPFailures int   `json:"http_failures,omitempty" version:">=0.8.0"`
}

type Active struct {
	Type                   string       `json:"type,omitempty" version:">=0.8.0"`
	Timeout                TimeoutValue `json:"timeout,omitempty" version:">=0.8.0"`
	Concurrency            int          `json:"concurrency,omitempty" version:">=0.8.0"`
	Host                   string       `json:"host,omitempty" version:">=0.8.0"`
	Port                   int          `json:"port,omitempty" version:">=1.5.0"`
	HTTPPath               string       `json:"http_path,omitempty" version:">=0.8.0"`
	HTTPSVerifyCertificate string       `json:"https_verify_certificate,omitempty" version:">=0.8.0"`
	Healthy                Healthy      `json:"healthy,omitempty" version:">=0.8.0"`
	UnHealthy              UnHealthy    `json:"unhealthy,omitempty" version:">=0.8.0"`
	ReqHeaders             []string     `json:"req_headers,omitempty" version:">=1.0.0"`
}

type Passive struct {
	Type      string    `json:"type,omitempty" version:">=0.8.0"`
	Healthy   Healthy   `json:"healthy,omitempty" version:">=0.8.0"`
	UnHealthy UnHealthy `json:"unhealthy,omitempty" version:">=0.8.0"`
}

type HealthChecker struct {
	Active  Active  `json:"active,omitempty" version:">=0.8.0"`
	Passive Passive `json:"passive,omitempty" version:">=0.8.0"`
}

type UpstreamTLS struct {
	ClientCert string `json:"client_cert,omitempty" version:">=2.6.0"`
	ClientKey  string `json:"client_key,omitempty" version:">=2.6.0"`
}

type UpstreamKeepalivePool struct {
	IdleTimeout TimeoutValue `json:"idle_timeout,omitempty" version:">=2.8.0"`
	Requests    int          `json:"requests,omitempty" version:">=2.8.0"`
	Size        int          `json:"size" version:">=2.8.0"`
}

type UpstreamDef struct {
	Nodes         interface{}            `json:"nodes,omitempty" version:">=0.8.0"`
	Retries       int                    `json:"retries,omitempty" version:">=0.8.0"`
	Timeout       *Timeout               `json:"timeout,omitempty" version:">=0.8.0"`
	Type          string                 `json:"type,omitempty" version:">=0.8.0"`
	Checks        interface{}            `json:"checks,omitempty" version:">=0.8.0"`
	HashOn        string                 `json:"hash_on,omitempty" version:">=1.0.0"`
	Key           string                 `json:"key,omitempty" version:">=0.8.0"`
	Scheme        string                 `json:"scheme,omitempty" version:">=0.8.0 <0.9.0 || >=2.3.0"`
	DiscoveryType string                 `json:"discovery_type,omitempty" version:">=2.1.0"`
	DiscoveryArgs map[string]string      `json:"discovery_args,omitempty" version:">=2.7.0"`
	PassHost      string                 `json:"pass_host,omitempty" version:">=2.1.0"`
	UpstreamHost  string                 `json:"upstream_host,omitempty" version:">=2.1.0"`
	Name          string                 `json:"name,omitempty" version:">=1.4.0"`
	Desc          string                 `json:"desc,omitempty" version:">=0.8.0"`
	ServiceName   string                 `json:"service_name,omitempty" version:">=1.4.0"`
	Labels        map[string]string      `json:"labels,omitempty" version:">=2.1.0"`
	TLS           *UpstreamTLS           `json:"tls,omitempty" version:">=2.6.0"`
	KeepalivePool *UpstreamKeepalivePool `json:"keepalive_pool,omitempty" version:">=2.8.0"`
	RetryTimeout  TimeoutValue           `json:"retry_timeout,omitempty" version:">=2.8.0"`

	// exist between version 0.8 and 0.9
	// see: https://github.com/apache/apisix/blob/v0.9/lua/apisix/schema_def.lua#L218
	Host            string `json:"host,omitempty" version:">=0.8.0 <0.9.0"`
	Upgrade         string `json:"upgrade,omitempty" version:">=0.8.0 <0.9.0"`
	Connection      string `json:"connection,omitempty" version:">=0.8.0 <0.9.0"`
	Uri             string `json:"uri,omitempty" version:">=0.8.0 <0.9.0"`
	EnableWebsocket bool   `json:"enable_websocket,omitempty" version:">=0.8.0 <0.9.0 || >=1.0.0 <2.5"`

	// exist between version 1.3 and 2.2
	// see: https://github.com/apache/apisix/blob/v2.2/apisix/schema_def.lua#L305
	K8sDeploymentInfo *K8sInfo `json:"k8s_deployment_info,omitempty" version:">=1.3.0 <2.2.0"`
}

// swagger:model Upstream
type Upstream struct {
	BaseInfo
	UpstreamDef
}

type UpstreamNameResponse struct {
	ID   interface{} `json:"id"`
	Name string      `json:"name"`
}

func (upstream *Upstream) Parse2NameResponse() (*UpstreamNameResponse, error) {
	nameResp := &UpstreamNameResponse{
		ID:   upstream.ID,
		Name: upstream.Name,
	}
	return nameResp, nil
}

// --- structures for upstream end  ---

// swagger:model Consumer
type Consumer struct {
	Username   string                 `json:"username" version:">=0.8.0"`
	Desc       string                 `json:"desc,omitempty" version:">=0.8.0"`
	Plugins    map[string]interface{} `json:"plugins,omitempty" version:">=0.8.0"`
	Labels     map[string]string      `json:"labels,omitempty" version:">=2.1.0"`
	CreateTime int64                  `json:"create_time,omitempty"`
	UpdateTime int64                  `json:"update_time,omitempty"`

	ID interface{} `json:"id,omitempty" version:">=1.5.0 <2.5.0"`
}

type SSLClient struct {
	CA    string `json:"ca,omitempty"`
	Depth int    `json:"depth,omitempty"`
}

// swagger:model SSL
type SSL struct {
	BaseInfo
	Cert          string            `json:"cert,omitempty" version:">=0.8.0"`
	Key           string            `json:"key,omitempty" version:">=0.8.0"`
	Sni           string            `json:"sni,omitempty" version:">=0.8.0"`
	Snis          []string          `json:"snis,omitempty" version:">=1.4.0"`
	Certs         []string          `json:"certs,omitempty" version:">=2.1.0"`
	Keys          []string          `json:"keys,omitempty" version:">=2.1.0"`
	ExpTime       int64             `json:"exptime,omitempty" version:">=1.4.0"`
	Status        int               `json:"status" version:">=1.4.0"`
	ValidityStart int64             `json:"validity_start,omitempty" version:">=2.1.0"`
	ValidityEnd   int64             `json:"validity_end,omitempty" version:">=2.1.0"`
	Labels        map[string]string `json:"labels,omitempty" version:">=2.1.0"`
	Client        *SSLClient        `json:"client,omitempty" version:">=2.6.0"`
}

// swagger:model Service
type Service struct {
	BaseInfo
	Name            string                 `json:"name,omitempty" version:">=1.4.0"`
	Desc            string                 `json:"desc,omitempty" version:">=0.8.0"`
	Upstream        *UpstreamDef           `json:"upstream,omitempty" version:">=0.8.0"`
	UpstreamID      interface{}            `json:"upstream_id,omitempty" version:">=0.8.0"`
	Plugins         map[string]interface{} `json:"plugins,omitempty" version:">=0.8.0"`
	Script          string                 `json:"script,omitempty" version:">=1.5.0"`
	Labels          map[string]string      `json:"labels,omitempty" version:">=2.1.0"`
	EnableWebsocket bool                   `json:"enable_websocket,omitempty" version:">=2.1.0"`
}

type Script struct {
	ID     string      `json:"id"`
	Script interface{} `json:"script,omitempty"`
}

type RequestValidation struct {
	Type       string      `json:"type,omitempty"`
	Required   []string    `json:"required,omitempty"`
	Properties interface{} `json:"properties,omitempty"`
}

// swagger:model GlobalPlugins
type GlobalPlugins struct {
	BaseInfo
	Plugins map[string]interface{} `json:"plugins" version:">=0.8.0"`
}

type ServerInfo struct {
	BaseInfo
	LastReportTime int64  `json:"last_report_time,omitempty"`
	UpTime         int64  `json:"up_time,omitempty"`
	BootTime       int64  `json:"boot_time,omitempty"`
	EtcdVersion    string `json:"etcd_version,omitempty"`
	Hostname       string `json:"hostname,omitempty"`
	Version        string `json:"version,omitempty"`
}

// swagger:model GlobalPlugins
type PluginConfig struct {
	BaseInfo
	Desc    string                 `json:"desc,omitempty" validate:"max=256" version:">=2.4.0"`
	Plugins map[string]interface{} `json:"plugins" version:">=2.4.0"`
	Labels  map[string]string      `json:"labels,omitempty" version:">=2.4.0"`
}
