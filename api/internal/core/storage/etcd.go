package storage

import (
	"context"
	"fmt"
	"github.com/apisix/manager-api/internal/utils"
	"go.etcd.io/etcd/clientv3"
	"time"
)

var (
	Client *clientv3.Client
)

type EtcdV3Storage struct {
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
	utils.AppendToClosers(Close)
	return nil
}

func Close() error {
	if err := Client.Close(); err != nil {
		return err
	}
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
	resp, err := Client.Get(ctx, key, clientv3.WithCountOnly())
	if err != nil {
		return fmt.Errorf("etcd get failed: %w", err)
	}
	if resp.Count != 0 {
		return fmt.Errorf("key: %s is conflicted", key)
	}
	_, err = Client.Put(ctx, key, val)
	if err != nil {
		return fmt.Errorf("etcd put failed: %w", err)
	}
	return nil
}

func (s *EtcdV3Storage) Update(ctx context.Context, key, val string) error {
	resp, err := Client.Get(ctx, key, clientv3.WithCountOnly())
	if err != nil {
		return fmt.Errorf("etcd get failed: %w", err)
	}
	if resp.Count == 0 {
		return fmt.Errorf("key: %s is not found", key)
	}
	_, err = Client.Put(ctx, key, val)
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
				output.Error = fmt.Errorf("channel canceled")
			}
			ch <- output
		}
	}()

	return ch
}
