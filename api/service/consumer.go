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
package service

import (
	"encoding/json"
	"fmt"

	"github.com/apisix/manager-api/conf"
	"github.com/apisix/manager-api/errno"
	"github.com/apisix/manager-api/utils"
	uuid "github.com/satori/go.uuid"
)

type Consumer struct {
	Base
	Username string `json:"username"`
	Desc     string `json:"desc"`
	Plugins  string `json:"plugins"`
}

type ConsumerDto struct {
	Base
	Username string                 `json:"username"`
	Desc     string                 `json:"desc"`
	Plugins  map[string]interface{} `json:"plugins"`
}

type ApisixConsumer struct {
	Username string                 `json:"username"`
	Desc     string                 `json:"desc"`
	Plugins  map[string]interface{} `json:"plugins"`
}

func (apisixConsumer *ApisixConsumer) Transfer(consumer *ConsumerDto) error {
	apisixConsumer.Username = consumer.Username
	apisixConsumer.Desc = consumer.Desc
	apisixConsumer.Plugins = consumer.Plugins

	return nil
}

func (consumer *Consumer) Transfer(req *ConsumerDto) error {
	consumer.ID = req.ID
	consumer.Desc = req.Desc
	consumer.Username = req.Username

	plugins, _ := json.Marshal(req.Plugins)
	consumer.Plugins = string(plugins)

	return nil
}

func (dto *ConsumerDto) Transfer(consumer *Consumer) error {
	dto.ID = consumer.ID
	dto.Desc = consumer.Desc
	dto.Username = consumer.Username
	dto.CreateTime = consumer.CreateTime
	dto.UpdateTime = consumer.UpdateTime

	var plugins map[string]interface{}
	_ = json.Unmarshal([]byte(consumer.Plugins), &plugins)
	dto.Plugins = plugins

	return nil
}

// ApisixConsumerResponse is response from apisix admin api
type ApisixConsumerResponse struct {
	Action string        `json:"action"`
	Node   *ConsumerNode `json:"node"`
}

type ConsumerNode struct {
	Value         ApisixConsumer `json:"value"`
	ModifiedIndex uint64         `json:"modifiedIndex"`
}

func (req *ConsumerDto) Parse(body interface{}) {
	if err := json.Unmarshal(body.([]byte), req); err != nil {
		req = nil
	}
}

func ConsumerList(page, size int, search string) (int, []ConsumerDto, error) {
	var count int
	consumerList := []Consumer{}
	db := conf.DB().Table("consumers")

	if search != "" {
		db = db.Where("username like ? ", "%"+search+"%").
			Or("`desc` like ? ", "%"+search+"%")
	}

	if err := db.Order("create_time desc").Offset((page - 1) * size).Limit(size).Find(&consumerList).Error; err != nil {
		e := errno.New(errno.DBReadError, err.Error())
		return 0, nil, e
	}
	if err := db.Count(&count).Error; err != nil {
		e := errno.New(errno.DBReadError, err.Error())
		return 0, nil, e
	}

	dtoList := []ConsumerDto{}

	for _, consumer := range consumerList {
		dto := ConsumerDto{}
		dto.Transfer(&consumer)

		dtoList = append(dtoList, dto)
	}

	return count, dtoList, nil
}

func ConsumerItem(id string) (*ConsumerDto, error) {
	if id == "" {
		return nil, errno.New(errno.InvalidParam)
	}

	consumer := &Consumer{}
	if err := conf.DB().Table("consumers").Where("id = ?", id).First(consumer).Error; err != nil {
		e := errno.New(errno.DBReadError, err.Error())
		return nil, e
	}

	dto := &ConsumerDto{}
	dto.Transfer(consumer)

	return dto, nil
}

func ConsumerCreate(param interface{}, id string) error {
	req := &ConsumerDto{}
	req.Parse(param)

	if req.Username == "" {
		return errno.New(errno.InvalidParamDetail, "username is required")
	}

	if len(req.Desc) > 200 {
		return errno.New(errno.InvalidParamDetail, "description is too long")
	}

	exists := Consumer{}
	conf.DB().Table("consumers").Where("username = ?", req.Username).First(&exists)
	if exists != (Consumer{}) {
		e := errno.New(errno.DuplicateUserName)
		return e
	}

	// trans
	tx := conf.DB().Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	consumer := &Consumer{}
	consumer.Transfer(req)

	// update mysql
	consumer.ID = uuid.FromStringOrNil(id)
	if err := tx.Create(consumer).Error; err != nil {
		tx.Rollback()
		return errno.New(errno.DBWriteError, err.Error())
	}

	apisixConsumer := &ApisixConsumer{}
	apisixConsumer.Transfer(req)

	if _, err := apisixConsumer.PutConsumerToApisix(req.Username); err != nil {
		tx.Rollback()
		if _, ok := err.(*errno.HttpError); ok {
			return err
		}
		e := errno.New(errno.ApisixConsumerCreateError, err.Error())
		return e
	}

	tx.Commit()

	return nil
}

func ConsumerUpdate(param interface{}, id string) error {
	if id == "" {
		return errno.New(errno.InvalidParam)
	}

	req := &ConsumerDto{}
	req.Parse(param)
	if req == nil {
		return errno.New(errno.InvalidParam)
	}

	req.ID = uuid.FromStringOrNil(id)
	if req.Username != "" {
		exists := Consumer{}
		conf.DB().Table("consumers").Where("username = ?", req.Username).First(&exists)
		if exists != (Consumer{}) && exists.ID != req.ID {
			e := errno.New(errno.DuplicateUserName)
			return e
		}
	}
	// trans
	tx := conf.DB().Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// update mysql
	consumer := &Consumer{}
	consumer.Transfer(req)
	data := Consumer{Desc: consumer.Desc, Plugins: consumer.Plugins}
	if req.Username != "" {
		data.Username = req.Username
	}
	if err := tx.Model(&consumer).Updates(data).Error; err != nil {
		tx.Rollback()
		return errno.New(errno.DBWriteError, err.Error())
	}

	apisixConsumer := &ApisixConsumer{}
	apisixConsumer.Transfer(req)

	if _, err := apisixConsumer.PutConsumerToApisix(req.Username); err != nil {
		tx.Rollback()
		if _, ok := err.(*errno.HttpError); ok {
			return err
		}
		e := errno.New(errno.ApisixConsumerUpdateError, err.Error())
		return e
	}

	tx.Commit()

	return nil
}

func ConsumerDelete(id string) error {
	if id == "" {
		return errno.New(errno.InvalidParam)
	}
	//
	consumer := &Consumer{}
	if err := conf.DB().Table("consumers").Where("id = ?", id).First(consumer).Error; err != nil {
		e := errno.New(errno.RecordNotExist, err.Error())
		return e
	}

	// trans
	tx := conf.DB().Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// delete from mysql
	if err := conf.DB().Delete(consumer).Error; err != nil {
		tx.Rollback()
		return errno.New(errno.DBDeleteError, err.Error())
	}

	//delete from apisix
	if _, err := consumer.DeleteConsumerFromApisix(); err != nil {
		tx.Rollback()
		if _, ok := err.(*errno.HttpError); ok {
			return err
		}
		e := errno.New(errno.ApisixConsumerDeleteError, err.Error())
		return e
	}

	tx.Commit()

	return nil
}

func (req *ApisixConsumer) PutConsumerToApisix(rid string) (*ApisixConsumerResponse, error) {
	url := fmt.Sprintf("%s/consumers/%s", conf.BaseUrl, rid)
	if data, err := json.Marshal(req); err != nil {
		return nil, err
	} else {
		if resp, err := utils.Put(url, data); err != nil {
			logger.Error(url)
			logger.Error(string(data))
			logger.Error(err.Error())
			return nil, err
		} else {
			var arresp ApisixConsumerResponse
			if err := json.Unmarshal(resp, &arresp); err != nil {
				logger.Error(err.Error(), resp)
				return nil, err
			} else {
				return &arresp, nil
			}
		}
	}
}

func (req *Consumer) DeleteConsumerFromApisix() (*ApisixConsumerResponse, error) {
	id := req.Username
	url := fmt.Sprintf("%s/consumers/%s", conf.BaseUrl, id)

	if resp, err := utils.Delete(url); err != nil {
		logger.Error(err.Error())
		return nil, err
	} else {
		var arresp ApisixConsumerResponse
		if err := json.Unmarshal(resp, &arresp); err != nil {
			logger.Error(err.Error())
			return nil, err
		} else {
			return &arresp, nil
		}
	}
}

func GetConsumerByUserName(name string) (*Consumer, error) {
	if name == "" {
		return nil, errno.New(errno.InvalidParam)
	}
	consumer := &Consumer{}
	if err := conf.DB().Table("consumers").Where("username = ?", name).First(consumer).Error; err != nil {
		e := errno.New(errno.NotFoundError, err.Error())
		return nil, e
	}

	return consumer, nil
}
