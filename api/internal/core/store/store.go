package store

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/apisix/manager-api/internal/core/storage"
	"log"
	"reflect"
	"time"
)

type GenericStore struct {
	Stg storage.Interface

	cache map[string]interface{}
	opt   GenericStoreOption

	cancel context.CancelFunc
}

type GenericStoreOption struct {
	BasePath string
	ObjType  reflect.Type
	KeyFunc  func(obj interface{}) string
}

func NewGenericStore(opt GenericStoreOption) (*GenericStore, error) {
	if opt.BasePath == "" {
		return nil, fmt.Errorf("base path can not be empty")
	}
	if opt.ObjType == nil {
		return nil, fmt.Errorf("object type can not be nil")
	}
	if opt.KeyFunc == nil {
		return nil, fmt.Errorf("key func can not be nil")
	}

	if opt.ObjType.Kind() == reflect.Ptr {
		opt.ObjType = opt.ObjType.Elem()
	}
	if opt.ObjType.Kind() != reflect.Struct {
		return nil, fmt.Errorf("obj type is invalid")
	}
	s := &GenericStore{
		opt:   opt,
		cache: make(map[string]interface{}),
	}
	s.Stg = &storage.EtcdV3Storage{}

	return s, nil
}

func (s *GenericStore) Init() error {
	lc, lcancel := context.WithTimeout(context.TODO(), 5*time.Second)
	defer lcancel()
	ret, err := s.Stg.List(lc, s.opt.BasePath)
	if err != nil {
		return err
	}
	for i := range ret {
		objPtr, err := s.StringToObjPtr(ret[i])
		if err != nil {
			return err
		}
		s.cache[s.opt.KeyFunc(objPtr)] = objPtr
	}

	c, cancel := context.WithCancel(context.TODO())
	ch := s.Stg.Watch(c, s.opt.BasePath)
	go func() {
		for event := range ch {
			if event.Canceled {
				log.Println("watch failed", event.Error)
			}

			for i := range event.Events {
				switch event.Events[i].Type {
				case storage.EventTypePut:
					objPtr, err := s.StringToObjPtr(event.Events[i].Value)
					if err != nil {
						log.Println("value convert to obj failed", err)
						continue
					}
					s.cache[event.Events[i].Key[len(s.opt.BasePath)+1:]] = objPtr
				case storage.EventTypeDelete:
					delete(s.cache, event.Events[i].Key[len(s.opt.BasePath)+1:])
				}
			}
		}
	}()
	s.cancel = cancel
	return nil
}

func (s *GenericStore) Get(key string) (interface{}, error) {
	ret, ok := s.cache[key]
	if !ok {
		return nil, fmt.Errorf("id:%s not found", key)
	}
	return ret, nil
}

func (s *GenericStore) List(predicate func(obj interface{}) bool) ([]interface{}, error) {
	var ret []interface{}
	for k := range s.cache {
		if predicate != nil && !predicate(s.cache[k]) {
			continue
		}
		ret = append(ret, s.cache[k])
	}

	return ret, nil
}

func (s *GenericStore) Create(ctx context.Context, obj interface{}) error {
	bs, err := json.Marshal(obj)
	if err != nil {
		return fmt.Errorf("json marshal failed: %s", err)
	}
	if err := s.Stg.Create(ctx, s.GetObjStorageKey(obj), string(bs)); err != nil {
		return err
	}

	return nil
}

func (s *GenericStore) Update(ctx context.Context, obj interface{}) error {
	bs, err := json.Marshal(obj)
	if err != nil {
		return fmt.Errorf("json marshal failed: %s", err)
	}
	if err := s.Stg.Update(ctx, s.GetObjStorageKey(obj), string(bs)); err != nil {
		return err
	}

	return nil
}

func (s *GenericStore) BatchDelete(ctx context.Context, keys []string) error {
	var storageKeys []string
	for i := range keys {
		storageKeys = append(storageKeys, s.GetStorageKey(keys[i]))
	}

	return s.Stg.BatchDelete(ctx, storageKeys)
}

func (s *GenericStore) Close() error {
	s.cancel()
	return nil
}

func (s *GenericStore) StringToObjPtr(str string) (interface{}, error) {
	objPtr := reflect.New(s.opt.ObjType)
	err := json.Unmarshal([]byte(str), objPtr.Interface())
	if err != nil {
		return nil, fmt.Errorf("json unmarshal failed: %w", err)
	}

	return objPtr.Interface(), nil
}

func (s *GenericStore) GetObjStorageKey(obj interface{}) string {
	return s.GetStorageKey(s.opt.KeyFunc(obj))
}

func (s *GenericStore) GetStorageKey(key string) string {
	return fmt.Sprintf("%s/%s", s.opt.BasePath, key)
}
