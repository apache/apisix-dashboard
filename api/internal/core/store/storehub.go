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

package store

import (
	"fmt"
	"reflect"

	"github.com/apache/apisix-dashboard/api/internal/core/entity"
	"github.com/apache/apisix-dashboard/api/internal/log"
	"github.com/apache/apisix-dashboard/api/internal/utils"
)

type HubKey string

const (
	HubKeyConsumer     HubKey = "consumer"
	HubKeyRoute        HubKey = "route"
	HubKeyService      HubKey = "service"
	HubKeySsl          HubKey = "ssl"
	HubKeyUpstream     HubKey = "upstream"
	HubKeyScript       HubKey = "script"
	HubKeyGlobalRule   HubKey = "global_rule"
	HubKeyServerInfo   HubKey = "server_info"
	HubKeyPluginConfig HubKey = "plugin_config"
	HubKeyProto        HubKey = "proto"
	HubKeyStreamRoute  HubKey = "stream_route"
	HubKeySystemConfig HubKey = "system_config"
)

var (
	storeHub = map[HubKey]*GenericStore{}
)

func InitStore(key HubKey, opt GenericStoreOption) error {
	hubsNeedCheck := map[HubKey]bool{
		HubKeyConsumer:     true,
		HubKeyRoute:        true,
		HubKeySsl:          true,
		HubKeyService:      true,
		HubKeyUpstream:     true,
		HubKeyGlobalRule:   true,
		HubKeyStreamRoute:  true,
		HubKeySystemConfig: true,
	}

	if _, ok := hubsNeedCheck[key]; ok {
		validator, err := NewAPISIXJsonSchemaValidator("main." + string(key))
		if err != nil {
			return err
		}
		opt.Validator = validator
	}
	opt.HubKey = key
	s, err := NewGenericStore(opt)
	if err != nil {
		log.Errorf("NewGenericStore error: %s", err)
		return err
	}
	if err := s.Init(); err != nil {
		log.Errorf("GenericStore init error: %s", err)
		return err
	}

	utils.AppendToClosers(s.Close)
	storeHub[key] = s
	return nil
}

func GetStore(key HubKey) *GenericStore {
	if s, ok := storeHub[key]; ok {
		return s
	}
	panic(fmt.Sprintf("no store with key: %s", key))
}

func RangeStore(f func(key HubKey, store *GenericStore) bool) {
	for k, s := range storeHub {
		if k != "" && s != nil {
			if !f(k, s) {
				break
			}
		}
	}
}

func InitStores(prefix string) error {
	err := InitStore(HubKeyConsumer, GenericStoreOption{
		BasePath: prefix + "/consumers",
		ObjType:  reflect.TypeOf(entity.Consumer{}),
		KeyFunc: func(obj interface{}) string {
			r := obj.(*entity.Consumer)
			return r.Username
		},
	})
	if err != nil {
		return err
	}

	err = InitStore(HubKeyRoute, GenericStoreOption{
		BasePath: prefix + "/routes",
		ObjType:  reflect.TypeOf(entity.Route{}),
		KeyFunc: func(obj interface{}) string {
			r := obj.(*entity.Route)
			return utils.InterfaceToString(r.ID)
		},
	})
	if err != nil {
		return err
	}

	err = InitStore(HubKeyService, GenericStoreOption{
		BasePath: prefix + "/services",
		ObjType:  reflect.TypeOf(entity.Service{}),
		KeyFunc: func(obj interface{}) string {
			r := obj.(*entity.Service)
			return utils.InterfaceToString(r.ID)
		},
	})
	if err != nil {
		return err
	}

	err = InitStore(HubKeySsl, GenericStoreOption{
		BasePath: prefix + "/ssl",
		ObjType:  reflect.TypeOf(entity.SSL{}),
		KeyFunc: func(obj interface{}) string {
			r := obj.(*entity.SSL)
			return utils.InterfaceToString(r.ID)
		},
	})
	if err != nil {
		return err
	}

	err = InitStore(HubKeyUpstream, GenericStoreOption{
		BasePath: prefix + "/upstreams",
		ObjType:  reflect.TypeOf(entity.Upstream{}),
		KeyFunc: func(obj interface{}) string {
			r := obj.(*entity.Upstream)
			return utils.InterfaceToString(r.ID)
		},
	})
	if err != nil {
		return err
	}

	err = InitStore(HubKeyScript, GenericStoreOption{
		BasePath: prefix + "/scripts",
		ObjType:  reflect.TypeOf(entity.Script{}),
		KeyFunc: func(obj interface{}) string {
			r := obj.(*entity.Script)
			return r.ID
		},
	})
	if err != nil {
		return err
	}

	err = InitStore(HubKeyGlobalRule, GenericStoreOption{
		BasePath: prefix + "/global_rules",
		ObjType:  reflect.TypeOf(entity.GlobalPlugins{}),
		KeyFunc: func(obj interface{}) string {
			r := obj.(*entity.GlobalPlugins)
			return utils.InterfaceToString(r.ID)
		},
	})
	if err != nil {
		return err
	}

	err = InitStore(HubKeyServerInfo, GenericStoreOption{
		BasePath: prefix + "/data_plane/server_info",
		ObjType:  reflect.TypeOf(entity.ServerInfo{}),
		KeyFunc: func(obj interface{}) string {
			r := obj.(*entity.ServerInfo)
			return utils.InterfaceToString(r.ID)
		},
	})
	if err != nil {
		return err
	}

	err = InitStore(HubKeyPluginConfig, GenericStoreOption{
		BasePath: prefix + "/plugin_configs",
		ObjType:  reflect.TypeOf(entity.PluginConfig{}),
		KeyFunc: func(obj interface{}) string {
			r := obj.(*entity.PluginConfig)
			return utils.InterfaceToString(r.ID)
		},
	})
	if err != nil {
		return err
	}

	err = InitStore(HubKeyProto, GenericStoreOption{
		BasePath: prefix + "/proto",
		ObjType:  reflect.TypeOf(entity.Proto{}),
		KeyFunc: func(obj interface{}) string {
			r := obj.(*entity.Proto)
			return utils.InterfaceToString(r.ID)
		},
	})
	if err != nil {
		return err
	}

	err = InitStore(HubKeyStreamRoute, GenericStoreOption{
		BasePath: prefix + "/stream_routes",
		ObjType:  reflect.TypeOf(entity.StreamRoute{}),
		KeyFunc: func(obj interface{}) string {
			r := obj.(*entity.StreamRoute)
			return utils.InterfaceToString(r.ID)
		},
	})
	if err != nil {
		return err
	}

	err = InitStore(HubKeySystemConfig, GenericStoreOption{
		BasePath: prefix + "/system_config",
		ObjType:  reflect.TypeOf(entity.SystemConfig{}),
		KeyFunc: func(obj interface{}) string {
			r := obj.(*entity.SystemConfig)
			return r.ConfigName
		},
	})
	if err != nil {
		return err
	}

	return nil
}
