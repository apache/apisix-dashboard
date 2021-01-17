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

	"github.com/stretchr/testify/mock"
)

type MockInterface struct {
	mock.Mock
}

func (m *MockInterface) Get(key string) (interface{}, error) {
	ret := m.Called(key)

	if rf, ok := ret.Get(0).(func(key string) (interface{}, error)); ok {
		return rf(key)
	}

	var r0 interface{}
	if rf, ok := ret.Get(0).(func(string) interface{}); ok {
		r0 = rf(key)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(interface{})
		}
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(string) error); ok {
		r1 = rf(key)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

func (m *MockInterface) List(input ListInput) (*ListOutput, error) {
	ret := m.Called(input)

	if rf, ok := ret.Get(0).(func(ListInput) (*ListOutput, error)); ok {
		return rf(input)
	}

	var r0 *ListOutput
	if rf, ok := ret.Get(0).(func(ListInput) *ListOutput); ok {
		r0 = rf(input)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*ListOutput)
		}
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(ListInput) error); ok {
		r1 = rf(input)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

func (m *MockInterface) Create(ctx context.Context, obj interface{}) (interface{}, error) {
	ret := m.Called(ctx, obj)

	if rf, ok := ret.Get(0).(func(context.Context, interface{}) (interface{}, error)); ok {
		return rf(ctx, obj)
	}

	var r0 interface{}
	if rf, ok := ret.Get(0).(func(context.Context, interface{}) interface{}); ok {
		r0 = rf(ctx, obj)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(interface{})
		}
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(context.Context, interface{}) error); ok {
		r1 = rf(ctx, obj)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

func (m *MockInterface) Update(ctx context.Context, obj interface{}, createIfNotExist bool) error {
	ret := m.Called(ctx, obj, createIfNotExist)

	var r0 error
	if rf, ok := ret.Get(0).(func(context.Context, interface{}, bool) error); ok {
		r0 = rf(ctx, obj, createIfNotExist)
	} else {
		r0 = ret.Error(0)
	}

	return r0
}

func (m *MockInterface) BatchDelete(ctx context.Context, keys []string) error {
	ret := m.Called(ctx, keys)

	var r0 error
	if rf, ok := ret.Get(0).(func(context.Context, []string) error); ok {
		r0 = rf(ctx, keys)
	} else {
		r0 = ret.Error(0)
	}

	return r0
}
