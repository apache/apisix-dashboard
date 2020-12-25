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
package storage

import (
	"context"
	"fmt"
	"time"

	"go.etcd.io/etcd/clientv3"

	"github.com/apisix/manager-api/internal/conf"
	"github.com/apisix/manager-api/internal/log"
	"github.com/apisix/manager-api/internal/utils"
)

var (
	Client *clientv3.Client
)

type EtcdV3Storage struct {
}

func InitETCDClient(etcdConf *conf.Etcd) error {
	cli, err := clientv3.New(clientv3.Config{
		Endpoints:   etcdConf.Endpoints,
		DialTimeout: 5 * time.Second,
		Username:    etcdConf.Username,
		Password:    etcdConf.Password,
	})
	if err != nil {
		log.Errorf("init etcd failed: %s", err)
		return fmt.Errorf("init etcd failed: %s", err)
	}
	Client = cli
	utils.AppendToClosers(Close)
	return nil
}

func Close() error {
	if err := Client.Close(); err != nil {
		log.Errorf("etcd client close failed: %s", err)
		return err
	}
	return nil
}

func (s *EtcdV3Storage) Get(ctx context.Context, key string) (string, error) {
	resp, err := Client.Get(ctx, key)
	if err != nil {
		log.Errorf("etcd get failed: %s", err)
		return "", fmt.Errorf("etcd get failed: %s", err)
	}
	if resp.Count == 0 {
		log.Warnf("key: %s is not found", key)
		return "", fmt.Errorf("key: %s is not found", key)
	}

	return string(resp.Kvs[0].Value), nil
}

func (s *EtcdV3Storage) List(ctx context.Context, key string) ([]Keypair, error) {
	resp, err := Client.Get(ctx, key, clientv3.WithPrefix())
	if err != nil {
		log.Errorf("etcd get failed: %s", err)
		return nil, fmt.Errorf("etcd get failed: %s", err)
	}
	var ret []Keypair
	for i := range resp.Kvs {
		data := Keypair{
			Key:   string(resp.Kvs[i].Key),
			Value: string(resp.Kvs[i].Value),
		}
		ret = append(ret, data)
	}

	return ret, nil
}

func (s *EtcdV3Storage) Create(ctx context.Context, key, val string) error {
	_, err := Client.Put(ctx, key, val)
	if err != nil {
		log.Errorf("etcd put failed: %s", err)
		return fmt.Errorf("etcd put failed: %s", err)
	}
	return nil
}

func (s *EtcdV3Storage) Update(ctx context.Context, key, val string) error {
	_, err := Client.Put(ctx, key, val)
	if err != nil {
		log.Errorf("etcd put failed: %s", err)
		return fmt.Errorf("etcd put failed: %s", err)
	}
	return nil
}

func (s *EtcdV3Storage) BatchDelete(ctx context.Context, keys []string) error {
	for i := range keys {
		resp, err := Client.Delete(ctx, keys[i])
		if err != nil {
			log.Errorf("delete etcd key[%s] failed: %s", keys[i], err)
			return fmt.Errorf("delete etcd key[%s] failed: %s", keys[i], err)
		}
		if resp.Deleted == 0 {
			log.Warnf("key: %s is not found", keys[i])
			return fmt.Errorf("key: %s is not found", keys[i])
		}
	}
	return nil
}

func (s *EtcdV3Storage) Watch(ctx context.Context, key string) <-chan WatchResponse {
	eventChan := Client.Watch(ctx, key, clientv3.WithPrefix())
	ch := make(chan WatchResponse, 1)
	go func() {
		for event := range eventChan {
			output := WatchResponse{
				Canceled: event.Canceled,
			}

			for i := range event.Events {
				e := Event{
					Key:   string(event.Events[i].Kv.Key),
					Value: string(event.Events[i].Kv.Value),
				}
				switch event.Events[i].Type {
				case clientv3.EventTypePut:
					e.Type = EventTypePut
				case clientv3.EventTypeDelete:
					e.Type = EventTypeDelete
				}
				output.Events = append(output.Events, e)
			}
			if output.Canceled {
				log.Error("channel canceled")
				output.Error = fmt.Errorf("channel canceled")
			}
			ch <- output
		}

		close(ch)
	}()

	return ch
}
