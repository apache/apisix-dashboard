package store

import (
	"context"
	"fmt"
	"github.com/apisix/manager-api/internal/core/storage"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"reflect"
	"strings"
	"testing"
	"time"
)

func TestNewGenericStore(t *testing.T) {
	dfFunc := func(obj interface{}) string { return "" }
	tests := []struct {
		giveOpt   GenericStoreOption
		wantStore *GenericStore
		wantErr   error
	}{
		{
			giveOpt: GenericStoreOption{
				BasePath: "test",
				ObjType:  reflect.TypeOf(GenericStoreOption{}),
				KeyFunc:  dfFunc,
			},
			wantStore: &GenericStore{
				Stg:   &storage.EtcdV3Storage{},
				cache: map[string]interface{}{},
				opt: GenericStoreOption{
					BasePath: "test",
					ObjType:  reflect.TypeOf(GenericStoreOption{}),
					KeyFunc:  dfFunc,
				},
			},
		},
		{
			giveOpt: GenericStoreOption{
				BasePath: "",
				ObjType:  reflect.TypeOf(GenericStoreOption{}),
				KeyFunc:  dfFunc,
			},
			wantErr: fmt.Errorf("base path can not be empty"),
		},
		{
			giveOpt: GenericStoreOption{
				BasePath: "test",
				ObjType:  reflect.TypeOf(""),
				KeyFunc:  dfFunc,
			},
			wantErr: fmt.Errorf("obj type is invalid"),
		},
		{
			giveOpt: GenericStoreOption{
				BasePath: "test",
				ObjType:  nil,
				KeyFunc:  dfFunc,
			},
			wantErr: fmt.Errorf("object type can not be nil"),
		},
		{
			giveOpt: GenericStoreOption{
				BasePath: "test",
				ObjType:  reflect.TypeOf(GenericStoreOption{}),
				KeyFunc:  nil,
			},
			wantErr: fmt.Errorf("key func can not be nil"),
		},
	}
	for _, tc := range tests {
		s, err := NewGenericStore(tc.giveOpt)
		assert.Equal(t, tc.wantErr, err)
		if err != nil {
			continue
		}
		assert.Equal(t, tc.wantStore.Stg, s.Stg)
		assert.Equal(t, tc.wantStore.cache, s.cache)
		assert.Equal(t, tc.wantStore.opt.BasePath, s.opt.BasePath)
		assert.Equal(t, tc.wantStore.opt.ObjType, s.opt.ObjType)
		assert.Equal(t, reflect.TypeOf(tc.wantStore.opt.KeyFunc), reflect.TypeOf(s.opt.KeyFunc))
	}
}

type TestStruct struct {
	Field1 string
	Field2 string
}

func TestGenericStore_Init(t *testing.T) {
	tests := []struct {
		caseDesc        string
		giveStore       *GenericStore
		giveListErr     error
		giveListRet     []string
		giveWatchCh     chan storage.WatchResponse
		giveResp        storage.WatchResponse
		wantErr         error
		wantCache       map[string]interface{}
		wantListCalled  bool
		wantWatchCalled bool
	}{
		{
			caseDesc: "sanity",
			giveStore: &GenericStore{
				cache: map[string]interface{}{},
				opt: GenericStoreOption{
					BasePath: "test",
					ObjType:  reflect.TypeOf(TestStruct{}),
					KeyFunc: func(obj interface{}) string {
						return obj.(*TestStruct).Field1
					},
				},
			},
			giveListRet: []string{
				`{"Field1":"demo1-f1", "Field2":"demo1-f2"}`,
				`{"Field1":"demo2-f1", "Field2":"demo2-f2"}`,
			},
			giveWatchCh: make(chan storage.WatchResponse),
			giveResp: storage.WatchResponse{
				Events: []storage.Event{
					{
						Type:  storage.EventTypePut,
						Key:   "test/demo3-f1",
						Value: `{"Field1":"demo3-f1", "Field2":"demo3-f2"}`,
					},
					{
						Type: storage.EventTypeDelete,
						Key:  "test/demo1-f1",
					},
				},
			},
			wantCache: map[string]interface{}{
				"demo2-f1": &TestStruct{
					Field1: "demo2-f1",
					Field2: "demo2-f2",
				},
				"demo3-f1": &TestStruct{
					Field1: "demo3-f1",
					Field2: "demo3-f2",
				},
			},
			wantListCalled:  true,
			wantWatchCalled: true,
		},
		{
			caseDesc:       "list error",
			giveStore:      &GenericStore{},
			giveListErr:    fmt.Errorf("list error"),
			wantErr:        fmt.Errorf("list error"),
			wantListCalled: true,
		},
		{
			caseDesc: "json error",
			giveStore: &GenericStore{
				opt: GenericStoreOption{
					BasePath: "test",
					ObjType:  reflect.TypeOf(TestStruct{}),
					KeyFunc: func(obj interface{}) string {
						return obj.(*TestStruct).Field1
					},
				},
			},
			giveListRet: []string{
				`{"Field1","demo1-f1", "Field2":"demo1-f2"}`,
				`{"Field1":"demo2-f1", "Field2":"demo2-f2"}`,
			},
			wantErr:        fmt.Errorf("json unmarshal failed: invalid character ',' after object key"),
			wantListCalled: true,
		},
	}

	for _, tc := range tests {
		listCalled, watchCalled := false, false
		mStorage := &storage.MockInterface{}
		mStorage.On("List", mock.Anything, mock.Anything).Run(func(args mock.Arguments) {
			listCalled = true
			assert.Equal(t, tc.giveStore.opt.BasePath, args[1], tc.caseDesc)
		}).Return(tc.giveListRet, tc.giveListErr)
		mStorage.On("Watch", mock.Anything, mock.Anything).Run(func(args mock.Arguments) {
			watchCalled = true
			assert.Equal(t, tc.giveStore.opt.BasePath, args[1], tc.caseDesc)
		}).Return((<-chan storage.WatchResponse)(tc.giveWatchCh))

		tc.giveStore.Stg = mStorage
		err := tc.giveStore.Init()
		assert.Equal(t, tc.wantListCalled, listCalled, tc.caseDesc)
		assert.Equal(t, tc.wantWatchCalled, watchCalled, tc.caseDesc)
		if err != nil {
			assert.Equal(t, tc.wantErr.Error(), err.Error(), tc.caseDesc)
			continue
		}
		tc.giveWatchCh <- tc.giveResp
		time.Sleep(1 * time.Second)
		close(tc.giveWatchCh)
		assert.Equal(t, tc.wantCache, tc.giveStore.cache, tc.caseDesc)
	}
}

func TestGenericStore_Get(t *testing.T) {
	tests := []struct {
		caseDesc  string
		giveId    string
		giveStore *GenericStore
		wantRet   interface{}
		wantErr   error
	}{
		{
			caseDesc: "sanity",
			giveId:   "test1",
			giveStore: &GenericStore{
				cache: map[string]interface{}{
					"test2": TestStruct{
						Field1: "test2-f1",
						Field2: "test2-f2",
					},
					"test1": TestStruct{
						Field1: "test1-f1",
						Field2: "test1-f2",
					},
				},
			},
			wantRet: TestStruct{
				Field1: "test1-f1",
				Field2: "test1-f2",
			},
		},
		{
			caseDesc: "not found",
			giveId:   "not",
			giveStore: &GenericStore{
				cache: map[string]interface{}{
					"test2": TestStruct{
						Field1: "test2-f1",
						Field2: "test2-f2",
					},
					"test1": TestStruct{
						Field1: "test1-f1",
						Field2: "test1-f2",
					},
				},
			},
			wantErr: fmt.Errorf("id:not not found"),
		},
	}

	for _, tc := range tests {
		ret, err := tc.giveStore.Get(tc.giveId)
		assert.Equal(t, tc.wantRet, ret, tc.caseDesc)
		assert.Equal(t, tc.wantErr, err, tc.caseDesc)
	}
}

func TestGenericStore_List(t *testing.T) {
	tests := []struct {
		caseDesc      string
		giveInput     ListInput
		giveStore     *GenericStore
		wantRet       *ListOutput
		wantErr       error
	}{
		{
			caseDesc: "sanity",
			giveInput: ListInput{
        Predicate:  func(obj interface{}) bool {
          for _, v := range strings.Split("test1-f2,test3-f2", ",") {
            if v == obj.(*TestStruct).Field2 {
              return true
            }
          }
          return false
        },
      },
			giveStore: &GenericStore{
				cache: map[string]interface{}{
					"test1": &TestStruct{
						Field1: "test1-f1",
						Field2: "test1-f2",
					},
					"test2": &TestStruct{
						Field1: "test2-f1",
						Field2: "test2-f2",
					},
					"test3": &TestStruct{
						Field1: "test3-f1",
						Field2: "test3-f2",
					},
					"test4": &TestStruct{
						Field1: "test4-f1",
						Field2: "test4-f2",
					},
				},
			},
      wantRet: &ListOutput{
        Rows: []interface{}{
          &TestStruct{
            Field1: "test1-f1",
            Field2: "test1-f2",
          },
          &TestStruct{
            Field1: "test3-f1",
            Field2: "test3-f2",
          },
        },
        TotalSize: 2,
      },
		},
    {
      caseDesc: "sanity-page",
      giveInput: ListInput{
        Predicate:  func(obj interface{}) bool {
          for _, v := range strings.Split("test1-f2,test3-f2", ",") {
            if v == obj.(*TestStruct).Field2 {
              return true
            }
          }
          return false
        },
        PageSize:   1,
        PageNumber: 2,
      },
      giveStore: &GenericStore{
        cache: map[string]interface{}{
          "test1": &TestStruct{
            Field1: "test1-f1",
            Field2: "test1-f2",
          },
          "test2": &TestStruct{
            Field1: "test2-f1",
            Field2: "test2-f2",
          },
          "test3": &TestStruct{
            Field1: "test3-f1",
            Field2: "test3-f2",
          },
          "test4": &TestStruct{
            Field1: "test4-f1",
            Field2: "test4-f2",
          },
        },
      },
      wantRet: &ListOutput{
        Rows: []interface{}{
          &TestStruct{
            Field1: "test3-f1",
            Field2: "test3-f2",
          },
        },
        TotalSize: 2,
      },
    },
    {
      caseDesc: "page overflow",
      giveInput: ListInput{
        Predicate:  func(obj interface{}) bool {
          for _, v := range strings.Split("test1-f2,test3-f2", ",") {
            if v == obj.(*TestStruct).Field2 {
              return true
            }
          }
          return false
        },
        PageSize:   1,
        PageNumber: 33,
      },
      giveStore: &GenericStore{
        cache: map[string]interface{}{
          "test1": &TestStruct{
            Field1: "test1-f1",
            Field2: "test1-f2",
          },
          "test2": &TestStruct{
            Field1: "test2-f1",
            Field2: "test2-f2",
          },
          "test3": &TestStruct{
            Field1: "test3-f1",
            Field2: "test3-f2",
          },
          "test4": &TestStruct{
            Field1: "test4-f1",
            Field2: "test4-f2",
          },
        },
      },
      wantRet: &ListOutput{
        Rows: []interface{}{
        },
        TotalSize: 2,
      },
    },
	}

	for _, tc := range tests {
		ret, err := tc.giveStore.List(tc.giveInput)
		assert.Equal(t, tc.wantRet, ret, tc.caseDesc)
		assert.Equal(t, tc.wantErr, err, tc.caseDesc)
	}
}

func TestGenericStore_Create(t *testing.T) {
	tests := []struct {
		caseDesc  string
		giveStore *GenericStore
		giveObj   *TestStruct
		giveErr   error
		wantKey   string
		wantStr   string
		wantErr   error
	}{
		{
			caseDesc: "sanity",
			giveObj: &TestStruct{
				Field1: "test1",
				Field2: "test2",
			},
			giveStore: &GenericStore{
				opt: GenericStoreOption{
					BasePath: "test/path",
					KeyFunc: func(obj interface{}) string {
						return obj.(*TestStruct).Field1
					},
				},
			},
			wantKey: "test/path/test1",
			wantStr: `{"Field1":"test1","Field2":"test2"}`,
		},
		{
			caseDesc: "create failed",
			giveObj: &TestStruct{
				Field1: "test1",
				Field2: "test2",
			},
			giveStore: &GenericStore{
				opt: GenericStoreOption{
					BasePath: "test/path",
					KeyFunc: func(obj interface{}) string {
						return obj.(*TestStruct).Field1
					},
				},
			},
			giveErr: fmt.Errorf("create failed"),
			wantKey: "test/path/test1",
			wantStr: `{"Field1":"test1","Field2":"test2"}`,
			wantErr: fmt.Errorf("create failed"),
		},
    {
      caseDesc: "conflicted",
      giveObj: &TestStruct{
        Field1: "test1",
        Field2: "test2",
      },
      giveStore: &GenericStore{
        cache: map[string]interface{}{
          "test1": struct {}{},
        },
        opt: GenericStoreOption{
          BasePath: "test/path",
          KeyFunc: func(obj interface{}) string {
            return obj.(*TestStruct).Field1
          },
        },
      },
      wantErr: fmt.Errorf("key: test1 is conflicted"),
    },
	}

	for _, tc := range tests {
		createCalled := false
		mStorage := &storage.MockInterface{}
		mStorage.On("Create", mock.Anything, mock.Anything, mock.Anything).Run(func(args mock.Arguments) {
			createCalled = true
			assert.Equal(t, tc.wantKey, args[1], tc.caseDesc)
			assert.Equal(t, tc.wantStr, args[2], tc.caseDesc)
		}).Return(tc.giveErr)

		tc.giveStore.Stg = mStorage
		err := tc.giveStore.Create(context.TODO(), tc.giveObj)
		assert.True(t, createCalled, tc.caseDesc)
		assert.Equal(t, tc.wantErr, err, tc.caseDesc)
	}
}

func TestGenericStore_Update(t *testing.T) {
	tests := []struct {
		caseDesc  string
		giveStore *GenericStore
		giveObj   *TestStruct
		giveErr   error
		wantKey   string
		wantStr   string
		wantErr   error
	}{
		{
			caseDesc: "sanity",
			giveObj: &TestStruct{
				Field1: "test1",
				Field2: "test2",
			},
			giveStore: &GenericStore{
        cache: map[string]interface{}{
          "test1": struct {}{},
        },
				opt: GenericStoreOption{
					BasePath: "test/path",
					KeyFunc: func(obj interface{}) string {
						return obj.(*TestStruct).Field1
					},
				},
			},
			wantKey: "test/path/test1",
			wantStr: `{"Field1":"test1","Field2":"test2"}`,
		},
		{
			caseDesc: "create failed",
			giveObj: &TestStruct{
				Field1: "test1",
				Field2: "test2",
			},
			giveStore: &GenericStore{
        cache: map[string]interface{}{
          "test1": struct {}{},
        },
				opt: GenericStoreOption{
					BasePath: "test/path",
					KeyFunc: func(obj interface{}) string {
						return obj.(*TestStruct).Field1
					},
				},
			},
			giveErr: fmt.Errorf("create failed"),
			wantKey: "test/path/test1",
			wantStr: `{"Field1":"test1","Field2":"test2"}`,
			wantErr: fmt.Errorf("create failed"),
		},
    {
      caseDesc: "not found",
      giveObj: &TestStruct{
        Field1: "test1",
        Field2: "test2",
      },
      giveStore: &GenericStore{
        cache: map[string]interface{}{
          "test2": struct {}{},
        },
        opt: GenericStoreOption{
          BasePath: "test/path",
          KeyFunc: func(obj interface{}) string {
            return obj.(*TestStruct).Field1
          },
        },
      },
      wantErr: fmt.Errorf("key: test1 is not found"),
    },
	}

	for _, tc := range tests {
		createCalled := false
		mStorage := &storage.MockInterface{}
		mStorage.On("Update", mock.Anything, mock.Anything, mock.Anything).Run(func(args mock.Arguments) {
			createCalled = true
			assert.Equal(t, tc.wantKey, args[1], tc.caseDesc)
			assert.Equal(t, tc.wantStr, args[2], tc.caseDesc)
		}).Return(tc.giveErr)

		tc.giveStore.Stg = mStorage
		err := tc.giveStore.Update(context.TODO(), tc.giveObj)
		if err != nil {
      assert.Equal(t, tc.wantErr, err, tc.caseDesc)
      continue
    }
		assert.True(t, createCalled, tc.caseDesc)
	}
}

func TestGenericStore_Delete(t *testing.T) {
	tests := []struct {
		caseDesc  string
		giveStore *GenericStore
		giveKeys  []string
		giveErr   error
		wantKey   []string
		wantErr   error
	}{
		{
			caseDesc: "sanity",
			giveKeys: []string{"test1", "test2"},
			giveStore: &GenericStore{
				opt: GenericStoreOption{
					BasePath: "test/path",
				},
			},
			wantKey: []string{"test/path/test1", "test/path/test2"},
		},
		{
			caseDesc: "delete failed",
			giveKeys: []string{"test1", "test2"},
			giveStore: &GenericStore{
				opt: GenericStoreOption{
					BasePath: "test/path",
				},
			},
			wantKey: []string{"test/path/test1", "test/path/test2"},
			giveErr: fmt.Errorf("delete failed"),
			wantErr: fmt.Errorf("delete failed"),
		},
	}

	for _, tc := range tests {
		createCalled := false
		mStorage := &storage.MockInterface{}
		mStorage.On("BatchDelete", mock.Anything, mock.Anything).Run(func(args mock.Arguments) {
			createCalled = true
			assert.Equal(t, tc.wantKey, args[1], tc.caseDesc)
		}).Return(tc.giveErr)

		tc.giveStore.Stg = mStorage
		err := tc.giveStore.BatchDelete(context.TODO(), tc.giveKeys)
		assert.True(t, createCalled, tc.caseDesc)
		assert.Equal(t, tc.wantErr, err, tc.caseDesc)
	}
}
