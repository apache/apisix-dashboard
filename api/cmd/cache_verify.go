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
package cmd

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"

	"github.com/spf13/cobra"
	"github.com/tidwall/gjson"

	"github.com/apisix/manager-api/internal/conf"
	"github.com/apisix/manager-api/internal/handler/cache_verify"
)

var port int
var username, password string

type response struct {
	Data cache_verify.OutputResult `json:"data"`
}

func newCacheVerifyCommand() *cobra.Command {
	return &cobra.Command{
		Use:   "cache-verify",
		Short: "verify that data in cache are consistent with that in ETCD",
		Run: func(cmd *cobra.Command, args []string) {
			conf.InitConf()
			port = conf.ServerPort
			username = "admin"
			password = conf.UserList[username].Password

			token := getToken()

			url := fmt.Sprintf("http://localhost:%d/apisix/admin/cache_verify", port)
			client := &http.Client{}

			get, err := http.NewRequest("GET", url, nil)
			if err != nil {
				log.Fatal("new http request failed")
			}

			get.Header.Set("Authorization", token)

			rsp, err := client.Do(get)
			if err != nil {
				fmt.Println("get result from migrate/export failed")
				return
			}
			defer func() {
				err := rsp.Body.Close()
				if err != nil {
					fmt.Println("close on response body failed")
				}
			}()

			data, err := ioutil.ReadAll(rsp.Body)
			if err != nil {
				fmt.Println(err)
			}

			var rs response
			err = json.Unmarshal(data, &rs)
			if err != nil {
				log.Fatal("bad Data format,json unmarshal failed")
			}

			fmt.Printf("cache verification result as follows:\n\n")
			fmt.Printf("There are %d items in total,%d of them are consistent,%d of them are inconsistent\n",
				rs.Data.Total, rs.Data.ConsistentCount, rs.Data.InconsistentCount)

			names := []string{
				"ssls",
				"routes",
				"scripts",
				"services",
				"upstreams",
				"consumers",
				"server infos",
				"global plugins",
				"plugin configs",
			}
			datas := []cache_verify.StatisticalData{
				rs.Data.Items.SSLs,
				rs.Data.Items.Routes,
				rs.Data.Items.Scripts,
				rs.Data.Items.Services,
				rs.Data.Items.Upstreams,
				rs.Data.Items.Consumers,
				rs.Data.Items.ServerInfos,
				rs.Data.Items.GlobalPlugins,
				rs.Data.Items.PluginConfigs,
			}
			for i, v := range names {
				printResult(v, datas[i])
			}
		},
	}
}

func getToken() string {
	account := map[string]string{
		"username": username,
		"password": password,
	}

	data, err := json.Marshal(account)
	if err != nil {
		log.Fatal("json marshal failed")
	}

	url := fmt.Sprintf("http://localhost:%d/apisix/admin/user/login", port)
	resp, err := http.Post(url, "application/json", bytes.NewBuffer(data))
	if err != nil {
		log.Fatal("login failed")
	}

	defer func() {
		err := resp.Body.Close()
		if err != nil {
			fmt.Println("close on response body failed")
		}
	}()

	respObj, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		fmt.Println(err)
	}

	token := gjson.Get(string(respObj), "data.token")
	if !token.Exists() {
		log.Fatal("no token found in response")
	}
	return token.String()
}

func printResult(name string, data cache_verify.StatisticalData) {
	fmt.Printf("%-15s: %d in total,%d consistent,%d inconsistent\n", name, data.Total, data.ConsistentCount, data.InconsistentCount)
	if data.InconsistentCount > 0 {
		fmt.Printf("inconsistent %s:\n", name)
		for _, pair := range data.InconsistentPairs {
			fmt.Printf("[key](%-15s)\n[etcd](%s)\n[cache](%s)\n", pair.Key, pair.EtcdValue, pair.CacheValue)
		}
	}
}
