package cache_verify

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/apisix/manager-api/internal/core/storage"
	"github.com/apisix/manager-api/internal/core/store"
	"github.com/shiningrush/droplet"
	"github.com/stretchr/testify/assert"
	"testing"
)

func TestHandler_CacheVerify(t *testing.T) {
	andyStr := `{"username":"andy","plugins":{"key-auth":{"key":"key-of-john"}},"create_time":1627739045,"update_time":1627744978}`
	var andyObj interface{}
	err := json.Unmarshal([]byte(andyStr), &andyObj)
	if err != nil {
		fmt.Printf("unmarshal error :: %s", err.Error())
	}
	brokenAndyStr := `{"username":"andy","plugins":{"key-auth":{"key":"key-of-john"}},"create_time":1627739046,"update_time":1627744978}`
	var brokenAndyObj interface{}
	err = json.Unmarshal([]byte(brokenAndyStr), &brokenAndyObj)
	if err != nil {
		fmt.Printf("unmarshal error :: %s", err.Error())
	}
	consumerPrefix := "/apisix/consumers/"

	tests := []struct {
		caseDesc  string
		listInput string
		listRet   []storage.Keypair
		getInput  string
		getRet    interface{}
	}{
		{
			caseDesc:  "consistent",
			listInput: consumerPrefix,
			listRet: []storage.Keypair{
				{
					Key:   consumerPrefix + "andy",
					Value: andyStr,
				},
			},
			getInput: "andy",
			getRet:   andyObj,
		},
		{
			caseDesc:  "inconsistent",
			listInput: consumerPrefix,
			listRet: []storage.Keypair{
				{
					Key:   consumerPrefix + "andy",
					Value: andyStr,
				},
			},
			getInput: "andy",
			getRet:   brokenAndyObj,
		},
	}

	for _, tc := range tests {
		t.Run(tc.caseDesc, func(t *testing.T) {
			mockConsumerCache := store.MockInterface{}
			mockEtcdStorage := storage.MockInterface{}
			mockEtcdStorage.On("List", context.TODO(), consumerPrefix).Return(tc.listRet, nil)
			mockConsumerCache.On("Get", tc.getInput).Return(tc.getRet, nil)
			handler := Handler{consumerStore: &mockConsumerCache, etcdStorage: &mockEtcdStorage}
			rs, err := handler.CacheVerify(droplet.NewContext())
			fmt.Println(rs)
			assert.Nil(t, err, nil)
		})
	}
	//// this is a working testify mocking example
	//mockConsumerCache := store.MockInterface{}
	//mockEtcdStorage := storage.MockInterface{}
	//andyStr := `{"username":"andy","plugins":{"key-auth":{"key":"key-of-john"}},
	//			"create_time":1627739045,"update_time":1627744978}`
	//var andyObj interface{}
	//err := json.Unmarshal([]byte(andyStr), &andyObj)
	//if err != nil {
	//	fmt.Printf("error mashalling string 1 :: %s", err.Error())
	//}
	//mockEtcdStorage.On("List", context.TODO(), "/apisix/consumers/").Return([]storage.Keypair{
	//	{
	//		Key:   "/apisix/consumers/andy",
	//		Value: andyStr,
	//	},
	//}, nil)
	//// 解释:为什么我们这里只传进去andy,而没有context.TODO()?
	//// 因为,在mockInterface里,对于called,只使用了key,没有使用context
	//mockConsumerCache.On("Get", "andy").Return(andyObj, nil)
	//handler := Handler{consumerStore: &mockConsumerCache, etcdStorage: &mockEtcdStorage}
	//rs, err := handler.CacheVerify(droplet.NewContext())
	//fmt.Println(rs)
	//assert.Nil(t, err, nil)
}
