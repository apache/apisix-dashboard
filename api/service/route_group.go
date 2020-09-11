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
	"github.com/apisix/manager-api/conf"
	"github.com/apisix/manager-api/errno"
	uuid "github.com/satori/go.uuid"
)

type RouteGroupDao struct {
	Base
	Name        string `json:"name"`
	Description string `json:"description,omitempty"`
}

func (RouteGroupDao) TableName() string {
	return "route_group"
}

func (rd *RouteGroupDao) CreateRouteGroup() error {
	return conf.DB().Create(&rd).Error
}

func (rd *RouteGroupDao) FindRouteGroup(id string) (error, int) {
	var count int
	if err := conf.DB().Table("route_group").Where("id=?", id).Count(&count).Error; err != nil {
		return err, 0
	}
	conf.DB().Table("route_group").Where("id=?", id).First(&rd)
	return nil, count
}

func (rd *RouteGroupDao) GetRouteGroupList(routeGroupList *[]RouteGroupDao, search string, page, size int) (error, int) {
	db := conf.DB()
	db = db.Table(rd.TableName())
	if len(search) != 0 {
		db = db.Where("name like ? or description like ? ", search, search)
	}
	var count int
	if err := db.Order("update_time desc").Offset((page - 1) * size).Limit(size).Find(&routeGroupList).Error; err != nil {
		return err, 0
	} else {
		if err := db.Count(&count).Error; err != nil {
			return err, 0
		}
		return nil, count
	}
}

func (rd *RouteGroupDao) UpdateRouteGroup() error {
	db := conf.DB()
	tx := db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()
	if err := tx.Model(&RouteGroupDao{}).Update(rd).Error; err != nil {
		tx.Rollback()
		return err
	}
	if err := tx.Table("routes").Where("route_group_id = ?", rd.ID.String()).Update("route_group_name", rd.Name).Error; err != nil {
		tx.Rollback()
		return err
	}
	if err := tx.Commit().Error; err != nil {
		tx.Rollback()
		return err
	}
	return nil
}

func (rd *RouteGroupDao) DeleteRouteGroup() error {
	if err, count := rd.FindRoute(); err != nil {
		e := errno.FromMessage(errno.RouteGroupSelectRoutesError, err.Error())
		logger.Error(e.Msg)
		return e
	} else {
		if count > 0 {
			e := errno.FromMessage(errno.RouteGroupHasRoutesError)
			logger.Error(e.Msg)
			return e
		}
	}
	return conf.DB().Delete(&rd).Error
}

type RouteGroupNameResponse struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

func (u *RouteGroupDao) Parse2NameResponse() (*RouteGroupNameResponse, error) {
	// routeGroup
	unr := &RouteGroupNameResponse{
		ID:   u.ID.String(),
		Name: u.Name,
	}
	return unr, nil
}

type RouteGroupRequest struct {
	Id          string `json:"id,omitempty"`
	Name        string `json:"name"`
	Description string `json:"description"`
}

func (u *RouteGroupRequest) toJson() []byte {
	res, _ := json.Marshal(&u)
	return res
}

func (r *RouteGroupRequest) Parse(body interface{}) error {
	if err := json.Unmarshal(body.([]byte), r); err != nil {
		r = nil
		return err
	}
	return nil
}

func Trans2RouteGroupDao(r *RouteGroupRequest) (*RouteGroupDao, *errno.ManagerError) {

	u := &RouteGroupDao{
		Name:        r.Name,
		Description: r.Description,
	}
	// id
	u.ID = uuid.FromStringOrNil(r.Id)
	return u, nil
}

func (r *RouteGroupDao) FindRoute() (error, int) {
	var count int
	if err := conf.DB().Table("routes").Where("route_group_id=?", r.ID).Count(&count).Error; err != nil {
		return err, 0
	}
	return nil, count
}
