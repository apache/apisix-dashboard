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

	"github.com/apisix/manager-api/internal/core/entity"
	"github.com/apisix/manager-api/internal/utils"
	"github.com/apisix/manager-api/log"
)

type HubKey string

const (
	HubKeyConsumer   HubKey = "consumer"
	HubKeyRoute      HubKey = "route"
	HubKeyService    HubKey = "service"
	HubKeySsl        HubKey = "ssl"
	HubKeyUpstream   HubKey = "upstream"
	HubKeyScript     HubKey = "script"
	HubKeyServerInfo HubKey = `server_info`
)

var (
	storeHub = map[HubKey]*GenericStore{}
)

func InitStore(key HubKey, opt GenericStoreOption) error {
	if key == HubKeyConsumer || key == HubKeyRoute ||
		key == HubKeyService || key == HubKeySsl || key == HubKeyUpstream {
		validator, err := NewAPISIXJsonSchemaValidator("main." + string(key))
		if err != nil {
			return err
		}
		opt.Validator = validator
	}
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

func InitStores() error {
	err := InitStore(HubKeyConsumer, GenericStoreOption{
		BasePath: "/apisix/consumers",
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
		BasePath: "/apisix/routes",
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
		BasePath: "/apisix/services",
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
		BasePath: "/apisix/ssl",
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
		BasePath: "/apisix/upstreams",
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
		BasePath: "/apisix/scripts",
		ObjType:  reflect.TypeOf(entity.Script{}),
		KeyFunc: func(obj interface{}) string {
			r := obj.(*entity.Script)
			return r.ID
		},
	})
	if err != nil {
		return err
	}

	err = InitStore(HubKeyServerInfo, GenericStoreOption{
		BasePath: "/apisix/data_plane/server_info",
		ObjType:  reflect.TypeOf(entity.ServerInfo{}),
		KeyFunc: func(obj interface{}) string {
			r := obj.(*entity.ServerInfo)
			return utils.InterfaceToString(r.ID)
		},
	})
	if err != nil {
		return err
	}

	return nil
}
