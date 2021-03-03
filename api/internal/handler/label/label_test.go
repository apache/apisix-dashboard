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

package label

import (
	"encoding/json"
	"math/rand"
	"testing"

	"github.com/shiningrush/droplet"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"

	"github.com/apisix/manager-api/internal/core/entity"
	"github.com/apisix/manager-api/internal/core/store"
)

type testCase struct {
	giveInput *ListInput
	giveData  []interface{}
	wantRet   interface{}
}

func TestPair_MarshalJSON(t *testing.T) {
	type tempStruct struct {
		Val string `json:"test_key"`
	}

	temp := tempStruct{Val: "test_val"}
	expect, err := json.Marshal(temp)
	assert.Nil(t, err)

	p := Pair{Key: "test_key", Val: `test_val`}
	content, err := json.Marshal(p)
	assert.Nil(t, err, nil)
	assert.Equal(t, expect, content)

	mp := make(map[string]string)
	err = json.Unmarshal(content, &mp)
	assert.Nil(t, err)
	assert.Equal(t, mp["test_key"], "test_val")

	// Because the quote in json key is not allowed.
	// So we only test the quote in json value.
	temp = tempStruct{Val: "test_val\""}
	expect, err = json.Marshal(temp)
	assert.Nil(t, err)

	p = Pair{Key: "test_key", Val: `test_val"`}
	content, err = json.Marshal(p)
	assert.Nil(t, err, nil)
	assert.Equal(t, expect, content)

	mp = make(map[string]string)
	err = json.Unmarshal(content, &mp)
	assert.Nil(t, err)
	assert.Equal(t, mp["test_key"], "test_val\"")
}

func genMockStore(t *testing.T, giveData []interface{}) *store.MockInterface {
	mStore := &store.MockInterface{}
	mStore.On("List", mock.Anything).Run(func(args mock.Arguments) {
		input := args.Get(0).(store.ListInput)
		assert.Equal(t, 0, input.PageSize)
		assert.Equal(t, 0, input.PageNumber)
	}).Return(func(input store.ListInput) *store.ListOutput {
		var returnData []interface{}
		for _, c := range giveData {
			if input.Predicate(c) {
				returnData = append(returnData, input.Format(c))
			}
		}
		return &store.ListOutput{
			Rows:      returnData,
			TotalSize: len(returnData),
		}
	}, nil)

	return mStore
}

func newCase(giveData []interface{}, ret []interface{}) *testCase {
	t := testCase{}
	t.giveInput = &ListInput{
		Pagination: store.Pagination{
			PageSize:   10,
			PageNumber: 1,
		},
	}

	t.giveData = giveData
	t.wantRet = &store.ListOutput{
		Rows:      ret,
		TotalSize: len(ret),
	}

	return &t
}

func genRoute(labels map[string]string) *entity.Route {
	r := entity.Route{
		BaseInfo: entity.BaseInfo{
			ID:         rand.Int(),
			CreateTime: rand.Int63(),
		},
		Host:   "test.com",
		URI:    "/test/route",
		Labels: labels,
	}

	return &r
}

func genService(labels map[string]string) *entity.Service {
	r := entity.Service{
		BaseInfo: entity.BaseInfo{
			ID:         rand.Int(),
			CreateTime: rand.Int63(),
		},
		EnableWebsocket: true,
		Labels:          labels,
	}

	return &r
}

func genSSL(labels map[string]string) *entity.SSL {
	r := entity.SSL{
		BaseInfo: entity.BaseInfo{
			ID:         rand.Int(),
			CreateTime: rand.Int63(),
		},
		Labels: labels,
	}

	return &r
}

func genUpstream(labels map[string]string) *entity.Upstream {
	r := entity.Upstream{
		BaseInfo: entity.BaseInfo{
			ID:         rand.Int(),
			CreateTime: rand.Int63(),
		},
		UpstreamDef: entity.UpstreamDef{
			Labels: labels,
		},
	}

	return &r
}

func genConsumer(labels map[string]string) *entity.Consumer {
	r := entity.Consumer{
		BaseInfo: entity.BaseInfo{
			ID:         rand.Int(),
			CreateTime: rand.Int63(),
		},
		Username: "test",
		Labels:   labels,
	}

	return &r
}

func genPluginConfig(labels map[string]string) *entity.PluginConfig {
	r := entity.PluginConfig{
		BaseInfo: entity.BaseInfo{
			ID:         rand.Int(),
			CreateTime: rand.Int63(),
		},
		Labels: labels,
	}

	return &r
}

func TestLabel(t *testing.T) {
	m1 := map[string]string{
		"label1": "value1",
		"label2": "value2",
	}

	m2 := map[string]string{
		"label1": "value2",
	}

	// TODO: Test SSL after the ssl config bug fixed
	types := []string{"route", "service", "upstream", "consumer", "plugin_config"}

	var giveData []interface{}
	for _, typ := range types {
		switch typ {
		case "route":
			giveData = []interface{}{
				genRoute(m1),
				genRoute(m2),
			}
		case "service":
			giveData = []interface{}{
				genService(m1),
				genService(m2),
			}
		case "ssl":
			giveData = []interface{}{
				genSSL(m1),
				genSSL(m2),
			}
		case "upstream":
			giveData = []interface{}{
				genUpstream(m1),
				genUpstream(m2),
			}
		case "consumer":
			giveData = []interface{}{
				genConsumer(m1),
				genConsumer(m2),
			}
		case "plugin_config":
			giveData = []interface{}{
				genPluginConfig(m1),
				genPluginConfig(m2),
			}
		}

		var testCases []*testCase

		expect := []interface{}{
			Pair{"label1", "value1"},
			Pair{"label1", "value2"},
			Pair{"label2", "value2"},
		}
		tc := newCase(giveData, expect)
		tc.giveInput.Type = typ
		testCases = append(testCases, tc)

		expect = []interface{}{
			Pair{"label1", "value1"},
			Pair{"label1", "value2"},
		}
		tc = newCase(giveData, expect)
		tc.giveInput.Type = typ
		tc.giveInput.Label = "label1"
		testCases = append(testCases, tc)

		expect = []interface{}{
			Pair{"label1", "value2"},
		}
		tc = newCase(giveData, expect)
		tc.giveInput.Type = typ
		tc.giveInput.Label = "label1:value2"
		testCases = append(testCases, tc)

		expect = []interface{}{
			Pair{"label1", "value1"},
			Pair{"label1", "value2"},
		}
		tc = newCase(giveData, expect)
		tc.giveInput.Type = typ
		tc.giveInput.Label = "label1:value1,label1:value2"
		testCases = append(testCases, tc)

		handler := Handler{}
		for _, tc := range testCases {
			switch typ {
			case "route":
				handler.routeStore = genMockStore(t, tc.giveData)
			case "service":
				handler.serviceStore = genMockStore(t, tc.giveData)
			case "ssl":
				handler.sslStore = genMockStore(t, tc.giveData)
			case "upstream":
				handler.upstreamStore = genMockStore(t, tc.giveData)
			case "consumer":
				handler.consumerStore = genMockStore(t, tc.giveData)
			case "plugin_config":
				handler.pluginConfigStore = genMockStore(t, tc.giveData)
			}

			ctx := droplet.NewContext()
			ctx.SetInput(tc.giveInput)
			ret, err := handler.List(ctx)
			assert.Nil(t, err)
			assert.Equal(t, tc.wantRet, ret)
		}
	}

	// test all
	m3 := map[string]string{
		"label3": "value3",
	}

	m4 := map[string]string{
		"label4": "value4",
	}

	m5 := map[string]string{
		"label4": "value4",
		"label5": "value5",
	}

	handler := Handler{
		routeStore:        genMockStore(t, []interface{}{genRoute(m1)}),
		sslStore:          genMockStore(t, []interface{}{genSSL(m2)}),
		upstreamStore:     genMockStore(t, []interface{}{genUpstream(m3)}),
		consumerStore:     genMockStore(t, []interface{}{genConsumer(m4)}),
		serviceStore:      genMockStore(t, []interface{}{genService(m5)}),
		pluginConfigStore: genMockStore(t, []interface{}{genPluginConfig(m5)}),
	}

	var testCases []*testCase

	expect := []interface{}{
		Pair{"label1", "value1"},
		Pair{"label1", "value2"},
		Pair{"label2", "value2"},
		Pair{"label3", "value3"},
		Pair{"label4", "value4"},
		Pair{"label5", "value5"},
	}
	tc := newCase(nil, expect)
	tc.giveInput.Type = "all"
	testCases = append(testCases, tc)

	expect = []interface{}{
		Pair{"label1", "value1"},
		Pair{"label1", "value2"},
	}
	tc = newCase(nil, expect)
	tc.giveInput.Type = "all"
	tc.giveInput.Label = "label1"
	testCases = append(testCases, tc)

	expect = []interface{}{
		Pair{"label1", "value2"},
	}
	tc = newCase(nil, expect)
	tc.giveInput.Type = "all"
	tc.giveInput.Label = "label1:value2"
	testCases = append(testCases, tc)

	expect = []interface{}{
		Pair{"label1", "value1"},
		Pair{"label1", "value2"},
		Pair{"label5", "value5"},
	}
	tc = newCase(nil, expect)
	tc.giveInput.Type = "all"
	tc.giveInput.Label = "label1,label5:value5"

	expect = []interface{}{
		Pair{"label1", "value1"},
		Pair{"label1", "value2"},
	}
	tc = newCase(nil, expect)
	tc.giveInput.Type = "all"
	tc.giveInput.Label = "label1=value1,label1=value2"

	for _, tc := range testCases {
		ctx := droplet.NewContext()
		ctx.SetInput(tc.giveInput)
		ret, err := handler.List(ctx)
		assert.Nil(t, err)
		assert.Equal(t, tc.wantRet, ret)
	}
}
