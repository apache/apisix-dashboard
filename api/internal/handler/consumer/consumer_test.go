package consumer

import (
	"encoding/json"
	"github.com/apisix/manager-api/internal/core/entity"
	"github.com/apisix/manager-api/internal/core/storage"
	"github.com/apisix/manager-api/internal/core/store"
	"github.com/shiningrush/droplet"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestConsumer(t *testing.T) {
	// init
	err := storage.InitETCDClient([]string{"127.0.0.1:2379"})
	assert.Nil(t, err)
	err = store.InitStores()
	assert.Nil(t, err)

	handler := &Handler{
		consumerStore: store.GetStore(store.HubKeyConsumer),
	}
	assert.NotNil(t, handler)

	//create consumer
	ctx := droplet.NewContext()
	consumer := &entity.Consumer{}
	reqBody := `{
      "username": "jack",
      "plugins": {
          "limit-count": {
              "count": 2,
              "time_window": 60,
              "rejected_code": 503,
              "key": "remote_addr"
          }
      },
    "desc": "test description"
  }`
	json.Unmarshal([]byte(reqBody), consumer)
	ctx.SetInput(consumer)
	_, err = handler.Create(ctx)
	assert.Nil(t, err)

	//get consumer
	input := &GetInput{}
	reqBody = `{"username": "jack"}`
	json.Unmarshal([]byte(reqBody), input)
	ctx.SetInput(input)
	ret, err := handler.Get(ctx)
	stored := ret.(*entity.Consumer)
	assert.Nil(t, err)
	assert.Equal(t, stored.ID, consumer.ID)
	assert.Equal(t, stored.Username, consumer.Username)

	//delete consumer
	inputDel := &BatchDelete{}
	reqBody = `{"usernames": "jack"}`
	json.Unmarshal([]byte(reqBody), inputDel)
	ctx.SetInput(inputDel)
	_, err = handler.BatchDelete(ctx)
	assert.Nil(t, err)

}
