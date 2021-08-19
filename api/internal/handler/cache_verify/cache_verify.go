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
}

type compareResult struct {
	Key        string `json:"key"`
	CacheValue string `json:"cache_value"`
	EtcdValue  string `json:"etcd_value"`
}

type inconsistentItems struct {
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
	}, nil
}

func (h *Handler) ApplyRoute(r *gin.Engine) {
	r.GET("/apisix/admin/cache_verify", wgin.Wraps(h.CacheVerify))
}

var etcd *storage.EtcdV3Storage

func (h *Handler) CacheVerify(_ droplet.Context) (interface{}, error) {
	checkConsistent := func(hubKey store.HubKey, s *store.Interface, rs *inconsistentItems, etcd *storage.EtcdV3Storage) {
		fmt.Printf("checking %s\n", hubKey)
		// 下面就是这个函数的实现:通过etcd(注意,每个genericStore里都有etcd,所以上面不用再次获取)
		// 获取到该HubKey对应的全部key,value pair,然后对于每个pair,都去分别获取对应的Cache值和etcd值,并且比较
		keyPairs, err := etcd.List(context.TODO(), fmt.Sprintf("/apisix/%s/", infixMap[hubKey]))
		if err != nil {
			fmt.Println(err)
			//return true
		}

		for i := range keyPairs {
			key := path.Base(keyPairs[i].Key)

			// todo 这里s应该传进来指针吗?
			cacheObj, err := (*s).Get(context.TODO(), key)
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
		//return true
	}
	var rs inconsistentItems
	etcd = storage.GenEtcdStorage()
	checkConsistent(store.HubKeyConsumer, &h.consumerStore, &rs, etcd)
	checkConsistent(store.HubKeyRoute, &h.routeStore, &rs, etcd)
	checkConsistent(store.HubKeyService, &h.serviceStore, &rs, etcd)
	checkConsistent(store.HubKeySsl, &h.sslStore, &rs, etcd)
	checkConsistent(store.HubKeyUpstream, &h.upstreamStore, &rs, etcd)
	checkConsistent(store.HubKeyScript, &h.scriptStore, &rs, etcd)
	checkConsistent(store.HubKeyGlobalRule, &h.globalPluginStore, &rs, etcd)
	checkConsistent(store.HubKeyPluginConfig, &h.pluginConfigStore, &rs, etcd)
	checkConsistent(store.HubKeyServerInfo, &h.serverInfoStore, &rs, etcd)
	return rs, nil
	//var rs inconsistentItems
	//etcd = storage.GenEtcdStorage()
	//// rangeStore:参数为一个函数,遍历storeHub,然后为每个(hubKey,store)调用这个函数
	//store.RangeStore(func(hubKey store.HubKey, s *store.GenericStore) bool {
	//	// 下面就是这个函数的实现:通过etcd(注意,每个genericStore里都有etcd,所以上面不用再次获取)
	//	// 获取到该HubKey对应的全部key,value pair,然后对于每个pair,都去分别获取对应的Cache值和etcd值,并且比较
	//	keyPairs, err := etcd.List(context.TODO(), fmt.Sprintf("/apisix/%s/", infixMap[hubKey]))
	//	if err != nil {
	//		fmt.Println(err)
	//		return true
	//	}
	//
	//	for i := range keyPairs {
	//		key := path.Base(keyPairs[i].Key)
	//
	//		cacheObj, err := s.Get(context.TODO(), key)
	//		if err != nil {
	//			fmt.Println(err)
	//		}
	//
	//		etcdValue := keyPairs[i].Value
	//		cmp, cacheValue := compare(keyPairs[i].Value, cacheObj)
	//
	//		if !cmp {
	//			cmpResult := compareResult{EtcdValue: etcdValue, CacheValue: cacheValue, Key: key}
	//			if hubKey == store.HubKeyConsumer {
	//				rs.Consumers = append(rs.Consumers, cmpResult)
	//			}
	//			if hubKey == store.HubKeyRoute {
	//				rs.Routes = append(rs.Routes, cmpResult)
	//			}
	//			if hubKey == store.HubKeyScript {
	//				rs.Scripts = append(rs.Scripts, cmpResult)
	//			}
	//			if hubKey == store.HubKeyService {
	//				rs.Services = append(rs.Services, cmpResult)
	//			}
	//			if hubKey == store.HubKeyGlobalRule {
	//				rs.GlobalPlugins = append(rs.GlobalPlugins, cmpResult)
	//			}
	//			if hubKey == store.HubKeyPluginConfig {
	//				rs.PluginConfigs = append(rs.PluginConfigs, cmpResult)
	//			}
	//			if hubKey == store.HubKeyUpstream {
	//				rs.Upstreams = append(rs.Upstreams, cmpResult)
	//			}
	//			if hubKey == store.HubKeySsl {
	//				rs.SSLs = append(rs.SSLs, cmpResult)
	//			}
	//			if hubKey == store.HubKeyServerInfo {
	//				rs.ServerInfos = append(rs.ServerInfos, cmpResult)
	//			}
	//		}
	//	}
	//	return true
	//})
	//return rs, nil
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
	fmt.Printf("cache: %s\netcd:%s\n", s1, s2)
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
