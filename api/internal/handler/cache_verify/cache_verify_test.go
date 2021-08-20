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
	"github.com/shiningrush/droplet"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"testing"
)

func TestHandler_CacheVerify(t *testing.T) {
	andyStr := `{"username":"andy","plugins":{"key-auth":{"key":"key-of-john"}},"create_time":1627739045,"update_time":1627744978}`
	var andyObj interface{}
	err := json.Unmarshal([]byte(andyStr), &andyObj)
	if err != nil {
		fmt.Printf("unmarshal error :: %s", err.Error())
	}
	brokenAndyStr := `{"username":"andy","plugins":{"key-auth":{"key":"key-of-john"}},"create_time":1627739046,"update_time":1627744978}`
	var brokenAndyObj interface{}
	err = json.Unmarshal([]byte(brokenAndyStr), &brokenAndyObj)
	if err != nil {
		fmt.Printf("unmarshal error :: %s", err.Error())
	}
	consumerPrefix := "/apisix/consumers/"

	tests := []struct {
		caseDesc                 string
		listInput                string
		listRet                  []storage.Keypair
		getInput                 string
		getRet                   interface{}
		wantInconsistentConsumer int
	}{
		{
			caseDesc:  "consistent",
			listInput: consumerPrefix,
			listRet: []storage.Keypair{
				{
					Key:   consumerPrefix + "andy",
					Value: andyStr,
				},
			},
			getInput:                 "andy",
			getRet:                   andyObj,
			wantInconsistentConsumer: 0,
		},
		{
			caseDesc:  "inconsistent",
			listInput: consumerPrefix,
			listRet: []storage.Keypair{
				{
					Key:   consumerPrefix + "andy",
					Value: andyStr,
				},
			},
			getInput:                 "andy",
			getRet:                   brokenAndyObj,
			wantInconsistentConsumer: 1,
		},
	}

	for _, tc := range tests {
		t.Run(tc.caseDesc, func(t *testing.T) {
			mockConsumerCache := store.MockInterface{}
			mockEtcdStorage := storage.MockInterface{}
			mockEtcdStorage.On("List", context.TODO(), consumerPrefix).Return(tc.listRet, nil)
			// for any other type of configs,etcd.List just return empty slice,so it will not check further
			mockEtcdStorage.On("List", context.TODO(), mock.Anything).Return([]storage.Keypair{}, nil)

			mockConsumerCache.On("Get", tc.getInput).Return(tc.getRet, nil)
			handler := Handler{consumerStore: &mockConsumerCache, etcdStorage: &mockEtcdStorage}
			rs, err := handler.CacheVerify(droplet.NewContext())
			//fmt.Println((string)(rs))
			assert.Nil(t, err, nil)
			// todo 因为现在输出了很多统计信息,那么测试的时候,就要相应的assert这些
			v, ok := rs.(OutputResult)
			assert.True(t, ok, true)
			assert.Equal(t, v.Items.Consumers.InconsistentCount, tc.wantInconsistentConsumer)

			// test output of command line,when there are inconsistent items
			//fmt.Printf("cache verification result as follows:\n\n")
			//fmt.Printf("There are %d items in total,%d of them are consistent,%d of them are inconsistent\n",
			//	v.Total, v.ConsistentCount, v.InconsistentCount)
			//
			//printResult("ssls", v.Items.SSLs)
			//
			//printResult("routes", v.Items.Routes)
			//
			//printResult("scripts", v.Items.Scripts)
			//
			//printResult("services", v.Items.Services)
			//
			//printResult("upstreams", v.Items.Upstreams)
			//
			//printResult("consumers", v.Items.Consumers)
			//
			//printResult("server infos", v.Items.ServerInfos)
			//
			//printResult("global plugins", v.Items.GlobalPlugins)
			//
			//printResult("plugin configs", v.Items.PluginConfigs)
		})
	}

}

//func printResult(name string, data StatisticalData) {
//	fmt.Printf("%-15s: %d in total,%d consistent,%d inconsistent\n", name, data.Total, data.ConsistentCount, data.InconsistentCount)
//	if data.InconsistentCount > 0 {
//		fmt.Printf("inconsistent %s:\n", name)
//		for _, pair := range data.InconsistentPairs {
//			fmt.Printf("[key](%s)\n[etcd](%s)\n[cache](%s)\n", pair.Key, pair.EtcdValue, pair.CacheValue)
//		}
//	}
//}
