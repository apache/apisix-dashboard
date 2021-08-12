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

// we read from cache and etcd,then compare them

type Handler struct {
}

type compareResult struct {
	Key        string `json:"key"`
	CacheValue string `json:"cache_value"`
	EtcdValue  string `json:"etcd_value"`
}

type resultOuput struct {
	Consumers     []compareResult `json:"inconsistent_consumers"`
	Routes        []compareResult `json:"inconsistent_routes"`
	Services      []compareResult `json:"inconsistent_services"`
	SSLs          []compareResult `json:"inconsistent_ssls"`
	Upstreams     []compareResult `json:"inconsistent_upstreams"`
	Scripts       []compareResult `json:"inconsistent_scripts"`
	GlobalPlugins []compareResult `json:"inconsistent_global_plugins"`
	PluginConfigs []compareResult `json:"inconsistent_plugin_configs"`
	ServerInfos   []compareResult `json:"inconsistent_server_infos"`
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
	return &Handler{}, nil
}

func (h *Handler) ApplyRoute(r *gin.Engine) {
	r.GET("/apisix/admin/cache_verify", wgin.Wraps(h.CacheVerify))
}

var etcd *storage.EtcdV3Storage

func (h *Handler) CacheVerify(_ droplet.Context) (interface{}, error) {

	var rs resultOuput
	etcd = storage.GenEtcdStorage()
	store.RangeStore(func(hubKey store.HubKey, s *store.GenericStore) bool {
		keyPairs, err := etcd.List(context.TODO(), fmt.Sprintf("/apisix/%s/", infixMap[hubKey]))
		if err != nil {
			fmt.Println(err)
			return true
		}

		for i := range keyPairs {
			key := path.Base(keyPairs[i].Key)

			cacheObj, err := s.Get(context.TODO(), key)
			if err != nil {
				fmt.Println(err)
			}

			etcdValue := keyPairs[i].Value
			cmp, cacheValue := compare(keyPairs[i].Value, cacheObj)

			if !cmp {
				cmpResult := compareResult{EtcdValue: etcdValue, CacheValue: cacheValue, Key: key}
				if hubKey == store.HubKeyConsumer {
					rs.Consumers = append(rs.Consumers, cmpResult)
				}
				if hubKey == store.HubKeyRoute {
					rs.Routes = append(rs.Routes, cmpResult)
				}
				if hubKey == store.HubKeyScript {
					rs.Scripts = append(rs.Scripts, cmpResult)
				}
				if hubKey == store.HubKeyService {
					rs.Services = append(rs.Services, cmpResult)
				}
				if hubKey == store.HubKeyGlobalRule {
					rs.GlobalPlugins = append(rs.GlobalPlugins, cmpResult)
				}
				if hubKey == store.HubKeyPluginConfig {
					rs.PluginConfigs = append(rs.PluginConfigs, cmpResult)
				}
				if hubKey == store.HubKeyUpstream {
					rs.Upstreams = append(rs.Upstreams, cmpResult)
				}
				if hubKey == store.HubKeySsl {
					rs.SSLs = append(rs.SSLs, cmpResult)
				}
				if hubKey == store.HubKeyServerInfo {
					rs.ServerInfos = append(rs.ServerInfos, cmpResult)
				}
			}
		}
		return true
	})
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
