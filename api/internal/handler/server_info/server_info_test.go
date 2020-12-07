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

package server_info

import (
	"strings"
	"testing"
	"time"

	"github.com/shiningrush/droplet"
	"github.com/stretchr/testify/assert"

	"github.com/apisix/manager-api/internal/core/entity"
	"github.com/apisix/manager-api/internal/core/storage"
	"github.com/apisix/manager-api/internal/core/store"
)

const (
	SleepTime = 100 * time.Millisecond
)

var serverInfoHandler *Handler

func init() {
	err := storage.InitETCDClient([]string{"127.0.0.1:2379"})

	if err != nil {
		panic(err)
	}
	err = store.InitStores()
	if err != nil {
		panic(err)
	}

	serverInfoHandler = &Handler{
		serverInfoStore: store.GetStore(store.HubKeyServerInfo),
	}
}

func create(t *testing.T, ctx droplet.Context, info *entity.ServerInfo) {
	err := serverInfoHandler.serverInfoStore.Create(ctx.Context(), info)
	assert.Nil(t, err)
}

func delete(t *testing.T, ctx droplet.Context, ids []string) {
	err := serverInfoHandler.serverInfoStore.BatchDelete(ctx.Context(), ids)
	assert.Nil(t, err)
}

func testGet(t *testing.T, ctx droplet.Context, id string) {
	input := &GetInput{ID: id}

	ctx.SetInput(input)
	res, err := serverInfoHandler.Get(ctx)
	assert.Nil(t, err)

	stored := res.(*entity.ServerInfo)
	assert.Equal(t, stored.ID, input.ID)
}

func testList(t *testing.T, ctx droplet.Context, ids []string, hostname string) {
	input := &ListInput{Hostname: hostname, Pagination: store.Pagination{PageSize: 10, PageNumber: 1}}

	ctx.SetInput(input)
	res, err := serverInfoHandler.List(ctx)
	assert.Nil(t, err)

	data := res.(*store.ListOutput)
	assert.Equal(t, len(data.Rows), len(ids))

	var find bool
	for _, id := range ids {
		find = false
		for _, row := range data.Rows {
			si := row.(*entity.ServerInfo)
			if si.ID == id {
				if hostname == "" {
					find = true
					break
				}

				if strings.Contains(si.Hostname, hostname) {
					find = true
					break
				}
			}
		}

		assert.Equal(t, find, true)
	}
}

func TestServerInfo(t *testing.T) {
	ctx := droplet.NewContext()

	serverInfo := &entity.ServerInfo{
		BaseInfo:       entity.BaseInfo{ID: "1"},
		UpTime:         10,
		LastReportTime: 1606892686,
		EtcdVersion:    "3.5.0",
		Hostname:       "gentoo",
		Version:        "2.0",
	}

	create(t, ctx, serverInfo)
	time.Sleep(SleepTime)

	testGet(t, ctx, "1")
	testList(t, ctx, []string{"1"}, "")
	delete(t, ctx, []string{"1"})
}

func TestServerInfo_Pass_Host(t *testing.T) {
	ctx := droplet.NewContext()

	serverInfo := &entity.ServerInfo{
		BaseInfo:       entity.BaseInfo{ID: "4"},
		UpTime:         10,
		LastReportTime: 1606892686,
		EtcdVersion:    "3.5.0",
		Hostname:       "gentoo",
		Version:        "2.0",
	}

	create(t, ctx, serverInfo)

	serverInfo.ID = "5"
	serverInfo.Hostname = "gentoo2"

	create(t, ctx, serverInfo)

	serverInfo.ID = "6"
	serverInfo.Hostname = "ubuntu"

	create(t, ctx, serverInfo)
	time.Sleep(SleepTime)

	testList(t, ctx, []string{"4", "5"}, "gentoo")
	delete(t, ctx, []string{"4", "5", "6"})
}
