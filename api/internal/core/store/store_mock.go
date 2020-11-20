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
	ret := m.Mock.Called(input)
	return ret.Get(0).(*ListOutput), ret.Error(1)
}

func (m *MockInterface) Create(ctx context.Context, obj interface{}) error {
	ret := m.Mock.Called(ctx, obj)
	return ret.Error(0)
}

func (m *MockInterface) Update(ctx context.Context, obj interface{}, createOnFail bool) error {
	ret := m.Mock.Called(ctx, obj, createOnFail)
	return ret.Error(0)
}

func (m *MockInterface) BatchDelete(ctx context.Context, keys []string) error {
	ret := m.Mock.Called(ctx, keys)
	return ret.Error(0)
}
