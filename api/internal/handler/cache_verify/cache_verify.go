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
	"path"
	"reflect"

	"github.com/apisix/manager-api/internal/core/storage"
	"github.com/apisix/manager-api/internal/core/store"
	"github.com/apisix/manager-api/internal/handler"
	"github.com/gin-gonic/gin"
	"github.com/shiningrush/droplet"
	wgin "github.com/shiningrush/droplet/wrapper/gin"
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

var hubToData map[store.HubKey]*StatisticalData

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

				if v, ok := hubToData[hubKey]; ok {
					v.InconsistentCount++
					v.Total++
					v.InconsistentPairs = append(v.InconsistentPairs, cmpResult)
				}
			} else {
				rs.ConsistentCount++
				if v, ok := hubToData[hubKey]; ok {
					v.ConsistentCount++
					v.Total++
				}
			}
		}
	}

	var rs OutputResult

	hubToData = make(map[store.HubKey]*StatisticalData)
	hubToData[store.HubKeyConsumer] = &rs.Items.Consumers
	hubToData[store.HubKeyRoute] = &rs.Items.Routes
	hubToData[store.HubKeyScript] = &rs.Items.Scripts
	hubToData[store.HubKeyService] = &rs.Items.Services
	hubToData[store.HubKeyGlobalRule] = &rs.Items.GlobalPlugins
	hubToData[store.HubKeyPluginConfig] = &rs.Items.PluginConfigs
	hubToData[store.HubKeyUpstream] = &rs.Items.Upstreams
	hubToData[store.HubKeySsl] = &rs.Items.SSLs
	hubToData[store.HubKeyServerInfo] = &rs.Items.ServerInfos

	keyToStore := make(map[store.HubKey]*store.Interface)
	keyToStore[store.HubKeyConsumer] = &h.consumerStore
	keyToStore[store.HubKeyRoute] = &h.routeStore
	keyToStore[store.HubKeyService] = &h.serviceStore
	keyToStore[store.HubKeySsl] = &h.sslStore
	keyToStore[store.HubKeyUpstream] = &h.upstreamStore
	keyToStore[store.HubKeyScript] = &h.scriptStore
	keyToStore[store.HubKeyGlobalRule] = &h.globalPluginStore
	keyToStore[store.HubKeyPluginConfig] = &h.pluginConfigStore
	keyToStore[store.HubKeyServerInfo] = &h.serverInfoStore

	for k, v := range keyToStore {
		checkConsistent(k, v, &rs, &h.etcdStorage)
	}

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
