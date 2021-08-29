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

package migrate

import (
	"errors"

	"github.com/apisix/manager-api/internal/core/entity"
	"github.com/apisix/manager-api/internal/core/store"
)

type DataSet struct {
	Consumers     []*entity.Consumer
	Routes        []*entity.Route
	Services      []*entity.Service
	SSLs          []*entity.SSL
	Upstreams     []*entity.Upstream
	Scripts       []*entity.Script
	GlobalPlugins []*entity.GlobalPlugins
	PluginConfigs []*entity.PluginConfig
}

func newDataSet() *DataSet {
	return &DataSet{
		Consumers:     make([]*entity.Consumer, 0),
		Routes:        make([]*entity.Route, 0),
		Services:      make([]*entity.Service, 0),
		SSLs:          make([]*entity.SSL, 0),
		Upstreams:     make([]*entity.Upstream, 0),
		Scripts:       make([]*entity.Script, 0),
		GlobalPlugins: make([]*entity.GlobalPlugins, 0),
		PluginConfigs: make([]*entity.PluginConfig, 0),
	}
}

func (a *DataSet) rangeData(key store.HubKey, f func(int, interface{}) bool) {
	switch key {
	case store.HubKeyConsumer:
		for i, v := range a.Consumers {
			if !f(i, v) {
				break
			}
		}
	case store.HubKeyRoute:
		for i, v := range a.Routes {
			if !f(i, v) {
				break
			}
		}
	case store.HubKeyService:
		for i, v := range a.Services {
			if !f(i, v) {
				break
			}
		}
	case store.HubKeySsl:
		for i, v := range a.SSLs {
			if !f(i, v) {
				break
			}
		}
	case store.HubKeyUpstream:
		for i, v := range a.Upstreams {
			if !f(i, v) {
				break
			}
		}
	case store.HubKeyScript:
		for i, v := range a.Scripts {
			if !f(i, v) {
				break
			}
		}
	case store.HubKeyGlobalRule:
		for i, v := range a.GlobalPlugins {
			if !f(i, v) {
				break
			}
		}
	case store.HubKeyPluginConfig:
		for i, v := range a.PluginConfigs {
			if !f(i, v) {
				break
			}
		}
	}
}

func (a *DataSet) Add(obj interface{}) error {
	var err error = nil
	switch obj := obj.(type) {
	case *entity.Consumer:
		a.Consumers = append(a.Consumers, obj)
	case *entity.Route:
		a.Routes = append(a.Routes, obj)
	case *entity.Service:
		a.Services = append(a.Services, obj)
	case *entity.SSL:
		a.SSLs = append(a.SSLs, obj)
	case *entity.Upstream:
		a.Upstreams = append(a.Upstreams, obj)
	case *entity.Script:
		a.Scripts = append(a.Scripts, obj)
	case *entity.GlobalPlugins:
		a.GlobalPlugins = append(a.GlobalPlugins, obj)
	case *entity.PluginConfig:
		a.PluginConfigs = append(a.PluginConfigs, obj)
	default:
		err = errors.New("Unknown type of obj")
	}
	return err
}
