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
	"errors"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"

	"github.com/spf13/cobra"
	"github.com/tidwall/gjson"

	"github.com/apisix/manager-api/internal/conf"
	"github.com/apisix/manager-api/internal/handler/cache_verify"
	"github.com/apisix/manager-api/internal/log"
)

var (
	port                     int
	host, username, password string
)

type response struct {
	Data cache_verify.OutputResult `json:"data"`
}

func newCacheVerifyCommand() *cobra.Command {
	return &cobra.Command{
		Use:   "cache-verify",
		Short: "verify that data in cache are consistent with that in ETCD",
		Run: func(cmd *cobra.Command, args []string) {
			conf.InitConf()
			log.InitLogger()

			port = conf.ServerPort
			host = "127.0.0.1"
			username = conf.AuthConf.Users[0].Username
			password = conf.UserList[username].Password
			token, err := getToken()
			if err != nil {
				fmt.Fprintf(os.Stderr, "get token failed: %s\n", err)
				return
			}

			url := fmt.Sprintf("http://%s:%d/apisix/admin/cache_verify", host, port)
			client := &http.Client{}
			req, err := http.NewRequest("GET", url, nil)
			if err != nil {
				fmt.Fprintf(os.Stderr, "new http request failed: %s\n", err)
				return
			}

			req.Header.Set("Authorization", token)
			rsp, err := client.Do(req)
			if err != nil {
				fmt.Fprintf(os.Stderr, "get result from migrate/export failed: %s\n", err)
				return
			}

			defer func() {
				err := rsp.Body.Close()
				if err != nil {
					fmt.Fprintf(os.Stderr, "close on response body failed: %s\n", err)
					return
				}
			}()

			data, err := ioutil.ReadAll(rsp.Body)
			if err != nil {
				fmt.Fprintf(os.Stderr, "io read all failed: %s\n", err)
				return
			}

			var rs response
			err = json.Unmarshal(data, &rs)
			if err != nil {
				fmt.Fprintf(os.Stderr, "bad Data format,json unmarshal failed: %s\n", err)
				return
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

func getToken() (string, error) {
	account := map[string]string{
		"username": username,
		"password": password,
	}

	data, err := json.Marshal(account)
	if err != nil {
		fmt.Fprintf(os.Stderr, "json marshal failed: %s\n", err)
		return "", err
	}

	url := fmt.Sprintf("http://%s:%d/apisix/admin/user/login", host, port)
	resp, err := http.Post(url, "application/json", bytes.NewBuffer(data))
	if err != nil {
		fmt.Fprintf(os.Stderr, "login failed: %s\n", err)
		return "", err
	}

	defer func() {
		err := resp.Body.Close()
		if err != nil {
			fmt.Fprintf(os.Stderr, "close on response body failed: %s\n", err)
			return
		}
	}()

	respObj, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		fmt.Fprintf(os.Stderr, "io read all failed: %s\n", err)
		return "", err
	}

	token := gjson.Get(string(respObj), "data.token")
	if !token.Exists() {
		fmt.Fprintf(os.Stderr, "no token found in response\n")
		return "", errors.New("no token found in response")
	}
	return token.String(), nil
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
