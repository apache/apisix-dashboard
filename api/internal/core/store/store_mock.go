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
	"sort"

	"github.com/apisix/manager-api/internal/core/entity"
	"github.com/shiningrush/droplet/data"
	"github.com/stretchr/testify/mock"
)

type Mock struct {
	MockInterface
	storage   map[string]interface{}
	validator Validator
	keyFunc   func(obj interface{}) string
}

func NewMock(keyFunc func(obj interface{}) string, validator Validator) *Mock {
	m := &Mock{
		storage:   make(map[string]interface{}),
		validator: validator,
		keyFunc:   keyFunc,
	}

	m.onCreate()
	m.onGet()
	m.onUpdate()
	m.onList()
	m.onBatchDelete()
	return m
}

func (m *Mock) create(ctx context.Context, obj interface{}) (interface{}, error) {
	if setter, ok := obj.(entity.BaseInfoSetter); ok {
		info := setter.GetBaseInfo()
		info.Creating()
	}

	if m.validator != nil {
		if err := m.validator.Validate(obj); err != nil {
			return nil, err
		}
	}

	key := m.keyFunc(obj)
	if key == "" {
		return nil, fmt.Errorf("key is required")
	}
	if _, exist := m.storage[key]; exist {
		return nil, fmt.Errorf("key: %s is conflicted", key)
	}

	_, err := json.Marshal(obj)
	if err != nil {
		return nil, fmt.Errorf("json marshal failed: %s", err)
	}

	m.storage[key] = obj
	return obj, nil
}

func (m *Mock) onCreate() {
	m.On("Create", mock.Anything, mock.Anything).Return(m.create, nil)
}

func (m *Mock) onGet() {
	rf := func(key string) (interface{}, error) {
		r, exist := m.storage[key]
		if !exist {
			return nil, data.ErrNotFound
		}

		return r, nil
	}

	m.On("Get", mock.Anything).Return(rf, nil)
}

func (m *Mock) onList() {
	rf := func(input ListInput) (*ListOutput, error) {
		var ret = make([]interface{}, 0)
		for _, v := range m.storage {
			value := v
			if input.Predicate != nil && !input.Predicate(v) {
				continue
			}

			if input.Format != nil {
				value = input.Format(v)
			}

			ret = append(ret, value)
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

	m.On("List", mock.Anything).Return(rf, nil)
}

func (m *Mock) onUpdate() {
	rf := func(ctx context.Context, obj interface{}, createIfNotExist bool) error {
		if m.validator != nil {
			if err := m.validator.Validate(obj); err != nil {
				return err
			}
		}

		key := m.keyFunc(obj)
		if key == "" {
			return fmt.Errorf("key is required")
		}

		storedObj, exist := m.storage[key]
		if !exist {
			if createIfNotExist {
				_, err := m.create(ctx, obj)
				return err
			}

			return fmt.Errorf("key: %s is not found", key)
		}

		if setter, ok := obj.(entity.BaseInfoGetter); ok {
			storedGetter := storedObj.(entity.BaseInfoGetter)
			storedInfo := storedGetter.GetBaseInfo()
			info := setter.GetBaseInfo()
			info.Updating(storedInfo)
		}

		_, err := json.Marshal(obj)
		if err != nil {
			return fmt.Errorf("json marshal failed: %s", err)
		}

		m.storage[key] = obj

		return nil
	}

	m.On("Update", mock.Anything, mock.Anything, mock.Anything).Return(rf)
}

func (m *Mock) onBatchDelete() {
	rf := func(ctx context.Context, keys []string) error {
		for _, k := range keys {
			if _, exist := m.storage[k]; exist {
				delete(m.storage, k)
			}
		}

		return nil
	}

	m.On("BatchDelete", mock.Anything, mock.Anything).Return(rf)
}
