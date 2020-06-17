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
package conf

import (
	"fmt"
	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/mysql"
	"time"
)

var db *gorm.DB

func DB() *gorm.DB {
	return db
}

// InitializeMysql creates mysql's *sqlDB instance
func InitializeMysql() {
	dsn := fmt.Sprintf("%s:%s@tcp(%s)/%s?charset=utf8&parseTime=True&loc=Local", MysqlConfig.User,
		MysqlConfig.Password, MysqlConfig.Address, "manager")
	if tmp, err := gorm.Open("mysql", dsn); err != nil {
		panic(fmt.Sprintf("fail to connect to DB: %s for %s", err.Error(), dsn))
	} else {
		db = tmp
		db.LogMode(true)
		db.DB().SetMaxOpenConns(MysqlConfig.MaxConns)
		db.DB().SetMaxIdleConns(MysqlConfig.MaxIdleConns)
		db.DB().SetConnMaxLifetime(time.Duration(MysqlConfig.MaxLifeTime) * time.Minute)
	}

}
