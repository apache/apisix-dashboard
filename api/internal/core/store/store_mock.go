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
	ret := m.Mock.Called(key)
	return ret.Get(0), ret.Error(1)
}

func (m *MockInterface) List(input ListInput) (*ListOutput, error) {
	ret := m.Called(input)

	var (
		r0 *ListOutput
		r1 error
	)

	if rf, ok := ret.Get(0).(func(ListInput) *ListOutput); ok {
		r0 = rf(input)
	} else {
		r0 = ret.Get(0).(*ListOutput)
	}
	r1 = ret.Error(1)

	return r0, r1
}

func (m *MockInterface) Create(ctx context.Context, obj interface{}) (interface{}, error) {
	ret := m.Mock.Called(ctx, obj)
	return ret.Get(0), ret.Error(1)
}

func (m *MockInterface) Update(ctx context.Context, obj interface{}, createOnFail bool) error {
	ret := m.Mock.Called(ctx, obj, createOnFail)
	return ret.Error(0)
}

func (m *MockInterface) BatchDelete(ctx context.Context, keys []string) error {
	ret := m.Mock.Called(ctx, keys)
	return ret.Error(0)
}
