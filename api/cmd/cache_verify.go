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
	"github.com/apisix/manager-api/internal/conf"
	"github.com/spf13/cobra"
	"github.com/tidwall/gjson"
	"io/ioutil"
	"log"
	"net/http"
)

var port int

func newCacheVerifyCommand() *cobra.Command {
	return &cobra.Command{
		Use:   "cache-verify",
		Short: "verify that data in cache are consistent with that in ETCD",
		Run: func(cmd *cobra.Command, args []string) {
			conf.InitConf()
			port = conf.ServerPort
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

			fmt.Printf("cache verification result as follows:\n\n")
			inconsistent_ssls := gjson.Get(string(data), "data.inconsistent_ssls")
			printResult("ssls", inconsistent_ssls)
			inconsistent_routes := gjson.Get(string(data), "data.inconsistent_routes")
			printResult("routes", inconsistent_routes)
			inconsistent_scripts := gjson.Get(string(data), "data.inconsistent_scripts")
			printResult("scripts", inconsistent_scripts)
			inconsistent_services := gjson.Get(string(data), "data.inconsistent_services")
			printResult("services", inconsistent_services)
			inconsistent_upstreams := gjson.Get(string(data), "data.inconsistent_upstreams")
			printResult("upstreams", inconsistent_upstreams)
			inconsistent_consumers := gjson.Get(string(data), "data.inconsistent_consumers")
			printResult("consumers", inconsistent_consumers)
			inconsistent_server_infos := gjson.Get(string(data), "data.inconsistent_server_infos")
			printResult("server infos", inconsistent_server_infos)
			inconsistent_global_plugins := gjson.Get(string(data), "data.inconsistent_global_plugins")
			printResult("global plugins", inconsistent_global_plugins)
			inconsistent_plugin_configs := gjson.Get(string(data), "data.inconsistent_plugin_configs")
			printResult("plugin configs", inconsistent_plugin_configs)
		},
	}
}

func getToken() string {
	account := map[string]string{
		"username": "admin",
		"password": "admin",
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

func printResult(name string, result gjson.Result) {
	if !result.Exists() {
		fmt.Printf("%-15s info not found in response\n", name)
	} else {
		if len(result.String()) == 0 {
			fmt.Printf("%-15s :\tall consistent\n", name)
		} else {
			fmt.Printf("inconsistent %-15s: %s\n", name, result.String())
		}
	}
}
