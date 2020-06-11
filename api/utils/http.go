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
package utils

import (
	"fmt"
	"github.com/apisix/manager-api/conf"
	"github.com/apisix/manager-api/log"
	"gopkg.in/resty.v1"
	"net/http"
	"time"
)

const timeout = 3000

var logger = log.GetLogger()

func Get(url string) ([]byte, error) {
	r := resty.New().
		SetTimeout(time.Duration(timeout)*time.Millisecond).
		R().
		SetHeader("content-type", "application/json").
		SetHeader("X-API-KEY", conf.ApiKey)
	resp, err := r.Get(url)
	if err != nil {
		return nil, err
	}
	if resp.StatusCode() != http.StatusOK {
		return nil, fmt.Errorf("status: %d, body: %s", resp.StatusCode(), resp.Body())
	}
	return resp.Body(), nil
}

func Post(url string, bytes []byte) ([]byte, error) {
	r := resty.New().
		SetTimeout(time.Duration(timeout)*time.Millisecond).
		R().
		SetHeader("content-type", "application/json").
		SetHeader("X-API-KEY", conf.ApiKey)
	r.SetBody(bytes)
	resp, err := r.Post(url)
	if err != nil {
		return nil, err
	}
	if resp.StatusCode() != http.StatusOK && resp.StatusCode() != http.StatusCreated {
		return nil, fmt.Errorf("status: %d, body: %s", resp.StatusCode(), resp.Body())
	}
	return resp.Body(), nil
}

func Put(url string, bytes []byte) ([]byte, error) {
	r := resty.New().
		SetTimeout(time.Duration(timeout)*time.Millisecond).
		R().
		SetHeader("content-type", "application/json").
		SetHeader("X-API-KEY", conf.ApiKey)
	r.SetBody(bytes)
	resp, err := r.Put(url)
	if err != nil {
		return nil, err
	}
	if resp.StatusCode() != http.StatusOK && resp.StatusCode() != http.StatusCreated {
		return nil, fmt.Errorf("status: %d, body: %s", resp.StatusCode(), resp.Body())
	}
	return resp.Body(), nil
}

func Patch(url string, bytes []byte) ([]byte, error) {
	r := resty.New().
		SetTimeout(time.Duration(timeout)*time.Millisecond).
		R().
		SetHeader("content-type", "application/json").
		SetHeader("X-API-KEY", conf.ApiKey)
	r.SetBody(bytes)
	resp, err := r.Patch(url)
	if err != nil {
		return nil, err
	}
	if resp.StatusCode() != http.StatusOK {
		return nil, fmt.Errorf("status: %d, body: %s", resp.StatusCode(), resp.Body())
	}
	return resp.Body(), nil
}

func Delete(url string) ([]byte, error) {
	r := resty.New().
		SetTimeout(time.Duration(timeout)*time.Millisecond).
		R().
		SetHeader("content-type", "application/json").
		SetHeader("X-API-KEY", conf.ApiKey)
	resp, err := r.Delete(url)
	if err != nil {
		return nil, err
	}
	if resp.StatusCode() != http.StatusOK {
		return nil, fmt.Errorf("status: %d, body: %s", resp.StatusCode(), resp.Body())
	}
	return resp.Body(), nil
}
