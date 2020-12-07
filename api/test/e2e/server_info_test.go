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
package e2e

import (
	"context"
	"encoding/json"
	"fmt"
	"math/rand"
	"net/http"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

const (
	ServerInfoPrefix = "/apisix/data_plane/server_info"
)

var (
	s = &EtcdV3Storage{}
)

type ServerInfo struct {
	ID             string `json:"id"`
	LastReportTime int64  `json:"last_report_time,omitempty"`
	UpTime         int64  `json:"up_time,omitempty"`
	BootTime       int64  `json:"boot_time,omitempty"`
	EtcdVersion    string `json:"etcd_version,omitempty"`
	Hostname       string `json:"hostname,omitempty"`
	Version        string `json:"version,omitempty"`
}

func putServerInfo(id, val string) error {
	ctx, _ := context.WithTimeout(context.Background(), 2*time.Second)
	key := fmt.Sprintf("%s/%s", ServerInfoPrefix, id)
	return s.Create(ctx, key, val)
}

func deleteServerInfo(ids []string) error {
	ctx, _ := context.WithTimeout(context.Background(), 2*time.Second)

	var keys []string
	for _, id := range ids {
		keys = append(keys, fmt.Sprintf("%s/%s", ServerInfoPrefix, id))
	}

	return s.BatchDelete(ctx, keys)
}

func genServerInfo(id, hostname string) string {
	if hostname == "" {
		hostname = "unknown"
	}

	s := ServerInfo{
		ID:             id,
		LastReportTime: rand.Int63(),
		UpTime:         rand.Int63(),
		BootTime:       rand.Int63(),
		EtcdVersion:    "3.5.0",
		Hostname:       hostname,
		Version:        "2.0",
	}

	res, _ := json.Marshal(s)

	return string(res)
}

func TestServerInfo_Get(t *testing.T) {
	err := putServerInfo("s1", genServerInfo("s1", ""))
	assert.Nil(t, err)
	time.Sleep(sleepTime)

	tc := HttpTestCase{
		caseDesc:     "get server info",
		Object:       ManagerApiExpect(t),
		Path:         "/apisix/server_info/s1",
		Method:       http.MethodGet,
		Headers:      map[string]string{"Authorization": token},
		ExpectStatus: http.StatusOK,
		ExpectBody:   "{\"id\":\"s1\"",
	}

	testCaseCheck(tc)

	err = deleteServerInfo([]string{"s1"})
	assert.Nil(t, err)
}

func TestServerInfo_List(t *testing.T) {
	err := putServerInfo("s2", genServerInfo("s2", "gentoo"))
	assert.Nil(t, err)

	err = putServerInfo("s3", genServerInfo("s3", "gentoo"))
	assert.Nil(t, err)

	err = putServerInfo("s4", genServerInfo("s4", "ubuntu"))
	assert.Nil(t, err)

	time.Sleep(sleepTime)

	tests := []HttpTestCase{
		{
			caseDesc:     "list server info",
			Object:       ManagerApiExpect(t),
			Path:         "/apisix/server_info",
			Method:       http.MethodGet,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "\"total_size\":3",
		},
		{
			caseDesc:     "list server info",
			Object:       ManagerApiExpect(t),
			Path:         "/apisix/server_info",
			Query:        "hostname=ubuntu",
			Method:       http.MethodGet,
			Headers:      map[string]string{"Authorization": token},
			ExpectStatus: http.StatusOK,
			ExpectBody:   "\"total_size\":1",
		},
	}

	for _, tc := range tests {
		testCaseCheck(tc)
	}

	err = deleteServerInfo([]string{"s2", "s3", "s4"})
	assert.Nil(t, err)
}
