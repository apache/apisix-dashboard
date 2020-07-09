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
	"time"

	"github.com/jinzhu/gorm"
	uuid "github.com/satori/go.uuid"
)

// Base contains common columns for all tables.
type Base struct {
	ID         uuid.UUID `json:"id",sql:"type:uuid;primary_key;"`
	CreateTime int64     `json:"create_time"`
	UpdateTime int64     `json:"update_time"`
}

// BeforeCreate will set a UUID rather than numeric ID.
func (base *Base) BeforeCreate(scope *gorm.Scope) error {
	timestamp := time.Now().Unix()
	err := scope.SetColumn("UpdateTime", timestamp)
	err = scope.SetColumn("CreateTime", timestamp)
	if len(base.ID) == 0 {
		uuid := uuid.NewV4()
		err = scope.SetColumn("ID", uuid)
		return err
	}
	return err
}

func (base *Base) BeforeSave(scope *gorm.Scope) error {
	err := scope.SetColumn("UpdateTime", time.Now().Unix())
	return err
}
