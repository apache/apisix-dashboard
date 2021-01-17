package store

import (
	"context"
	"fmt"
	"testing"

	"github.com/apisix/manager-api/internal/core/entity"
	"github.com/apisix/manager-api/internal/utils"
	"github.com/shiningrush/droplet/data"
	"github.com/stretchr/testify/assert"
)

type testObj struct {
	entity.BaseInfo
	Name  string
	Value string
}

func keyFunc(obj interface{}) string {
	return utils.InterfaceToString(obj.(*testObj).Name)
}

func TestMock_Create(t *testing.T) {
	ctx := context.Background()
	m := NewMock(keyFunc, nil)

	// create success
	ret, err := m.Create(ctx, &testObj{Name: "test"})
	assert.Nil(t, err)
	assert.Equal(t, "test", ret.(*testObj).Name)

	// create failed, "key is required"
	ret, err = m.Create(ctx, &testObj{Name: ""})
	assert.Equal(t, fmt.Errorf("key is required"), err)
	assert.Nil(t, ret)

	// create failed, "key is conflicted"
	ret, err = m.Create(ctx, &testObj{Name: "test"})
	assert.Equal(t, fmt.Errorf("key: %s is conflicted", "test"), err)
	assert.Nil(t, ret)
}

func TestMock_List(t *testing.T) {
	ctx := context.Background()
	m := NewMock(keyFunc, nil)

	// create success
	ret, err := m.Create(ctx, &testObj{Name: "test"})
	assert.Nil(t, err)
	assert.Equal(t, "test", ret.(*testObj).Name)

	// create success
	ret, err = m.Create(ctx, &testObj{Name: "test2"})
	assert.Nil(t, err)
	assert.Equal(t, "test2", ret.(*testObj).Name)

	// list success
	ret, err = m.List(ListInput{})
	assert.Equal(t, 2, ret.(*ListOutput).TotalSize)
	assert.Equal(t, 2, len(ret.(*ListOutput).Rows))
	assert.Equal(t, "test", ret.(*ListOutput).Rows[0].(*testObj).Name)
	assert.Equal(t, "test2", ret.(*ListOutput).Rows[1].(*testObj).Name)

	// list success with PageSize
	ret, err = m.List(ListInput{PageSize: 1, PageNumber: 1})
	assert.Equal(t, 2, ret.(*ListOutput).TotalSize)
	assert.Equal(t, 1, len(ret.(*ListOutput).Rows))
	assert.Equal(t, "test", ret.(*ListOutput).Rows[0].(*testObj).Name)

	// list success with Predicate
	ret, err = m.List(ListInput{
		Predicate: func(obj interface{}) bool {
			r := obj.(*testObj)

			if r.Name == "test2" {
				return true
			}

			return false
		},
		PageNumber: 1,
		PageSize:   1,
	})
	assert.Equal(t, 1, ret.(*ListOutput).TotalSize)
	assert.Equal(t, "test2", ret.(*ListOutput).Rows[0].(*testObj).Name)

	// list success with format
	ret, err = m.List(ListInput{
		Predicate: func(obj interface{}) bool {
			r := obj.(*testObj)
			if r.Name == "test2" {
				return true
			}

			return false
		},
		Format: func(obj interface{}) interface{} {
			r := obj.(*testObj)
			r.Name = fmt.Sprintf("format: %s", r.Name)
			return r
		},
		PageNumber: 1,
		PageSize:   1,
	})
	assert.Equal(t, 1, ret.(*ListOutput).TotalSize)
	assert.Equal(t, "format: test2", ret.(*ListOutput).Rows[0].(*testObj).Name)
}

func TestMock_Update(t *testing.T) {
	ctx := context.Background()
	m := NewMock(keyFunc, nil)

	// create success
	ret, err := m.Create(ctx, &testObj{Name: "test"})
	assert.Nil(t, err)
	assert.Equal(t, "test", ret.(*testObj).Name)

	// update success (create)
	err = m.Update(ctx, &testObj{Name: "test2", Value: "value"}, true)
	assert.Nil(t, err)

	ret, err = m.Get("test2")
	assert.Nil(t, err)
	assert.Equal(t, "value", ret.(*testObj).Value)

	// update success
	err = m.Update(ctx, &testObj{Name: "test2", Value: "new value"}, false)
	assert.Nil(t, err)

	ret, err = m.Get("test2")
	assert.Nil(t, err)
	assert.Equal(t, "new value", ret.(*testObj).Value)

	// update failed, name is required
	err = m.Update(ctx, &testObj{Name: "", Value: "value"}, false)
	assert.Equal(t, fmt.Errorf("key is required"), err)

	//update failed, name
	err = m.Update(ctx, &testObj{Name: "test3", Value: "value"}, false)
	assert.Equal(t, fmt.Errorf("key: test3 is not found"), err)
}

func TestMock_Get(t *testing.T) {
	ctx := context.Background()
	m := NewMock(keyFunc, nil)

	// create success
	ret, err := m.Create(ctx, &testObj{Name: "test"})
	assert.Nil(t, err)
	assert.Equal(t, "test", ret.(*testObj).Name)

	// get success
	ret, err = m.Get("test")
	assert.Nil(t, err)
	assert.Equal(t, "test", ret.(*testObj).Name)

	// get failed
	ret, err = m.Get("test2")
	assert.Equal(t, err, data.ErrNotFound)
}

func TestMock_Delete(t *testing.T) {
	ctx := context.Background()
	m := NewMock(keyFunc, nil)

	// create success
	ret, err := m.Create(ctx, &testObj{Name: "test"})
	assert.Nil(t, err)
	assert.Equal(t, "test", ret.(*testObj).Name)

	// get success
	ret, err = m.Get("test")
	assert.Nil(t, err)
	assert.Equal(t, "test", ret.(*testObj).Name)

	// delete
	err = m.BatchDelete(ctx, []string{"test"})
	assert.Nil(t, err)

	_, err = m.Get("test")
	assert.Equal(t, err, data.ErrNotFound)
}
