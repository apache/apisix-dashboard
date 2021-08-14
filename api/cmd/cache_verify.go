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
	"github.com/spf13/cobra"
	"io/ioutil"
	"log"
	"net/http"
)

func newCacheVerifyCommand() *cobra.Command {
	return &cobra.Command{
		Use:   "cache-verify",
		Short: "verify that data in cache are consistent with that in ETCD",
		Run: func(cmd *cobra.Command, args []string) {
			token := getToken()

			url := "http://localhost:9000/apisix/admin/cache_verify"
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

			fmt.Println(string(data))
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

	url := `http://localhost:9000/apisix/admin/user/login`
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

	sth, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		fmt.Println(err)
	}

	token := loginOutput{}
	err = json.Unmarshal(sth, &token)
	if err != nil {
		log.Fatal("get token from resp failed", err)
	}

	return token.Data.Token
}

type loginOutput struct {
	Data data `json:"data"`
}
type data struct {
	Token string `json:"token"`
}
