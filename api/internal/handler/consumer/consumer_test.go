package consumer

import (
	"encoding/json"
	"github.com/apisix/manager-api/internal/core/entity"
	"github.com/apisix/manager-api/internal/core/storage"
	"github.com/apisix/manager-api/internal/core/store"
	"github.com/shiningrush/droplet"
	"testing"
	"time"

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

	//create consumer 2
	consumer2 := &entity.Consumer{}
	reqBody = `{
      "username": "pony",
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
	json.Unmarshal([]byte(reqBody), consumer2)
	ctx.SetInput(consumer2)
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

	//update consumer
	consumer3 := &UpdateInput{}
	consumer3.Username = "pony"
	reqBody = `{
      "username": "pony",
      "plugins": {
          "limit-count": {
              "count": 2,
              "time_window": 60,
              "rejected_code": 503,
              "key": "remote_addr"
          }
      },
    "desc": "test description2"
  }`
	json.Unmarshal([]byte(reqBody), consumer3)
	ctx.SetInput(consumer3)
	_, err = handler.Update(ctx)
	assert.Nil(t, err)

	//
	time.Sleep(time.Duration(1) * time.Second)

	//check update
	input3 := &GetInput{}
	reqBody = `{"username": "pony"}`
	json.Unmarshal([]byte(reqBody), input3)
	ctx.SetInput(input3)
	ret3, err := handler.Get(ctx)
	stored3 := ret3.(*entity.Consumer)
	assert.Nil(t, err)
	assert.Equal(t, stored3.Desc, "test description2") //consumer3.Desc)
	assert.Equal(t, stored3.Username, consumer3.Username)

	//list page 1
	listInput := &ListInput{}
	reqBody = `{"page_size": 1, "page_number": 1}`
	json.Unmarshal([]byte(reqBody), listInput)
	ctx.SetInput(listInput)
	retPage1, err := handler.List(ctx)
	dataPage1 := retPage1.(*store.ListOutput)
	assert.Equal(t, len(dataPage1.Rows), 1)

	//list page 2
	listInput2 := &ListInput{}
	reqBody = `{"page_size": 1, "page_number": 2}`
	json.Unmarshal([]byte(reqBody), listInput2)
	ctx.SetInput(listInput2)
	retPage2, err := handler.List(ctx)
	dataPage2 := retPage2.(*store.ListOutput)
	assert.Equal(t, len(dataPage2.Rows), 1)

	//delete consumer
	inputDel := &BatchDelete{}
	reqBody = `{"usernames": "jack"}`
	json.Unmarshal([]byte(reqBody), inputDel)
	ctx.SetInput(inputDel)
	_, err = handler.BatchDelete(ctx)
	assert.Nil(t, err)

	reqBody = `{"usernames": "pony"}`
	json.Unmarshal([]byte(reqBody), inputDel)
	ctx.SetInput(inputDel)
	_, err = handler.BatchDelete(ctx)
	assert.Nil(t, err)

}
