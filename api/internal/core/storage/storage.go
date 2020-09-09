package storage

import "context"

type Interface interface {
	Get(ctx context.Context, key string) (string, error)
	List(ctx context.Context, key string) ([]string, error)
	Create(ctx context.Context, key, val string) error
	Update(ctx context.Context, key, val string) error
	BatchDelete(ctx context.Context, keys []string) error
	Watch(ctx context.Context, key string) <-chan WatchResponse
}

type WatchResponse struct {
	Events   []Event
	Error    error
	Canceled bool
}

type Event struct {
	Type  EventType
	Key   string
	Value string
}

type EventType string

var (
	EventTypePut    EventType = "put"
	EventTypeDelete EventType = "delete"
)
