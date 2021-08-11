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
	"fmt"
	"github.com/spf13/cobra"
	"io/ioutil"
	"net/http"
)

func newCacheVerifyCommand() *cobra.Command {
	return &cobra.Command{
		Use:   "cache-verify",
		Short: "verify that data in cache are consistent with that in ETCD",
		Run: func(cmd *cobra.Command, args []string) {
			rsp, err := http.Get("http://localhost:9000/apisix/admin/cache_verify")
			defer func() {
				err := rsp.Body.Close()
				if err != nil {
					fmt.Println("close on response body failed")
				}
			}()
			if err != nil {
				fmt.Println("get result from migrate/export failed")
				return
			}
			data, err := ioutil.ReadAll(rsp.Body)
			if err != nil {
				fmt.Println(err)
			}
			fmt.Println(string(data))
		},
	}
}
