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
package cache_verify

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/apisix/manager-api/internal/core/storage"
	"github.com/apisix/manager-api/internal/core/store"
	"github.com/apisix/manager-api/internal/handler"
	"github.com/gin-gonic/gin"
	"github.com/shiningrush/droplet"
	wgin "github.com/shiningrush/droplet/wrapper/gin"
	"path"
	"reflect"
)

type Handler struct {
	consumerStore     store.Interface
	routeStore        store.Interface
	serviceStore      store.Interface
	sslStore          store.Interface
	upstreamStore     store.Interface
	scriptStore       store.Interface
	globalPluginStore store.Interface
	pluginConfigStore store.Interface
	serverInfoStore   store.Interface
	etcdStorage       storage.Interface
}

type inconsistentPair struct {
	Key        string `json:"key"`
	CacheValue string `json:"cache_value"`
	EtcdValue  string `json:"etcd_value"`
}

type StatisticalData struct {
	Total             int                `json:"total"`
	ConsistentCount   int                `json:"consistent_count"`
	InconsistentCount int                `json:"inconsistent_count"`
	InconsistentPairs []inconsistentPair `json:"inconsistent_pairs"`
}

type items struct {
	Consumers     StatisticalData `json:"consumers"`
	Routes        StatisticalData `json:"routes"`
	Services      StatisticalData `json:"services"`
	SSLs          StatisticalData `json:"ssls"`
	Upstreams     StatisticalData `json:"upstreams"`
	Scripts       StatisticalData `json:"scripts"`
	GlobalPlugins StatisticalData `json:"global_plugins"`
	PluginConfigs StatisticalData `json:"plugin_configs"`
	ServerInfos   StatisticalData `json:"server_infos"`
}

type OutputResult struct {
	Total             int   `json:"total"`
	ConsistentCount   int   `json:"consistent_count"`
	InconsistentCount int   `json:"inconsistent_count"`
	Items             items `json:"items"`
}

var infixMap = map[store.HubKey]string{
	store.HubKeyConsumer:     "consumers",
	store.HubKeyRoute:        "routes",
	store.HubKeyService:      "services",
	store.HubKeySsl:          "ssl",
	store.HubKeyUpstream:     "upstreams",
	store.HubKeyScript:       "scripts",
	store.HubKeyGlobalRule:   "global_rules",
	store.HubKeyServerInfo:   "data_plane/server_info",
	store.HubKeyPluginConfig: "plugin_configs",
}

func NewHandler() (handler.RouteRegister, error) {
	return &Handler{
		consumerStore:     store.GetStore(store.HubKeyConsumer),
		routeStore:        store.GetStore(store.HubKeyRoute),
		serviceStore:      store.GetStore(store.HubKeyService),
		sslStore:          store.GetStore(store.HubKeySsl),
		upstreamStore:     store.GetStore(store.HubKeyUpstream),
		scriptStore:       store.GetStore(store.HubKeyScript),
		globalPluginStore: store.GetStore(store.HubKeyGlobalRule),
		pluginConfigStore: store.GetStore(store.HubKeyPluginConfig),
		serverInfoStore:   store.GetStore(store.HubKeyServerInfo),
		etcdStorage:       storage.GenEtcdStorage(),
	}, nil
}

func (h *Handler) ApplyRoute(r *gin.Engine) {
	r.GET("/apisix/admin/cache_verify", wgin.Wraps(h.CacheVerify))
}

func (h *Handler) CacheVerify(_ droplet.Context) (interface{}, error) {
	checkConsistent := func(hubKey store.HubKey, s *store.Interface, rs *OutputResult, etcd *storage.Interface) {

		keyPairs, err := (*etcd).List(context.TODO(), fmt.Sprintf("/apisix/%s/", infixMap[hubKey]))
		if err != nil {
			fmt.Println(err)
		}

		rs.Total += len(keyPairs)

		for i := range keyPairs {
			key := path.Base(keyPairs[i].Key)

			cacheObj, err := (*s).Get(context.TODO(), key)
			if err != nil {
				fmt.Println(err)
			}

			etcdValue := keyPairs[i].Value
			cmp, cacheValue := compare(keyPairs[i].Value, cacheObj)

			if !cmp {
				rs.InconsistentCount++
				cmpResult := inconsistentPair{EtcdValue: etcdValue, CacheValue: cacheValue, Key: key}
				if hubKey == store.HubKeyConsumer {
					// is there a way that I can avoid this if else ?
					// 可以尝试用map实现?比如:items作为一个hubKey为key,statisticalData为value的map
					rs.Items.Consumers.InconsistentCount++
					rs.Items.Consumers.Total++
					rs.Items.Consumers.InconsistentPairs = append(rs.Items.Consumers.InconsistentPairs, cmpResult)
				}
				if hubKey == store.HubKeyRoute {
					rs.Items.Routes.InconsistentCount++
					rs.Items.Routes.Total++
					rs.Items.Routes.InconsistentPairs = append(rs.Items.Routes.InconsistentPairs, cmpResult)
				}
				if hubKey == store.HubKeyScript {
					rs.Items.Scripts.InconsistentCount++
					rs.Items.Scripts.Total++
					rs.Items.Scripts.InconsistentPairs = append(rs.Items.Scripts.InconsistentPairs, cmpResult)
				}
				if hubKey == store.HubKeyService {
					rs.Items.Services.InconsistentCount++
					rs.Items.Services.Total++
					rs.Items.Services.InconsistentPairs = append(rs.Items.Services.InconsistentPairs, cmpResult)
				}
				if hubKey == store.HubKeyGlobalRule {
					rs.Items.GlobalPlugins.InconsistentCount++
					rs.Items.GlobalPlugins.Total++
					rs.Items.GlobalPlugins.InconsistentPairs = append(rs.Items.GlobalPlugins.InconsistentPairs, cmpResult)
				}
				if hubKey == store.HubKeyPluginConfig {
					rs.Items.PluginConfigs.InconsistentCount++
					rs.Items.PluginConfigs.Total++
					rs.Items.PluginConfigs.InconsistentPairs = append(rs.Items.PluginConfigs.InconsistentPairs, cmpResult)
				}
				if hubKey == store.HubKeyUpstream {
					rs.Items.Upstreams.InconsistentCount++
					rs.Items.Upstreams.Total++
					rs.Items.Upstreams.InconsistentPairs = append(rs.Items.Upstreams.InconsistentPairs, cmpResult)
				}
				if hubKey == store.HubKeySsl {
					rs.Items.SSLs.InconsistentCount++
					rs.Items.SSLs.Total++
					rs.Items.SSLs.InconsistentPairs = append(rs.Items.SSLs.InconsistentPairs, cmpResult)
				}
				if hubKey == store.HubKeyServerInfo {
					rs.Items.ServerInfos.Total++
					rs.Items.ServerInfos.InconsistentCount++
					rs.Items.ServerInfos.InconsistentPairs = append(rs.Items.ServerInfos.InconsistentPairs, cmpResult)
				}
			} else {
				rs.ConsistentCount++

				if hubKey == store.HubKeyConsumer {
					// is there a way that I can avoid this if else ?
					// 可以尝试用map实现?比如:items作为一个hubKey为key,statisticalData为value的map
					rs.Items.Consumers.ConsistentCount++
					rs.Items.Consumers.Total++
				}
				if hubKey == store.HubKeyRoute {
					rs.Items.Routes.ConsistentCount++
					rs.Items.Routes.Total++
				}
				if hubKey == store.HubKeyScript {
					rs.Items.Scripts.ConsistentCount++
					rs.Items.Scripts.Total++
				}
				if hubKey == store.HubKeyService {
					rs.Items.Services.ConsistentCount++
					rs.Items.Services.Total++
				}
				if hubKey == store.HubKeyGlobalRule {
					rs.Items.GlobalPlugins.ConsistentCount++
					rs.Items.GlobalPlugins.Total++
				}
				if hubKey == store.HubKeyPluginConfig {
					rs.Items.PluginConfigs.ConsistentCount++
					rs.Items.PluginConfigs.Total++
				}
				if hubKey == store.HubKeyUpstream {
					rs.Items.Upstreams.ConsistentCount++
					rs.Items.Upstreams.Total++
				}
				if hubKey == store.HubKeySsl {
					rs.Items.SSLs.ConsistentCount++
					rs.Items.SSLs.Total++
				}
				if hubKey == store.HubKeyServerInfo {
					rs.Items.ServerInfos.Total++
					rs.Items.ServerInfos.ConsistentCount++
				}
			}
		}
	}

	var rs OutputResult
	// todo this will panic when consumerStore is nil?
	checkConsistent(store.HubKeyConsumer, &h.consumerStore, &rs, &h.etcdStorage)
	checkConsistent(store.HubKeyRoute, &h.routeStore, &rs, &h.etcdStorage)
	checkConsistent(store.HubKeyService, &h.serviceStore, &rs, &h.etcdStorage)
	checkConsistent(store.HubKeySsl, &h.sslStore, &rs, &h.etcdStorage)
	checkConsistent(store.HubKeyUpstream, &h.upstreamStore, &rs, &h.etcdStorage)
	checkConsistent(store.HubKeyScript, &h.scriptStore, &rs, &h.etcdStorage)
	checkConsistent(store.HubKeyGlobalRule, &h.globalPluginStore, &rs, &h.etcdStorage)
	checkConsistent(store.HubKeyPluginConfig, &h.pluginConfigStore, &rs, &h.etcdStorage)
	checkConsistent(store.HubKeyServerInfo, &h.serverInfoStore, &rs, &h.etcdStorage)
	return rs, nil
}

func compare(etcdValue string, cacheObj interface{}) (bool, string) {
	s, err := json.Marshal(cacheObj)
	if err != nil {
		fmt.Printf("json marsharl failed : %cacheObj\n", err)
		return false, ""
	}
	cacheValue := string(s)
	cmp, err := areEqualJSON(cacheValue, etcdValue)
	if err != nil {
		fmt.Printf("compare json failed %cacheObj\n", err)
	}
	return cmp, cacheValue
}

func areEqualJSON(s1, s2 string) (bool, error) {
	var o1 interface{}
	var o2 interface{}

	var err error
	err = json.Unmarshal([]byte(s1), &o1)
	if err != nil {
		return false, fmt.Errorf("error mashalling string 1 :: %s", err.Error())
	}
	err = json.Unmarshal([]byte(s2), &o2)
	if err != nil {
		return false, fmt.Errorf("error mashalling string 2 :: %s", err.Error())
	}

	return reflect.DeepEqual(o1, o2), nil
}
