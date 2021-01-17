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
package base

import (
	"github.com/stretchr/testify/assert"
	"io/ioutil"
	"net/http"
)

func HttpGet(url string, headers map[string]string) ([]byte, int, error) {
	req, err := http.NewRequest(http.MethodGet, url, nil)
	if err != nil {
		return nil, 0, err
	}

	// set header
	for key, val := range headers {
		req.Header.Add(key, val)
	}

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, 0, err
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, 0, err
	}

	return body, resp.StatusCode, nil
}

func BatchTestServerPort(times int) map[string]int {
	t := getTestingHandle()
	url := APISIXSingleWorkerHost + "/server_port"
	res := map[string]int{}

	for i := 0; i < times; i++ {
		bodyByte, status, err := HttpGet(url, nil)
		assert.Nil(t, err)
		assert.Equal(t, 200, status)

		body := string(bodyByte)
		if _, ok := res[body]; !ok {
			res[body] = 1
		} else {
			res[body] += 1
		}
	}

	return res
}
