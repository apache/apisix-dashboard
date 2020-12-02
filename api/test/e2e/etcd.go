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
	"fmt"
	"time"

	"go.etcd.io/etcd/clientv3"
)

var (
	Client *clientv3.Client
)

type EtcdV3Storage struct {
}

func init() {
	err := InitETCDClient([]string{"127.0.0.1:2379"})

	if err != nil {
		panic(err)
	}
}

func InitETCDClient(endpoints []string) error {
	cli, err := clientv3.New(clientv3.Config{
		Endpoints:   endpoints,
		DialTimeout: 5 * time.Second,
	})
	if err != nil {
		return fmt.Errorf("init etcd failed: %w", err)
	}

	Client = cli
	return nil
}

func (s *EtcdV3Storage) Get(ctx context.Context, key string) (string, error) {
	resp, err := Client.Get(ctx, key)
	if err != nil {
		return "", fmt.Errorf("etcd get failed: %w", err)
	}

	if resp.Count == 0 {
		return "", fmt.Errorf("key: %s is not found", key)
	}

	return string(resp.Kvs[0].Value), nil
}

func (s *EtcdV3Storage) List(ctx context.Context, key string) ([]string, error) {
	resp, err := Client.Get(ctx, key, clientv3.WithPrefix())
	if err != nil {
		return nil, fmt.Errorf("etcd get failed: %w", err)
	}

	var ret []string
	for i := range resp.Kvs {
		ret = append(ret, string(resp.Kvs[i].Value))
	}

	return ret, nil
}

func (s *EtcdV3Storage) Create(ctx context.Context, key, val string) error {
	_, err := Client.Put(ctx, key, val)
	if err != nil {
		return fmt.Errorf("etcd put failed: %w", err)
	}

	return nil
}

func (s *EtcdV3Storage) Update(ctx context.Context, key, val string) error {
	_, err := Client.Put(ctx, key, val)
	if err != nil {
		return fmt.Errorf("etcd put failed: %w", err)
	}

	return nil
}

func (s *EtcdV3Storage) BatchDelete(ctx context.Context, keys []string) error {
	for i := range keys {
		resp, err := Client.Delete(ctx, keys[i])
		if err != nil {
			return fmt.Errorf("delete etcd key[%s] failed: %w", keys[i], err)
		}

		if resp.Deleted == 0 {
			return fmt.Errorf("key: %s is not found", keys[i])
		}
	}
	return nil
}
