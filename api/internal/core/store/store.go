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

package store

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"reflect"
	"sort"
	"sync"
	"time"

	"github.com/shiningrush/droplet/data"

	"github.com/apisix/manager-api/internal/core/entity"
	"github.com/apisix/manager-api/internal/core/storage"
	"github.com/apisix/manager-api/internal/utils"
)

type Interface interface {
	Get(key string) (interface{}, error)
	List(input ListInput) (*ListOutput, error)
	Create(ctx context.Context, obj interface{}) error
	Update(ctx context.Context, obj interface{}) error
	BatchDelete(ctx context.Context, keys []string) error
}

type GenericStore struct {
	Stg storage.Interface

	cache sync.Map
	opt   GenericStoreOption

	cancel context.CancelFunc
}

type GenericStoreOption struct {
	BasePath   string
	ObjType    reflect.Type
	KeyFunc    func(obj interface{}) string
	StockCheck func(obj interface{}, stockObj interface{}) error
	Validator  Validator
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
		opt: opt,
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
		s.cache.Store(s.opt.KeyFunc(objPtr), objPtr)
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
					s.cache.Store(event.Events[i].Key[len(s.opt.BasePath)+1:], objPtr)
				case storage.EventTypeDelete:
					s.cache.Delete(event.Events[i].Key[len(s.opt.BasePath)+1:])
				}
			}
		}
	}()
	s.cancel = cancel
	return nil
}

func (s *GenericStore) Get(key string) (interface{}, error) {
	ret, ok := s.cache.Load(key)
	if !ok {
		return nil, data.ErrNotFound
	}
	return ret, nil
}

type ListInput struct {
	Predicate func(obj interface{}) bool
	PageSize  int
	// start from 1
	PageNumber int
	Less       func(i, j interface{}) bool
}

type ListOutput struct {
	Rows      []interface{} `json:"rows"`
	TotalSize int           `json:"total_size"`
}

var defLessFunc = func(i, j interface{}) bool {
	iBase := i.(entity.BaseInfoGetter).GetBaseInfo()
	jBase := j.(entity.BaseInfoGetter).GetBaseInfo()
	if iBase.CreateTime != jBase.CreateTime {
		return iBase.CreateTime < jBase.CreateTime
	}
	if iBase.UpdateTime != jBase.UpdateTime {
		return iBase.UpdateTime < jBase.UpdateTime
	}
	return iBase.ID < jBase.ID
}

func (s *GenericStore) List(input ListInput) (*ListOutput, error) {
	var ret []interface{}
	s.cache.Range(func(key, value interface{}) bool {
		if input.Predicate != nil && !input.Predicate(value) {
			return true
		}
		ret = append(ret, value)
		return true
	})

	//should return an empty array not a null for client
	if ret == nil {
		ret = []interface{}{}
	}

	output := &ListOutput{
		Rows:      ret,
		TotalSize: len(ret),
	}
	if input.Less == nil {
		input.Less = defLessFunc
	}

	sort.Slice(output.Rows, func(i, j int) bool {
		return input.Less(output.Rows[i], output.Rows[j])
	})

	if input.PageSize > 0 && input.PageNumber > 0 {
		skipCount := (input.PageNumber - 1) * input.PageSize
		if skipCount > output.TotalSize {
			output.Rows = []interface{}{}
			return output, nil
		}

		endIdx := skipCount + input.PageSize
		if endIdx >= output.TotalSize {
			output.Rows = ret[skipCount:]
			return output, nil
		}
		output.Rows = ret[skipCount:endIdx]
	}

	return output, nil
}

func (s *GenericStore) ingestValidate(obj interface{}) (err error) {
	if s.opt.Validator != nil {
		if err := s.opt.Validator.Validate(obj); err != nil {
			return err
		}
	}

	if s.opt.StockCheck != nil {
		s.cache.Range(func(key, value interface{}) bool {
			if err = s.opt.StockCheck(obj, value); err != nil {
				return false
			}
			return true
		})
	}
	return err
}

func (s *GenericStore) Create(ctx context.Context, obj interface{}) error {
	if err := s.ingestValidate(obj); err != nil {
		return err
	}

	if getter, ok := obj.(entity.BaseInfoGetter); ok {
		info := getter.GetBaseInfo()
		if info.ID == "" {
			info.ID = utils.GetFlakeUidStr()
		}
		info.CreateTime = time.Now().Unix()
		info.UpdateTime = time.Now().Unix()
	}

	key := s.opt.KeyFunc(obj)
	if key == "" {
		return fmt.Errorf("key is required")
	}
	_, ok := s.cache.Load(key)
	if ok {
		return fmt.Errorf("key: %s is conflicted", key)
	}

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
	if err := s.ingestValidate(obj); err != nil {
		return err
	}

	key := s.opt.KeyFunc(obj)
	if key == "" {
		return fmt.Errorf("key is required")
	}
	oldObj, ok := s.cache.Load(key)
	if !ok {
		return fmt.Errorf("key: %s is not found", key)
	}

	createTime := int64(0)
	if oldGetter, ok := oldObj.(entity.BaseInfoGetter); ok {
		oldInfo := oldGetter.GetBaseInfo()
		createTime = oldInfo.CreateTime
	}

	if getter, ok := obj.(entity.BaseInfoGetter); ok {
		info := getter.GetBaseInfo()
		info.CreateTime = createTime
		info.UpdateTime = time.Now().Unix()
	}

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
